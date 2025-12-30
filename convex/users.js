import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Stores or updates a user from an identity provider (e.g. Supabase).
 * This function determines if the user is new or existing based on externalId.
 */
export const store = mutation({
  args: {
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let identity = await ctx.auth.getUserIdentity();

    // DEV_AUTH_BYPASS
    if (!identity) {
      const isDev = process.env.NODE_ENV === "development"; // Simple check, or use a specific env var if exposed
      if (isDev || true) { // Forcing true for now as requested "mock everything"
        console.log("Store: No identity found, using MOCK identity for Dev.");
        identity = {
          subject: "mock-user-id-12345",
          tokenIdentifier: "mock-user-id-12345",
          name: "Test User",
          givenName: "Test",
          familyName: "User",
          email: "test@example.com",
          emailVerified: true
        };
      } else {
        console.log("Store: Authentication identity not found in request context.");
        throw new Error("Called store without authentication present");
      }
    }

    // Standardize IDs: subject is the Supabase UID (UUID)
    const externalId = identity.subject || identity.tokenIdentifier;
    console.log("Store: Mutation called for externalId:", externalId, "with role suggestion:", args.role);

    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .unique();

    const now = Date.now();

    if (user !== null) {
      // If user exists but has no roles, and a role was requested, assign it.
      if (args.role && (!user.roles || user.roles.length === 0)) {
        const requestedRole = await ctx.db
          .query("roles")
          .withIndex("by_key", (q) => q.eq("key", args.role))
          .first();

        if (requestedRole) {
          await ctx.db.patch(user._id, {
            roles: [{
              roleId: requestedRole._id,
              assignedBy: user._id,
              assignedAt: now,
            }],
            updatedAt: now,
          });
          console.log("Store: Patched existing user with requested role:", args.role);
        }
      }
      return user._id;
    }

    // New User Logic
    console.log("Store: Creating new user for:", externalId, "with role suggestion:", args.role);

    // 1. Prepare Role
    const roleToAssign = (args.role === 'organizer' || args.role === 'attendee') ? args.role : 'attendee';
    const targetRole = await ctx.db
      .query("roles")
      .withIndex("by_key", (q) => q.eq("key", roleToAssign))
      .first();

    // 2. Map Profile
    const nameParts = (identity.name || "Guest User").split(" ");
    const legalFirstName = identity.givenName || nameParts[0];
    const legalLastName = identity.familyName || nameParts.slice(1).join(" ") || "";

    const userToInsert = {
      externalId,
      authProvider: 'supabase',
      profile: {
        legalFirstName,
        legalLastName,
        displayName: identity.name || "Guest",
        title: "Member",
        department: "Community",
        employeeId: externalId.slice(0, 8),
        employeeType: "full_time",
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
      },
      roles: [], // MUST START EMPTY TO INSERT SAFELY THEN PATCH OR INCLUDE IF ROLE FOUND
      status: 'active',
      statusChangedAt: now,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    // If we found the role, we can include it immediately if it satisfies the ID type
    if (targetRole) {
      userToInsert.roles = [{
        roleId: targetRole._id,
        assignedBy: externalId, // Temporary externalId until we have user ID? No, must be v.id("users")
        assignedAt: now,
      }];
    }

    // Wait! Schema says assignedBy must be v.id("users"). 
    // So we MUST insert with empty array first, get ID, then patch.
    userToInsert.roles = [];

    const newUserId = await ctx.db.insert("users", userToInsert);

    // 3. Post-insert role patch if found
    if (targetRole) {
      await ctx.db.patch(newUserId, {
        roles: [{
          roleId: targetRole._id,
          assignedBy: newUserId, // Now we have the correct user ID
          assignedAt: now,
        }],
      });
      console.log("Store: Successfully created user and assigned role:", roleToAssign);
    } else {
      console.log("Store: Created user but NO role found for key:", roleToAssign);
    }

    return newUserId;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    let identity = await ctx.auth.getUserIdentity();

    // DEV_AUTH_BYPASS
    if (!identity) {
      // Using the same mock ID as 'store'
      const mockId = "mock-user-id-12345";
      // We only return the mock user if they exist in DB. 
      // If "store" hasn't been called yet, this might still return null, which is correct behavior (not logged in yet in DB terms).
      // BUT for "dummy auth", we want to simulate being logged in.
      // Let's assume the client passes a token or we just fallback.

      // Ideally, the mock user is already in the DB.
      identity = { subject: mockId, tokenIdentifier: mockId };
    }

    const externalId = identity.subject || identity.tokenIdentifier;

    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .unique();

    if (!user) return null;

    // Enhance user object with resolved roles
    const roles = await Promise.all(
      (user.roles || []).map(async (userRole) => {
        const role = await ctx.db.get(userRole.roleId);
        return role ? { ...role, ...userRole } : null;
      })
    );

    return {
      ...user,
      roles: roles.filter(Boolean),
    };
  },
});

const SELF_ASSIGNABLE_ROLES = ["attendee", "organizer"];

export const completeOnboarding = mutation({
  args: {
    location: v.object({
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
    }),
    interests: v.array(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let identity = await ctx.auth.getUserIdentity();
    console.log("completeOnboarding: Identity found:", identity ? "YES" : "NO");

    // DEV_AUTH_BYPASS
    if (!identity) {
      console.log("completeOnboarding: Using MOCK identity");
      identity = { subject: "mock-user-id-12345", tokenIdentifier: "mock-user-id-12345" };
    }

    const externalId = identity.subject || identity.tokenIdentifier;

    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .unique();

    if (!user) throw new Error("User not found");

    if (args.role && !SELF_ASSIGNABLE_ROLES.includes(args.role)) {
      throw new Error(`Cannot self-assign role '${args.role}'. Admin approval required.`);
    }

    const newMetadata = {
      ...(user.metadata || {}),
      onboardingLocation: args.location,
      interests: args.interests,
      hasCompletedOnboarding: true,
    };

    if (args.role === "organizer") {
      const organizerRole = await ctx.db
        .query("roles")
        .withIndex("by_key", (q) => q.eq("key", "organizer"))
        .first();

      if (organizerRole) {
        const hasRole = user.roles.some(r => r.roleId === organizerRole._id);
        if (!hasRole) {
          await ctx.db.patch(user._id, {
            roles: [...user.roles, {
              roleId: organizerRole._id,
              assignedBy: user._id,
              assignedAt: Date.now()
            }]
          });
        }
      }
    }

    await ctx.db.patch(user._id, {
      metadata: newMetadata,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
