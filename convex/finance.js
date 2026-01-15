import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { logAdminAction } from "./audit";

// --- Helper for Auth Check ---
async function getAuthenticatedUser(ctx, token) {
    let user = null;

    // 1. Try Custom Session Token (Internal Auth)
    if (token) {
        const session = await ctx.db
            .query("user_sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (session && session.expiresAt > Date.now()) {
            user = await ctx.db.get(session.userId);
        }
    }

    // 2. Fallback to Context Auth (Clerk/NextAuth if configured)
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

// MIN_WITHDRAWAL_AMOUNT (BDT minimum)
const MIN_WITHDRAWAL_AMOUNT = 500;

/**
 * Helper to fetch system settings
 */
async function getSystemSettings(ctx) {
    const settings = await ctx.db.query("system_settings").collect();
    return settings.reduce((acc, curr) => ({
        ...acc,
        [curr.key]: curr.value
    }), {
        commission_rate: 10, // Defaults
        maintenance_mode: false
    });
}

// ==============================================
// VENDOR FINANCE QUERIES
// ==============================================

/**
 * Get Vendor's Financial Stats (for Finance Dashboard)
 */
export const getVendorFinanceStats = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) {
            return {
                isSupplier: false,
                isAuthenticated: false,
                message: "Please log in to view your finance dashboard."
            };
        }

        // Get Supplier Profile
        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) {
            return {
                isSupplier: false,
                message: "You are not registered as a vendor."
            };
        }

        // Initialize balances if not present
        const walletBalance = supplier.walletBalance || 0;
        const pendingBalance = supplier.pendingBalance || 0;
        const totalEarnings = supplier.totalEarnings || 0;

        // Get recent transactions for this supplier
        const transactions = await ctx.db
            .query("transactions")
            .filter((q) => q.eq(q.field("payeeId"), supplier._id))
            .order("desc")
            .take(20);

        // Get pending withdrawal requests
        const withdrawals = await ctx.db
            .query("withdrawals")
            .filter((q) => q.eq(q.field("supplierId"), supplier._id))
            .order("desc")
            .take(10);

        const systemSettings = await getSystemSettings(ctx);

        return {
            isSupplier: true,
            supplierId: supplier._id,
            supplierName: supplier.name,
            walletBalance,
            pendingBalance,
            totalEarnings,
            canWithdraw: walletBalance >= MIN_WITHDRAWAL_AMOUNT,
            minWithdrawal: MIN_WITHDRAWAL_AMOUNT,
            commissionRate: systemSettings.commission_rate, // As percentage
            transactions,
            withdrawals,
        };
    }
});

/**
 * Get Transaction History for Vendor
 */
export const getVendorTransactions = query({
    args: {
        token: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) return [];

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) return [];

        const transactions = await ctx.db
            .query("transactions")
            .filter((q) => q.eq(q.field("payeeId"), supplier._id))
            .order("desc")
            .take(args.limit || 50);

        return transactions;
    }
});

// ==============================================
// VENDOR WITHDRAWAL MUTATIONS
// ==============================================

/**
 * Request Withdrawal (Vendor initiates payout request)
 */
