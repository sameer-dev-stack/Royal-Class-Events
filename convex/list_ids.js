
import { query } from "./_generated/server";

export default query({
    handler: async (ctx) => {
        const events = await ctx.db.query("events").take(10);
        return events.map(e => ({ id: e._id, title: e.title?.en }));
    }
});
