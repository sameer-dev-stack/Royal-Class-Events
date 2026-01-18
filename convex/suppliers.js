import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Public: Get Supplier by Slug
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        return supplier; // Returns null if not found
    },
});

// Authenticated: Onboard as a new Supplier
export const onboard = mutation({
    args: {
        token: v.optional(v.string()), // Auth token
        name: v.string(),
        slug: v.string(),
        categories: v.array(v.string()),
        contact: v.object({
            email: v.string(),
            phone: v.optional(v.string()),
            website: v.optional(v.string()),
            instagram: v.optional(v.string()),
        }),
        location: v.object({
            city: v.string(),
            country: v.string(),
            address: v.optional(v.string()),
        }),
        // Initial setup data
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Verify Authentication
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Unauthorized: Please log in to join.");

        // 2. Check if user is already a supplier
        const existingSupplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (existingSupplier) throw new Error("You are already registered as a supplier.");

        // 3. Check slug uniqueness
        const slugTaken = await ctx.db
            .query("suppliers")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (slugTaken) throw new Error("This URL handle is already taken.");

        // 4. Create Supplier Profile
        const supplierId = await ctx.db.insert("suppliers", {
            userId: user._id,
            name: args.name,
            slug: args.slug,
            description: args.description,
            categories: args.categories,
            contact: args.contact,
            location: args.location,
            rating: 0,
            reviewCount: 0,
            verified: false,
            status: "active", // Auto-activate for MVP, or "pending" if strict
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // 5. Upgrade User Role to 'supplier'
        // We need to check if they have it, if not add it.
        // For simplicity, we'll append to roles if not present.
        const hasRole = user.roles.some(r => r.key === "supplier");
        if (!hasRole) {
            // Find the role ID for 'supplier'
            const roleDoc = await ctx.db
                .query("roles")
                .withIndex("by_key", (q) => q.eq("key", "supplier"))
                .first();

            if (roleDoc) {
                await ctx.db.patch(user._id, {
                    roles: [...user.roles, {
                        roleId: roleDoc._id,
                        assignedBy: user._id, // Self-onboard
                        assignedAt: Date.now(),
                    }],
                    // Also update root role field for backward compat if needed, 
                    // though schema uses 'roles' array primarily now.
                    // employeeType: "supplier" // Optional update
                });
            }
        }

        return supplierId;
    },
});

// Public: List Suppliers with filtering
export const list = query({
    args: {
        category: v.optional(v.string()),
        city: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("suppliers").withIndex("by_status", (q) => q.eq("status", "active"));

        // Convex doesn't support multi-field filtering easily without searchIndex
        // We will use the search index if text search is needed, but for exact matches:

        // Naive client-side filtering (efficient for MVP, scalable via search later)
        const suppliers = await q.take(args.limit || 20);

        return suppliers.filter(s => {
            if (args.category && !s.categories.includes(args.category)) return false;
            if (args.city && s.location.city !== args.city) return false;
            return true;
        });
    },
});

// Public: Get Full Supplier Profile with Services and Reviews
export const getProfile = query({
    args: { supplierId: v.id("suppliers") },
    handler: async (ctx, args) => {
        // 1. Fetch Supplier
        const supplier = await ctx.db.get(args.supplierId);
        if (!supplier || supplier.status !== "active") {
            return null; // Not found or inactive
        }

        // 2. Fetch Services (from 'services' table)
        const services = await ctx.db
            .query("services")
            .withIndex("by_supplier", (q) => q.eq("supplierId", args.supplierId))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();

        // 3. Fetch Reviews (limit to 5 most recent)
        const reviews = await ctx.db
            .query("reviews")
            .withIndex("by_supplier", (q) => q.eq("supplierId", args.supplierId))
            .order("desc")
            .take(5);

        // 4. Enrich reviews with user names (privacy-safe)
        const enrichedReviews = await Promise.all(
            reviews.map(async (review) => {
                let reviewer = null;
                try {
                    if (review.userId) reviewer = await ctx.db.get(review.userId);
                } catch (e) { }

                return {
                    ...review,
                    reviewerName: reviewer?.profile?.displayName ||
                        reviewer?.profile?.legalFirstName ||
                        "Anonymous",
                    reviewerImage: reviewer?.profile?.avatarUrl || null,
                };
            })
        );

        // 5. Calculate starting price from services
        const startingPrice = services.length > 0
            ? Math.min(...services.map(s => s.price))
            : null;

        return {
            ...supplier,
            services,
            reviews: enrichedReviews,
            startingPrice,
        };
    },
});

// Public: Get Supplier by ID (simple lookup)
export const getById = query({
    args: { supplierId: v.id("suppliers") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.supplierId);
    },
});

// Public: Search Suppliers with filters
export const searchSuppliers = query({
    args: {
        category: v.optional(v.string()),
        city: v.optional(v.string()),
        minPrice: v.optional(v.number()),
        maxPrice: v.optional(v.number()),
        query: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Get all active suppliers
        const allSuppliers = await ctx.db
            .query("suppliers")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();

        // Filter suppliers
        let filtered = allSuppliers.filter((s) => {
            // Category filter
            if (args.category && !s.categories.includes(args.category)) {
                return false;
            }
            // City filter
            if (args.city && s.location?.city !== args.city) {
                return false;
            }
            // Text search (name, description, categories)
            if (args.query) {
                const searchTerm = args.query.toLowerCase();
                const nameMatch = s.name?.toLowerCase().includes(searchTerm);
                const descMatch = s.description?.toLowerCase().includes(searchTerm);
                const catMatch = s.categories?.some((c) =>
                    c.toLowerCase().includes(searchTerm)
                );
                if (!nameMatch && !descMatch && !catMatch) {
                    return false;
                }
            }
            return true;
        });

        // Enrich with services for price info
        const enriched = await Promise.all(
            filtered.map(async (supplier) => {
                const services = await ctx.db
                    .query("services")
                    .withIndex("by_supplier", (q) => q.eq("supplierId", supplier._id))
                    .filter((q) => q.eq(q.field("active"), true))
                    .collect();

                const startingPrice = services.length > 0
                    ? Math.min(...services.map((s) => s.price))
                    : null;

                return {
                    ...supplier,
                    startingPrice,
                    serviceCount: services.length,
                };
            })
        );

        // Price range filter (after enrichment)
        let result = enriched;
        if (args.minPrice !== undefined || args.maxPrice !== undefined) {
            result = enriched.filter((s) => {
                if (s.startingPrice === null) return false;
                if (args.minPrice && s.startingPrice < args.minPrice) return false;
                if (args.maxPrice && s.startingPrice > args.maxPrice) return false;
                return true;
            });
        }

        // Sort by rating (highest first)
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        // Limit results
        return result.slice(0, args.limit || 50);
    },
});

// Public: Get Featured Suppliers for Landing Page
export const getFeaturedSuppliers = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        // 1. Try to get explicitly featured or high rated vendors
        let featured = await ctx.db
            .query("suppliers")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .filter((q) =>
                q.or(
                    q.eq(q.field("isFeatured"), true),
                    q.gt(q.field("rating"), 4.0)
                )
            )
            .take(args.limit || 8);

        // 2. Fallback: If no featured/high-rated, just take the most recent active vendors
        if (featured.length === 0) {
            featured = await ctx.db
                .query("suppliers")
                .withIndex("by_status", (q) => q.eq("status", "active"))
                .order("desc")
                .take(args.limit || 8);
        }

        // 3. Enrich with services for starting price
        const enriched = await Promise.all(
            featured.map(async (supplier) => {
                const services = await ctx.db
                    .query("services")
                    .withIndex("by_supplier", (q) => q.eq("supplierId", supplier._id))
                    .filter((q) => q.eq(q.field("active"), true))
                    .collect();

                const startingPrice = services.length > 0
                    ? Math.min(...services.map((s) => s.price))
                    : null;

                // Image placeholder logic if needed
                const images = services
                    .map(s => s.images?.[0]) // assuming service has images
                    .filter(Boolean)
                    .slice(0, 3); // Take top 3 service images for carousel

                return {
                    ...supplier,
                    startingPrice,
                    serviceImages: images
                };
            })
        );

        return enriched.sort((a, b) => b.rating - a.rating);
    },
});

