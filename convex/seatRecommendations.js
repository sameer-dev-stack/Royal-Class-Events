import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * AI-Powered Seat Recommendation Engine
 * Uses rule-based algorithms to suggest optimal seats based on user preferences
 */

export const recommendSeats = query({
    args: {
        eventId: v.id("events"),
        venueId: v.id("venues"),
        preferences: v.object({
            quantity: v.number(),
            maxPrice: v.optional(v.number()),
            minPrice: v.optional(v.number()),
            accessibilityRequired: v.optional(v.boolean()),
            preferredSections: v.optional(v.array(v.string())),
            viewPriority: v.optional(v.union(
                v.literal('high'),
                v.literal('medium'),
                v.literal('low')
            )),
            keepTogether: v.optional(v.boolean()), // For groups
        }),
    },
    handler: async (ctx, args) => {
        // Get all sections for the venue
        const sections = await ctx.db
            .query("sections")
            .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
            .collect();

        if (sections.length === 0) {
            return { recommendations: [], message: "No seat map configured for this venue" };
        }

        // Get available seats with price zones
        const sectionsWithSeats = await Promise.all(
            sections.map(async (section) => {
                const seats = await ctx.db
                    .query("seats")
                    .withIndex("by_section", (q) => q.eq("sectionId", section._id))
                    .filter((q) => q.eq(q.field("status"), "available"))
                    .collect();

                const priceZone = section.priceZoneId
                    ? await ctx.db.get(section.priceZoneId)
                    : null;

                return { section, seats, priceZone };
            })
        );

        // Filter by price range
        let availableSections = sectionsWithSeats.filter(({ priceZone }) => {
            if (!priceZone) return false;
            if (args.preferences.maxPrice && priceZone.basePrice > args.preferences.maxPrice) return false;
            if (args.preferences.minPrice && priceZone.basePrice < args.preferences.minPrice) return false;
            return true;
        });

        // Filter by preferred sections
        if (args.preferences.preferredSections && args.preferences.preferredSections.length > 0) {
            availableSections = availableSections.filter(({ section }) =>
                args.preferences.preferredSections.includes(section.name) ||
                args.preferences.preferredSections.includes(section.sectionType)
            );
        }

        // Generate recommendations
        const recommendations = [];
        const quantity = args.preferences.quantity;
        const keepTogether = args.preferences.keepTogether ?? (quantity > 1);

        if (keepTogether && quantity > 1) {
            // Find consecutive seats in the same row
            for (const { section, seats, priceZone } of availableSections) {
                const consecutiveGroups = findConsecutiveSeats(seats, quantity);

                for (const group of consecutiveGroups) {
                    const score = calculateGroupScore(
                        group,
                        priceZone,
                        args.preferences
                    );

                    recommendations.push({
                        seatIds: group.map(s => s._id),
                        seats: group,
                        section: section.name,
                        sectionType: section.sectionType,
                        totalPrice: priceZone.basePrice * quantity,
                        pricePerSeat: priceZone.basePrice,
                        aiScore: score.total,
                        scoreBreakdown: score.breakdown,
                        reason: generateReasonText(score, section, priceZone),
                        features: priceZone.features || [],
                    });
                }
            }
        } else {
            // Find best individual seats (not necessarily together)
            const allAvailableSeats = availableSections.flatMap(({ section, seats, priceZone }) =>
                seats.map(seat => ({
                    seat,
                    section,
                    priceZone,
                }))
            );

            // Score each seat
            const scoredSeats = allAvailableSeats.map(({ seat, section, priceZone }) => ({
                seat,
                section,
                priceZone,
                score: calculateSeatScore(seat, priceZone, args.preferences),
            }));

            // Sort by score and take top N
            scoredSeats.sort((a, b) => b.score.total - a.score.total);
            const topSeats = scoredSeats.slice(0, Math.min(quantity, scoredSeats.length));

            if (topSeats.length === quantity) {
                recommendations.push({
                    seatIds: topSeats.map(s => s.seat._id),
                    seats: topSeats.map(s => s.seat),
                    section: "Mixed",
                    sectionType: "standard",
                    totalPrice: topSeats.reduce((sum, s) => sum + s.priceZone.basePrice, 0),
                    pricePerSeat: topSeats.reduce((sum, s) => sum + s.priceZone.basePrice, 0) / quantity,
                    aiScore: topSeats.reduce((sum, s) => sum + s.score.total, 0) / quantity,
                    scoreBreakdown: {
                        viewQuality: topSeats.reduce((sum, s) => sum + s.score.breakdown.viewQuality, 0) / quantity,
                        priceValue: topSeats.reduce((sum, s) => sum + s.score.breakdown.priceValue, 0) / quantity,
                        accessibility: topSeats.reduce((sum, s) => sum + s.score.breakdown.accessibility, 0) / quantity,
                    },
                    reason: "Best individual seats based on your preferences",
                    features: [],
                });
            }
        }

        // Sort recommendations by AI score
        recommendations.sort((a, b) => b.aiScore - a.aiScore);

        // Return top 5 recommendations
        return {
            recommendations: recommendations.slice(0, 5),
            totalOptionsFound: recommendations.length,
            searchCriteria: args.preferences,
        };
    },
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Find groups of consecutive seats in the same row
 */
function findConsecutiveSeats(seats, quantity) {
    // Group seats by row
    const seatsByRow = {};
    for (const seat of seats) {
        if (!seatsByRow[seat.rowLabel]) {
            seatsByRow[seat.rowLabel] = [];
        }
        seatsByRow[seat.rowLabel].push(seat);
    }

    const consecutiveGroups = [];

    // Find consecutive seats in each row
    for (const row of Object.values(seatsByRow)) {
        // Sort by seat number
        row.sort((a, b) => a.seatNumber - b.seatNumber);

        for (let i = 0; i <= row.length - quantity; i++) {
            const group = row.slice(i, i + quantity);

            // Check if seats are consecutive
            const isConsecutive = group.every((seat, idx) => {
                if (idx === 0) return true;
                return seat.seatNumber === group[idx - 1].seatNumber + 1;
            });

            if (isConsecutive) {
                consecutiveGroups.push(group);
            }
        }
    }

    return consecutiveGroups;
}

/**
 * Calculate score for a group of seats
 */
function calculateGroupScore(seatGroup, priceZone, preferences) {
    const breakdown = {
        viewQuality: 0,
        priceValue: 0,
        groupCohesion: 100, // Always 100 for groups
        accessibility: 0,
    };

    // Average view quality
    breakdown.viewQuality = seatGroup.reduce((sum, seat) =>
        sum + (seat.viewQualityScore || 50), 0
    ) / seatGroup.length;

    // Price value (inverse relationship - lower price = higher score)
    if (preferences.maxPrice) {
        breakdown.priceValue = ((preferences.maxPrice - priceZone.basePrice) / preferences.maxPrice) * 100;
    } else {
        breakdown.priceValue = 50; // Neutral if no price preference
    }

    // Accessibility
    if (preferences.accessibilityRequired) {
        breakdown.accessibility = seatGroup.reduce((sum, seat) =>
            sum + (seat.accessibilityScore || 0), 0
        ) / seatGroup.length;
    } else {
        breakdown.accessibility = 50;
    }

    // Calculate weighted total based on viewPriority
    let weights = {
        viewQuality: 0.4,
        priceValue: 0.3,
        groupCohesion: 0.2,
        accessibility: 0.1,
    };

    if (preferences.viewPriority === 'high') {
        weights = {
            viewQuality: 0.5,
            priceValue: 0.2,
            groupCohesion: 0.2,
            accessibility: 0.1,
        };
    } else if (preferences.viewPriority === 'low') {
        weights = {
            viewQuality: 0.2,
            priceValue: 0.5,
            groupCohesion: 0.2,
            accessibility: 0.1,
        };
    }

    if (preferences.accessibilityRequired) {
        weights.accessibility = 0.3;
        weights.viewQuality = 0.3;
        weights.priceValue = 0.2;
        weights.groupCohesion = 0.2;
    }

    const total = Object.keys(breakdown).reduce((sum, key) =>
        sum + (breakdown[key] * weights[key]), 0
    );

    return {
        total: Math.round(total),
        breakdown,
        weights,
    };
}

/**
 * Calculate score for a single seat
 */
function calculateSeatScore(seat, priceZone, preferences) {
    const breakdown = {
        viewQuality: seat.viewQualityScore || 50,
        priceValue: 50,
        accessibility: seat.accessibilityScore || 50,
    };

    // Price value
    if (preferences.maxPrice) {
        breakdown.priceValue = ((preferences.maxPrice - priceZone.basePrice) / preferences.maxPrice) * 100;
    }

    // Weights
    let weights = {
        viewQuality: 0.5,
        priceValue: 0.3,
        accessibility: 0.2,
    };

    if (preferences.viewPriority === 'high') {
        weights = { viewQuality: 0.6, priceValue: 0.2, accessibility: 0.2 };
    } else if (preferences.viewPriority === 'low') {
        weights = { viewQuality: 0.2, priceValue: 0.6, accessibility: 0.2 };
    }

    if (preferences.accessibilityRequired) {
        weights = { viewQuality: 0.3, priceValue: 0.2, accessibility: 0.5 };
    }

    const total = Object.keys(breakdown).reduce((sum, key) =>
        sum + (breakdown[key] * weights[key]), 0
    );

    return {
        total: Math.round(total),
        breakdown,
        weights,
    };
}

/**
 * Generate human-readable reason text
 */
function generateReasonText(score, section, priceZone) {
    const reasons = [];

    if (score.breakdown.viewQuality > 75) {
        reasons.push("Excellent view");
    } else if (score.breakdown.viewQuality > 50) {
        reasons.push("Good view");
    }

    if (score.breakdown.priceValue > 75) {
        reasons.push("Great value");
    } else if (score.breakdown.priceValue > 50) {
        reasons.push("Fair price");
    }

    if (section.sectionType === 'vip') {
        reasons.push("VIP section");
    } else if (section.sectionType === 'premium') {
        reasons.push("Premium seating");
    }

    if (score.breakdown.accessibility > 75) {
        reasons.push("Easy access");
    }

    if (score.breakdown.groupCohesion === 100) {
        reasons.push("Seats together");
    }

    return reasons.length > 0 ? reasons.join(" • ") : "Available seats";
}
