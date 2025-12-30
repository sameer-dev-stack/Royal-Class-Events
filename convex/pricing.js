/**
 * Dynamic Pricing Mutations and Queries
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Enable dynamic pricing for an event
 */
export const enableDynamicPricing = mutation({
    args: {
        eventId: v.id("events"),
        basePriceMin: v.number(),
        basePriceMax: v.number(),
        currentPrice: v.number(),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event) {
            throw new Error("Event not found");
        }

        // Update event with dynamic pricing configuration
        await ctx.db.patch(args.eventId, {
            dynamicPricingEnabled: true,
            basePriceMin: args.basePriceMin,
            basePriceMax: args.basePriceMax,
            currentPrice: args.currentPrice,
            updatedAt: Date.now(),
        });

        // Record initial price in history
        await ctx.db.insert("priceHistory", {
            eventId: args.eventId,
            price: args.currentPrice,
            reason: "dynamic_pricing_enabled",
            registrationCount: event.registrationCount,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Update event price
 */
export const updateEventPrice = mutation({
    args: {
        eventId: v.id("events"),
        newPrice: v.number(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event) {
            throw new Error("Event not found");
        }

        // Update current price
        await ctx.db.patch(args.eventId, {
            currentPrice: args.newPrice,
            ticketPrice: args.newPrice, // Also update base ticket price
            updatedAt: Date.now(),
        });

        // Record in price history
        await ctx.db.insert("priceHistory", {
            eventId: args.eventId,
            price: args.newPrice,
            reason: args.reason,
            registrationCount: event.registrationCount,
            timestamp: Date.now(),
        });

        return { success: true, newPrice: args.newPrice };
    },
});

/**
 * Save AI prediction results to event
 */
export const savePrediction = mutation({
    args: {
        eventId: v.id("events"),
        demandScore: v.number(),
        predictedRevenue: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.eventId, {
            predictedDemand: args.demandScore,
            predictedRevenue: args.predictedRevenue,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Increment event views
 */
export const incrementViews = mutation({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event) {
            return;
        }

        const currentViews = event.views || 0;

        await ctx.db.patch(args.eventId, {
            views: currentViews + 1,
            updatedAt: Date.now(),
        });

        // Update conversion rate
        if (event.registrationCount > 0) {
            const conversionRate = (event.registrationCount / (currentViews + 1)) * 100;
            await ctx.db.patch(args.eventId, {
                conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimals
            });
        }
    },
});

/**
 * Get price history for an event
 */
export const getPriceHistory = query({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const history = await ctx.db
            .query("priceHistory")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .order("desc")
            .collect();

        return history;
    },
});

/**
 * Get current price for an event (respects dynamic pricing)
 */
export const getCurrentPrice = query({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event) {
            throw new Error("Event not found");
        }

        // Return dynamic price if enabled, otherwise base ticket price
        const price = event.dynamicPricingEnabled && event.currentPrice
            ? event.currentPrice
            : event.ticketPrice;

        return {
            price,
            isDynamic: event.dynamicPricingEnabled || false,
            priceRange: event.dynamicPricingEnabled ? {
                min: event.basePriceMin,
                max: event.basePriceMax,
            } : null,
        };
    },
});

/**
 * Get event analytics data
 */
export const getEventAnalytics = query({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event) {
            throw new Error("Event not found");
        }

        // eventAnalytics and priceHistory tables don't exist yet
        const snapshots = [];
        const priceHistory = [];

        // Get actual registrations for accurate data
        const registrations = await ctx.db
            .query("registrations")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .collect();

        // Calculate Revenue from actual registrations
        const totalRevenue = registrations.reduce((sum, reg) => sum + (reg.unitPrice || 0), 0);

        // Calculate Growth (dummy calculation for now, or based on snapshots)
        const lastWeekSnapshot = snapshots[6];
        const lastWeekRevenue = lastWeekSnapshot ? lastWeekSnapshot.revenue : 0;
        const revenueGrowth = lastWeekRevenue > 0
            ? ((totalRevenue - lastWeekRevenue) / lastWeekRevenue * 100).toFixed(1)
            : 0;

        return {
            totalRevenue,
            revenueGrowth,
            totalViews: event.analytics?.views || 0,
            totalRegistrations: registrations.length,
            snapshots: snapshots.reverse(), // Return in chronological order for charts
            priceHistory,
            event: {
                views: event.analytics?.views || 0,
                registrations: registrations.length,
                conversionRate: event.analytics?.conversionRate || 0,
                predictedDemand: event.predictedDemand,
                predictedRevenue: event.predictedRevenue,
            },
        };
    },
});

/**
 * Record daily analytics snapshot
 */
export const recordAnalyticsSnapshot = mutation({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event) {
            throw new Error("Event not found");
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if snapshot already exists for today
        const existing = await ctx.db
            .query("eventAnalytics")
            .withIndex("by_event_date", (q) =>
                q.eq("eventId", args.eventId).eq("date", today)
            )
            .first();

        const revenue = event.ticketPrice
            ? event.registrationCount * (event.currentPrice || event.ticketPrice)
            : 0;

        const snapshotData = {
            eventId: args.eventId,
            date: today,
            views: event.views || 0,
            registrations: event.registrationCount || 0,
            revenue,
            timestamp: Date.now(),
        };

        if (existing) {
            // Update existing snapshot
            await ctx.db.patch(existing._id, snapshotData);
        } else {
            // Create new snapshot
            await ctx.db.insert("eventAnalytics", snapshotData);
        }

        return { success: true };
    },
});
