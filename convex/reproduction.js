import { query } from "./_generated/server";

export const test = query({
    args: {},
    handler: async (ctx) => {
        const events = await ctx.db.query("events").collect();
        const matches = events.filter(e => {
            const t = (e.title?.en || e.title || "").toString().toLowerCase();
            return t.includes("test for approval");
        });
        return matches.map(e => `[${e._id}] status: ${JSON.stringify(e.status)} | meta: ${JSON.stringify(e.statusMetadata)}`);
    },
});
