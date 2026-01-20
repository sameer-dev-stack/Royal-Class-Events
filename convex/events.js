import { internal, api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new event (Enterprise Schema Compatible)
export const publishEvent = mutation({
  args: {
    eventId: v.id("events"),
    token: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not logged in");

    const event = await ctx.db.get(args.eventId);
    if (!event || event.ownerId !== user._id) {
      // Check admin
      const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin" || r.permissions.includes("*"));
      if (!isAdmin) throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.eventId, {
      status: {
        ...event.status,
        current: "published",
        changedAt: Date.now(),
        changedBy: user._id
      }
    });

    return { success: true };
  }
});

export const createEvent = mutation({
  args: {
    // Basic Info
    title: v.string(),
    description: v.string(),

    // Taxonomy
    category: v.string(), // We map this to eventType per best guess or default
    tags: v.array(v.string()),

    // Time
    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),

    // Location
    locationType: v.union(v.literal("physical"), v.literal("online")), // map to 'virtual'
    venue: v.optional(v.string()), // Used to look up or create venue? For now stick in metadata
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),

    // Capacity & Pricing
    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),

    // Media and Theme
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()), // Store in metadata or style config
    venueDesignId: v.optional(v.id("venueDesigns")),
    hasPro: v.optional(v.boolean()),
    seatingMode: v.optional(v.union(v.literal("GENERAL"), v.literal("RESERVED"))),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
      const isPro = args.hasPro || false;

      // 1. Role & Policy Checks
      const hasRole = user.role === "organizer" ||
        user.role === "admin" ||
        user.roles?.some(r => r.key === "organizer" || r.key === "admin" || r.permissions.includes("*"));

      if (!hasRole) {
        throw new Error("Unauthorized: You need an Organizer role to create events.");
      }

      const finalColor = args.themeColor || "#d97706";

      // 2. Image Handling
      let finalCoverImage = args.coverImage || "";
      if (args.coverImage && !args.coverImage.startsWith("http")) {
        finalCoverImage = (await ctx.storage.getUrl(args.coverImage)) || "";
      }

      // 3. Slug Generation
      const slugBase = args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const slug = `${slugBase}-${Date.now()}`;

      // 4. Construct Enterprise Data Structures
      // We fill required Enterprise fields with reasonable defaults or derived data

      const now = Date.now();

      // Mapped Location Config
      const locationConfig = {
        type: args.locationType === "online" ? "virtual" : "physical",
        physicalVenues: [], // We'd need to create a Venue object first to link it. For now leaving empty.
        virtualConfig: args.locationType === "online" ? {
          platform: "custom",
          instanceId: "default",
          region: "us-east-1",
          backupRegion: undefined,
          joinUrl: "https://tbd.com",
          hostUrl: "https://tbd.com",
          dialInNumbers: [],
          waitingRoomEnabled: true,
          passwordProtected: false,
          encryptionLevel: "standard",
          recordingAllowed: false,
          breakoutRooms: false,
          maxBreakoutRooms: 0,
          pollingEnabled: false,
          qnaEnabled: false,
          handRaiseEnabled: false,
          closedCaptioning: false,
          signLanguageInterpreters: 0,
          dataRegion: "us-east-1",
          isCompliant: true,
          complianceCertifications: []
        } : undefined
      };

      // Mapped Time Config
      const timeConfiguration = {
        startDateTime: args.startDate,
        endDateTime: args.endDate,
        timezone: args.timezone,
        localStartTime: new Date(args.startDate).toISOString(), // rough approx
        localEndTime: new Date(args.endDate).toISOString(),
        durationMinutes: (args.endDate - args.startDate) / 60000,
        isRecurring: false,
        supportsMultipleTimezones: false,
        primaryTimezone: args.timezone,
        secondaryTimezones: [],
        setupBufferMinutes: 0,
        teardownBufferMinutes: 0,
        attendeeBufferBefore: 0,
        attendeeBufferAfter: 0
      };

      const newEventId = await ctx.db.insert("events", {
        // --- Core ---
        tenantId: user.tenantId, // Auto-assign to user's tenant
        externalId: slug, // Use slug as external ID reference for now
        eventType: "conference", // Defaulting. 'category' arg could map here if standard.
        eventSubType: args.category,
        seatingMode: args.seatingMode || "GENERAL",
        classification: "public",
        complianceLevel: "standard",

        // --- Basic Info ---
        title: { en: args.title },
        description: { en: args.description },
        venueDesignId: args.venueDesignId, // ADDED
        slug: slug,

        // --- Organization ---
        organizingDepartment: user.profile?.department || "General",
        costCenter: "Default",

        // --- Ownership ---
        ownerId: user._id,
        committeeIds: [],

        // --- Configs ---
        timeConfiguration,
        locationConfig,

        // --- Capacity Configuration (Required) ---
        capacityConfig: {
          totalCapacity: args.capacity,
          reservedCapacity: Math.floor(args.capacity * 0.1), // 10% reserved for VIPs/speakers
          waitlistEnabled: true,
          waitlistCapacity: Math.floor(args.capacity * 0.5), // 50% of capacity for waitlist
          overflowStrategy: "waitlist",
          groupAllocations: [], // Empty initially, configurable in admin panel
          maxDensityPercent: 100,
          socialDistancingRequired: false,
          distancingFeet: undefined
        },

        // --- Registration Configuration (Required) ---
        registrationConfig: {
          opensAt: now,
          closesAt: args.startDate - 86400000, // Closes 1 day before event
          earlyBirdDeadline: undefined,
          requireApproval: false,
          approvalWorkflowId: undefined, // TODO: Create default workflow
          requireNDA: false,
          ndaDocumentId: undefined, // TODO: Create default NDA document
          requireBackgroundCheck: false,
          backgroundCheckLevel: undefined,
          registrationFormId: undefined, // TODO: Create default form
          customFields: [],
          invitationOnly: false,
          invitationMode: "multi_use",
          maxInvitationsPerUser: undefined,
          checkInOpensBeforeMinutes: 60,
          checkInClosesAfterMinutes: 120,
          checkInMethods: ["qr_code", "email"],
          requirePhotoId: false,
          requireCovidTest: false,
          covidTestValidityHours: undefined
        },

        // --- Financials (Required) ---
        financials: {
          budget: args.ticketPrice ? args.capacity * args.ticketPrice : 0,
          actualCost: 0,
          forecastCost: 0,
          revenueTarget: args.ticketPrice ? Math.floor(args.capacity * args.ticketPrice * 0.8) : 0, // 80% capacity target
          actualRevenue: 0,
          pricingModel: args.ticketType === "free" ? "free" : "paid",
          currency: "BDT", // Bangladesh Taka
          taxInclusive: false,
          taxRate: 0,
          taxJurisdiction: "BD",
          paymentProcessor: "sslcommerz",
          merchantAccountId: "default",
          paymentTerms: "immediate",
          refundPolicy: "standard",
          invoiceTemplateId: undefined, // TODO: Create default invoice template
          requirePO: false,
          poPrefix: undefined
        },

        // --- Marketing ---
        marketing: {
          publicListing: true,
          seoOptimized: true,
          metaTitle: args.title,
          metaDescription: args.description.substring(0, 150),
          keywords: args.tags,
          socialSharingEnabled: true
        },

        // --- Content (Required) ---
        content: {
          agendaPublished: false,
          speakerBiosPublished: false,
          materialsAvailable: false,
          recordingAvailable: false,
          coverImage: {
            url: finalCoverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600",
            altText: args.title,
          },
          gallery: [],
          documents: [] // Required: empty array for event documents
        },

        // --- Risk & Compliance (Required) ---
        risk: {
          riskAssessmentId: undefined, // TODO: Create default risk assessment
          securityLevel: "low", // Default security level for public events
          insuranceRequired: false,
          insuranceAmount: undefined,
          insuranceCertificateId: undefined,
          permits: [], // Empty initially, can add permits in admin panel
          emergencyPlanId: undefined, // TODO: Create default emergency plan document
          firstAidStaff: 0,
          securityStaff: 0,
          evacuationRoutes: [],
          dataProcessingAgreementSigned: true,
          dataProtectionOfficerId: undefined,
          dataRetentionPolicyId: undefined // TODO: Create default retention policy
        },

        // --- Logistics (Required) ---
        logistics: {
          cateringRequired: false,
          catererId: undefined,
          dietaryRequirements: [],
          accommodationBlock: undefined,
          shuttleService: undefined,
          avEquipment: [],
          signageRequired: false,
          signageLocations: []
        },

        // --- Status ---
        status: {
          current: "draft", // Use valid schema status
          changedAt: now,
          changedBy: user._id,
          milestones: []
        },

        // --- Analytics ---
        analytics: {
          // Engagement
          views: 0,
          uniqueViews: 0,
          saves: 0,
          shares: 0,

          // Conversion
          conversionRate: 0,
          dropOffRate: 0,

          // Performance
          loadTime: 0,
          uptime: 100,
          errorRate: 0,

          // Satisfaction
          predictedNps: 0,
          sentimentScore: 0,

          // UI Compatibility (optional in schema)
          registrations: 0,
          revenue: 0,
          attendanceRate: 0,
          npsScore: 0,
        },

        // --- Legacy/Support for UI ---
        // Storing stuff that the frontend might look for in metadata if needed
        metadata: {
          legacyProps: {
            city: args.city,
            state: args.state,
            country: args.country,
            themeColor: finalColor,
            venueName: args.venue,
            ticketPrice: args.ticketPrice
          },
          tags: args.tags || [],
          categories: [args.category],
          customAttributes: {},
          systemAttributes: {}
        },

        // --- Audit Trail ---
        audit: {
          createdBy: user._id,
          createdAt: now,
          updatedBy: user._id,
          updatedAt: now,
          version: 1,
          changeLog: [{
            version: 1,
            changedBy: user._id,
            changedAt: now,
            changes: ["Initial event creation"]
          }]
        },

        // --- Schema Required Fields ---
        // Some might be missing, we will find out in validation.
      });

      // Update user stats
      await ctx.db.patch(user._id, {
        freeEventsCreated: (user.freeEventsCreated ?? 0) + 1,
      });

      return newEventId;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },
});

