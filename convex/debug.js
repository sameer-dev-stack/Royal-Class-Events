import { query } from "./_generated/server";

export const countTitle = query({
    args: {},
    handler: async (ctx) => {
        const events = await ctx.db.query("events").collect();
        return events
            .filter(e => {
                const title = (e.title?.en || e.title || "").toString().toLowerCase();
                return title.includes("test for approval");
            })
            .map(e => ({
                id: e._id,
                status: e.status,
                statusMetadata: e.statusMetadata,
                title: e.title
            }));
    },
});
