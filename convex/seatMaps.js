import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal, api } from "./_generated/api";

// ==================== VENUE LAYOUT MANAGEMENT ====================

/**
 * Create or update a venue's seat map layout
 */
export const createVenueLayout = mutation({
    args: {
        venueId: v.id("venues"),
        layoutType: v.union(
            v.literal('stadium'),
            v.literal('theater'),
            v.literal('conference'),
            v.literal('outdoor')
        ),
        sections: v.array(v.object({
            name: v.string(),
            sectionType: v.union(
                v.literal('vip'),
                v.literal('premium'),
                v.literal('standard'),
                v.literal('accessible'),
                v.literal('standing')
            ),
            rowCount: v.number(),
            seatsPerRow: v.number(),
            basePrice: v.number(),
            color: v.string(),
            displayOrder: v.number(),
        })),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin" || r.permissions.includes("*"));

        if (!isAdmin) {
            throw new Error("Unauthorized: Admin access required");
        }

        const venue = await ctx.db.get(args.venueId);
        if (!venue) {
            throw new Error("Venue not found");
        }

        const now = Date.now();
        const createdSections = [];

        // Create sections and seats
        for (const sectionData of args.sections) {
            // Create price zone for this section
            const priceZoneId = await ctx.db.insert("priceZones", {
                name: `${sectionData.name} - ${sectionData.sectionType}`,
                venueId: args.venueId,
                basePrice: sectionData.basePrice,
                currency: "BDT",
                dynamicPricingEnabled: false,
                features: [],
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            // Create section
            const sectionId = await ctx.db.insert("sections", {
                venueId: args.venueId,
                name: sectionData.name,
                sectionType: sectionData.sectionType,
                priceZoneId,
                layoutType: args.layoutType,
                displayOrder: sectionData.displayOrder,
                color: sectionData.color,
                capacity: sectionData.rowCount * sectionData.seatsPerRow,
                rowCount: sectionData.rowCount,
                seatsPerRow: sectionData.seatsPerRow,
                createdAt: now,
                updatedAt: now,
            });

            // Generate seats based on layout type
            const seats = generateSeats(
                sectionId,
                sectionData.rowCount,
                sectionData.seatsPerRow,
                args.layoutType,
                sectionData.displayOrder
            );

            // Insert all seats
            for (const seat of seats) {
                await ctx.db.insert("seats", {
                    ...seat,
                    status: "available",
                    seatType: "standard",
                    lastStatusChange: now,
                    createdAt: now,
                    updatedAt: now,
                });
            }

            createdSections.push({ sectionId, priceZoneId, seatCount: seats.length });
        }

        // Update venue to enable seat map
        await ctx.db.patch(args.venueId, {
            seatMapEnabled: true,
            seatMapConfig: {
                defaultLayoutType: args.layoutType,
                totalSeats: createdSections.reduce((sum, s) => sum + s.seatCount, 0),
                canvasWidth: 1200,
                canvasHeight: 800,
                seatWidth: 24,
                seatSpacing: 8,
                rowSpacing: 40,
                centerX: 600,
                centerY: 400,
            },
            updatedAt: now,
        });

        return {
            success: true,
            venueId: args.venueId,
            sections: createdSections,
        };
    },
});

/**
 * Get seat map for an event or venue
 */
export const getSeatMap = query({
    args: {
        eventId: v.optional(v.id("events")),
        venueId: v.optional(v.id("venues")),
    },
    handler: async (ctx, args) => {
        if (!args.eventId && !args.venueId) {
            throw new Error("Either eventId or venueId is required");
        }

        let venue;
        if (args.eventId) {
            const event = await ctx.db.get(args.eventId);
            if (!event) throw new Error("Event not found");
            // For now, assume venues is linked via locationConfig or we need to add venueId to events
            // This is a placeholder - you'll need to add venueId to events schema
            throw new Error("Event-based seat maps require venueId in events schema");
        } else {
            venue = await ctx.db.get(args.venueId);
        }

        if (!venue || !venue.seatMapEnabled) {
            return null;
        }

        // Get all sections for this venue
        const sections = await ctx.db
            .query("sections")
            .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
            .collect();

        // Get seats for each section
        const sectionsWithSeats = await Promise.all(
            sections.map(async (section) => {
                const seats = await ctx.db
                    .query("seats")
                    .withIndex("by_section", (q) => q.eq("sectionId", section._id))
                    .collect();

                const priceZone = section.priceZoneId
                    ? await ctx.db.get(section.priceZoneId)
                    : null;

                return {
                    ...section,
                    seats,
                    priceZone,
                };
            })
        );

        return {
            venue,
            sections: sectionsWithSeats,
            config: venue.seatMapConfig,
        };
    },
});

// ==================== SEAT SELECTION & HOLDS ====================

/**
 * Hold seats temporarily (10 minute hold)
 */
export const holdSeats = mutation({
    args: {
        eventId: v.id("events"),
        seatIds: v.array(v.id("seats")),
        sessionId: v.string(),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        const now = Date.now();
        const holdDuration = 10 * 60 * 1000; // 10 minutes

        // Validate all seats are available
        const seats = await Promise.all(
            args.seatIds.map(id => ctx.db.get(id))
        );

        const unavailableSeats = seats.filter(
            seat => !seat || seat.status !== "available"
        );

        if (unavailableSeats.length > 0) {
            throw new Error(`Some seats are no longer available`);
        }

        // Create hold record
        const holdId = await ctx.db.insert("seatHolds", {
            eventId: args.eventId,
            seatIds: args.seatIds,
            userId: user?._id,
            sessionId: args.sessionId,
            holdExpiresAt: now + holdDuration,
            holdDurationMs: holdDuration,
            status: "active",
            createdAt: now,
            updatedAt: now,
        });

        // Update all seats to held status
        for (const seat of seats) {
            await ctx.db.patch(seat._id, {
                status: "held",
                currentHoldId: holdId,
                lastStatusChange: now,
                updatedAt: now,
            });

            // Create audit event
            await ctx.db.insert("seatEvents", {
                seatId: seat._id,
                eventId: args.eventId,
                eventType: "hold_created",
                fromStatus: "available",
                toStatus: "held",
                userId: user?._id,
                sessionId: args.sessionId,
                holdId,
                occurredAt: now,
            });
        }

        return {
            holdId,
            expiresAt: now + holdDuration,
            seatIds: args.seatIds,
        };
    },
});

/**
 * Release held seats
 */
export const releaseSeats = mutation({
    args: {
        holdId: v.id("seatHolds"),
    },
    handler: async (ctx, args) => {
        const hold = await ctx.db.get(args.holdId);
        if (!hold) {
            throw new Error("Hold not found");
        }

        const now = Date.now();

        // Update hold status
        await ctx.db.patch(args.holdId, {
            status: "released",
            updatedAt: now,
        });

        // Release all seats
        for (const seatId of hold.seatIds) {
            const seat = await ctx.db.get(seatId);
            if (seat && seat.currentHoldId === args.holdId) {
                await ctx.db.patch(seatId, {
                    status: "available",
                    currentHoldId: undefined,
                    lastStatusChange: now,
                    updatedAt: now,
                });

                // Create audit event
                await ctx.db.insert("seatEvents", {
                    seatId,
                    eventId: hold.eventId,
                    eventType: "hold_released",
                    fromStatus: "held",
                    toStatus: "available",
                    sessionId: hold.sessionId,
                    holdId: args.holdId,
                    occurredAt: now,
                });
            }
        }

        return { success: true };
    },
});

/**
 * Expire old seat holds (run as cron job)
 */
export const expireOldHolds = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        // Find all active holds that have expired
        const expiredHolds = await ctx.db
            .query("seatHolds")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .filter((q) => q.lt(q.field("holdExpiresAt"), now))
            .collect();

        for (const hold of expiredHolds) {
            // Update hold status
            await ctx.db.patch(hold._id, {
                status: "expired",
                updatedAt: now,
            });

            // Release seats
            for (const seatId of hold.seatIds) {
                const seat = await ctx.db.get(seatId);
                if (seat && seat.currentHoldId === hold._id) {
                    await ctx.db.patch(seatId, {
                        status: "available",
                        currentHoldId: undefined,
                        lastStatusChange: now,
                        updatedAt: now,
                    });

                    // Audit event
                    await ctx.db.insert("seatEvents", {
                        seatId,
                        eventId: hold.eventId,
                        eventType: "hold_expired",
                        fromStatus: "held",
                        toStatus: "available",
                        holdId: hold._id,
                        occurredAt: now,
                    });
                }
            }
        }

        return { expiredCount: expiredHolds.length };
    },
});