export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!event) return null;

    let ticketPrice = event.metadata?.legacyProps?.ticketPrice;

    if (ticketPrice === undefined || ticketPrice === 0) {
      // Try to find from ticket tiers
      const tiers = await ctx.db
        .query("ticketTiers")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      if (tiers.length > 0) {
        ticketPrice = Math.min(...tiers.map(t => t.price || t.pricing?.basePrice || 0));
      }
    }

    return {
      ...event,
      ticketPrice: ticketPrice || 0
    };
  },
});

// ALIAS: Required by many frontend files
export const getEvent = query({
  args: {
    id: v.optional(v.union(v.id("events"), v.string())),
    eventId: v.optional(v.union(v.id("events"), v.string()))
  },
  handler: async (ctx, args) => {
    const id = args.id || args.eventId;
    if (!id) return null;
    return await getById(ctx, { id });
  }
});

export const getById = query({
  args: { id: v.union(v.id("events"), v.string()) },
  handler: async (ctx, args) => {
    const eventId = ctx.db.normalizeId("events", args.id);
    if (!eventId) return null;

    // Fetch event by ID
    const event = await ctx.db.get(eventId);
    if (!event) return null;

    // Resolve seat map image URL if it's a storage ID
    let finalEvent = { ...event };

    if (event.seatMapConfig?.storageId && !event.seatMapConfig.imageUrl) {
      const url = await ctx.storage.getUrl(event.seatMapConfig.storageId);
      finalEvent.seatMapConfig = {
        ...event.seatMapConfig,
        imageUrl: url || ""
      };
    }

    // Resolve venueLayout background URL if it's a storage ID
    if (event.venueLayout?.background && !event.venueLayout.background.startsWith("http")) {
      const url = await ctx.storage.getUrl(event.venueLayout.background);
      finalEvent.venueLayout = {
        ...event.venueLayout,
        background: url || ""
      };
    }

    let ticketPrice = finalEvent.metadata?.legacyProps?.ticketPrice;

    if (ticketPrice === undefined || ticketPrice === 0) {
      // Try to find from ticket tiers
      const tiers = await ctx.db
        .query("ticketTiers")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      if (tiers.length > 0) {
        ticketPrice = Math.min(...tiers.map(t => t.price || t.pricing?.basePrice || 0));
      }
    }

    return {
      ...event,
      ticketPrice: ticketPrice || 0
    };
  },
});



