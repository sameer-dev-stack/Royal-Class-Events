
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
    args: { eventId: v.string() },
    handler: async (ctx, args) => {
        // Just try to call the internal save function if possible, or we just check if this file deploys
        console.log("Test mutation deployed successfully");
    }
});