/**
 * Confirm seat booking (called when registration is completed)
 */
export const confirmSeatBooking = mutation({
    args: {
        holdId: v.id("seatHolds"),
        registrationId: v.id("registrations"),
    },
    handler: async (ctx, args) => {
        const hold = await ctx.db.get(args.holdId);
        if (!hold) {
            throw new Error("Hold not found");
        }

        if (hold.status !== "active") {
            throw new Error("Hold is no longer active");
        }

        const now = Date.now();

        // Update hold as converted
        await ctx.db.patch(args.holdId, {
            status: "converted",
            updatedAt: now,
        });

        // Mark seats as booked
        for (const seatId of hold.seatIds) {
            await ctx.db.patch(seatId, {
                status: "booked",
                currentHoldId: undefined,
                registrationId: args.registrationId,
                lastStatusChange: now,
                updatedAt: now,
            });

            // Audit event
            await ctx.db.insert("seatEvents", {
                seatId,
                eventId: hold.eventId,
                eventType: "booking_confirmed",
                fromStatus: "held",
                toStatus: "booked",
                userId: hold.userId,
                sessionId: hold.sessionId,
                holdId: args.holdId,
                registrationId: args.registrationId,
                occurredAt: now,
            });
        }

        return { success: true };
    },
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate seat positions based on layout type
 */
function generateSeats(sectionId, rowCount, seatsPerRow, layoutType, sectionOffset) {
    const seats = [];
    const rowLabels = generateRowLabels(rowCount);

    // Base positioning (will be adjusted by layout type)
    const baseY = 100 + (sectionOffset * 250); // Offset sections vertically
    const baseX = 100;
    const seatSpacing = 32; // 24px seat + 8px gap
    const rowSpacing = 40;

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        const rowLabel = rowLabels[rowIdx];

        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            let xPos, yPos;

            switch (layoutType) {
                case 'theater':
                    // Fan-shaped: wider rows at the back
                    const fanFactor = 1 + (rowIdx * 0.1);
                    xPos = baseX + (seatNum * seatSpacing * fanFactor);
                    yPos = baseY + (rowIdx * rowSpacing);
                    break;

                case 'stadium':
                    // Concentric circles
                    const radius = 200 + (rowIdx * 30);
                    const angleStep = (Math.PI * 1.5) / seatsPerRow;
                    const angle = -Math.PI * 0.75 + (seatNum * angleStep);
                    xPos = 600 + Math.cos(angle) * radius;
                    yPos = 400 + Math.sin(angle) * radius;
                    break;

                case 'conference':
                    // Simple grid
                    xPos = baseX + (seatNum * seatSpacing);
                    yPos = baseY + (rowIdx * rowSpacing);
                    break;

                case 'outdoor':
                    // Freeform (similar to conference for now)
                    xPos = baseX + (seatNum * seatSpacing);
                    yPos = baseY + (rowIdx * rowSpacing);
                    break;

                default:
                    xPos = baseX + (seatNum * seatSpacing);
                    yPos = baseY + (rowIdx * rowSpacing);
            }

            seats.push({
                sectionId,
                rowLabel,
                seatNumber: seatNum,
                displayLabel: `${rowLabel}-${seatNum}`,
                xPosition: Math.round(xPos),
                yPosition: Math.round(yPos),
                viewQualityScore: calculateViewQuality(rowIdx, seatNum, rowCount, seatsPerRow),
                accessibilityScore: seatNum <= 2 ? 100 : 50, // Aisle seats get higher score
            });
        }
    }

    return seats;
}

/**
 * Generate row labels (A, B, C... AA, AB...)
 */
function generateRowLabels(count) {
    const labels = [];
    for (let i = 0; i < count; i++) {
        if (i < 26) {
            labels.push(String.fromCharCode(65 + i)); // A-Z
        } else {
            const first = String.fromCharCode(65 + Math.floor(i / 26) - 1);
            const second = String.fromCharCode(65 + (i % 26));
            labels.push(first + second); // AA, AB, ...
        }
    }
    return labels;
}

/**
 * Calculate view quality score (0-100)
 */
function calculateViewQuality(rowIdx, seatNum, totalRows, seatsPerRow) {
    // Front rows = better view
    const rowScore = ((totalRows - rowIdx) / totalRows) * 50;

    // Center seats = better view
    const center = seatsPerRow / 2;
    const distanceFromCenter = Math.abs(seatNum - center);
    const seatScore = ((seatsPerRow / 2 - distanceFromCenter) / (seatsPerRow / 2)) * 50;

    return Math.round(rowScore + seatScore);
}