export const requestWithdrawal = mutation({
    args: {
        token: v.optional(v.string()),
        amount: v.number(),
        paymentMethod: v.string(), // "bank_transfer", "bkash", "nagad"
        paymentDetails: v.object({
            accountName: v.optional(v.string()),
            accountNumber: v.optional(v.string()),
            bankName: v.optional(v.string()),
            mobileNumber: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) throw new Error("Supplier profile not found.");

        const walletBalance = supplier.walletBalance || 0;

        // Validation
        if (args.amount < MIN_WITHDRAWAL_AMOUNT) {
            throw new Error(`Minimum withdrawal amount is BDT ${MIN_WITHDRAWAL_AMOUNT}.`);
        }

        if (args.amount > walletBalance) {
            throw new Error(`Insufficient balance. Available: BDT ${walletBalance}`);
        }

        const now = Date.now();

        // 1. Deduct from wallet, add to pending
        await ctx.db.patch(supplier._id, {
            walletBalance: walletBalance - args.amount,
            pendingBalance: (supplier.pendingBalance || 0) + args.amount,
            updatedAt: now,
        });

        // 2. Create Withdrawal Request
        const withdrawalId = await ctx.db.insert("withdrawals", {
            supplierId: supplier._id,
            userId: user._id,
            amount: args.amount,
            paymentMethod: args.paymentMethod,
            paymentDetails: args.paymentDetails,
            status: "pending", // pending -> processing -> completed/failed
            requestedAt: now,
            processedAt: null,
            processedBy: null,
            note: null,
        });

        // 3. Create Transaction Record
        await ctx.db.insert("transactions", {
            payeeId: supplier._id,
            payerId: null, // Platform payout
            amount: args.amount,
            type: "withdrawal_request",
            status: "pending",
            timestamp: now,
            metadata: {
                withdrawalId,
                paymentMethod: args.paymentMethod,
            },
        });

        return {
            success: true,
            withdrawalId,
            message: `Withdrawal request for BDT ${args.amount.toLocaleString()} submitted.`
        };
    }
});

/**
 * Process Withdrawal (Admin approves/rejects payout)
 */
export const processWithdrawal = mutation({
    args: {
        token: v.optional(v.string()),
        withdrawalId: v.id("withdrawals"),
        action: v.union(v.literal("approve"), v.literal("reject")),
        note: v.optional(v.string()),
        transactionRef: v.optional(v.string()), // Bank/bKash transaction reference
    },
    handler: async (ctx, args) => {
        // Admin check
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const hasAdminRole = user.role === "admin" || (user.roles || []).some(r => r.key === "admin");
        if (!hasAdminRole) throw new Error("Admin access required.");

        const withdrawal = await ctx.db.get(args.withdrawalId);
        if (!withdrawal) throw new Error("Withdrawal request not found.");

        if (withdrawal.status !== "pending") {
            throw new Error("This withdrawal has already been processed.");
        }

        const supplier = await ctx.db.get(withdrawal.supplierId);
        if (!supplier) throw new Error("Supplier not found.");

        const now = Date.now();

        if (args.action === "approve") {
            // 1. Mark withdrawal as completed
            await ctx.db.patch(args.withdrawalId, {
                status: "completed",
                processedAt: now,
                processedBy: user._id,
                note: args.note,
                transactionRef: args.transactionRef,
            });

            // 2. Deduct from pending balance (already moved from wallet)
            await ctx.db.patch(supplier._id, {
                pendingBalance: Math.max(0, (supplier.pendingBalance || 0) - withdrawal.amount),
                updatedAt: now,
            });

            // 3. Update transaction record
            const txn = await ctx.db
                .query("transactions")
                .filter((q) =>
                    q.and(
                        q.eq(q.field("type"), "withdrawal_request"),
                        q.eq(q.field("metadata.withdrawalId"), args.withdrawalId)
                    )
                )
                .first();

            if (txn) {
                await ctx.db.patch(txn._id, {
                    status: "completed",
                    type: "payout",
                    metadata: {
                        ...txn.metadata,
                        transactionRef: args.transactionRef,
                        processedBy: user._id,
                    }
                });
            }

            return { success: true, message: "Withdrawal approved and processed." };

        } else {
            // Reject: Return funds to wallet
            await ctx.db.patch(args.withdrawalId, {
                status: "rejected",
                processedAt: now,
                processedBy: user._id,
                note: args.note || "Withdrawal rejected by admin.",
            });

            // Return funds from pending to wallet
            await ctx.db.patch(supplier._id, {
                walletBalance: (supplier.walletBalance || 0) + withdrawal.amount,
                pendingBalance: Math.max(0, (supplier.pendingBalance || 0) - withdrawal.amount),
                updatedAt: now,
            });

            // Update transaction
            const txn = await ctx.db
                .query("transactions")
                .filter((q) =>
                    q.and(
                        q.eq(q.field("type"), "withdrawal_request"),
                        q.eq(q.field("metadata.withdrawalId"), args.withdrawalId)
                    )
                )
                .first();

            if (txn) {
                await ctx.db.patch(txn._id, {
                    status: "cancelled",
                    metadata: { ...txn.metadata, rejectedBy: user._id, reason: args.note }
                });
            }

            return { success: true, message: "Withdrawal rejected. Funds returned to wallet." };
        }
    }
});

// ==============================================
// ADMIN FINANCE QUERIES
// ==============================================

/**
 * Get All Pending Withdrawals (Admin View)
 */
export const getPendingWithdrawals = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const hasAdminRole = user.role === "admin" || (user.roles || []).some(r => r.key === "admin");
        if (!hasAdminRole) throw new Error("Admin access required.");

        const pending = await ctx.db
            .query("withdrawals")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .order("desc")
            .take(50);

        // Enrich with supplier info
        const enriched = await Promise.all(
            pending.map(async (w) => {
                const supplier = await ctx.db.get(w.supplierId);
                return {
                    ...w,
                    supplierName: supplier?.name || "Unknown",
                    supplierSlug: supplier?.slug,
                };
            })
        );

        return enriched;
    }
});

/**
 * Get Platform Finance Summary (Admin Dashboard)
 */