// Public: Get all unique categories
export const getCategories = query({
    args: {},
    handler: async (ctx) => {
        const suppliers = await ctx.db
            .query("suppliers")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();

        const categories = new Set();
        suppliers.forEach((s) => {
            s.categories?.forEach((c) => categories.add(c));
        });

        return Array.from(categories).sort();
    },
});

// Public: Get all unique cities
export const getCities = query({
    args: {},
    handler: async (ctx) => {
        const suppliers = await ctx.db
            .query("suppliers")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();

        const cities = new Set();
        suppliers.forEach((s) => {
            if (s.location?.city) {
                cities.add(s.location.city);
            }
        });

        return Array.from(cities).sort();
    },
});

// Authenticated: Get Vendor Dashboard Stats
export const getDashboardStats = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // 1. Auth Check
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Please log in to view dashboard.");

        // 2. Get Supplier Profile
        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) {
            return {
                isSupplier: false,
                message: "You are not registered as a vendor.",
            };
        }

        // 3. Get All Leads
        const allLeads = await ctx.db
            .query("leads")
            .withIndex("by_supplier_status", (q) => q.eq("supplierId", supplier._id))
            .collect();

        // 4. Calculate Stats
        const totalLeads = allLeads.length;
        const newLeads = allLeads.filter((l) => l.status === "new").length;
        const contactedLeads = allLeads.filter((l) => l.status === "contacted").length;
        const quotedLeads = allLeads.filter((l) => l.status === "quoted").length;
        const bookedLeads = allLeads.filter((l) => l.status === "booked").length;

        // Calculate conversion rate
        const conversionRate = totalLeads > 0
            ? Math.round((bookedLeads / totalLeads) * 100)
            : 0;

        // Mock profile views (in production, track real views)
        const profileViews = Math.floor(Math.random() * 100) + totalLeads * 10;

        // 5. Get Recent Leads (last 5)
        const recentLeads = allLeads
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);

        // Enrich with client info
        const enrichedLeads = await Promise.all(
            recentLeads.map(async (lead) => {
                const client = await ctx.db.get(lead.userId);
                return {
                    _id: lead._id,
                    clientName: client?.name || "Anonymous",
                    clientEmail: client?.email || null,
                    eventDate: lead.details?.eventDate,
                    guestCount: lead.details?.guestCount,
                    budget: lead.details?.budget,
                    status: lead.status,
                    createdAt: lead.createdAt,
                    lastActionAt: lead.lastActionAt,
                };
            })
        );

        return {
            isSupplier: true,
            supplier,
            stats: {
                totalLeads,
                newLeads,
                profileViews,
            },
            recentLeads: enrichedLeads,
        };
    },
});

