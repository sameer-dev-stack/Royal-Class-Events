import { internalMutation } from "./_generated/server";

export const promoteRecentUser = internalMutation({
    args: {},
    handler: async (ctx) => {
        // 1. Find the most recent user
        const recentUser = await ctx.db
            .query("users")
            .order("desc") // newest first
            .first();

        if (!recentUser) {
            console.log("No users found in database.");
            return { success: false, message: "No users found" };
        }

        // 2. Add super_admin role
        const roles = recentUser.roles || [];
        if (roles.includes("super_admin")) {
            console.log(`User ${recentUser.profile.displayName} is already a Super Admin.`);
            return { success: true, message: "Already admin", userId: recentUser._id };
        }

        await ctx.db.patch(recentUser._id, {
            roles: [...roles, "super_admin"],
            updatedAt: Date.now()
        });

        console.log(`Successfully promoted ${recentUser.profile.displayName} (${recentUser.profile.primaryEmail?.address}) to Super Admin.`);
        return { success: true, userId: recentUser._id };
    }
});
