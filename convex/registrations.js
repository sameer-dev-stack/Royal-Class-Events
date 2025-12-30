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
    if (event.userId === user._id) {
      throw new Error("Organizers cannot register for their own events");
    }

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
          changedBy: user._id, // Self registered
          notes: "Self registration"
        }],
        lastUpdated: now
      },

      // Attendee Info
      attendeeInfo: {
        primary: {
          userId: user._id,
          verifiedName: args.attendeeName,
          verifiedEmail: args.attendeeEmail,
          verifiedPhone: user.profile?.mobilePhone?.number,

          // Badge Info
          badgeName: args.attendeeName,
          badgeTitle: user.profile?.title || user.metadata?.title || "",
          badgeCompany: user.profile?.company || user.metadata?.company || "",
          badgeColor: "Standard",

          // Requirements
          dietaryRestrictions: [],
          accessibilityRequirements: [],

          // Classification
          registrationType: "self",

          emergencyContact: undefined,
          medicalConditions: undefined
        },
        additionalAttendees: [],
        corporateInfo: undefined,
        groupInfo: undefined
      },

      // Check-in
      checkIn: {
        status: "not_checked_in",
        badgePrinted: false,
        badgePrintCount: 0,
        materialsDistributed: []
      },

      // Financials
      financials: {
        totalAmount: 0,
        currency: "BDT",

        amountDue: 0,
        amountPaid: 0,
        subtotal: 0,
        taxAmount: 0,
        processingFee: 0,
        serviceFee: 0,
        discountAmount: 0,

        discounts: [],
        refunds: []
      },

      // Source
      source: {
        source: "web", // Was channel
        campaign: "direct",
        referrer: "",

        browser: "unknown",
        deviceType: "unknown",
        ipAddress: "0.0.0.0",
        os: "unknown",

        firstVisit: now,
        registrationStarted: now,
        registrationCompleted: now,
        timeToComplete: 0,

        abandonedSteps: [],
        stepsCompleted: ["registration_form"]
      },

      // Audit
      audit: {
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
        version: 1
      },

      // Compliance
      compliance: {
        ageVerified: true, // Assumed for now
        idVerified: false,
        termsAccepted: true,
        termsAcceptedAt: now,
        termsVersion: "1.0",
        privacyAccepted: true,
        privacyAcceptedAt: now,
        privacyVersion: "1.0",

        ndaSigned: false,
        waiverSigned: false,
        photoRelease: false
      },

      // Communication
      communication: {
        preferences: {
          emailUpdates: true,
          smsUpdates: false,
          pushNotifications: false,
          partnerCommunications: false,
          photoRelease: false
        },
        sentEmails: [],
        sentSms: []
      },

      // Metadata
      metadata: {
        priority: 0,
        tags: []
      },

      sessionAttendance: [],
      // communications: [], // Removed as it is now 'communication' object in schema, NOT array

      // createdAt: now, // Removed as it is in audit
      // updatedAt: now, // Removed as it is in audit
      // version: 1 // Removed as it is in audit
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
      analytics: newAnalytics
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
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const isAdmin = user?.roles?.some(r => r.key === "admin");
    const isOwner = event.userId === user?._id;

    // DEV_AUTH_BYPASS: Allow the mock user to see all registrations in dev
    const isMockUser = user?.externalId === "mock-user-id-12345";

    if (!isAdmin && !isOwner && !isMockUser) {
      throw new Error("Unauthorized");
    }

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

    // Look up by registrationNumber which matches the QR code value
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_external_id", (q) => q.eq("externalId", args.qrCode))
      .first();

    // Fallback scan if index lookup fails or if qrCode is different
    if (!registration) {
      // try scanning
      const scanReg = await ctx.db.query("registrations")
        .filter(q => q.eq(q.field("registrationNumber"), args.qrCode))
        .first();

      if (!scanReg) throw new Error("Invalid QR: Registration not found");
    }

    const regDoc = registration || (await ctx.db.query("registrations").filter(q => q.eq(q.field("registrationNumber"), args.qrCode)).first());
    if (!regDoc) throw new Error("Invalid QR");

    const event = await ctx.db.get(regDoc.eventId);
    const isAdmin = user?.roles?.some(r => r.key === "admin");
    const isOwner = event.userId === user?._id;

    // DEV_AUTH_BYPASS: Allow the mock user to check in attendees in dev
    const isMockUser = user?.externalId === "mock-user-id-12345";

    if (!isAdmin && !isOwner && !isMockUser) {
      throw new Error("Unauthorized: Only event owners and admins can check in attendees");
    }

    if (regDoc.checkIn.status === "checked_in") return { success: false, message: "Already checked in" };

    const now = Date.now();
    const newCheckIn = {
      ...regDoc.checkIn,
      status: "checked_in",
      checkInTime: now,
      checkedInBy: user._id,
      checkInMethod: "qr_scan"
    };

    const newStatus = {
      ...regDoc.status,
      current: "checked_in",
      history: [...regDoc.status.history, {
        status: "checked_in",
        changedAt: now,
        changedBy: user._id
      }],
      lastUpdated: now
    };

    await ctx.db.patch(regDoc._id, {
      checkIn: newCheckIn,
      status: newStatus,
      // updatedAt: now // in audit
      audit: {
        ...regDoc.audit,
        updatedAt: now,
        updatedBy: user._id,
        version: (regDoc.audit?.version || 1) + 1
      }
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
export const getRegistrationById = query({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) return null;

    const event = await ctx.db.get(registration.eventId);

    // Fallback for QR code if not present in metadata
    const qrCode = registration.metadata?.qrCode || registration.registrationNumber;

    return {
      ...registration,
      event,
      qrCode
    };
  },
});
