import { mutation } from "./_generated/server";

export const clear = mutation({
    args: {},
    handler: async (ctx) => {
        const docs = await ctx.db.query("sessions").collect();
        for (const doc of docs) {
            await ctx.db.delete(doc._id);
        }
        return "Cleared " + docs.length + " sessions";
    }
});
