import { query } from "./_generated/server";
import { v } from "convex/values";

// Helper to get start date safely
const getStartDate = (event) => {
  return event.timeConfiguration?.startDateTime || 0;
};

// Helper to get registration count safely
const getRegCount = (event) => {
  return event.analytics?.registrations || event.registrationCount || 0;
};

// Get featured events (high registration count or recent)
export const getFeaturedEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Use by_dates index from new schema
    // .index("by_dates", ["timeConfiguration.startDateTime", "timeConfiguration.endDateTime"])
    const events = await ctx.db
      .query("events")
      .withIndex("by_dates")
      .order("asc") // Get upcoming
      .filter((q) => q.gte(q.field("timeConfiguration.startDateTime"), now))
      .collect();

    // Sort by registration count for featured
    const featured = events
      .sort((a, b) => getRegCount(b) - getRegCount(a))
      .slice(0, args.limit ?? 3);

    return featured;
  },
});

// Get events by location (city/state)
export const getEventsByLocation = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let events = await ctx.db
      .query("events")
      .withIndex("by_dates")
      .filter((q) => q.gte(q.field("timeConfiguration.startDateTime"), now))
      .collect();

    // Filter by city or state
    // We check both the top-level fields (if migrated) and legacyProps
    if (args.city) {
      const searchCity = args.city.toLowerCase();
      events = events.filter((e) => {
        const city = e.city || e.metadata?.legacyProps?.city;
        return city && city.toLowerCase() === searchCity;
      });
    } else if (args.state) {
      const searchState = args.state.toLowerCase();
      events = events.filter((e) => {
        const state = e.state || e.metadata?.legacyProps?.state;
        return state && state.toLowerCase() === searchState;
      });
    }

    return events.slice(0, args.limit ?? 4);
  },
});

// Get popular events (high registration count)
export const getPopularEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_dates")
      .filter((q) => q.gte(q.field("timeConfiguration.startDateTime"), now))
      .collect();

    // Sort by registration count
    const popular = events
      .sort((a, b) => getRegCount(b) - getRegCount(a))
      .slice(0, args.limit ?? 6);

    return popular;
  },
});

// Get events by category with pagination
export const getEventsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // New schema uses `eventSubType` or `eventType` as category
    // But we don't have an index on `eventSubType` specifically combined with date easily?
    // Actually we have .index("by_type", ["eventType"])
    // And .index("by_department", ["organizingDepartment"])
    // Let's assume 'category' maps to 'eventSubType' which does NOT have a top level index in the massive schema I saw?
    // Wait, let's check schema indexes again.
    // .index("by_classification", ...), .index("by_status", ...)

    // For now, we will fetch all upcoming and filter in memory since dataset is small.
    // Optimisation: If we had "by_category" index on eventSubType we would use it.

    const events = await ctx.db
      .query("events")
      .withIndex("by_dates")
      .filter((q) => q.gte(q.field("timeConfiguration.startDateTime"), now))
      .collect();

    const filtered = events.filter(e => e.eventSubType === args.category);

    return filtered.slice(0, args.limit ?? 12);
  },
});

// Get event counts by category
export const getCategoryCounts = query({
  handler: async (ctx) => {
    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_dates")
      .filter((q) => q.gte(q.field("timeConfiguration.startDateTime"), now))
      .collect();

    // Count events by category (eventSubType)
    const counts = {};
    events.forEach((event) => {
      const cat = event.eventSubType || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return counts;
  },
});
