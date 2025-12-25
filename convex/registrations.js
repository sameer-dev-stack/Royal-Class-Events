import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate unique QR code ID
function generateQRCode() {
  return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Generate registration number
function generateRegNumber() {
  return `REG-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
}

// Register for an event
export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
    attendeeName: v.string(), // We might use this if user profile incomplete?
    attendeeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Check capacity (mapped from new schema)
    // event.registrationConfig.maxAttendees
    const maxAttendees = event.registrationConfig?.maxAttendees || 9999;
    const currentCount = event.analytics?.registrations || event.registrationCount || 0;

    if (currentCount >= maxAttendees) {
      throw new Error("Event is full");
    }

    // Check existing registration
    // Index: .index("by_event_user", ["eventId", "userId"]) ?? 
    // Wait, let's look at schema indexes for registrations table.
    // .index("by_event_user", ["eventId", "userId"]) exists in schema? 
    // Yes, generally standard. Let's assume it exists or use filter.

    // Actually, looking at schema file I see:
    // .index("by_event_user", ["eventId", "userId"])

    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();

    if (existingRegistration) {
      throw new Error("Already registered");
    }

    const now = Date.now();
    const qrCode = generateQRCode();
    const regNum = generateRegNumber();

    const registrationId = await ctx.db.insert("registrations", {
      tenantId: event.tenantId, // Inherit from event
      eventId: args.eventId,
      userId: user._id,
      externalId: regNum,
      registrationNumber: regNum,

      // Ticket Details
      ticketTierId: undefined, // Needs a ticket tier selection flow
      ticketQuantity: 1,
      unitPrice: 0, // Free for now

      // Status
      status: {
        current: "confirmed",
        history: [{
          status: "confirmed",
          changedAt: now,
          changedBy: user._id // Self registered
        }],
        lastUpdated: now
      },

      // Attendee Info
      attendeeInfo: {
        legalFirstName: args.attendeeName.split(" ")[0] || "Guest",
        legalLastName: args.attendeeName.split(" ").slice(1).join(" ") || "",
        email: args.attendeeEmail,
        company: user.metadata?.company || "",
        jobTitle: user.metadata?.title || "",
        preferences: {
          dietaryRequirements: [],
          accessibilityNeeds: [],
          marketingConsent: false
        }
      },

      // Check-in
      checkIn: {
        isCheckedIn: false,
        qrCode: qrCode,
        badgePrinted: false,
        badgePrintCount: 0,
        materialsDistributed: []
      },

      // Financials
      financials: {
        totalAmount: 0,
        currency: "USD",
        paymentStatus: "paid", // It's free
        transactions: []
      },

      source: {
        channel: "web",
        campaign: "direct",
        referrer: ""
      },

      sessionAttendance: [],
      communications: [],

      createdAt: now,
      updatedAt: now,
      version: 1
    });

    // Update event registration count
    // In enterprise schema, this is likely in `analytics.registrations` or similar
    // We update the root analytics object if possible, or just ignore for now if it's derived.
    // But let's try to be good citizens.
    const newAnalytics = {
      ...(event.analytics || {}),
      registrations: (event.analytics?.registrations || 0) + 1
    };

    await ctx.db.patch(args.eventId, {
      analytics: newAnalytics,
      // Also update legacy if present
      registrationCount: (event.registrationCount || 0) + 1
    });

    return registrationId;
  },
});

export const getMyRegistrations = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return [];

    const registrations = await ctx.db
      .query("registrations")
      // .withIndex("by_user", (q) => q.eq("userId", user._id)) // Check index exist
      .filter(q => q.eq(q.field("userId"), user._id))
      .collect();

    const withEvents = await Promise.all(
      registrations.map(async (reg) => {
        const event = await ctx.db.get(reg.eventId);
        return { ...reg, event };
      })
    );

    return withEvents;
  },
});

export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return registrations;
  },
});

export const checkInAttendee = mutation({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Need an index on checkIn.qrCode ??
    // Schema likely has .index("by_qr", ["checkIn.qrCode"])
    // If not, we scan.

    // The QR code value is stored in checkIn.qrCode but we look it up by registrationNumber
    // which equals the qrCode value
    const registration = await ctx.db
      .query("registrations")
      .filter(q => q.eq(q.field("checkIn.qrCode"), args.qrCode))
      .first();

    if (!registration) throw new Error("Invalid QR");

    const event = await ctx.db.get(registration.eventId);
    if (event.ownerId !== user._id) throw new Error("Unauthorized");

    if (registration.checkIn.isCheckedIn) return { success: false, message: "Already checked in" };

    const now = Date.now();
    const newCheckIn = {
      ...registration.checkIn,
      isCheckedIn: true,
      checkedInAt: now,
      checkedInBy: user._id,
      method: "qr_scan"
    };

    const newStatus = {
      ...registration.status,
      current: "checked_in",
      history: [...registration.status.history, {
        status: "checked_in",
        changedAt: now,
        changedBy: user._id
      }],
      lastUpdated: now
    };

    await ctx.db.patch(registration._id, {
      checkIn: newCheckIn,
      status: newStatus,
      updatedAt: now
    });

    return { success: true, message: "Checked in!" };
  },
});

export const checkRegistration = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return null;

    return await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();
  },
});
