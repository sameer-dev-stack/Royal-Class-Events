import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Stores or updates a user from an identity provider (e.g. Clerk).
 * This function determines if the user is new or existing based on externalId.
 */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called store without authentication present");
    }

    // Clerk tokenIdentifier is "issuer|subject"
    // We use the full tokenIdentifier as the externalId to ensure uniqueness.
    const externalId = identity.tokenIdentifier;

    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .unique();

    const now = Date.now();

    if (user !== null) {
      // User exists. We could update fields if needed, but for now just return ID.
      // E.g. update emails if verified status changed.
      // Not critical for login.
      return user._id;
    }

    // New User Logic
    console.log("Creating new user for:", externalId);

    // 1. Get or Create Default Tenant
    // Since tenantId is optional, we search for a "Standard" or "Global" tenant.
    let tenantId = undefined;

    // Check if we have any tenants
    const anyTenant = await ctx.db.query("tenants").first();
    if (anyTenant) {
      tenantId = anyTenant._id;
    } else {
      // No tenants exist. This might be the FIRST user (Admin).
      // Or we should create a "Default Tenant".
      // But creating a tenant requires filling many fields.
      // We'll leave tenantId undefined for now.
    }

    // 2. Construct Profile
    // Map Clerk fields to Enterprise Profile structure
    const nameParts = (identity.name || "Guest User").split(" ");
    const legalFirstName = identity.givenName || nameParts[0];
    const legalLastName = identity.familyName || nameParts.slice(1).join(" ") || "";

    const profile = {
      legalFirstName,
      legalLastName,
      displayName: identity.name || "Guest",
      title: "Member",
      department: "Community",
      employeeId: "N/A",
      employeeType: "full_time", // Required field - default to full_time for community members
      timezone: "UTC",
      locale: "en-US",
      currencyPreference: "USD",
      dataProcessingConsent: {
        consentedAt: now,
        version: "1.0",
        purposes: ["service_delivery"],
      },
      mfaEnabled: false,
      accessibility: {
        requiresClosedCaptions: false,
        wheelchairAccess: false,
        dietaryRestrictions: [],
      },
      primaryEmail: {
        address: identity.email || "",
        verified: identity.emailVerified || false,
        isMarketingAllowed: false,
        isTransactionalAllowed: true,
      },
    };

    // 3. Insert User
    const newUserId = await ctx.db.insert("users", {
      externalId,
      authProvider: 'clerk',
      tenantId, // Can be undefined
      profile,
      roles: [],
      status: 'active',
      statusChangedAt: now,
      createdAt: now,
      updatedAt: now,
      version: 1,
      // Note: Email verification status is stored in profile.primaryEmail.verified
    });

    return newUserId;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", identity.tokenIdentifier))
      .unique();
    return user;
  },
});

export const completeOnboarding = mutation({
  args: {
    location: v.object({
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
    }),
    interests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const newMetadata = {
      ...(user.metadata || {}),
      onboardingLocation: args.location,
      interests: args.interests,
      hasCompletedOnboarding: true,
    };

    await ctx.db.patch(user._id, {
      metadata: newMetadata,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
