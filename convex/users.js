import { internal, api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * CRYPTO HELPERS (SHA-256)
 * Secure password hashing and verification
 */
async function hashPassword(password) {
  const salt = Math.random().toString(36).substring(2, 15);
  const textBuffer = new TextEncoder().encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", textBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${salt}:${hashHex}`;
}

async function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const textBuffer = new TextEncoder().encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", textBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === originalHash;
}

function generateToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// =========================================================
// AUTHENTICATION MUTATIONS (MASTER)
// =========================================================

/**
 * registerUser: Creates a new user with a hashed password and assigns initial roles.
 */
export const registerUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(), // "organizer" or "attendee"
  },
  handler: async (ctx, args) => {
    // 1. Check duplicate email (Efficient Index lookup)
    const existingByProfile = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("profile.primaryEmail.address", args.email))
      .first();

    const existingByTopLevel = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingByProfile || existingByTopLevel) {
      return { success: false, error: "Email already registered!" };
    }

    // 2. Lookup role document to get _id
    const roleDoc = await ctx.db
      .query("roles")
      .withIndex("by_key", (q) => q.eq("key", args.role))
      .first();

    if (!roleDoc) {
      return { success: false, error: "Requested role not found in system." };
    }

    const now = Date.now();
    const passwordHash = await hashPassword(args.password);

    // 3. Insert user document
    const newUserId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: passwordHash,
      role: args.role, // Unified Role String
      status: "active",
      statusChangedAt: now,
      externalId: `custom_${now}`,
      authProvider: "internal",
      createdAt: now,
      updatedAt: now,
      version: 1,
      profile: {
        legalFirstName: args.name.split(' ')[0] || args.name,
        legalLastName: args.name.split(' ').slice(1).join(' ') || "User",
        displayName: args.name,
        title: "Member",
        department: "General",
        employeeId: `EMP-${now}`,
        primaryEmail: {
          address: args.email,
          verified: false,
          isMarketingAllowed: false,
          isTransactionalAllowed: true,
        },
        timezone: "UTC",
        locale: "en-US",
        currencyPreference: "USD",
        dataProcessingConsent: {
          consentedAt: now,
          version: "1.0",
          purposes: ["auth"],
        },
        mfaEnabled: false,
        accessibility: {
          requiresClosedCaptions: false,
          wheelchairAccess: false,
          dietaryRestrictions: [],
        },
        employeeType: "full_time"
      },
    });

    // 4. Assign Resolved Role Record
    await ctx.db.patch(newUserId, {
      roles: [{
        roleId: roleDoc._id,
        assignedBy: newUserId,
        assignedAt: now,
      }]
    });

    // 5. Generate Session
    const token = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("user_sessions", {
      userId: newUserId,
      token,
      expiresAt,
    });

    return {
      success: true,
      token,
      userId: newUserId,
      role: args.role,
      name: args.name,
      email: args.email
    };
  },
});

/**
 * login: Validates credentials and returns a session token.
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Find User (Using new optimized index)
    let user = await ctx.db
      .query("users")
      .withIndex("by_top_level_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      // Fallback for legacy or SSO users
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("profile.primaryEmail.address", args.email))
        .first();
    }

    if (!user) {
      console.log("Login: User not found for email:", args.email);
      throw new Error("Invalid credentials");
    }

    if (!user.passwordHash) {
      console.log("Login: User exists but has no password hash (SSO/Legacy):", args.email);
      throw new Error("Invalid credentials (no password set for this account)");
    }

    // 2. Verify Password
    const isValid = await verifyPassword(args.password, user.passwordHash);
    if (!isValid) {
      console.log("Login: Password mismatch for user:", args.email);
      throw new Error("Invalid credentials");
    }

    // 3. Manage Session
    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("user_sessions", {
      userId: user._id,
      token,
      expiresAt,
    });

    return {
      success: true,
      token,
      userId: user._id,
      role: user.role || "attendee",
      name: user.name || user.profile?.displayName,
      email: user.email || user.profile?.primaryEmail?.address,
    };
  },
});

/**
 * logout: Revokes a session token.
 */
export const logout = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return { success: true };

    const session = await ctx.db
      .query("user_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
    return { success: true };
  },
});

// =========================================================
// IDENTITY & ROLES (MASTER)
// =========================================================

