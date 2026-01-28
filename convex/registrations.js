import { internal, api } from "./_generated/api";
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
    attendeeName: v.string(),
    attendeeEmail: v.string(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not logged in");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.ownerId === userDoc._id) {
      throw new Error("Organizers cannot register for their own events");
    }

    const userId = userDoc._id;

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
        q.eq("eventId", args.eventId).eq("userId", userId)
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
      userId: userId,
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
          changedBy: userId, // Self registered
          notes: "Self registration"
        }],
        lastUpdated: now
      },

      // Attendee Info
      attendeeInfo: {
        primary: {
          userId: userId,
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
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId,
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
    });

    // Update event registration count
    const currentAnalytics = event.analytics || {};
    const newAnalytics = {
      // Engagement (Required)
      views: currentAnalytics.views || 0,
      uniqueViews: currentAnalytics.uniqueViews || 0,
      saves: currentAnalytics.saves || 0,
      shares: currentAnalytics.shares || 0,

      // Conversion (Required)
      conversionRate: currentAnalytics.conversionRate || 0,
      dropOffRate: currentAnalytics.dropOffRate || 0,

      // Performance (Required)
      loadTime: currentAnalytics.loadTime || 0,
      uptime: currentAnalytics.uptime || 100,
      errorRate: currentAnalytics.errorRate || 0,

      // Satisfaction (Required)
      predictedNps: currentAnalytics.predictedNps || 0,
      sentimentScore: currentAnalytics.sentimentScore || 0,

      // Optional/UI Compatibility
      ...currentAnalytics,
      registrations: (currentAnalytics.registrations || 0) + 1
    };

    await ctx.db.patch(args.eventId, {
      analytics: newAnalytics
    });

    return registrationId;
  },
});

export const getMyRegistrations = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // 1. Unified User Resolution
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });

    if (!user) return [];

    // 2. Efficient Index Lookup
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // 3. Hydrate Event Data & Explode Multi-Seat Registrations
    const explodedRegistrations = [];

    await Promise.all(
      registrations.map(async (reg) => {
        const event = await ctx.db.get(reg.eventId);
        const baseReg = { ...reg, event };

        // Retroactive fix: Split multi-seat registrations into individual tickets
        if (reg.ticketQuantity > 1 && reg.metadata?.selectedSeatIds?.length > 0) {
          reg.metadata.selectedSeatIds.forEach((seat, index) => {
            explodedRegistrations.push({
              ...baseReg,
              _id: `${reg._id}_seat_${index}`, // Virtual ID for React keys
              originalId: reg._id,
              ticketQuantity: 1,
              metadata: {
                ...reg.metadata,
                seatId: seat, // Assign specific seat
                isVirtual: true
              }
            });
          });
        } else {
          // Single ticket or legacy without seat data
          explodedRegistrations.push(baseReg);
        }
      })
    );

    return explodedRegistrations;
  },
});

export const getEventRegistrations = query({
  args: {
    eventId: v.string(), // Changed to string to support slugs
    token: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });

    // Support both direct ID and Slug lookup
    const id = ctx.db.normalizeId("events", args.eventId);
    let event = id ? await ctx.db.get(id) : null;

    if (!event) {
      event = await ctx.db.query("events")
        .withIndex("by_slug", q => q.eq("slug", args.eventId))
        .unique();
    }

    if (!event) throw new Error("Event not found");

    const isAdmin = user?.role === "admin" || user?.roles?.some(r => r.key === "admin");
    const isOwner = event.ownerId === user?._id;

    if (!isAdmin && !isOwner) {
      throw new Error("Unauthorized");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();

    return registrations;
  },
});

