import { query } from "./_generated/server";

export const audit = query({
    args: {},
    handler: async (ctx) => {
        const events = await ctx.db.query("events").collect();
        return events.filter(e => {
            const t = (e.title?.en || e.title || "").toString().toLowerCase();
            return t === "test";
        }).map(e => ({
            id: e._id,
            status: e.status,
            statusMetadata: e.statusMetadata,
            title: e.title
        }));
    },
});