export const getCurrentUser = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let user = null;

    if (args.token) {
      const session = await ctx.db
        .query("user_sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token))
        .first();

      if (session && session.expiresAt > Date.now()) {
        user = await ctx.db.get(session.userId);
      }
    }

    if (!user) {
      let identity = await ctx.auth.getUserIdentity();
      if (!identity && process.env.NODE_ENV === "development") {
        const mockId = "mock-user-id-12345";
        identity = { subject: mockId, tokenIdentifier: mockId };
      }
      if (!identity) return null;

      const externalId = identity.subject || identity.tokenIdentifier;
      user = await ctx.db
        .query("users")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .unique();
    }

    if (!user) return null;

    // Resolve roles for standard structure
    let resolvedRoles = await Promise.all(
      (user.roles || []).map(async (userRole) => {
        const roleDoc = await ctx.db.get(userRole.roleId);
        return roleDoc ? { ...roleDoc, ...userRole } : null;
      })
    );

    const roleKey = resolvedRoles.filter(Boolean)[0]?.key || user.role || "attendee";

    return {
      ...user,
      role: roleKey,
      roles: resolvedRoles.filter(Boolean),
    };
  },
});

export const upgradeToOrganizer = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not logged in");

    const roleDoc = await ctx.db
      .query("roles")
      .withIndex("by_key", (q) => q.eq("key", "organizer"))
      .first();

    if (!roleDoc) throw new Error("Role 'organizer' not found");

    const hasOrganizer = user.role === "organizer" || user.roles?.some(r => r.key === "organizer");

    if (!hasOrganizer) {
      const currentRoles = user.roles || [];
      await ctx.db.patch(user._id, {
        role: "organizer",
        roles: [...currentRoles, {
          roleId: roleDoc._id,
          assignedBy: user._id,
          assignedAt: Date.now(),
        }]
      });
      return { success: true, message: "Upgraded to Organizer" };
    }
    return { success: true, message: "Already an organizer" };
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
    role: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
    if (!user) throw new Error("User not found");

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
        const currentRoles = user.roles || [];
        const hasRole = currentRoles.some(r => r.roleId === organizerRole._id);
        if (!hasRole) {
          await ctx.db.patch(user._id, {
            role: "organizer",
            roles: [...currentRoles, {
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

/**
 * store: Mutation for SSO/Auth Identity Sync (Legacy/Support)
 */
export const store = mutation({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let identity = await ctx.auth.getUserIdentity();
    if (!identity && process.env.NODE_ENV === "development") {
      identity = {
        subject: "mock-user-id-12345",
        tokenIdentifier: "mock-user-id-12345",
        name: "Test User",
        email: "test@example.com",
      };
    }
    if (!identity) {
      console.log("Store: No identity found. Skipping sync.");
      return null;
    }

    const externalId = identity.subject || identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .unique();

    if (user !== null) return user._id;

    const roleToAssign = (args.role === 'organizer' || args.role === 'attendee') ? args.role : 'attendee';
    const now = Date.now();

    const newUser = {
      externalId,
      authProvider: 'sso',
      role: roleToAssign,
      profile: {
        legalFirstName: identity.givenName || identity.name?.split(" ")[0] || "Guest",
        legalLastName: identity.familyName || identity.name?.split(" ").slice(1).join(" ") || "",
        displayName: identity.name || "Guest",
        primaryEmail: { address: identity.email || "", verified: true, isMarketingAllowed: false, isTransactionalAllowed: true },
        timezone: "UTC",
        locale: "en-US",
        currencyPreference: "USD",
        title: "Member",
        department: "General",
        employeeId: externalId.slice(0, 8),
        employeeType: "full_time"
      },
      status: 'active',
      statusChangedAt: now,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const newUserId = await ctx.db.insert("users", newUser);

    const targetRole = await ctx.db
      .query("roles")
      .withIndex("by_key", (q) => q.eq("key", roleToAssign))
      .first();

    if (targetRole) {
      await ctx.db.patch(newUserId, {
        roles: [{ roleId: targetRole._id, assignedBy: newUserId, assignedAt: now }]
      });
    }

    return newUserId;
  },
});


/**
 * updateProfile: Allows users to update their personal information.
 */
export const updateProfile = mutation({
  args: {
    token: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Validate Session
    const session = await ctx.db
      .query("user_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const userId = session.userId;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // 2. Prepare Updates
    const patches = {
      updatedAt: Date.now(),
    };

    if (args.name) {
      patches.name = args.name;
      // Update nested profile displayName and names as well
      const profile = { ...user.profile };
      profile.displayName = args.name;
      profile.legalFirstName = args.name.split(' ')[0] || profile.legalFirstName;
      profile.legalLastName = args.name.split(' ').slice(1).join(' ') || profile.legalLastName;
      patches.profile = profile;
    }

    if (args.bio !== undefined) {
      // Store bio in metadata or profile (extending schema internally)
      const profile = { ...(patches.profile || user.profile) };
      profile.bio = args.bio; // Adding to profile object
      patches.profile = profile;
    }

    // 3. Patch Database
    await ctx.db.patch(userId, patches);

    return {
      success: true,
      userId,
      name: patches.name || user.name,
    };
  },
});

export const debugGetAllSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("user_sessions").collect();
  },
});
