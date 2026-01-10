import { internal, api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get event with detailed stats for dashboard
export const getEventDashboard = query({
  args: {
    eventId: v.id("events"),
    token: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });

    if (!user) {
      throw new Error("User not found");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the owner
    if (event.ownerId !== user._id) {
      throw new Error("You are not authorized to view this dashboard");
    }

    // Get all registrations
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Calculate stats
    const totalRegistrations = registrations.filter(
      (r) => r.status?.current === "confirmed" || r.status === "confirmed"
    ).length;
    const checkedInCount = registrations.filter(
      (r) => r.checkIn?.status === "checked_in" && (r.status?.current === "confirmed" || r.status === "confirmed")
    ).length;
    const pendingCount = totalRegistrations - checkedInCount;

    // Calculate revenue for paid events
    let totalRevenue = 0;
    const pricingModel = event.financials?.pricingModel || 'free';
    const ticketPrice = event.metadata?.legacyProps?.ticketPrice || 0;
    if (pricingModel === "paid" && ticketPrice) {
      totalRevenue = checkedInCount * ticketPrice;
    }

    // Calculate check-in rate
    const checkInRate =
      totalRegistrations > 0
        ? Math.round((checkedInCount / totalRegistrations) * 100)
        : 0;

    // Calculate time until event
    const now = Date.now();
    const startDateTime = event.timeConfiguration?.startDateTime || event.startDate;
    const endDateTime = event.timeConfiguration?.endDateTime || event.endDate;
    const timeUntilEvent = startDateTime - now;
    const hoursUntilEvent = Math.max(
      0,
      Math.floor(timeUntilEvent / (1000 * 60 * 60))
    );

    const today = new Date().setHours(0, 0, 0, 0);
    const startDay = new Date(startDateTime).setHours(0, 0, 0, 0);
    const endDay = new Date(endDateTime).setHours(0, 0, 0, 0);
    const isEventToday = today >= startDay && today <= endDay;
    const isEventPast = endDateTime < now;

    return {
      event,
      stats: {
        totalRegistrations,
        checkedInCount,
        pendingCount,
        capacity: event.capacityConfig?.totalCapacity || event.capacity || 0,
        checkInRate,
        totalRevenue,
        hoursUntilEvent,
        isEventToday,
        isEventPast,
      },
    };
  },
});