export const getPlatformFinanceSummary = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const hasAdminRole = user.role === "admin" || (user.roles || []).some(r => r.key === "admin");
        if (!hasAdminRole) throw new Error("Admin access required.");

        // Get all transactions
        const allTransactions = await ctx.db.query("transactions").collect();

        // Calculate totals
        const totalGMV = allTransactions
            .filter(t => t.type === "escrow_in" || t.type === "payment")
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const totalCommission = allTransactions
            .filter(t => t.type === "commission")
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const totalPayouts = allTransactions
            .filter(t => t.type === "payout" && t.status === "completed")
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const pendingPayouts = await ctx.db
            .query("withdrawals")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        const pendingPayoutAmount = pendingPayouts.reduce((sum, w) => sum + w.amount, 0);

        const systemSettings = await getSystemSettings(ctx);

        return {
            totalGMV,
            totalCommission,
            totalPayouts,
            pendingPayoutAmount,
            pendingPayoutCount: pendingPayouts.length,
            commissionRate: systemSettings.commission_rate,
        };
    }
});

// ==============================================
// ESCROW MANAGEMENT (Admin)
// ==============================================

/**
 * Get All Held Escrows (Admin - for release)
 */
export const getHeldEscrows = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const hasAdminRole = user.role === "admin" || (user.roles || []).some(r => r.key === "admin");
        if (!hasAdminRole) throw new Error("Admin access required.");

        // Get all held/escrow transactions
        const heldTransactions = await ctx.db
            .query("transactions")
            .filter((q) =>
                q.and(
                    q.eq(q.field("type"), "escrow_in"),
                    q.eq(q.field("status"), "held")
                )
            )
            .order("desc")
            .take(50);

        // Enrich with supplier and lead info
        const enriched = await Promise.all(
            heldTransactions.map(async (txn) => {
                let supplier = null;
                let lead = null;
                let payer = null;

                try {
                    if (txn.payeeId) supplier = await ctx.db.get(txn.payeeId);
                    if (txn.leadId) lead = await ctx.db.get(txn.leadId);
                    if (txn.payerId) payer = await ctx.db.get(txn.payerId);
                } catch (e) {
                    console.error("Error enriching transaction:", e);
                }

                return {
                    ...txn,
                    supplierName: supplier?.name || "Unknown Vendor",
                    supplierSlug: supplier?.slug,
                    leadStatus: lead?.status,
                    payerName: payer?.profile?.displayName || payer?.profile?.legalFirstName || "Client",
                };
            })
        );

        return enriched;
    }
});

/**
 * Release Escrow to Vendor (Admin Action)
 * Splits the held amount: 10% commission + 90% to vendor wallet
 */
export const releaseEscrow = mutation({
    args: {
        token: v.optional(v.string()),
        transactionId: v.id("transactions"),
        note: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const hasAdminRole = user.role === "admin" || (user.roles || []).some(r => r.key === "admin");
        if (!hasAdminRole) throw new Error("Admin access required.");

        const txn = await ctx.db.get(args.transactionId);
        if (!txn) throw new Error("Transaction not found.");

        if (txn.type !== "escrow_in" || txn.status !== "held") {
            throw new Error("This transaction is not eligible for release.");
        }

        const supplier = await ctx.db.get(txn.payeeId);
        if (!supplier) throw new Error("Supplier not found.");

        const systemSettings = await getSystemSettings(ctx);
        const commissionRateDecimal = systemSettings.commission_rate / 100;

        const now = Date.now();
        const totalAmount = txn.amount;
        const commissionAmount = Math.round(totalAmount * commissionRateDecimal);
        const vendorEarnings = totalAmount - commissionAmount;

        // 1. Mark original escrow as released
        await ctx.db.patch(args.transactionId, {
            status: "released",
            metadata: {
                ...txn.metadata,
                releasedAt: now,
                releasedBy: user._id,
                adminNote: args.note,
                commissionDeducted: commissionAmount,
                vendorReceived: vendorEarnings,
            }
        });

        // 2. Create Commission Transaction
        await ctx.db.insert("transactions", {
            leadId: txn.leadId,
            payerId: txn.payeeId, // From vendor
            payeeId: null, // Platform
            amount: commissionAmount,
            type: "commission",
            status: "completed",
            timestamp: now,
            metadata: {
                rate: COMMISSION_RATE,
                sourceTransaction: args.transactionId,
                releasedBy: user._id,
            },
        });

        // 3. Create Vendor Credit Transaction
        await ctx.db.insert("transactions", {
            leadId: txn.leadId,
            payerId: txn.payerId,
            payeeId: txn.payeeId,
            amount: vendorEarnings,
            type: "vendor_credit",
            status: "completed",
            timestamp: now,
            metadata: {
                afterCommission: true,
                commissionDeducted: commissionAmount,
                sourceEscrow: args.transactionId,
            },
        });

        // 4. Update Vendor Balance
        const currentBalance = supplier.walletBalance || 0;
        const currentTotalEarnings = supplier.totalEarnings || 0;

        await ctx.db.patch(txn.payeeId, {
            walletBalance: currentBalance + vendorEarnings,
            totalEarnings: currentTotalEarnings + vendorEarnings,
            updatedAt: now,
        });

        // 5. Update Lead status if exists
        if (txn.leadId) {
            await ctx.db.patch(txn.leadId, {
                status: "completed",
                updatedAt: now,
            });
        }

        return {
            success: true,
            message: `Released ৳${totalAmount.toLocaleString()} - Vendor received ৳${vendorEarnings.toLocaleString()} (after 10% commission)`,
            breakdown: {
                total: totalAmount,
                commission: commissionAmount,
                vendorEarnings: vendorEarnings,
            }
        };
    }
});
import { checkAdmin } from "./admin";

