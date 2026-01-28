import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Validates a coupon code for a specific event and purchase amount.
 * Returns the discount details if valid, otherwise returns error information.
 */
export const validateCoupon = query({
    args: {
        code: v.string(),
        eventId: v.id("events"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const coupon = await ctx.db
            .query("coupons")
            .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
            .first();

        if (!coupon) {
            return { valid: false, message: "Invalid coupon code." };
        }

        if (!coupon.active) {
            return { valid: false, message: "This coupon is no longer active." };
        }

        const now = Date.now();
        if (coupon.expiresAt && now > coupon.expiresAt) {
            return { valid: false, message: "This coupon has expired." };
        }

        if (coupon.eventId && coupon.eventId !== args.eventId) {
            return { valid: false, message: "This coupon is not valid for this event." };
        }

        if (coupon.minPurchase && args.amount < coupon.minPurchase) {
            return {
                valid: false,
                message: `Minimum purchase of BDT ${coupon.minPurchase} required.`
            };
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return { valid: false, message: "This coupon has reached its maximum uses." };
        }

        return {
            valid: true,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            couponId: coupon._id,
        };
    },
});

/**
 * Logic to seed a few test coupons if needed
 */
export const seedTestCoupons = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("coupons").collect();
        if (existing.length > 0) return "Coupons already exist.";

        await ctx.db.insert("coupons", {
            code: "WELCOME10",
            discountType: "percentage",
            discountValue: 10,
            usedCount: 0,
            active: true,
        });

        await ctx.db.insert("coupons", {
            code: "SAVE500",
            discountType: "fixed",
            discountValue: 500,
            usedCount: 0,
            active: true,
        });

        return "Test coupons seeded.";
    },
});