export const checkInAttendee = mutation({
  args: { qrCode: v.string(), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });

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
    const isAdmin = user?.role === "admin" || user?.roles?.some(r => r.key === "admin");
    const isOwner = event.ownerId === user?._id;

    // DEV_AUTH_BYPASS
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
  args: { eventId: v.id("events"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let user = null;

    if (args.token) {
      const session = await ctx.db
        .query("user_sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token))
        .first();

      if (session && session.expiresAt > Date.now()) {
        user = await ctx.db.get(session.userId);
      }
    }

    if (!user) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;

      const externalId = identity.subject || identity.tokenIdentifier;
      user = await ctx.db
        .query("users")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .unique();
    }

    if (!user) return null;

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .collect();

    // Return the first active (non-cancelled) registration
    return registrations.find(reg => {
      const status = typeof reg.status === "string" ? reg.status : reg.status?.current;
      return status !== "cancelled";
    });
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

export const cancelRegistration = mutation({
  args: { registrationId: v.id("registrations"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let user = null;

    if (args.token) {
      const session = await ctx.db
        .query("user_sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token))
        .first();

      if (session && session.expiresAt > Date.now()) {
        user = await ctx.db.get(session.userId);
      }
    }

    if (!user) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthenticated");

      const externalId = identity.subject || identity.tokenIdentifier;
      user = await ctx.db
        .query("users")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .unique();
    }

    if (!user) throw new Error("Unauthenticated");

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new Error("Registration not found");

    if (registration.userId !== user._id) {
      throw new Error("Unauthorized to cancel this registration");
    }

    if (registration.status?.current === "cancelled") {
      throw new Error("Registration is already cancelled");
    }

    const now = Date.now();

    // Update registration status
    await ctx.db.patch(args.registrationId, {
      status: {
        current: "cancelled",
        history: [
          ...(registration.status?.history || []),
          {
            status: "cancelled",
            changedAt: now,
            changedBy: user._id,
            notes: "User cancelled"
          }
        ],
        lastUpdated: now
      },
      audit: {
        ...(registration.audit || {}),
        updatedAt: now,
        updatedBy: user._id,
        version: (registration.audit?.version || 1) + 1
      }
    });

    // Decrement event analytics
    const event = await ctx.db.get(registration.eventId);
    if (event) {
      const currentRegistrations = event.analytics?.registrations || 0;
      await ctx.db.patch(registration.eventId, {
        analytics: {
          ...(event.analytics || {}),
          registrations: Math.max(0, currentRegistrations - 1)
        }
      });
    }

    return { success: true };
  }
});

// ==================== PHASE 8: SNIPER GUARD ====================

// 1. Get Sold Seats (Reactive Query)
export const getSoldSeats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Filter for confirmed bookings (handles both string and object status)
    const confirmedRegistrations = registrations.filter(reg => {
      const status = reg.status;
      if (typeof status === "string") return status === "confirmed";
      return status?.current === "confirmed";
    });

    // Flatten all seat IDs from metadata or new seatIds field if we were to add one
    const soldSeats = confirmedRegistrations.flatMap((reg) => {
      // Safe access since schema is v.any()
      return reg.metadata?.selectedSeatIds || [];
    });

    return soldSeats;
  },
});

// 2. The Sniper Guard (Mutation)
export const bookSeats = mutation({
  args: {
    eventId: v.id("events"),
    seatIds: v.array(v.string()), // The requested seats
    amount: v.number(), // Total amount before discount
    token: v.optional(v.string()), // Auth token for logged in users

    // Guest Details (Buyer)
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.string(),

    // Individual Attendee Details
    attendeeDetails: v.array(
      v.object({
        seatId: v.string(),
        name: v.string(),
      })
    ),

    // Optional Promo Code
    couponCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 0. Resolve User Identity
    let userId = undefined;
    if (args.token) {
      const userDoc = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
      if (userDoc) userId = userDoc._id;

      if (!userId) {
        throw new Error("Invalid authentication token. Please log out and log in again.");
      }
    }
    console.log("bookSeats: resolved userId", userId);

    // A. Verify Coupon if provided
    let discountAmount = 0;
    let couponId = undefined;
    if (args.couponCode) {
      const couponResult = await ctx.runQuery(api.coupons.validateCoupon, {
        code: args.couponCode,
        eventId: args.eventId,
        amount: args.amount,
      });

      if (couponResult.valid) {
        couponId = couponResult.couponId;
        if (couponResult.discountType === "percentage") {
          discountAmount = (args.amount * couponResult.discountValue) / 100;
        } else {
          discountAmount = couponResult.discountValue;
        }
      } else {
        throw new Error(`Coupon Error: ${couponResult.message}`);
      }
    }

    const finalAmount = Math.max(0, args.amount - discountAmount);

    // B. ATOMIC CHECK: Fetch current inventory
    const existingBookings = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Filter confirmed only
    const confirmedBookings = existingBookings.filter(reg => {
      const status = reg.status;
      if (typeof status === "string") return status === "confirmed";
      return status?.current === "confirmed";
    });

    const allSoldSeats = new Set(
      confirmedBookings.flatMap((reg) => reg.metadata?.selectedSeatIds || [])
    );

    // Fetch dynamic commission rate
    const commissionSetting = await ctx.db
      .query("system_settings")
      .withIndex("by_key", (q) => q.eq("key", "commission_rate"))
      .unique();
    const commissionRate = commissionSetting?.value || 10;
    const platformFee = (finalAmount * commissionRate) / 100;
    const netAmount = finalAmount - platformFee;

    // C. Validate Availability
    const unavailable = args.seatIds.filter(seat => allSoldSeats.has(seat));
    if (unavailable.length > 0) {
      throw new Error(`Seats ${unavailable.join(", ")} are no longer available.`);
    }

    const bookingIds = [];
    const now = Date.now();

    // D. Create Registrations (One per seat for granular tracking)
    for (const seatId of args.seatIds) {
      const regNum = generateRegNumber();
      // Find name for this specific seat
      const attendeeName = args.attendeeDetails.find(a => a.seatId === seatId)?.name || args.guestName;

      const registrationId = await ctx.db.insert("registrations", {
        eventId: args.eventId,
        userId: userId,
        externalId: regNum,
        registrationNumber: regNum,

        ticketQuantity: 1,
        unitPrice: finalAmount / args.seatIds.length,

        status: {
          current: "pending_payment",
          history: [{
            status: "pending_payment",
            changedAt: now,
            changedBy: userId || "system",
            notes: "Awaiting payment via Switchboard OS"
          }],
          lastUpdated: now
        },

        metadata: {
          selectedSeatIds: [seatId],
          isSeated: true,
          couponId,
          originalPrice: args.amount / args.seatIds.length,
        },

        attendeeInfo: {
          primary: {
            verifiedName: attendeeName,
            verifiedEmail: args.guestEmail, // All tickets linked to buyer email currently
            verifiedPhone: args.guestPhone,
          }
        },

        checkIn: { status: "not_checked_in" },
        financials: {
          totalAmount: finalAmount / args.seatIds.length,
          currency: "BDT",
          amountPaid: finalAmount / args.seatIds.length,
          serviceFee: platformFee / args.seatIds.length,
          discountAmount: discountAmount / args.seatIds.length,
        },
        source: { source: "web", registrationCompleted: now },
        audit: { createdAt: now, updatedAt: now, version: 1 }
      });

      bookingIds.push(registrationId);
    }

    // E. Log Transaction (PENDING)
    const transactionId = await ctx.db.insert("transactions", {
      eventId: args.eventId,
      userId: userId,
      payerId: userId,
      amount: finalAmount,
      type: "ticket_sale",
      status: "pending",
      sbos_status: "pending",
      timestamp: now,
      metadata: {
        bookingIds,
        seatIds: args.seatIds,
        guestEmail: args.guestEmail,
        platformFee,
        commissionRate,
        netAmount,
        couponId,
        discountApplied: discountAmount
      }
    });

    // F. Increment Coupon Usage if applicable
    if (couponId) {
      const coupon = await ctx.db.get(couponId);
      if (coupon) {
        await ctx.db.patch(couponId, { usedCount: (coupon.usedCount || 0) + 1 });
      }
    }

    return { success: true, bookingIds, transactionId, amount: finalAmount };
  },
});

export const confirmBooking = mutation({
  args: {
    transactionId: v.id("transactions"),
    sbosPaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status === "success") return; // Already confirmed

    const now = Date.now();
    const bookingIds = transaction.metadata?.bookingIds || [];

    // 1. Update Transaction status
    await ctx.db.patch(args.transactionId, {
      status: "success",
      sbos_status: "paid",
      sbos_payment_intent_id: args.sbosPaymentIntentId,
      timestamp: now,
    });

    // 2. Update Registrations status to 'confirmed'
    for (const bookingId of bookingIds) {
      const reg = await ctx.db.get(bookingId);
      if (reg) {
        await ctx.db.patch(bookingId, {
          status: {
            current: "confirmed",
            history: [
              ...(reg.status?.history || []),
              {
                status: "confirmed",
                changedAt: now,
                changedBy: "system",
                notes: "Payment confirmed via Switchboard OS"
              }
            ],
            lastUpdated: now
          }
        });
      }
    }

    // 3. Update Event Analytics
    const event = await ctx.db.get(transaction.eventId);
    if (event) {
      const currentAnalytics = event.analytics || {};
      await ctx.db.patch(transaction.eventId, {
        analytics: {
          ...currentAnalytics,
          registrations: (currentAnalytics.registrations || 0) + bookingIds.length
        }
      });
    }

    return { success: true };
  },
});

