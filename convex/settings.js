import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// --- Helper for Auth Check ---
async function getAuthenticatedUser(ctx, token) {
    let user = null;
    if (token) {
        const session = await ctx.db
            .query("user_sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();
        if (session && session.expiresAt > Date.now()) {
            user = await ctx.db.get(session.userId);
        }
    }
    if (!user) {
        const identity = await ctx.auth.getUserIdentity();
        if (identity) {
            const externalId = identity.subject || identity.tokenIdentifier;
            user = await ctx.db
                .query("users")
                .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
                .unique();
        }
    }
    return user;
}

/**
 * Publicly accessible settings for frontend logic
 * (Maintenance mode check, fee display, etc.)
 */
export const getPublicSettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("system_settings").collect();

        const mapped = settings.reduce((acc, curr) => ({
            ...acc,
            [curr.key]: curr.value
        }), {
            maintenance_mode: false,
            commission_rate: 10,
            vat_rate: 0,
            fixed_fee: 0
        });

        return {
            maintenance_mode: mapped.maintenance_mode,
            commission_rate: mapped.commission_rate,
            vat_rate: mapped.vat_rate,
            fixed_fee: mapped.fixed_fee
        };
    }
});

/**
 * Get Finance Settings (Admin view with all details)
 */
export const getFinanceSettings = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin");
        if (!isAdmin) throw new Error("Admin access required");

        const settings = await ctx.db.query("system_settings").collect();

        const mapped = settings.reduce((acc, curr) => ({
            ...acc,
            [curr.key]: curr.value
        }), {
            commission_rate: 10,
            vat_rate: 0,
            fixed_fee: 0
        });

        return {
            platformFeePercent: mapped.commission_rate,
            vatPercent: mapped.vat_rate,
            fixedFee: mapped.fixed_fee
        };
    }
});

/**
 * Update Finance Settings (Admin only)
 * - Platform Fee %
 * - VAT on Fee %
 * - Fixed Fee (৳)
 */
export const updateFinanceSettings = mutation({
    args: {
        token: v.optional(v.string()),
        platformFeePercent: v.number(),
        vatPercent: v.number(),
        fixedFee: v.number()
    },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin");
        if (!isAdmin) throw new Error("Admin access required");

        // Validate ranges
        if (args.platformFeePercent < 0 || args.platformFeePercent > 100) {
            throw new Error("Platform Fee must be between 0-100%");
        }
        if (args.vatPercent < 0 || args.vatPercent > 100) {
            throw new Error("VAT must be between 0-100%");
        }
        if (args.fixedFee < 0) {
            throw new Error("Fixed Fee cannot be negative");
        }

        const now = Date.now();

        // Upsert each setting
        const settingsToUpdate = [
            { key: "commission_rate", value: args.platformFeePercent },
            { key: "vat_rate", value: args.vatPercent },
            { key: "fixed_fee", value: args.fixedFee }
        ];

        for (const setting of settingsToUpdate) {
            const existing = await ctx.db
                .query("system_settings")
                .filter(q => q.eq(q.field("key"), setting.key))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    value: setting.value,
                    updatedAt: now,
                    updatedBy: user._id
                });
            } else {
                await ctx.db.insert("system_settings", {
                    key: setting.key,
                    value: setting.value,
                    createdAt: now,
                    updatedAt: now,
                    updatedBy: user._id
                });
            }
        }

        return {
            success: true,
            message: "Finance settings updated successfully",
            settings: {
                platformFeePercent: args.platformFeePercent,
                vatPercent: args.vatPercent,
                fixedFee: args.fixedFee
            }
        };
    }
});