export const getOrganizerStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
    if (!user) return { revenue: 0, ticketsSold: 0, activeEvents: 0 };

    const events = await ctx.db
      .query("events")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    let revenue = 0;
    let ticketsSold = 0;
    let activeEvents = 0;

    for (const event of events) {
      // Safely access potentially nested/optional fields
      const rev = event.financials?.actualRevenue ?? event.analytics?.revenue ?? 0;
      const tix = event.analytics?.registrations ?? 0;

      revenue += rev;
      ticketsSold += tix;

      if (event.status?.current === "published") {
        activeEvents++;
      }
    }

    return { revenue, ticketsSold, activeEvents };
  },
});

export const getMyEvents = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
    if (!user) return [];

    return await ctx.db
      .query("events")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});


export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not logged in");

    const event = await ctx.db.get(args.eventId);

    const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin" || r.permissions.includes("*"));

    if (!event || (event.ownerId !== user._id && !isAdmin)) {
      throw new Error("Unauthorized");
    }

    // Enterprise delete might be soft-delete 'archived' status
    // But for MVP explicit delete:
    await ctx.db.delete(args.eventId);

    // Decrement stats...
    return { success: true };
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    locationType: v.optional(v.union(v.literal("physical"), v.literal("online"))),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    capacity: v.optional(v.number()),
    ticketType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    ticketPrice: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    seatingMode: v.optional(v.union(v.literal("GENERAL"), v.literal("RESERVED"))),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { eventId, token, ...updates } = args;
    const user = await ctx.runQuery(api.users.getCurrentUser, { token });
    if (!user) throw new Error("Not logged in");

    const event = await ctx.db.get(eventId);
    const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin" || r.permissions.includes("*"));

    if (!event || (event.ownerId !== user._id && !isAdmin)) {
      throw new Error("Unauthorized");
    }

    const patch = {
      updatedAt: Date.now(),
      audit: {
        ...event.audit,
        updatedAt: Date.now(),
        updatedBy: user._id,
        version: (event.audit?.version || 1) + 1,
        changeLog: [
          ...(event.audit?.changeLog || []),
          {
            version: (event.audit?.version || 1) + 1,
            changedBy: user._id,
            changedAt: Date.now(),
            changes: ["Updated event details"]
          }
        ]
      }
    };

    if (updates.title) patch.title = { ...event.title, en: updates.title };
    if (updates.description) patch.description = { ...event.description, en: updates.description };
    if (updates.category) patch.eventSubType = updates.category;

    // Time Config
    if (updates.startDate || updates.endDate) {
      patch.timeConfiguration = {
        ...(event.timeConfiguration || {}),
        startDateTime: updates.startDate || event.timeConfiguration.startDateTime,
        endDateTime: updates.endDate || event.timeConfiguration.endDateTime,
        durationMinutes: ((updates.endDate || event.timeConfiguration.endDateTime) - (updates.startDate || event.timeConfiguration.startDateTime)) / 60000,
      };
    }

    // Location
    if (updates.locationType) {
      patch.locationConfig = {
        ...(event.locationConfig || {}),
        type: updates.locationType === "online" ? "virtual" : "physical"
      };
    }

    // Capacity
    if (updates.capacity !== undefined) {
      patch.capacityConfig = {
        ...(event.capacityConfig || {}),
        totalCapacity: updates.capacity
      };
    }

    // Financials
    if (updates.ticketType || updates.ticketPrice !== undefined) {
      patch.financials = {
        ...(event.financials || {}),
        pricingModel: updates.ticketType || event.financials.pricingModel,
        budget: updates.ticketPrice ? (updates.capacity || event.capacityConfig.totalCapacity) * updates.ticketPrice : 0
      };
    }

    // Metadata / Legacy Support
    if (Object.keys(updates).some(k => ["city", "state", "country", "venue", "ticketPrice"].includes(k))) {
      patch.metadata = {
        ...(event.metadata || {}),
        legacyProps: {
          ...(event.metadata?.legacyProps || {}),
          city: updates.city || event.metadata?.legacyProps?.city,
          state: updates.state || event.metadata?.legacyProps?.state,
          country: updates.country || event.metadata?.legacyProps?.country,
          venueName: updates.venue || event.metadata?.legacyProps?.venueName,
          ticketPrice: updates.ticketPrice !== undefined ? updates.ticketPrice : event.metadata?.legacyProps?.ticketPrice
        }
      };
    }

    if (updates.coverImage) {
      let finalCoverImage = updates.coverImage;
      if (!updates.coverImage.startsWith("http")) {
        finalCoverImage = (await ctx.storage.getUrl(updates.coverImage)) || "";
      }
      patch.content = {
        ...(event.content || {}),
        coverImage: {
          url: finalCoverImage,
          altText: updates.title || event.title?.en || "Event Image"
        }
      };
    }

    if (updates.seatingMode) patch.seatingMode = updates.seatingMode;

    await ctx.db.patch(eventId, patch);
    return { success: true };
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    venueDesignId: v.optional(v.id("venueDesigns")), // ADDED
    seatMapConfig: v.optional(v.object({
      imageUrl: v.string(),
      storageId: v.optional(v.string()),
      zones: v.array(v.object({
        id: v.string(),
        name: v.string(),
        color: v.string(),
        price: v.number(),
        capacity: v.optional(v.number()),
        x: v.optional(v.number()),
        y: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        shape: v.optional(v.union(v.literal("rect"), v.literal("circle"), v.literal("ellipse"), v.literal("path"))),
        rotation: v.optional(v.number()),
        path: v.optional(v.string())
      }))
    })),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, token, ...updates } = args;
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: token });
    if (!user) throw new Error("Not logged in");

    const event = await ctx.db.get(id);

    const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin" || r.permissions.includes("*"));

    if (!event || (event.ownerId !== user._id && !isAdmin)) {
      throw new Error("Unauthorized");
    }

    // If seatMapConfig has a storageId, resolve the URL before saving if imageUrl is empty
    if (updates.seatMapConfig?.storageId && !updates.seatMapConfig.imageUrl) {
      updates.seatMapConfig.imageUrl = (await ctx.storage.getUrl(updates.seatMapConfig.storageId)) || "";
    }

    await ctx.db.patch(id, updates);
    return { success: true };
  },
});

