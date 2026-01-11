import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = internalMutation({
    args: {},
    handler: async (ctx) => {
        const roles = [
            {
                key: "admin",
                name: "Admin / Super Admin",
                description: "Full control over the platform",
                permissions: ["*"],
            },
            {
                key: "organizer",
                name: "Event Organizer",
                description: "Create and manage events, tickets, and attendees",
                permissions: [
                    "events:create",
                    "events:edit",
                    "events:delete",
                    "events:publish",
                    "tickets:manage",
                    "attendees:view",
                    "attendees:check_in",
                    "analytics:view",
                    "communications:send"
                ],
            },
            {
                key: "attendee",
                name: "Attendee / Visitor",
                description: "Browse events, purchase tickets, manage bookings",
                permissions: [
                    "events:view",
                    "tickets:purchase",
                    "bookings:view",
                    "bookings:cancel",
                    "profile:manage"
                ],
            },
            {
                key: "support",
                name: "Support / Customer Service",
                description: "Handle user issues, manage disputes and refunds",
                permissions: [
                    "users:view",
                    "tickets:view",
                    "tickets:refund",
                    "support:manage",
                    "disputes:manage"
                ],
            },
        ];

        // Add Supplier Role
        roles.push({
            key: "supplier",
            name: "Supplier / Vendor",
            description: "Manage storefront, services, and leads",
            permissions: [
                "profile:manage",
                "services:manage",
                "leads:view",
                "leads:respond",
                "storefront:edit",
                "analytics:view_basic"
            ],
        });

        // Seed Roles
        const roleIds = {};
        for (const role of roles) {
            const existing = await ctx.db
                .query("roles")
                .withIndex("by_key", (q) => q.eq("key", role.key))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, role);
                roleIds[role.key] = existing._id;
            } else {
                const id = await ctx.db.insert("roles", {
                    ...role,
                    isSystem: true,
                });
                roleIds[role.key] = id;
            }
        }

        // Seed Dummy Users
        const users = [
            {
                email: "admin@royalclass.com",
                name: "Super Admin",
                roleKey: "admin",
                title: "Platform Administrator",
                department: "IT",
            },
            {
                email: "organizer@royalclass.com",
                name: "Event Organizer",
                roleKey: "organizer",
                title: "Senior Events Manager",
                department: "Operations",
            },
            {
                email: "attendee@royalclass.com",
                name: "Hena Matin",
                roleKey: "attendee",
                title: "Guest",
                department: "N/A",
            },
            {
                email: "support@royalclass.com",
                name: "Customer Support",
                roleKey: "support",
                title: "Support Agent",
                department: "Customer Service",
            },
        ];

        for (const u of users) {
            const existingUser = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("profile.primaryEmail.address", u.email))
                .first();

            const roleId = roleIds[u.roleKey];
            if (!roleId) continue;

            const userData = {
                profile: {
                    legalFirstName: u.name.split(" ")[0],
                    legalLastName: u.name.split(" ").slice(1).join(" ") || "",
                    displayName: u.name,
                    primaryEmail: {
                        address: u.email,
                        verified: true,
                        isMarketingAllowed: true,
                        isTransactionalAllowed: true,
                    },
                    title: u.title,
                    department: u.department,
                    employeeType: "full_time",
                    timezone: "Asia/Dhaka",
                    locale: "en-US",
                    currencyPreference: "BDT",
                    // Required default fields
                    dataProcessingConsent: {
                        consentedAt: Date.now(),
                        version: "1.0",
                        purposes: ["all"],
                    },
                    mfaEnabled: false,
                    accessibility: {
                        requiresClosedCaptions: false,
                        wheelchairAccess: false,
                        dietaryRestrictions: [],
                    },
                    employeeId: "EMP-" + Math.floor(Math.random() * 10000),
                },
                roles: [{
                    roleId: roleId,
                    assignedBy: existingUser?._id, // Self-assigned for seed, or undefined if new
                    assignedAt: Date.now(),
                }],
                status: "active",
                statusChangedAt: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                version: 1,
                // Required root fields
                externalId: u.email,
                authProvider: "internal",
            };

            // Fix for assignedBy if user doesn't exist yet
            // For new users, we can't self-reference in the initial insert easily if we want to be strict.
            // We can just use the first roleId as a placeholder or null if schema allows (it checks v.id("users")).
            // Actually, let's create the user first without roles, then patch permission.
            // Or simpler: Use a known ID if we had one. 
            // For now, I'll let assignedBy be undefined if schema allows? 
            // Schema says assignedBy: v.id("users").
            // I will just use the admin user ID if it exists, otherwise I might have a chicken-egg problem.
            // I'll leave assignedBy as the user's own ID *after* creation.

            if (existingUser) {
                // Update roles if needed
                await ctx.db.patch(existingUser._id, {
                    roles: [{
                        roleId: roleId,
                        assignedBy: existingUser._id,
                        assignedAt: Date.now(),
                    }],
                    // Ensure profile fields are set
                    "profile.title": u.title,
                    "profile.displayName": u.name,
                });
            } else {
                // Create new
                const id = await ctx.db.insert("users", {
                    ...userData,
                    roles: [], // Insert empty first
                });

                // Now update with role, self-assigned
                await ctx.db.patch(id, {
                    roles: [{
                        roleId: roleId,
                        assignedBy: id,
                        assignedAt: Date.now(),
                    }],
                    createdBy: id,
                    updatedBy: id,
                });
            }
        }
    },
});