export const getFinancials = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const transactions = await ctx.db.query("transactions").order("desc").collect();

        // Enrich with User and Event details
        const enriched = await Promise.all(transactions.map(async (tx) => {
            let payerName = "Guest";
            let eventTitle = "Unknown";

            if (tx.userId) {
                const user = await ctx.db.get(tx.userId);
                payerName = user?.name || user?.profile?.displayName || "Unknown User";
            } else if (tx.metadata?.guestEmail) {
                payerName = `Guest (${tx.metadata.guestEmail})`;
            }

            if (tx.eventId) {
                const event = await ctx.db.get(tx.eventId);
                eventTitle = event?.title?.en || "Unknown Event";
            }

            return {
                ...tx,
                payerName,
                eventTitle
            };
        }));

        return enriched;
    }
});

export const getPendingPayouts = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const payouts = await ctx.db
            .query("transactions")
            .filter((q) =>
                q.and(
                    q.eq(q.field("type"), "payout"),
                    q.eq(q.field("status"), "pending")
                )
            )
            .collect();

        const enriched = await Promise.all(payouts.map(async (p) => {
            let vendorName = "Unknown Vendor";
            if (p.payeeId) {
                const supplier = await ctx.db.get(p.payeeId);
                vendorName = supplier?.name || "Unknown";
            }
            return { ...p, vendorName };
        }));

        return enriched;
    }
});

export const approvePayout = mutation({
    args: {
        transactionId: v.id("transactions"),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const txn = await ctx.db.get(args.transactionId);
        if (!txn) throw new Error("Transaction not found");

        await ctx.db.patch(args.transactionId, {
            status: "completed",
            metadata: {
                ...txn.metadata,
                approvedAt: Date.now()
            }
        });

        const admin = await checkAdmin(ctx, args.token);
        await logAdminAction(ctx, admin._id, "TRANSACTION_PAYOUT_APPROVED", args.transactionId, {
            amount: txn.amount
        });

        return { success: true };
    }
});

// ==============================================
// NEW VENDOR PAYOUT MANAGEMENT (User Requested)
// ==============================================

export const getPayouts = query({
    args: {
        status: v.optional(v.union(v.literal('pending'), v.literal('completed'), v.literal('rejected'))),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        let payoutQuery = ctx.db.query("payouts");
        if (args.status) {
            payoutQuery = payoutQuery.withIndex("by_status", (q) => q.eq("status", args.status));
        }

        const payouts = await payoutQuery.order("desc").collect();

        // Enrich with Vendor (Supplier) details
        const enriched = await Promise.all(payouts.map(async (p) => {
            const vendor = await ctx.db.get(p.supplierId);
            return {
                ...p,
                vendorName: vendor?.name || vendor?.profile?.displayName || "Unknown Vendor",
                vendorEmail: vendor?.email || vendor?.profile?.primaryEmail?.address || "N/A"
            };
        }));

        return enriched;
    }
});

export const processPayout = mutation({
    args: {
        payoutId: v.id("payouts"),
        status: v.optional(v.string()), // Allow passing status if needed
        transactionRef: v.optional(v.string()),
        notes: v.optional(v.string()),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const payout = await ctx.db.get(args.payoutId);
        if (!payout) throw new Error("Payout request not found");

        await ctx.db.patch(args.payoutId, {
            status: args.status || "completed",
            transactionRef: args.transactionRef,
            notes: args.notes,
            processedAt: Date.now()
        });

        await logAdminAction(ctx, admin._id, "VENDOR_PAYOUT_PROCESSED", args.payoutId, {
            status: args.status || "completed",
            amount: payout.amount
        });

        return { success: true };
    }
});