export const saveVenueLayout = mutation({
  args: {
    eventId: v.string(), // Accept any string (ID or Slug)
    layout: v.any(),
    totalSeats: v.optional(v.number()),
    mode: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not logged in");

    let event = null;
    const normalizedId = ctx.db.normalizeId("events", args.eventId);

    if (normalizedId) {
      event = await ctx.db.get(normalizedId);
    }

    if (!event) {
      event = await ctx.db.query("events")
        .withIndex("by_slug", (q) => q.eq("slug", args.eventId))
        .unique();
    }

    if (!event) throw new Error(`Event not found for identifier: ${args.eventId}`);

    if (event.ownerId !== user._id) {
      const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin");
      if (!isAdmin) throw new Error("Unauthorized");
    }

    await ctx.db.patch(event._id, {
      venueLayout: args.layout,
      totalSeats: args.totalSeats || 0,
      seatingMode: "RESERVED_SEATING",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
export const getPublicEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_dates")
      .order("asc")
      .collect();

    // Filter for published events and ensure they aren't in the past
    // We handle legacy data by checking if status.current exists and equals "published"
    const publicEvents = events.filter((e) => {
      const isPublished = (e.status?.current === "published") || (e.status === "published") || (e.status === "active");
      const isNotPast = (e.timeConfiguration?.startDateTime || e.startDate || 0) > Date.now() - (24 * 60 * 60 * 1000); // Allow same day
      return isPublished && isNotPast;
    });

    // DEBUG FALLBACK: If no published events found, return all events to avoid "Coming Soon" during dev
    if (publicEvents.length === 0 && events.length > 0) {
      console.log("No published events found, returning raw list for debugging.");
      return events.slice(0, 10);
    }

    return publicEvents;
  },
});

export const by_start_date = getPublicEvents;

export const getOrganizerEvents = getMyEvents;