export const failBooking = mutation({
  args: {
    transactionId: v.id("transactions"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) throw new Error("Transaction not found");

    const now = Date.now();
    const bookingIds = transaction.metadata?.bookingIds || [];

    // 1. Update Transaction status
    await ctx.db.patch(args.transactionId, {
      status: "failed",
      sbos_status: "failed",
      metadata: {
        ...transaction.metadata,
        failureReason: args.reason,
      },
      timestamp: now,
    });

    // 2. Update Registrations status to 'cancelled' or 'failed'
    for (const bookingId of bookingIds) {
      const reg = await ctx.db.get(bookingId);
      if (reg) {
        await ctx.db.patch(bookingId, {
          status: {
            current: "cancelled",
            history: [
              ...(reg.status?.history || []),
              {
                status: "cancelled",
                changedAt: now,
                changedBy: "system",
                notes: `Payment failed: ${args.reason}`
              }
            ],
            lastUpdated: now
          }
        });
      }
    }

    return { success: true };
  },
});

export const updateTransactionIntent = mutation({
  args: {
    transactionId: v.id("transactions"),
    sbosPaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      sbos_payment_intent_id: args.sbosPaymentIntentId,
    });
  },
});

export const getBooking = query({
  args: { bookingId: v.id("registrations") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return null;

    const event = await ctx.db.get(booking.eventId);

    return {
      ...booking,
      eventTitle: event?.title?.en || "Unknown Event",
      eventDate: event?.timeConfiguration?.startDateTime || Date.now(),
      eventLocation: "Royal Arena (Main Hall)",
    };
  },
});

// End of file