// Authenticated: Get Current User's Supplier Profile
export const getMyProfile = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return null;

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        return supplier;
    },
});

// Authenticated: Get Availability
export const getAvailability = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return [];

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        return supplier?.availability || [];
    },
});

// Authenticated: Update Availability
export const updateAvailability = mutation({
    args: {
        token: v.optional(v.string()),
        availability: v.array(v.number()), // Complete array of unavailable timestamps
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Authentication required.");

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) throw new Error("Supplier profile not found.");

        await ctx.db.patch(supplier._id, {
            availability: args.availability,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Authenticated: Update Supplier Settings (Profile + Payments)
export const updateSettings = mutation({
    args: {
        token: v.optional(v.string()),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        categories: v.optional(v.array(v.string())),
        coverUrl: v.optional(v.string()), // Added cover image support
        contact: v.optional(v.object({
            email: v.string(),
            phone: v.optional(v.string()),
            website: v.optional(v.string()),
            instagram: v.optional(v.string()),
            facebook: v.optional(v.string()),
        })),
        paymentInfo: v.optional(v.object({
            method: v.string(), // "bKash" | "Bank"
            accountNumber: v.string(),
            accountHolder: v.string(),
            bankName: v.optional(v.string()),
            branchName: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Authentication required.");

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) throw new Error("Supplier profile not found.");

        const { token, ...updateData } = args;

        await ctx.db.patch(supplier._id, {
            ...updateData,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Authenticated: Update Supplier Profile (Legacy, kept for backward compat if needed)
export const updateProfile = mutation({
    args: {
        token: v.optional(v.string()),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        categories: v.optional(v.array(v.string())),
        contact: v.optional(v.object({
            email: v.string(),
            phone: v.optional(v.string()),
            website: v.optional(v.string()),
            instagram: v.optional(v.string()),
            facebook: v.optional(v.string()),
        })),
        location: v.optional(v.object({
            city: v.string(),
            country: v.string(),
            address: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Authentication required.");

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) throw new Error("Supplier profile not found.");

        const { token, ...updateData } = args;

        await ctx.db.patch(supplier._id, {
            ...updateData,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Authenticated: List Supplier Services
export const listServices = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return [];

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) return [];

        return await ctx.db
            .query("services")
            .withIndex("by_supplier", (q) => q.eq("supplierId", supplier._id))
            .collect();
    },
});

// Authenticated: Create Service
export const createService = mutation({
    args: {
        token: v.optional(v.string()),
        name: v.string(),
        description: v.string(),
        price: v.number(),
        features: v.array(v.string()),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Authentication required.");

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) throw new Error("Supplier profile not found.");

        const serviceId = await ctx.db.insert("services", {
            supplierId: supplier._id,
            name: args.name,
            description: args.description,
            price: args.price,
            currency: "BDT", // Defaulting to BDT
            features: args.features,
            active: args.active,
        });

        return serviceId;
    },
});

// Authenticated: Update Service
export const updateService = mutation({
    args: {
        token: v.optional(v.string()),
        serviceId: v.id("services"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        price: v.optional(v.number()),
        features: v.optional(v.array(v.string())),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Authentication required.");

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) throw new Error("Supplier profile not found.");

        const service = await ctx.db.get(args.serviceId);
        if (!service || service.supplierId !== supplier._id) {
            throw new Error("Service not found or unauthorized.");
        }

        const { token, serviceId, ...updateData } = args;
        await ctx.db.patch(serviceId, updateData);

        return { success: true };
    },
});

// Authenticated: Delete Service
export const deleteService = mutation({
    args: {
        token: v.optional(v.string()),
        serviceId: v.id("services"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Authentication required.");

        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) throw new Error("Supplier profile not found.");

        const service = await ctx.db.get(args.serviceId);
        if (!service || service.supplierId !== supplier._id) {
            throw new Error("Service not found or unauthorized.");
        }

        await ctx.db.delete(args.serviceId);

        return { success: true };
    },
});

// ==============================================
// REVIEWS SYSTEM
// ==============================================

/**
 * Get Reviews for a Supplier
 */
export const getSupplierReviews = query({
    args: {
        supplierId: v.id("suppliers"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const reviews = await ctx.db
            .query("reviews")
            .filter((q) => q.eq(q.field("supplierId"), args.supplierId))
            .order("desc")
            .take(args.limit || 20);

        // Enrich with reviewer info
        const enriched = await Promise.all(
            reviews.map(async (review) => {
                let reviewer = null;
                try {
                    if (review.userId) reviewer = await ctx.db.get(review.userId);
                } catch (e) { }

                return {
                    ...review,
                    reviewerName: reviewer?.profile?.displayName ||
                        reviewer?.profile?.legalFirstName ||
                        "Anonymous",
                    reviewerAvatar: reviewer?.profile?.avatarUrl || null,
                };
            })
        );

        return enriched;
    },
});

/**
 * Check if user can review this supplier (completed booking, no prior review)
 */
export const canReviewSupplier = query({
    args: {
        token: v.optional(v.string()),
        supplierId: v.id("suppliers"),
    },
    handler: async (ctx, args) => {
        // 1. Get current user
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return { canReview: false, reason: "Not authenticated" };

        // 2. Check for completed lead/booking
        const completedLead = await ctx.db
            .query("leads")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), user._id),
                    q.eq(q.field("supplierId"), args.supplierId),
                    q.or(
                        q.eq(q.field("status"), "booked"),
                        q.eq(q.field("status"), "completed")
                    )
                )
            )
            .first();

        if (!completedLead) {
            return { canReview: false, reason: "No completed booking found" };
        }

        // 3. Check for existing review
        const existingReview = await ctx.db
            .query("reviews")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), user._id),
                    q.eq(q.field("supplierId"), args.supplierId)
                )
            )
            .first();

        if (existingReview) {
            return { canReview: false, reason: "Already reviewed", reviewId: existingReview._id };
        }

        return { canReview: true, leadId: completedLead._id };
    },
});

/**
 * Submit a Review for a Supplier
 */
export const submitReview = mutation({
    args: {
        token: v.optional(v.string()),
        supplierId: v.id("suppliers"),
        leadId: v.optional(v.id("leads")),
        rating: v.number(), // 1-5
        comment: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Verify User
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Please log in to submit a review.");

        // 2. Validate rating
        if (args.rating < 1 || args.rating > 5) {
            throw new Error("Rating must be between 1 and 5.");
        }

        // 3. Verify supplier exists
        const supplier = await ctx.db.get(args.supplierId);
        if (!supplier) throw new Error("Supplier not found.");

        // 4. Check for completed booking
        const completedLead = await ctx.db
            .query("leads")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), user._id),
                    q.eq(q.field("supplierId"), args.supplierId),
                    q.or(
                        q.eq(q.field("status"), "booked"),
                        q.eq(q.field("status"), "completed")
                    )
                )
            )
            .first();

        if (!completedLead) {
            throw new Error("You can only review vendors you have booked.");
        }

        // 5. Check for duplicate review
        const existingReview = await ctx.db
            .query("reviews")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), user._id),
                    q.eq(q.field("supplierId"), args.supplierId)
                )
            )
            .first();

        if (existingReview) {
            throw new Error("You have already reviewed this vendor.");
        }

        const now = Date.now();

        // 6. Insert Review
        const reviewId = await ctx.db.insert("reviews", {
            userId: user._id,
            supplierId: args.supplierId,
            leadId: completedLead._id,
            rating: args.rating,
            comment: args.comment,
            status: "published", // Could be "pending" for moderation
            createdAt: now,
        });

        // 7. Update Supplier Rating (Average)
        const currentRating = supplier.rating || 0;
        const currentCount = supplier.reviewCount || 0;
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + args.rating) / newCount;

        await ctx.db.patch(args.supplierId, {
            rating: Math.round(newRating * 10) / 10, // Round to 1 decimal
            reviewCount: newCount,
            updatedAt: now,
        });

        return {
            success: true,
            reviewId,
            message: "Thank you for your review!"
        };
    },
});
