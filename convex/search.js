import { query } from "./_generated/server";
import { v } from "convex/values";

// Search events by title
export const searchEvents = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length < 2) {
      return [];
    }

    const now = Date.now();

    // Search by title
    const searchResults = await ctx.db
      .query("events")
      .withSearchIndex("event_search", (q) => q.search("title.en", args.query))
      .filter((q) => q.gte(q.field("startDate"), now))
      .take(args.limit ?? 5);

    return searchResults;
  },
});

// Advanced filtered search
export const getFilteredEvents = query({
  args: {
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    ticketType: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all published events
    const allEvents = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    let filteredEvents = allEvents;

    // Apply filters
    if (args.category && args.category !== "all") {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.category === args.category ||
          event.eventSubType === args.category
      );
    }

    if (args.location) {
      const locationLower = args.location.toLowerCase();
      filteredEvents = filteredEvents.filter((event) => {
        const city = (event.city || event.metadata?.legacyProps?.city || "").toLowerCase();
        const state = (event.state || event.metadata?.legacyProps?.state || "").toLowerCase();
        const country = (event.country || event.metadata?.legacyProps?.country || "").toLowerCase();

        return (
          city.includes(locationLower) ||
          state.includes(locationLower) ||
          country.includes(locationLower)
        );
      });
    }

    if (args.dateFrom) {
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = event.startDate || event.timeConfiguration?.startDateTime;
        return eventDate >= args.dateFrom;
      });
    }

    if (args.dateTo) {
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = event.startDate || event.timeConfiguration?.startDateTime;
        return eventDate <= args.dateTo;
      });
    }

    if (args.priceMin !== undefined || args.priceMax !== undefined) {
      filteredEvents = filteredEvents.filter((event) => {
        const price = event.ticketPrice || event.metadata?.legacyProps?.ticketPrice || 0;

        if (args.priceMin !== undefined && price < args.priceMin) return false;
        if (args.priceMax !== undefined && price > args.priceMax) return false;

        return true;
      });
    }

    if (args.ticketType && args.ticketType !== "all") {
      filteredEvents = filteredEvents.filter((event) => {
        const ticketType = event.ticketType || event.financials?.pricingModel;
        return ticketType === args.ticketType;
      });
    }

    // Sort results
    const sortBy = args.sortBy || "date";

    if (sortBy === "date") {
      filteredEvents.sort((a, b) => {
        const dateA = a.startDate || a.timeConfiguration?.startDateTime || 0;
        const dateB = b.startDate || b.timeConfiguration?.startDateTime || 0;
        return dateA - dateB;
      });
    } else if (sortBy === "date-desc") {
      filteredEvents.sort((a, b) => {
        const dateA = a.startDate || a.timeConfiguration?.startDateTime || 0;
        const dateB = b.startDate || b.timeConfiguration?.startDateTime || 0;
        return dateB - dateA;
      });
    } else if (sortBy === "popular") {
      filteredEvents.sort((a, b) => {
        const regA = a.registrationCount || a.analytics?.registrations || 0;
        const regB = b.registrationCount || b.analytics?.registrations || 0;
        return regB - regA;
      });
    } else if (sortBy === "price-asc") {
      filteredEvents.sort((a, b) => {
        const priceA = a.ticketPrice || a.metadata?.legacyProps?.ticketPrice || 0;
        const priceB = b.ticketPrice || b.metadata?.legacyProps?.ticketPrice || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      filteredEvents.sort((a, b) => {
        const priceA = a.ticketPrice || a.metadata?.legacyProps?.ticketPrice || 0;
        const priceB = b.ticketPrice || b.metadata?.legacyProps?.ticketPrice || 0;
        return priceB - priceA;
      });
    }

    // Apply limit
    const limit = args.limit || 50;
    const limitedEvents = filteredEvents.slice(0, limit);

    return {
      events: limitedEvents,
      total: filteredEvents.length,
    };
  },
});
