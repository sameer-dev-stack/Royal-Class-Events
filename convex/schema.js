import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    // ==================== USERS & IDENTITY ====================
    users: defineTable({
      // Identity
      externalId: v.string(), // SSO/SAML ID
      authProvider: v.union(
        v.literal('internal'),
        v.literal('okta'),
        v.literal('azure_ad'),
        v.literal('google_workspace'),
        v.literal('ping'),
        v.literal('onelogin'),
        v.literal('custom_saml'),
        v.literal('clerk'),
        v.literal('supabase'),
        v.literal('sso')
      ),
      authMetadata: v.optional(v.any()),

      // Internal Auth Fields
      email: v.optional(v.string()),
      passwordHash: v.optional(v.string()),
      role: v.optional(v.string()), // Primary role string

      // Profile (multi-tenant aware)
      tenantId: v.optional(v.id("tenants")),
      profile: v.object({
        // Legal names
        legalFirstName: v.string(),
        legalLastName: v.string(),
        displayName: v.optional(v.string()),

        // Professional
        title: v.string(),
        department: v.string(),
        employeeId: v.string(),
        managerId: v.optional(v.id("users")),

        // Contact (verified channels)
        primaryEmail: v.object({
          address: v.string(),
          verified: v.boolean(),
          verifiedAt: v.optional(v.number()),
          isMarketingAllowed: v.boolean(),
          isTransactionalAllowed: v.boolean(),
        }),
        backupEmail: v.optional(v.string()),

        // Phones
        mobilePhone: v.optional(
          v.object({
            number: v.string(),
            countryCode: v.string(),
            verified: v.boolean(),
            isSmsAllowed: v.boolean(),
          })
        ),
        workPhone: v.optional(v.string()),

        // Addresses
        workAddress: v.optional(
          v.object({
            line1: v.string(),
            line2: v.optional(v.string()),
            city: v.string(),
            state: v.string(),
            postalCode: v.string(),
            country: v.string(),
            countryCode: v.string(),
            isVerified: v.boolean(),
          })
        ),

        // Time & Location
        timezone: v.string(),
        locale: v.string(), // en-US, fr-CA, etc.
        currencyPreference: v.string(), // ISO 4217

        // Compliance
        dataProcessingConsent: v.object({
          consentedAt: v.number(),
          version: v.string(),
          purposes: v.array(v.string()),
          withdrawalAt: v.optional(v.number()),
        }),

        // Security
        mfaEnabled: v.boolean(),
        mfaMethods: v.optional(
          v.array(
            v.object({
              type: v.union(v.literal('totp'), v.literal('sms'), v.literal('email'), v.literal('webauthn')),
              lastUsed: v.optional(v.number()),
              isBackup: v.boolean(),
            })
          )
        ),
        lastPasswordChange: v.optional(v.number()),
        passwordExpiresAt: v.optional(v.number()),

        // Accessibility
        accessibility: v.object({
          requiresClosedCaptions: v.boolean(),
          signLanguageRequired: v.optional(v.string()), // ASL, BSL, etc.
          wheelchairAccess: v.boolean(),
          dietaryRestrictions: v.array(v.string()),
          otherNeeds: v.optional(v.string()),
          emergencyContact: v.optional(
            v.object({
              name: v.string(),
              relationship: v.string(),
              phone: v.string(),
              phoneSecondary: v.optional(v.string()),
            })
          ),
        }),

        // Metadata
        employeeType: v.union(v.literal('full_time'), v.literal('part_time'), v.literal('contractor'), v.literal('vendor'), v.literal('supplier')),
        hireDate: v.optional(v.number()),
        costCenter: v.optional(v.string()),
        badgeNumber: v.optional(v.string()),
        governmentId: v.optional(
          v.object({
            type: v.string(), // passport, ssn, etc.
            lastFour: v.string(),
            country: v.string(),
          })
        ),
      }),

      // Roles & Permissions (RBAC with ABAC attributes)
      roles: v.optional(v.array(
        v.object({
          roleId: v.id("roles"),
          assignedBy: v.id("users"),
          assignedAt: v.number(),
          expiresAt: v.optional(v.number()),
          context: v.optional(v.any()), // Event-specific role context
        })
      )),

      // Session Management
      sessions: v.optional(
        v.array(
          v.object({
            sessionId: v.string(),
            deviceInfo: v.object({
              userAgent: v.string(),
              ipAddress: v.string(),
              deviceId: v.string(),
              deviceType: v.string(),
              os: v.string(),
              browser: v.string(),
              screenResolution: v.string(),
            }),
            issuedAt: v.number(),
            expiresAt: v.number(),
            lastActivity: v.number(),
            isRevoked: v.boolean(),
            revokeReason: v.optional(v.string()),
            geoLocation: v.optional(
              v.object({
                country: v.string(),
                region: v.string(),
                city: v.string(),
                lat: v.number(),
                lon: v.number(),
              })
            ),
          })
        )
      ),

      metadata: v.optional(v.any()),

      // Usage tracking
      freeEventsCreated: v.optional(v.number()),

      // Status
      status: v.union(
        v.literal('active'),
        v.literal('inactive'),
        v.literal('suspended'),
        v.literal('terminated'),
        v.literal('on_leave')
      ),
      statusReason: v.optional(v.string()),
      statusChangedAt: v.number(),

      // Audit
      createdBy: v.optional(v.id("users")),
      createdAt: v.number(),
      updatedBy: v.optional(v.id("users")),
      updatedAt: v.number(),
      version: v.number(),
    })
      .index("by_external_id", ["externalId"])
      .index("by_tenant", ["tenantId"])
      .index("by_email", ["profile.primaryEmail.address"])
      .index("by_status", ["status"])
      .index("by_manager", ["profile.managerId"])
      .index("by_top_level_email", ["email"])
      .index("by_department", ["profile.department"])
      .searchIndex("user_search", {
        searchField: "profile.displayName",
        filterFields: ["tenantId", "status", "profile.department"],
      }),

    // Session Management (Table)
    user_sessions: defineTable({
      userId: v.id("users"),
      token: v.string(),
      expiresAt: v.number(),
    })
      .index("by_token", ["token"]),

    // ==================== ROLES & PERMISSIONS ====================
    roles: defineTable({
      key: v.string(), // admin, organizer, attendee, support
      name: v.string(),
      description: v.string(),
      permissions: v.array(v.string()),
      isSystem: v.boolean(),
      metadata: v.optional(v.any()),
    })
      .index("by_key", ["key"]),

    // ==================== TENANTS/ORGANIZATIONS ====================
    tenants: defineTable({
      // Identification
      externalId: v.string(),
      legalName: v.string(),
      tradingName: v.string(),
      dba: v.optional(v.string()),

      // Contact
      primaryContact: v.optional(v.object({
        userId: v.id("users"),
        role: v.string(),
      })),

      // Addresses
      headquarters: v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        postalCode: v.string(),
        country: v.string(),
        countryCode: v.string(),
        timezone: v.string(),
      }),

      // Registration
      registrationNumber: v.string(),
      taxId: v.string(),
      vatNumber: v.optional(v.string()),
      incorporationDate: v.number(),
      incorporationCountry: v.string(),

      // Financial
      defaultCurrency: v.string(),
      paymentTerms: v.number(), // days
      creditLimit: v.optional(v.number()),

      // Compliance
      compliance: v.object({
        gdprApplicable: v.boolean(),
        ccpaApplicable: v.boolean(),
        hipaaApplicable: v.boolean(),
        soc2Compliant: v.boolean(),
        iso27001Certified: v.boolean(),
        dataResidencyRegion: v.string(),
        retentionPolicyId: v.optional(v.id("retentionPolicies")),
      }),

      // Billing
      billingPlan: v.object({
        planId: v.string(),
        name: v.string(),
        tier: v.union(v.literal('free'), v.literal('basic'), v.literal('pro'), v.literal('enterprise')),
        limits: v.object({
          maxUsers: v.number(),
          maxEvents: v.optional(v.number()),
          maxAttendees: v.number(),
          storageGb: v.number(),
          apiCallsPerMonth: v.number(),
        }),
        billingCycle: v.union(v.literal('monthly'), v.literal('annual')),
        nextBillingDate: v.number(),
        autoRenew: v.boolean(),
        contractEndDate: v.optional(v.number()),
      }),

      // Branding
      branding: v.object({
        logoUrl: v.string(),
        primaryColor: v.string(),
        secondaryColor: v.string(),
        fontFamily: v.string(),
        customCss: v.optional(v.string()),
        favicon: v.optional(v.string()),
        emailTemplateId: v.optional(v.id("emailTemplates")),
      }),

      // Settings
      settings: v.optional(v.object({
        requireMfa: v.boolean(),
        passwordPolicyId: v.id("passwordPolicies"),
        sessionTimeoutMinutes: v.number(),
        maxConcurrentSessions: v.number(),
        ipWhitelist: v.optional(v.array(v.string())),
        allowedDomains: v.array(v.string()),
        defaultLanguage: v.string(),
        dateFormat: v.string(),
        timeFormat: v.string(),
        firstDayOfWeek: v.number(),
      })),

      // Status
      status: v.union(
        v.literal('active'),
        v.literal('suspended'),
        v.literal('terminated'),
        v.literal('onboarding')
      ),
      onboardedAt: v.optional(v.number()),

      // Metadata
      metadata: v.optional(v.any()),
      tags: v.array(v.string()),

      // Audit
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedBy: v.id("users"),
      updatedAt: v.number(),
      version: v.number(),
    })
      .index("by_external_id", ["externalId"])
      .index("by_status", ["status"])
      .index("by_billing_plan", ["billingPlan.tier"])
      .index("by_country", ["headquarters.country"])
      .searchIndex("tenant_search", {
        searchField: "legalName",
        filterFields: ["status", "headquarters.country", "billingPlan.tier"],
      }),

    // ==================== EVENTS (MAIN) ====================
    events: defineTable({
      // Core
      tenantId: v.optional(v.id("tenants")),
      externalId: v.optional(v.string()), // External system reference (made optional for legacy)
      parentEventId: v.optional(v.id("events")), // For event series

      // Hierarchy (made optional for legacy data)
      eventType: v.optional(v.union(
        v.literal('conference'),
        v.literal('meeting'),
        v.literal('webinar'),
        v.literal('training'),
        v.literal('social'),
        v.literal('board_meeting'),
        v.literal('shareholder_meeting'),
        v.literal('product_launch'),
        v.literal('partner_summit')
      )),
      eventSubType: v.optional(v.string()),

      // Classification (made optional for legacy data)
      classification: v.optional(v.union(
        v.literal('public'),
        v.literal('internal'),
        v.literal('confidential'),
        v.literal('secret'),
        v.literal('top_secret')
      )),
      complianceLevel: v.optional(v.union(
        v.literal('standard'),
        v.literal('hipaa'),
        v.literal('pci'),
        v.literal('fedramp'),
        v.literal('sox')
      )),

      // Basic Info (made optional for legacy data)
      title: v.optional(v.object({
        en: v.string(),
        localized: v.optional(v.any()),
      })),
      description: v.optional(v.object({
        en: v.string(),
        localized: v.optional(v.any()),
      })),
      slug: v.optional(v.string()),

      // Organizer Structure (made optional for legacy data)
      organizingDepartment: v.optional(v.string()),
      costCenter: v.optional(v.string()),
      projectCode: v.optional(v.string()),
      glAccount: v.optional(v.string()),
      budgetId: v.optional(v.id("budgets")),

      // Ownership (made optional for legacy data)
      ownerId: v.optional(v.id("users")),
      sponsorId: v.optional(v.id("users")), // Executive sponsor
      committeeIds: v.optional(v.array(v.id("committees"))),

      // Configuration
      timeConfiguration: v.optional(v.any()),
      locationConfig: v.optional(v.any()),
      capacityConfig: v.optional(v.any()),
      registrationConfig: v.optional(v.any()),
      financials: v.optional(v.any()),
      marketing: v.optional(v.any()),
      content: v.optional(v.any()),
      risk: v.optional(v.any()),
      logistics: v.optional(v.any()),

      // Royal Seat Engine (Optional Seating Configuration)
      seatingMode: v.optional(v.union(
        v.literal("GENERAL_ADMISSION"),
        v.literal("RESERVED_SEATING"),
        v.literal("HYBRID")
      )),

      // Total Capacity from Seat Builder
      totalSeats: v.optional(v.number()),

      // Venue Layout (Only for Reserved/Hybrid modes)
      venueLayout: v.optional(v.any()),

      // Seat Map Configuration
      seatMapConfig: v.optional(v.object({
        imageUrl: v.string(),
        storageId: v.optional(v.string()), // Added for internal storage reference
        zones: v.array(v.object({
          id: v.string(),
          name: v.string(),
          color: v.string(),
          price: v.number(),
          capacity: v.optional(v.number()),
          // Spatial Data (Temporarily optional to allow backfill)
          x: v.optional(v.number()),
          y: v.optional(v.number()),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          shape: v.optional(v.union(v.literal("rect"), v.literal("circle"), v.literal("ellipse"), v.literal("path"))),
          rotation: v.optional(v.number()),
          path: v.optional(v.string()) // For custom shapes if needed
        }))
      })),

      // Status & Workflow
      status: v.optional(v.any()),

      // Analytics (Made optional for legacy data compatibility)
      analytics: v.optional(v.object({
        // Engagement
        views: v.number(),
        uniqueViews: v.number(),
        saves: v.number(),
        shares: v.number(),

        // Conversion
        conversionRate: v.number(),
        dropOffRate: v.number(),

        // Performance
        loadTime: v.number(),
        uptime: v.number(),
        errorRate: v.number(),

        // Satisfaction
        predictedNps: v.number(),
        sentimentScore: v.number(),

        // Optional fields for UI compatibility
        registrations: v.optional(v.number()),
        revenue: v.optional(v.number()),
        attendanceRate: v.optional(v.number()),
        npsScore: v.optional(v.number()),
      })),

      // Metadata (Made optional for legacy data compatibility)
      metadata: v.optional(v.object({
        tags: v.array(v.string()),
        categories: v.array(v.string()),
        customAttributes: v.optional(v.any()),
        systemAttributes: v.optional(v.any()),
        legacyProps: v.optional(v.any()),
      })),

      // Audit (Made optional for legacy data compatibility)
      audit: v.optional(v.object({
        createdBy: v.id("users"),
        createdAt: v.number(),
        updatedBy: v.id("users"),
        updatedAt: v.number(),
        approvedBy: v.optional(v.id("users")),
        approvedAt: v.optional(v.number()),
        publishedBy: v.optional(v.id("users")),
        publishedAt: v.optional(v.number()),
        version: v.number(),
        changeLog: v.array(
          v.object({
            version: v.number(),
            changedBy: v.id("users"),
            changedAt: v.number(),
            changes: v.array(v.string()),
            rollbackTo: v.optional(v.number()),
          })
        ),
      })),
    })
      // Comprehensive indexing strategy
      .index("by_tenant", ["tenantId"])
      .index("by_external_id", ["externalId"])
      .index("by_parent", ["parentEventId"])
      .index("by_owner", ["ownerId"])
      .index("by_dates", ["timeConfiguration.startDateTime", "timeConfiguration.endDateTime"])
      .index("by_status", ["status.current"])
      .index("by_type", ["eventType"])
      .index("by_budget", ["budgetId"])
      .index("by_department", ["organizingDepartment"])
      .index("by_classification", ["classification"])
      .index("by_slug", ["slug"])
      .searchIndex("event_search", {
        searchField: "title.en",
        filterFields: [
          "tenantId",
          "status.current",
          "eventType",
          "classification",
          "organizingDepartment"
        ],
      }),

    // ==================== VENUES ====================
    venues: defineTable({
      tenantId: v.id("tenants"),
      externalId: v.string(),
      name: v.string(),
      type: v.union(
        v.literal('conference_center'),
        v.literal('hotel'),
        v.literal('university'),
        v.literal('stadium'),
        v.literal('museum'),
        v.literal('restaurant'),
        v.literal('office'),
        v.literal('virtual')
      ),

      // Location details
      address: v.object({
        formatted: v.string(),
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        postalCode: v.string(),
        country: v.string(),
        countryCode: v.string(),
        coordinates: v.object({
          lat: v.number(),
          lon: v.number(),
          accuracy: v.number(),
        }),
        timezone: v.string(),
      }),

      // Capacity
      capacities: v.object({
        theater: v.number(),
        classroom: v.number(),
        banquet: v.number(),
        uShape: v.number(),
        reception: v.number(),
        standing: v.number(),
      }),

      // Facilities
      facilities: v.object({
        wifi: v.object({
          available: v.boolean(),
          speedMbps: v.number(),
          coverage: v.string(), // full, partial
          ssid: v.optional(v.string()),
          password: v.optional(v.string()),
          captivePortal: v.boolean(),
        }),
        power: v.object({
          outletsPerPerson: v.number(),
          voltage: v.string(),
          phases: v.number(),
          backupGenerator: v.boolean(),
        }),
        av: v.object({
          builtIn: v.boolean(),
          projector: v.boolean(),
          screens: v.number(),
          soundSystem: v.boolean(),
          microphones: v.number(),
          videoConferencing: v.boolean(),
          technicianOnSite: v.boolean(),
        }),
        accessibility: v.object({
          wheelchairAccess: v.boolean(),
          elevators: v.number(),
          accessibleRestrooms: v.boolean(),
          hearingAssistance: v.boolean(),
          brailleSignage: v.boolean(),
          serviceAnimalFriendly: v.boolean(),
        }),
        security: v.object({
          cctv: v.boolean(),
          securityStaff: v.boolean(),
          metalDetectors: v.boolean(),
          bagCheck: v.boolean(),
          emergencyExits: v.number(),
          firstAidRoom: v.boolean(),
        }),
      }),

      // Contact
      contacts: v.array(
        v.object({
          name: v.string(),
          title: v.string(),
          email: v.string(),
          phone: v.string(),
          mobile: v.optional(v.string()),
          emergencyContact: v.boolean(),
          availability: v.string(),
        })
      ),

      // Pricing
      pricing: v.object({
        hourlyRate: v.number(),
        dailyRate: v.number(),
        weekendRate: v.number(),
        overtimeRate: v.number(),
        minimumHours: v.number(),
        depositPercentage: v.number(),
        cancellationPolicy: v.string(),
        includedServices: v.array(v.string()),
        extraServices: v.array(
          v.object({
            service: v.string(),
            rate: v.number(),
            unit: v.string(),
          })
        ),
      }),

      // Compliance
      compliance: v.object({
        licenses: v.array(
          v.object({
            type: v.string(),
            number: v.string(),
            expiry: v.number(),
          })
        ),
        insurance: v.object({
          liabilityAmount: v.number(),
          certificateNumber: v.string(),
          expiry: v.number(),
        }),
        fireSafety: v.object({
          certificateNumber: v.string(),
          expiry: v.number(),
          maxOccupancy: v.number(),
        }),
        healthRating: v.optional(v.string()),
      }),

      // Availability
      availability: v.object({
        blackoutDates: v.array(v.number()),
        maintenanceSchedule: v.array(
          v.object({
            start: v.number(),
            end: v.number(),
            reason: v.string(),
          })
        ),
        bookingLeadTimeDays: v.number(),
        maxBookingDays: v.number(),
      }),

      // Media
      media: v.object({
        floorPlans: v.array(
          v.object({
            url: v.string(),
            description: v.string(),
            dimensions: v.string(),
          })
        ),
        photos: v.array(
          v.object({
            url: v.string(),
            caption: v.string(),
            room: v.string(),
          })
        ),
        vrTour: v.optional(v.string()),
      }),

      // Ratings
      ratings: v.object({
        average: v.number(),
        count: v.number(),
        reviews: v.array(
          v.object({
            userId: v.id("users"),
            rating: v.number(),
            comment: v.string(),
            date: v.number(),
          })
        ),
      }),

      // Seat Map Configuration
      seatMapEnabled: v.optional(v.boolean()),
      seatMapConfig: v.optional(v.object({
        defaultLayoutType: v.union(
          v.literal('stadium'),
          v.literal('theater'),
          v.literal('conference'),
          v.literal('outdoor')
        ),
        totalSeats: v.number(),
        canvasWidth: v.number(),  // SVG canvas width
        canvasHeight: v.number(), // SVG canvas height
        seatWidth: v.number(),    // Seat circle/rect size
        seatSpacing: v.number(),  // Space between seats
        rowSpacing: v.number(),   // Space between rows
        centerX: v.number(),      // Center point for stadium/theater
        centerY: v.number(),
        stagePosition: v.optional(v.object({
          x: v.number(),
          y: v.number(),
          width: v.number(),
          height: v.number(),
        })),
      })),

      // Status
      status: v.union(
        v.literal('active'),
        v.literal('inactive'),
        v.literal('under_renovation'),
        v.literal('closed')
      ),

      // Audit
      createdAt: v.number(),
      updatedAt: v.number(),
      version: v.number(),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_location", ["address.coordinates.lat", "address.coordinates.lon"])
      .index("by_capacity", ["capacities.theater"])
      .index("by_type", ["type"])
      .searchIndex("venue_search", {
        searchField: "name",
        filterFields: ["tenantId", "type", "address.city", "address.country"],
      }),

    // ==================== TICKET TIERS ====================
    ticketTiers: defineTable({
      eventId: v.id("events"),
      externalId: v.string(),
      name: v.string(),
      code: v.string(), // Internal code like VIP-001

      // Pricing strategy
      pricing: v.optional(v.any()),

      // Inventory
      inventory: v.optional(v.any()),

      // Sales window
      salesWindow: v.optional(v.any()),

      // Ticket features
      features: v.optional(v.any()),

      // Fulfillment
      fulfillment: v.optional(v.any()),

      // Compliance
      compliance: v.optional(v.any()),

      // Status
      status: v.optional(v.any()),

      // Analytics
      analytics: v.optional(v.any()),

      // Audit
      createdBy: v.optional(v.id("users")),
      createdAt: v.optional(v.number()),
      updatedBy: v.optional(v.id("users")),
      updatedAt: v.optional(v.number()),
      version: v.optional(v.number()),
    })
      .index("by_event", ["eventId"])
      .index("by_external_id", ["externalId"])
      .index("by_status", ["status"])
      .index("by_sales_window", ["salesWindow.startDate", "salesWindow.endDate"])
      .index("by_price", ["pricing.basePrice"])
      .index("by_inventory", ["inventory.soldQuantity", "inventory.totalQuantity"]),

    // ==================== REGISTRATIONS ====================
    registrations: defineTable({
      tenantId: v.optional(v.id("tenants")),
      eventId: v.id("events"),
      userId: v.optional(v.id("users")), // Optional for Guest checkouts
      externalId: v.string(),
      registrationNumber: v.string(),
      ticketTierId: v.optional(v.id("ticketTiers")),
      ticketQuantity: v.number(),
      unitPrice: v.number(),

      // Flexible sections
      status: v.optional(v.any()),
      attendeeInfo: v.optional(v.any()),
      financials: v.optional(v.any()),
      checkIn: v.optional(v.any()),
      sessionAttendance: v.optional(v.any()),
      communication: v.optional(v.any()),
      source: v.optional(v.any()),
      compliance: v.optional(v.any()),
      metadata: v.optional(v.any()),
      audit: v.optional(v.any()),
    })
      .index("by_event", ["eventId"])
      .index("by_user", ["userId"])
      .index("by_event_user", ["eventId", "userId"]),

    // ==================== PAYMENTS ====================
    payments: defineTable({
      tenantId: v.optional(v.id("tenants")),
      registrationId: v.id("registrations"),
      externalId: v.string(),
      paymentNumber: v.string(),

      // Flexible sections
      amount: v.optional(v.any()),
      method: v.optional(v.any()),
      processor: v.optional(v.any()),
      status: v.optional(v.any()),
      timeline: v.optional(v.any()),
      refunds: v.optional(v.any()),
      disputes: v.optional(v.any()),
      compliance: v.optional(v.any()),
      metadata: v.optional(v.any()),
      audit: v.optional(v.any()),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_registration", ["registrationId"])
      .index("by_status", ["status.current"])
      .index("by_date", ["timeline.initiatedAt"])
      .index("by_external_id", ["externalId"])
      .index("by_processor", ["processor.transactionId"])
      .index("by_method", ["method.type"])
      .searchIndex("payment_search", {
        searchField: "paymentNumber",
        filterFields: ["tenantId", "status.current", "method.type"],
      }),

    // ==================== SESSIONS ====================
    sessions: defineTable({
      tenantId: v.id("tenants"),
      eventId: v.id("events"),
      externalId: v.string(),
      parentSessionId: v.optional(v.id("sessions")),

      // Core
      title: v.object({
        en: v.string(),
        localized: v.optional(v.any()),
      }),
      description: v.object({
        en: v.string(),
        localized: v.optional(v.any()),
      }),
      code: v.string(), // Session code like KEY-101

      // Type & Classification
      type: v.union(
        v.literal('keynote'),
        v.literal('breakout'),
        v.literal('workshop'),
        v.literal('panel'),
        v.literal('networking'),
        v.literal('meal'),
        v.literal('registration'),
        v.literal('exhibition'),
        v.literal('sponsored')
      ),
      track: v.string(),
      level: v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'), v.literal('all')),
      category: v.string(),

      // Time
      time: v.object({
        startDateTime: v.number(),
        endDateTime: v.number(),
        timezone: v.string(),
        durationMinutes: v.number(),

        // Recurrence
        isRecurring: v.boolean(),
        recurrenceRule: v.optional(
          v.object({
            frequency: v.string(),
            interval: v.number(),
            days: v.optional(v.array(v.string())),
            until: v.optional(v.number()),
          })
        ),

        // Buffer
        setupMinutes: v.number(),
        teardownMinutes: v.number(),
        attendeeBufferBefore: v.number(),
        attendeeBufferAfter: v.number(),
      }),

      // Location
      location: v.object({
        venueId: v.id("venues"),
        room: v.string(),
        capacity: v.number(),
        setupStyle: v.string(),

        // Virtual
        virtualDetails: v.optional(
          v.object({
            platform: v.string(),
            joinUrl: v.string(),
            hostUrl: v.string(),
            dialIn: v.optional(v.string()),
            meetingId: v.string(),
            password: v.optional(v.string()),
          })
        ),

        // Hybrid
        isHybrid: v.boolean(),
        streamingUrl: v.optional(v.string()),
        streamKey: v.optional(v.string()),
      }),

      // People
      people: v.object({
        // Speakers
        speakers: v.array(
          v.object({
            userId: v.id("users"),
            role: v.union(v.literal('speaker'), v.literal('moderator'), v.literal('host')),
            bio: v.string(),
            photoUrl: v.string(),
            socialLinks: v.array(v.string()),
            isConfirmed: v.boolean(),
            confirmedAt: v.optional(v.number()),
            honorarium: v.optional(
              v.object({
                amount: v.number(),
                currency: v.string(),
                status: v.string(),
                paidAt: v.optional(v.number()),
              })
            ),
            travelArranged: v.boolean(),
            accommodationArranged: v.boolean(),
            specialRequirements: v.optional(v.string()),
          })
        ),

        // Organizers
        organizers: v.array(v.id("users")),

        // Sponsors
        sponsors: v.array(
          v.object({
            companyId: v.id("companies"),
            sponsorshipLevel: v.string(),
            logoUrl: v.string(),
            description: v.string(),
          })
        ),
      }),

      // Content
      content: v.object({
        // Agenda
        agenda: v.array(
          v.object({
            time: v.string(),
            title: v.string(),
            speaker: v.optional(v.string()),
            duration: v.number(),
          })
        ),

        // Learning objectives
        learningObjectives: v.array(v.string()),

        // Prerequisites
        prerequisites: v.array(v.string()),

        // Materials
        materials: v.array(
          v.object({
            type: v.string(),
            title: v.string(),
            url: v.string(),
            size: v.number(),
            language: v.string(),
            downloadCount: v.number(),
          })
        ),

        // Recording
        recording: v.optional(
          v.object({
            url: v.string(),
            duration: v.number(),
            quality: v.string(),
            availableFrom: v.number(),
            availableTo: v.optional(v.number()),
            downloadAllowed: v.boolean(),
            streamingAllowed: v.boolean(),
          })
        ),

        // Slides
        slides: v.optional(
          v.object({
            url: v.string(),
            pageCount: v.number(),
            format: v.string(),
          })
        ),
      }),

      // Registration & Attendance
      registration: v.object({
        // Capacity
        maxAttendees: v.number(),
        waitlistEnabled: v.boolean(),
        waitlistSize: v.number(),

        // Access
        accessLevel: v.number(),
        requiresSeparateRegistration: v.boolean(),
        registrationOpens: v.optional(v.number()),
        registrationCloses: v.optional(v.number()),

        // Pricing
        additionalFee: v.optional(
          v.object({
            amount: v.number(),
            currency: v.string(),
            required: v.boolean(),
          })
        ),

        // Attendance tracking
        attendanceMethod: v.union(
          v.literal('none'),
          v.literal('manual'),
          v.literal('qr'),
          v.literal('nfc'),
          v.literal('facial')
        ),
        checkInRequired: v.boolean(),
        checkInStarts: v.optional(v.number()),
        checkInEnds: v.optional(v.number()),
      }),

      // Interactive Features
      interactive: v.object({
        // Q&A
        qnaEnabled: v.boolean(),
        qnaModerated: v.boolean(),
        qnaAnonymous: v.boolean(),
        qnaAutoApprove: v.boolean(),

        // Polls
        pollsEnabled: v.boolean(),
        maxPolls: v.number(),

        // Chat
        chatEnabled: v.boolean(),
        chatModerated: v.boolean(),
        chatArchived: v.boolean(),

        // Reactions
        reactionsEnabled: v.boolean(),
        availableReactions: v.array(v.string()),

        // Breakout rooms
        breakoutRoomsEnabled: v.boolean(),
        breakoutRoomCount: v.optional(v.number()),
        breakoutRoomDuration: v.optional(v.number()),
      }),

      // Compliance
      compliance: v.object({
        // Recording consent
        recordingConsentRequired: v.boolean(),
        recordingConsentMessage: v.optional(v.string()),

        // Privacy
        anonymizeParticipants: v.boolean(),
        dataRetentionDays: v.number(),

        // Accessibility
        closedCaptioning: v.boolean(),
        signLanguage: v.optional(v.string()),
        transcriptAvailable: v.boolean(),

        // Content warnings
        contentWarnings: v.array(v.string()),
        ageRestriction: v.optional(v.number()),
      }),

      // Status
      status: v.object({
        current: v.union(
          v.literal('draft'),
          v.literal('scheduled'),
          v.literal('live'),
          v.literal('completed'),
          v.literal('cancelled'),
          v.literal('postponed')
        ),
        history: v.array(
          v.object({
            status: v.string(),
            changedAt: v.number(),
            changedBy: v.id("users"),
            reason: v.optional(v.string()),
          })
        ),
      }),

      // Analytics
      analytics: v.object({
        // Registration
        registeredCount: v.number(),
        attendedCount: v.number(),
        attendanceRate: v.number(),
        noShowCount: v.number(),

        // Engagement
        averageAttendanceMinutes: v.number(),
        questionsAsked: v.number(),
        pollResponses: v.number(),
        chatMessages: v.number(),

        // Feedback
        averageRating: v.number(),
        feedbackCount: v.number(),
        sentimentScore: v.number(),

        // Technical
        streamQualityScore: v.number(),
        bufferingRate: v.number(),
        dropoutRate: v.number(),
      }),

      // Metadata
      metadata: v.object({
        tags: v.array(v.string()),
        keywords: v.array(v.string()),
        customFields: v.optional(v.any()),
        internalNotes: v.optional(v.string()),
      }),

      // Audit
      audit: v.object({
        createdBy: v.id("users"),
        createdAt: v.number(),
        updatedBy: v.id("users"),
        updatedAt: v.number(),
        publishedBy: v.optional(v.id("users")),
        publishedAt: v.optional(v.number()),
        version: v.number(),
      }),
    })
      .index("by_tenant_event", ["tenantId", "eventId"])
      .index("by_time", ["time.startDateTime"])
      .index("by_type", ["type"])
      .index("by_track", ["track"])

      .index("by_status", ["status.current"])
      .index("by_location", ["location.venueId", "location.room"])
      .searchIndex("session_search", {
        searchField: "title.en",
        filterFields: [
          "tenantId",
          "eventId",
          "type",
          "track",
          "status.current"
        ],
      }),

    // ==================== ANALYTICS (TIME-SERIES) ====================
    analyticsTimeSeries: defineTable({
      tenantId: v.id("tenants"),
      eventId: v.id("events"),
      sessionId: v.optional(v.id("sessions")),

      // Dimensions
      dimension: v.object({
        date: v.string(), // YYYY-MM-DD
        hour: v.optional(v.number()),
        minute: v.optional(v.number()),

        // Breakdowns
        breakdownType: v.union(
          v.literal('overall'),
          v.literal('by_device'),
          v.literal('by_source'),
          v.literal('by_location'),
          v.literal('by_user_type')
        ),
        breakdownValue: v.optional(v.string()),
      }),

      // Metrics
      metrics: v.object({
        // Traffic
        pageViews: v.number(),
        uniqueVisitors: v.number(),
        returningVisitors: v.number(),
        bounceRate: v.number(),
        avgSessionDuration: v.number(),

        // Conversions
        registrations: v.number(),
        registrationsValue: v.number(),
        checkIns: v.number(),
        noShows: v.number(),
        cancellations: v.number(),

        // Engagement
        questionsAsked: v.number(),
        pollResponses: v.number(),
        chatMessages: v.number(),
        resourceDownloads: v.number(),
        feedbackSubmissions: v.number(),

        // Financial
        revenue: v.number(),
        averageTicketPrice: v.number(),
        refunds: v.number(),
        refundAmount: v.number(),

        // Technical
        loadTime: v.number(),
        errorRate: v.number(),
        uptime: v.number(),
        concurrentUsers: v.number(),

        // Satisfaction
        netPromoterScore: v.number(),
        customerSatisfaction: v.number(),
        sentimentScore: v.number(),
      }),

      // Derived metrics
      derived: v.object({
        conversionRate: v.number(),
        attendanceRate: v.number(),
        engagementScore: v.number(),
        roi: v.optional(v.number()),
      }),

      // Metadata
      metadata: v.object({
        sampleRate: v.number(),
        confidenceInterval: v.number(),
        dataQuality: v.number(),
      }),

      // Audit
      collectedAt: v.number(),
      processedAt: v.number(),
      version: v.string(),
    })
      .index("by_tenant_date", ["tenantId", "dimension.date"])
      .index("by_event_date", ["eventId", "dimension.date"])
      .index("by_session_date", ["sessionId", "dimension.date"])
      .index("by_breakdown", ["dimension.breakdownType", "dimension.breakdownValue"]),

    // ==================== COMPLIANCE & AUDIT ====================
    complianceRecords: defineTable({
      tenantId: v.id("tenants"),
      entityType: v.string(),
      entityId: v.string(),
      recordType: v.string(),

      // Content
      content: v.any(),

      // Signatures
      signatures: v.array(
        v.object({
          userId: v.id("users"),
          signedAt: v.number(),
          method: v.string(),
          ipAddress: v.string(),
          userAgent: v.string(),
          signature: v.string(),
        })
      ),

      // Versions
      version: v.string(),
      previousVersionId: v.optional(v.id("complianceRecords")),

      // Status
      status: v.union(
        v.literal('draft'),
        v.literal('pending_review'),
        v.literal('approved'),
        v.literal('rejected'),
        v.literal('expired')
      ),

      // Validity
      validFrom: v.number(),
      validTo: v.optional(v.number()),
      renewalReminderAt: v.optional(v.number()),

      // Audit
      createdBy: v.id("users"),
      createdAt: v.number(),
      reviewedBy: v.optional(v.id("users")),
      reviewedAt: v.optional(v.number()),
      approvedBy: v.optional(v.id("users")),
      approvedAt: v.optional(v.number()),
    })
      .index("by_tenant_entity", ["tenantId", "entityType", "entityId"])
      .index("by_status", ["status"])
      .index("by_validity", ["validFrom", "validTo"])
      .index("by_type", ["recordType"]),

    // ==================== WORKFLOWS ====================
    workflows: defineTable({
      tenantId: v.id("tenants"),
      name: v.string(),
      description: v.string(),
      type: v.string(),

      // Definition
      definition: v.object({
        version: v.string(),
        steps: v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            type: v.string(),
            config: v.any(),
            conditions: v.optional(v.any()),
            timeout: v.optional(v.number()),
            retries: v.optional(v.number()),
          })
        ),
        transitions: v.array(
          v.object({
            from: v.string(),
            to: v.string(),
            condition: v.optional(v.any()),
          })
        ),
      }),

      // Execution engine
      engine: v.object({
        type: v.string(),
        version: v.string(),
        config: v.any(),
      }),

      // Permissions
      permissions: v.object({
        canStart: v.array(v.string()),
        canApprove: v.array(v.string()),
        canReject: v.array(v.string()),
        canCancel: v.array(v.string()),
      }),

      // Status
      status: v.union(
        v.literal('active'),
        v.literal('inactive'),
        v.literal('draft'),
        v.literal('archived')
      ),

      // Statistics
      statistics: v.object({
        totalExecutions: v.number(),
        averageDuration: v.number(),
        successRate: v.number(),
        pendingCount: v.number(),
      }),

      // Audit
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedBy: v.id("users"),
      updatedAt: v.number(),
      version: v.number(),
    })
      .index("by_tenant_type", ["tenantId", "type"])
      .index("by_status", ["status"])
      .searchIndex("workflow_search", {
        searchField: "name",
        filterFields: ["tenantId", "type", "status"],
      }),

    // ==================== WORKFLOW EXECUTIONS ====================
    workflowExecutions: defineTable({
      tenantId: v.id("tenants"),
      workflowId: v.id("workflows"),
      entityType: v.string(),
      entityId: v.string(),
      externalId: v.string(),

      // Current state
      currentState: v.object({
        stepId: v.string(),
        status: v.union(
          v.literal('pending'),
          v.literal('in_progress'),
          v.literal('completed'),
          v.literal('failed'),
          v.literal('cancelled'),
          v.literal('escalated')
        ),
        startedAt: v.number(),
        assignedTo: v.optional(v.id("users")),
        deadline: v.optional(v.number()),
        attempts: v.number(),
        lastAttemptAt: v.optional(v.number()),
      }),

      // Context
      context: v.object({
        input: v.any(),
        output: v.optional(v.any()),
        variables: v.optional(v.any()),
        attachments: v.array(
          v.object({
            type: v.string(),
            url: v.string(),
            uploadedAt: v.number(),
            uploadedBy: v.id("users"),
          })
        ),
      }),

      // History
      history: v.array(
        v.object({
          stepId: v.string(),
          status: v.string(),
          startedAt: v.number(),
          completedAt: v.optional(v.number()),
          duration: v.optional(v.number()),
          assignedTo: v.optional(v.id("users")),
          actionBy: v.id("users"),
          actionAt: v.number(),
          comments: v.optional(v.string()),
          output: v.optional(v.any()),
          error: v.optional(
            v.object({
              code: v.string(),
              message: v.string(),
              stack: v.optional(v.string()),
            })
          ),
        })
      ),

      // Notifications
      notifications: v.array(
        v.object({
          type: v.string(),
          sentTo: v.id("users"),
          sentAt: v.number(),
          channel: v.string(),
          status: v.string(),
          response: v.optional(v.string()),
        })
      ),

      // Escalations
      escalations: v.array(
        v.object({
          level: v.number(),
          reason: v.string(),
          escalatedAt: v.number(),
          escalatedBy: v.id("users"),
          assignedTo: v.id("users"),
          resolvedAt: v.optional(v.number()),
          resolution: v.optional(v.string()),
        })
      ),

      // SLAs
      slas: v.object({
        targetDuration: v.number(),
        warningThreshold: v.number(),
        criticalThreshold: v.number(),
        actualDuration: v.optional(v.number()),
        slaStatus: v.optional(v.string()),
        breachedAt: v.optional(v.number()),
      }),

      // Result
      result: v.optional(
        v.object({
          finalStatus: v.string(),
          completedAt: v.number(),
          completedBy: v.id("users"),
          summary: v.string(),
          metrics: v.any(),
        })
      ),

      // Metadata
      metadata: v.object({
        priority: v.number(),
        tags: v.array(v.string()),
        customFields: v.optional(v.any()),
      }),

      // Audit
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedBy: v.id("users"),
      updatedAt: v.number(),
      version: v.number(),
    })
      .index("by_tenant_entity", ["tenantId", "entityType", "entityId"])
      .index("by_workflow", ["workflowId"])
      .index("by_status", ["currentState.status"])
      .index("by_assigned", ["currentState.assignedTo"])
      .index("by_deadline", ["currentState.deadline"])
      .index("by_external_id", ["externalId"])
      .searchIndex("execution_search", {
        searchField: "externalId",
        filterFields: [
          "tenantId",
          "workflowId",
          "currentState.status",
          "entityType"
        ],
      }),

    // ==================== INCIDENTS & ISSUES ====================
    incidents: defineTable({
      tenantId: v.id("tenants"),
      eventId: v.id("events"),
      externalId: v.string(),

      // Classification
      type: v.union(
        v.literal('technical'),
        v.literal('security'),
        v.literal('safety'),
        v.literal('logistical'),
        v.literal('financial'),
        v.literal('compliance'),
        v.literal('customer_service')
      ),
      severity: v.union(
        v.literal('critical'),
        v.literal('high'),
        v.literal('medium'),
        v.literal('low'),
        v.literal('informational')
      ),
      priority: v.union(v.literal('p1'), v.literal('p2'), v.literal('p3'), v.literal('p4')),

      // Description
      title: v.string(),
      description: v.string(),
      affectedComponents: v.array(v.string()),
      affectedUsers: v.number(),

      // Timeline
      timeline: v.object({
        detectedAt: v.number(),
        reportedAt: v.number(),
        reportedBy: v.id("users"),
        startedAt: v.optional(v.number()),
        acknowledgedAt: v.optional(v.number()),
        resolvedAt: v.optional(v.number()),
        closedAt: v.optional(v.number()),
      }),

      // Response
      response: v.object({
        assignedTo: v.id("users"),
        team: v.string(),
        communicationPlan: v.string(),

        // Actions
        actions: v.array(
          v.object({
            description: v.string(),
            assignedTo: v.id("users"),
            dueAt: v.number(),
            completedAt: v.optional(v.number()),
            status: v.string(),
          })
        ),

        // Communication
        updates: v.array(
          v.object({
            type: v.string(),
            content: v.string(),
            sentAt: v.number(),
            sentBy: v.id("users"),
            channels: v.array(v.string()),
            recipients: v.number(),
          })
        ),
      }),

      // Impact
      impact: v.object({
        financialImpact: v.optional(v.number()),
        reputationImpact: v.optional(v.string()),
        operationalImpact: v.optional(v.string()),
        customerImpact: v.optional(v.string()),
        downtimeMinutes: v.optional(v.number()),
      }),

      // Root cause
      rootCause: v.optional(
        v.object({
          category: v.string(),
          description: v.string(),
          identifiedAt: v.number(),
          identifiedBy: v.id("users"),
        })
      ),

      // Resolution
      resolution: v.optional(
        v.object({
          description: v.string(),
          implementedAt: v.number(),
          implementedBy: v.id("users"),
          verification: v.string(),
          verifiedAt: v.number(),
          verifiedBy: v.id("users"),
        })
      ),

      // Prevention
      prevention: v.optional(
        v.object({
          actionItems: v.array(v.string()),
          assignedTo: v.id("users"),
          dueDate: v.number(),
        })
      ),

      // Status
      status: v.union(
        v.literal('new'),
        v.literal('investigating'),
        v.literal('identified'),
        v.literal('monitoring'),
        v.literal('resolved'),
        v.literal('closed')
      ),

      // SLAs
      slas: v.object({
        acknowledgeTime: v.number(),
        resolveTime: v.number(),
        actualAcknowledgeTime: v.optional(v.number()),
        actualResolveTime: v.optional(v.number()),
        slaStatus: v.optional(v.string()),
      }),

      // Metadata
      metadata: v.object({
        tags: v.array(v.string()),
        references: v.array(v.string()),
        attachments: v.array(
          v.object({
            type: v.string(),
            url: v.string(),
            uploadedAt: v.number(),
          })
        ),
      }),

      // Audit
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedBy: v.id("users"),
      updatedAt: v.number(),
      version: v.number(),
    })
      .index("by_tenant_event", ["tenantId", "eventId"])
      .index("by_status_severity", ["status", "severity"])
      .index("by_assigned", ["response.assignedTo"])
      .index("by_date", ["timeline.detectedAt"])
      .index("by_external_id", ["externalId"])
      .searchIndex("incident_search", {
        searchField: "title",
        filterFields: [
          "tenantId",
          "eventId",
          "type",
          "severity",
          "status"
        ],
      }),

    retentionPolicies: defineTable({
      tenantId: v.optional(v.id("tenants")),
      name: v.string(),
      description: v.optional(v.string()),
      retentionDays: v.number(),
      dataTypes: v.array(v.string()), // e.g., 'user_data', 'logs'
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.id("users"),
    }),

    // ==================== CONFIGURATION & SETTINGS ====================
    configurations: defineTable({
      tenantId: v.id("tenants"),
      category: v.string(),
      key: v.string(),

      // Value
      value: v.any(),

      // Type information
      valueType: v.union(
        v.literal('string'),
        v.literal('number'),
        v.literal('boolean'),
        v.literal('array'),
        v.literal('object'),
        v.literal('json')
      ),

      // Constraints
      constraints: v.optional(
        v.object({
          min: v.optional(v.any()),
          max: v.optional(v.any()),
          pattern: v.optional(v.string()),
          enum: v.optional(v.array(v.any())),
          required: v.optional(v.boolean()),
        })
      ),

      // Scoping
      scope: v.object({
        level: v.union(
          v.literal('global'),
          v.literal('tenant'),
          v.literal('event'),
          v.literal('user'),
          v.literal('session')
        ),
        targetId: v.optional(v.string()),
      }),

      // Metadata
      metadata: v.object({
        description: v.string(),
        displayName: v.string(),
        group: v.string(),
        order: v.number(),
        uiComponent: v.optional(v.string()),
        encrypted: v.boolean(),
        sensitive: v.boolean(),
      }),

      // Versioning
      version: v.object({
        current: v.string(),
        history: v.array(
          v.object({
            version: v.string(),
            value: v.any(),
            changedBy: v.id("users"),
            changedAt: v.number(),
            changeReason: v.string(),
          })
        ),
      }),

      // Status
      status: v.union(
        v.literal('active'),
        v.literal('inactive'),
        v.literal('deprecated'),
        v.literal('experimental')
      ),

      // Audit
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedBy: v.id("users"),
      updatedAt: v.number(),
    })
      .index("by_tenant_category", ["tenantId", "category"])
      .index("by_key", ["key"])
      .index("by_scope", ["scope.level", "scope.targetId"])
      .index("by_status", ["status"]),

    // ==================== INTEGRATIONS ====================
    integrations: defineTable({
      tenantId: v.id("tenants"),
      name: v.string(),
      type: v.string(),
      provider: v.string(),

      // Configuration
      config: v.object({
        enabled: v.boolean(),
        baseUrl: v.string(),
        apiVersion: v.string(),

        // Authentication
        auth: v.object({
          type: v.string(),
          credentials: v.any(),
          token: v.optional(v.string()),
          tokenExpiresAt: v.optional(v.number()),
          refreshToken: v.optional(v.string()),
        }),

        // Endpoints
        endpoints: v.any(),

        // Rate limiting
        rateLimit: v.object({
          requestsPerSecond: v.number(),
          burstCapacity: v.number(),
        }),

        // Retry policy
        retryPolicy: v.object({
          maxAttempts: v.number(),
          backoffMultiplier: v.number(),
          retryableErrors: v.array(v.string()),
        }),
      }),

      // Capabilities
      capabilities: v.array(v.string()),

      // Health
      health: v.object({
        status: v.union(v.literal('healthy'), v.literal('degraded'), v.literal('unhealthy'), v.literal('unknown')),
        lastChecked: v.number(),
        responseTime: v.number(),
        errorRate: v.number(),
        uptime: v.number(),
      }),

      // Usage
      usage: v.object({
        totalCalls: v.number(),
        successfulCalls: v.number(),
        failedCalls: v.number(),
        lastCallAt: v.number(),
        quotaUsed: v.number(),
        quotaLimit: v.number(),
        quotaResetAt: v.number(),
      }),

      // Webhooks
      webhooks: v.array(
        v.object({
          url: v.string(),
          events: v.array(v.string()),
          secret: v.string(),
          status: v.string(),
          lastDelivery: v.optional(v.number()),
          failureCount: v.number(),
        })
      ),

      // Status
      status: v.union(
        v.literal('active'),
        v.literal('inactive'),
        v.literal('maintenance'),
        v.literal('deprecated')
      ),

      // Audit
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedBy: v.id("users"),
      updatedAt: v.number(),
      version: v.number(),
    })
      .index("by_tenant_type", ["tenantId", "type"])
      .index("by_provider", ["provider"])
      .index("by_status", ["status"])
      .index("by_health", ["health.status"])
      .searchIndex("integration_search", {
        searchField: "name",
        filterFields: ["tenantId", "type", "provider", "status"],
      }),

    // ==================== INTEGRATION LOGS ====================
    integrationLogs: defineTable({
      tenantId: v.id("tenants"),
      integrationId: v.id("integrations"),
      correlationId: v.string(),

      // Request
      request: v.object({
        method: v.string(),
        url: v.string(),
        headers: v.optional(v.any()),
        body: v.optional(v.any()),
        timestamp: v.number(),
      }),

      // Response
      response: v.optional(
        v.object({
          statusCode: v.number(),
          headers: v.optional(v.any()),
          body: v.optional(v.any()),
          timestamp: v.number(),
          duration: v.number(),
        })
      ),

      // Error
      error: v.optional(
        v.object({
          code: v.string(),
          message: v.string(),
          details: v.optional(v.any()),
          stack: v.optional(v.string()),
        })
      ),

      // Context
      context: v.object({
        userId: v.optional(v.id("users")),
        eventId: v.optional(v.id("events")),
        sessionId: v.optional(v.id("sessions")),
        registrationId: v.optional(v.id("registrations")),
        action: v.string(),
        resource: v.string(),
      }),

      // Status
      status: v.union(
        v.literal('success'),
        v.literal('failure'),
        v.literal('timeout'),
        v.literal('retry')
      ),

      // Retry information
      retry: v.optional(
        v.object({
          attempt: v.number(),
          maxAttempts: v.number(),
          nextRetryAt: v.optional(v.number()),
        })
      ),

      // Metadata
      metadata: v.object({
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        service: v.string(),
        version: v.string(),
      }),
    })
      .index("by_tenant_integration", ["tenantId", "integrationId"])
      .index("by_correlation_id", ["correlationId"])
      .index("by_status", ["status"])
      .index("by_date", ["request.timestamp"])
      .index("by_context", ["context.eventId", "context.resource"]),

    // ==================== BACKUPS & DATA MANAGEMENT ====================
    backups: defineTable({
      tenantId: v.id("tenants"),
      type: v.union(
        v.literal('full'),
        v.literal('incremental'),
        v.literal('differential'),
        v.literal('transaction_log')
      ),

      // Details
      details: v.object({
        startTime: v.number(),
        endTime: v.number(),
        duration: v.number(),
        sizeBytes: v.number(),
        recordCount: v.number(),
        tables: v.array(v.string()),

        // Storage
        storage: v.object({
          provider: v.string(),
          region: v.string(),
          bucket: v.string(),
          path: v.string(),
          encryptionKey: v.string(),
        }),

        // Verification
        verification: v.object({
          checksum: v.string(),
          verified: v.boolean(),
          verifiedAt: v.optional(v.number()),
          integrityCheck: v.string(),
        }),
      }),

      // Schedule
      schedule: v.object({
        scheduledAt: v.number(),
        frequency: v.string(),
        retentionDays: v.number(),
        nextSchedule: v.number(),
      }),

      // Status
      status: v.union(
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('failed'),
        v.literal('verifying'),
        v.literal('expired')
      ),

      // Error
      error: v.optional(
        v.object({
          code: v.string(),
          message: v.string(),
          retryable: v.boolean(),
        })
      ),

      // Restore
      restore: v.optional(
        v.object({
          requestedBy: v.id("users"),
          requestedAt: v.number(),
          completedAt: v.optional(v.number()),
          status: v.string(),
          targetDate: v.number(),
        })
      ),

      // Audit
      createdBy: v.id("users"),
      createdAt: v.number(),
    })
      .index("by_tenant_date", ["tenantId", "details.startTime"])
      .index("by_status", ["status"])
      .index("by_type", ["type"])
      .index("by_schedule", ["schedule.scheduledAt"]),
    organizerRegistrations: defineTable({
      // Registration workflow
      registrationId: v.string(),
      email: v.string(),
      companyName: v.string(),

      // Business verification
      businessType: v.union(
        v.literal('corporation'),
        v.literal('llc'),
        v.literal('nonprofit'),
        v.literal('government'),
        v.literal('educational'),
        v.literal('individual')
      ),

      // Verification documents
      documents: v.array(
        v.object({
          type: v.union(
            v.literal('business_license'),
            v.literal('tax_certificate'),
            v.literal('bank_statement'),
            v.literal('government_id'),
            v.literal('utility_bill')
          ),
          url: v.string(),
          status: v.union(v.literal('pending'), v.literal('verified'), v.literal('rejected')),
          verifiedBy: v.optional(v.id("users")),
          verifiedAt: v.optional(v.number()),
          rejectionReason: v.optional(v.string()),
        })
      ),

      // KYC/AML compliance
      kycStatus: v.union(
        v.literal('not_started'),
        v.literal('in_review'),
        v.literal('approved'),
        v.literal('rejected'),
        v.literal('escalated')
      ),
      kycScore: v.optional(v.number()),
      amlCheckPassed: v.boolean(),

      // Onboarding workflow
      onboardingStep: v.number(),
      onboardingStatus: v.union(
        v.literal('email_verification'),
        v.literal('business_verification'),
        v.literal('payment_setup'),
        v.literal('platform_tour'),
        v.literal('first_event'),
        v.literal('completed')
      ),

      // Credit check
      creditCheck: v.optional(
        v.object({
          status: v.string(),
          score: v.number(),
          limit: v.number(),
          checkedAt: v.number(),
          provider: v.string(),
        })
      ),

      // Custom onboarding
      customOnboarding: v.object({
        assignedAccountManager: v.optional(v.id("users")),
        successPlan: v.optional(v.string()),
        expectedMonthlyVolume: v.number(),
        contractSigned: v.boolean(),
        contractId: v.optional(v.id("documents")),
      }),

      // Status
      status: v.union(
        v.literal('pending'),
        v.literal('approved'),
        v.literal('rejected'),
        v.literal('suspended'),
        v.literal('under_review')
      ),

      // Timeline
      submittedAt: v.number(),
      reviewedAt: v.optional(v.number()),
      approvedAt: v.optional(v.number()),
      activatedAt: v.optional(v.number()),

      // Audit
      createdBy: v.optional(v.string()), // Could be external user not yet in system
      reviewedBy: v.optional(v.id("users")),
      approvedBy: v.optional(v.id("users")),
    })
      .index("by_email", ["email"])
      .index("by_status", ["status"])
      .index("by_submission_date", ["submittedAt"])
      .searchIndex("organizer_search", {
        searchField: "companyName",
        filterFields: ["status", "businessType", "kycStatus"],
      }),

    // Add organizer profiles for additional business info
    organizerProfiles: defineTable({
      tenantId: v.id("tenants"),

      // Business details
      businessInfo: v.object({
        legalStructure: v.string(),
        incorporationDate: v.number(),
        incorporationCountry: v.string(),
        registrationNumber: v.string(),
        taxId: v.string(),

        // Contact persons
        legalContact: v.object({
          name: v.string(),
          email: v.string(),
          phone: v.string(),
          title: v.string(),
        }),
        billingContact: v.object({
          name: v.string(),
          email: v.string(),
          phone: v.string(),
        }),
        technicalContact: v.object({
          name: v.string(),
          email: v.string(),
          phone: v.string(),
        }),
      }),

      // Event specialization
      specialization: v.object({
        industries: v.array(v.string()),
        eventTypes: v.array(v.string()),
        averageEventSize: v.number(),
        yearlyEventCount: v.number(),

        // Capabilities
        capabilities: v.array(
          v.object({
            name: v.string(),
            level: v.union(v.literal('basic'), v.literal('intermediate'), v.literal('expert')),
            certified: v.boolean(),
            certificationId: v.optional(v.string()),
          })
        ),

        // Awards & recognition
        awards: v.array(
          v.object({
            name: v.string(),
            year: v.number(),
            awardingBody: v.string(),
          })
        ),
      }),

      // Performance metrics
      performance: v.object({
        overallRating: v.number(),
        totalEvents: v.number(),
        totalAttendees: v.number(),
        repeatRate: v.number(),
        cancellationRate: v.number(),

        // Financial metrics
        totalRevenue: v.number(),
        averageRevenuePerEvent: v.number(),
        paymentSuccessRate: v.number(),

        // Customer satisfaction
        averageEventRating: v.number(),
        responseTimeHours: v.number(),
        supportTickets: v.number(),
        resolutionRate: v.number(),
      }),

      // Partner program
      partnerTier: v.union(
        v.literal('basic'),
        v.literal('silver'),
        v.literal('gold'),
        v.literal('platinum'),
        v.literal('enterprise')
      ),
      partnerSince: v.number(),
      partnerBenefits: v.array(v.string()),

      // Integration preferences
      integrations: v.array(
        v.object({
          type: v.string(),
          provider: v.string(),
          connected: v.boolean(),
          connectedAt: v.optional(v.number()),
        })
      ),

      // Custom branding
      customBranding: v.object({
        logoUrl: v.string(),
        colorScheme: v.object({
          primary: v.string(),
          secondary: v.string(),
          accent: v.string(),
        }),
        fonts: v.array(v.string()),
        cssOverrides: v.optional(v.string()),
      }),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_partner_tier", ["partnerTier"])
      .index("by_performance", ["performance.overallRating"]),

    // AI Models & Configurations
    aiModels: defineTable({
      tenantId: v.id("tenants"),
      name: v.string(),
      provider: v.union(
        v.literal('openai'),
        v.literal('anthropic'),
        v.literal('google'),
        v.literal('azure'),
        v.literal('aws'),
        v.literal('custom')
      ),

      // Model configuration
      modelConfig: v.object({
        modelName: v.string(),
        version: v.string(),
        maxTokens: v.number(),
        temperature: v.number(),

        // Fine-tuning
        fineTuned: v.boolean(),
        fineTunedModelId: v.optional(v.string()),
        trainingDataSize: v.optional(v.number()),
        lastTrained: v.optional(v.number()),

        // Cost tracking
        costPerToken: v.number(),
        monthlyBudget: v.number(),
        currentUsage: v.number(),
      }),

      // Capabilities
      capabilities: v.array(
        v.union(
          v.literal('content_generation'),
          v.literal('sentiment_analysis'),
          v.literal('recommendation'),
          v.literal('prediction'),
          v.literal('classification'),
          v.literal('summarization'),
          v.literal('translation'),
          v.literal('moderation')
        )
      ),

      // Performance
      performance: v.object({
        accuracy: v.number(),
        latency: v.number(),
        uptime: v.number(),
        lastEvaluated: v.number(),

        // Bias monitoring
        biasScore: v.number(),
        fairnessMetrics: v.any(),

        // Drift detection
        dataDriftDetected: v.boolean(),
        conceptDriftDetected: v.boolean(),
        lastDriftCheck: v.number(),
      }),

      // Compliance
      compliance: v.object({
        gdprCompliant: v.boolean(),
        dataProcessingAgreement: v.boolean(),
        auditTrailEnabled: v.boolean(),
        explainabilityRequired: v.boolean(),

        // Ethical AI
        ethicalGuidelines: v.array(v.string()),
        biasMitigation: v.boolean(),
        humanInTheLoop: v.boolean(),
      }),

      status: v.union(
        v.literal('active'),
        v.literal('training'),
        v.literal('evaluating'),
        v.literal('deprecated'),
        v.literal('paused')
      ),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_capability", ["capabilities"])
      .index("by_status", ["status"]),

    // AI-powered predictions
    aiPredictions: defineTable({
      tenantId: v.id("tenants"),
      eventId: v.id("events"),
      modelId: v.id("aiModels"),

      // Prediction details
      predictionType: v.union(
        v.literal('attendance'),
        v.literal('revenue'),
        v.literal('engagement'),
        v.literal('churn'),
        v.literal('sentiment'),
        v.literal('recommendation')
      ),

      // Input features
      inputFeatures: v.object({
        historicalData: v.any(),
        currentMetrics: v.any(),
        externalFactors: v.optional(v.any()),
        confidenceThreshold: v.number(),
      }),

      // Prediction results
      results: v.object({
        predictedValue: v.any(),
        confidence: v.number(),
        upperBound: v.any(),
        lowerBound: v.any(),
        explanation: v.string(),

        // Feature importance
        featureImportance: v.array(
          v.object({
            feature: v.string(),
            importance: v.number(),
            impact: v.string(),
          })
        ),

        // Alternative scenarios
        scenarios: v.array(
          v.object({
            name: v.string(),
            probability: v.number(),
            outcome: v.any(),
            recommendation: v.string(),
          })
        ),
      }),

      // Actual outcomes (for model improvement)
      actualOutcome: v.optional(
        v.object({
          value: v.any(),
          recordedAt: v.number(),
          accuracy: v.number(),
          feedback: v.optional(v.string()),
        })
      ),

      // Usage tracking
      usedInDecision: v.boolean(),
      decisionImpact: v.optional(v.string()),

      // Audit
      generatedAt: v.number(),
      generatedBy: v.union(v.id("users"), v.literal('system')),
      version: v.string(),
    })
      .index("by_tenant_event", ["tenantId", "eventId"])
      .index("by_prediction_type", ["predictionType"])
      .index("by_date", ["generatedAt"])
      .index("by_model", ["modelId"]),

    // AI-generated content
    aiGeneratedContent: defineTable({
      tenantId: v.id("tenants"),
      eventId: v.id("events"),
      modelId: v.id("aiModels"),

      // Content details
      contentType: v.union(
        v.literal('event_description'),
        v.literal('email_copy'),
        v.literal('social_media'),
        v.literal('speaker_bio'),
        v.literal('agenda_item'),
        v.literal('faq'),
        v.literal('marketing_copy')
      ),

      // Generation parameters
      generationParams: v.object({
        tone: v.string(),
        targetAudience: v.string(),
        keywords: v.array(v.string()),
        length: v.string(),
        language: v.string(),
        styleGuideId: v.optional(v.id("documents")),
      }),

      // Generated content
      content: v.object({
        draft: v.string(),
        revised: v.optional(v.string()),
        final: v.optional(v.string()),

        // Variants
        variants: v.array(
          v.object({
            version: v.string(),
            content: v.string(),
            rating: v.number(),
            selected: v.boolean(),
          })
        ),

        // SEO optimization
        seoScore: v.number(),
        keywordsIncluded: v.array(v.string()),
        readabilityScore: v.number(),
      }),

      // Human feedback
      humanFeedback: v.optional(
        v.object({
          rating: v.number(),
          comments: v.string(),
          suggestedChanges: v.array(v.string()),
          approved: v.boolean(),
          approvedBy: v.id("users"),
          approvedAt: v.number(),
        })
      ),

      // Usage
      usage: v.object({
        usedIn: v.string(),
        publishedAt: v.optional(v.number()),
        views: v.number(),
        engagement: v.number(),
        conversionRate: v.optional(v.number()),
      }),

      // Compliance
      compliance: v.object({
        plagiarismChecked: v.boolean(),
        plagiarismScore: v.number(),
        brandGuidelinesFollowed: v.boolean(),
        legalReviewPassed: v.boolean(),
        aiDisclosureRequired: v.boolean(),
        aiDisclosureIncluded: v.boolean(),
      }),

      // Version control
      version: v.string(),
      previousVersionId: v.optional(v.id("aiGeneratedContent")),

      status: v.union(
        v.literal('draft'),
        v.literal('review'),
        v.literal('approved'),
        v.literal('published'),
        v.literal('archived')
      ),
    })
      .index("by_tenant_event", ["tenantId", "eventId"])
      .index("by_content_type", ["contentType"])
      .index("by_status", ["status"])
      .searchIndex("content_search", {
        searchField: "content.final",
        filterFields: ["tenantId", "contentType", "status"],
      }),

    // AI recommendations engine
    aiRecommendations: defineTable({
      tenantId: v.id("tenants"),
      userId: v.id("users"),

      // Recommendation context
      context: v.object({
        currentPage: v.string(),
        userIntent: v.string(),
        userBehavior: v.array(v.string()),
        timeOfDay: v.string(),
        deviceType: v.string(),
      }),

      // Recommendation engine
      engine: v.object({
        type: v.union(
          v.literal('collaborative_filtering'),
          v.literal('content_based'),
          v.literal('hybrid'),
          v.literal('context_aware'),
          v.literal('reinforcement_learning')
        ),
        modelId: v.id("aiModels"),
        confidence: v.number(),

        // Personalization
        personalized: v.boolean(),
        personalizationLevel: v.number(),
        diversityScore: v.number(),
        noveltyScore: v.number(),
      }),

      // Recommendations
      recommendations: v.array(
        v.object({
          rank: v.number(),
          itemType: v.string(),
          itemId: v.string(),
          score: v.number(),
          explanation: v.string(),

          // Business rules
          meetsCriteria: v.boolean(),
          constraints: v.array(v.string()),
          priority: v.number(),

          // Display
          displayTitle: v.string(),
          displayDescription: v.string(),
          displayImage: v.optional(v.string()),
          callToAction: v.string(),
        })
      ),

      // User interaction
      interaction: v.optional(
        v.object({
          selectedRank: v.optional(v.number()),
          selectedAt: v.optional(v.number()),
          feedback: v.optional(
            v.union(
              v.literal('positive'),
              v.literal('negative'),
              v.literal('neutral')
            )
          ),
          conversion: v.optional(v.boolean()),
          conversionValue: v.optional(v.number()),
        })
      ),

      // Performance
      performance: v.object({
        clickThroughRate: v.number(),
        conversionRate: v.number(),
        averagePosition: v.number(),
        impressionCount: v.number(),
      }),

      generatedAt: v.number(),
      expiresAt: v.number(),
    })
      .index("by_tenant_user", ["tenantId", "userId"])
      .index("by_generation_date", ["generatedAt"])
      .index("by_engine", ["engine.type"]),

    // AI moderation & safety
    aiModeration: defineTable({
      tenantId: v.id("tenants"),
      eventId: v.id("events"),
      sessionId: v.optional(v.id("sessions")),

      // Content to moderate
      content: v.object({
        type: v.union(
          v.literal('text'),
          v.literal('image'),
          v.literal('video'),
          v.literal('audio'),
          v.literal('document')
        ),
        source: v.string(),
        rawContent: v.string(),
        contentType: v.string(),
        authorId: v.id("users"),
      }),

      // Moderation results
      moderationResults: v.object({
        // Categories
        categories: v.object({
          hate: v.object({ flagged: v.boolean(), score: v.number() }),
          harassment: v.object({ flagged: v.boolean(), score: v.number() }),
          selfHarm: v.object({ flagged: v.boolean(), score: v.number() }),
          sexual: v.object({ flagged: v.boolean(), score: v.number() }),
          violence: v.object({ flagged: v.boolean(), score: v.number() }),
          spam: v.object({ flagged: v.boolean(), score: v.number() }),
          misinformation: v.object({ flagged: v.boolean(), score: v.number() }),
          customCategories: v.optional(v.any()),
        }),

        // Overall
        flagged: v.boolean(),
        severity: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')),
        confidence: v.number(),

        // Explanation
        explanation: v.string(),
        evidence: v.array(v.string()),

        // Suggested actions
        suggestedActions: v.array(
          v.union(
            v.literal('allow'),
            v.literal('review'),
            v.literal('block'),
            v.literal('warn'),
            v.literal('remove'),
            v.literal('escalate')
          )
        ),
      }),

      // Human review
      humanReview: v.optional(
        v.object({
          reviewedBy: v.id("users"),
          reviewedAt: v.number(),
          decision: v.string(),
          decisionReason: v.string(),
          overrideAi: v.boolean(),
          notes: v.string(),
        })
      ),

      // Actions taken
      actions: v.array(
        v.object({
          action: v.string(),
          takenBy: v.union(v.id("users"), v.literal('system')),
          takenAt: v.number(),
          duration: v.optional(v.number()), // For temporary blocks
          reason: v.string(),
        })
      ),

      // Appeal
      appeal: v.optional(
        v.object({
          requestedBy: v.id("users"),
          requestedAt: v.number(),
          reason: v.string(),
          status: v.string(),
          reviewedBy: v.optional(v.id("users")),
          reviewedAt: v.optional(v.number()),
          decision: v.optional(v.string()),
        })
      ),

      // Model info
      modelId: v.id("aiModels"),
      modelVersion: v.string(),

      status: v.union(
        v.literal('pending'),
        v.literal('reviewed'),
        v.literal('actioned'),
        v.literal('appealed'),
        v.literal('resolved')
      ),
    })
      .index("by_tenant_event", ["tenantId", "eventId"])
      .index("by_author", ["content.authorId"])
      .index("by_status", ["status"])
      .index("by_severity", ["moderationResults.severity"]),


    // AI Training Data
    aiTrainingData: defineTable({
      tenantId: v.id("tenants"),
      dataType: v.string(),

      // Data source
      source: v.object({
        type: v.union(
          v.literal('user_feedback'),
          v.literal('behavioral'),
          v.literal('manual_labeling'),
          v.literal('external_dataset'),
          v.literal('synthetic')
        ),
        eventId: v.optional(v.id("events")),
        userId: v.optional(v.id("users")),
        collectedAt: v.number(),
      }),

      // Data content
      content: v.any(),

      // Labels/annotations
      annotations: v.object({
        labeledBy: v.union(v.id("users"), v.literal('system')),
        labeledAt: v.number(),
        labels: v.any(),
        confidence: v.number(),
        qualityScore: v.number(),

        // Multi-labeler agreement
        multipleLabels: v.optional(
          v.array(
            v.object({
              labelerId: v.id("users"),
              labels: v.any(),
              confidence: v.number(),
            })
          )
        ),
        agreementScore: v.optional(v.number()),
      }),

      // Usage in training
      trainingUsage: v.array(
        v.object({
          modelId: v.id("aiModels"),
          trainingRunId: v.string(),
          usedAt: v.number(),
          weight: v.number(),
        })
      ),

      // Data quality
      quality: v.object({
        completeness: v.number(),
        accuracy: v.number(),
        consistency: v.number(),
        timeliness: v.number(),

        // Bias assessment
        biasAssessed: v.boolean(),
        biasScore: v.number(),
        protectedAttributes: v.array(v.string()),
        fairnessMetrics: v.any(),
      }),

      // Compliance
      compliance: v.object({
        consentObtained: v.boolean(),
        anonymized: v.boolean(),
        retentionPolicy: v.string(),
        canBeDeleted: v.boolean(),
        exportable: v.boolean(),
      }),

      status: v.union(
        v.literal('raw'),
        v.literal('labeled'),
        v.literal('validated'),
        v.literal('in_training'),
        v.literal('archived')
      ),
    })
      .index("by_tenant_type", ["tenantId", "dataType"])
      .index("by_source", ["source.type"])
      .index("by_quality", ["quality.accuracy"])
      .index("by_status", ["status"]),

    // AI Model Performance Tracking
    aiModelPerformance: defineTable({
      tenantId: v.id("tenants"),
      modelId: v.id("aiModels"),

      // Evaluation metrics
      metrics: v.object({
        // Accuracy metrics
        accuracy: v.number(),
        precision: v.number(),
        recall: v.number(),
        f1Score: v.number(),
        aucRoc: v.number(),

        // Business metrics
        businessImpact: v.number(),
        roi: v.number(),
        costSavings: v.number(),

        // Fairness metrics
        demographicParity: v.number(),
        equalOpportunity: v.number(),
        disparateImpact: v.number(),

        // Technical metrics
        latency: v.number(),
        throughput: v.number(),
        errorRate: v.number(),
        modelSize: v.number(),
      }),

      // Test data
      testData: v.object({
        size: v.number(),
        distribution: v.any(),
        splitMethod: v.string(),
        dataVersion: v.string(),
      }),

      // Drift detection
      drift: v.object({
        dataDrift: v.number(),
        conceptDrift: v.number(),
        lastDriftCheck: v.number(),
        alertThreshold: v.number(),
        alertsTriggered: v.number(),
      }),

      // Comparison
      comparison: v.object({
        baselineModelId: v.optional(v.id("aiModels")),
        improvement: v.number(),
        statisticalSignificance: v.number(),
        abTestId: v.optional(v.string()),
      }),

      // Evaluation period
      evaluationPeriod: v.object({
        startDate: v.number(),
        endDate: v.number(),
        sampleSize: v.number(),
      }),

      // Recommendations
      recommendations: v.array(
        v.object({
          type: v.string(),
          priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')),
          description: v.string(),
          expectedImpact: v.number(),
          effort: v.number(),
        })
      ),

      evaluatedAt: v.number(),
      evaluatedBy: v.union(v.id("users"), v.literal('system')),
      version: v.string(),
    })
      .index("by_tenant_model", ["tenantId", "modelId"])
      .index("by_evaluation_date", ["evaluatedAt"])
      .index("by_performance", ["metrics.accuracy"]),

    // ==================== MOCK COMMUNICATIONS (DEV ONLY) ====================
    mock_communications: defineTable({
      type: v.union(v.literal('email'), v.literal('sms')),
      recipient: v.string(),
      subject: v.optional(v.string()),
      body: v.string(),
      metadata: v.optional(v.any()),
      sentAt: v.number(),
      status: v.string(), // sent, failed
    })
      .index("by_recipient", ["recipient"])
      .index("by_type", ["type"]),

    // ==================== SEAT MAP SYSTEM ====================

    // Venue Sections (e.g., VIP, Premium, Standard)
    sections: defineTable({
      venueId: v.id("venues"),
      eventId: v.optional(v.id("events")), // Event-specific overrides
      name: v.string(), // "VIP Section A", "Balcony Left"
      sectionType: v.union(
        v.literal('vip'),
        v.literal('premium'),
        v.literal('standard'),
        v.literal('accessible'),
        v.literal('standing')
      ),
      priceZoneId: v.optional(v.id("priceZones")),

      // Layout configuration
      layoutType: v.union(
        v.literal('stadium'), // Concentric circles
        v.literal('theater'),  // Fan-shaped rows
        v.literal('conference'), // Grid layout
        v.literal('outdoor')   // Freeform
      ),

      // Geometry for rendering (polygon coordinates)
      geometry: v.optional(v.object({
        type: v.literal('polygon'),
        coordinates: v.array(v.object({
          x: v.number(),
          y: v.number()
        }))
      })),

      // Display properties
      displayOrder: v.number(),
      color: v.string(), // Hex color for section

      // Metadata
      capacity: v.number(),
      rowCount: v.number(),
      seatsPerRow: v.number(),
      properties: v.optional(v.any()),

      // Audit
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_venue", ["venueId"])
      .index("by_event", ["eventId"])
      .index("by_price_zone", ["priceZoneId"]),

    // Price Zones for seat pricing tiers
    priceZones: defineTable({
      name: v.string(),
      eventId: v.optional(v.id("events")), // Event-specific pricing
      venueId: v.optional(v.id("venues")), // Default venue pricing

      // Pricing
      basePrice: v.number(),
      currency: v.string(),

      // Dynamic pricing (optional AI features)
      dynamicPricingEnabled: v.boolean(),
      surgeMultiplier: v.optional(v.number()), // 1.5 = 50% surge
      demandThreshold: v.optional(v.number()), // % sold to trigger surge

      // Features included
      features: v.array(v.string()), // ["Early entry", "Meet & greet"]

      // Status
      isActive: v.boolean(),

      // Audit
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_event", ["eventId"])
      .index("by_venue", ["venueId"])
      .index("by_price", ["basePrice"]),

    // Individual Seats
    seats: defineTable({
      sectionId: v.id("sections"),
      eventId: v.optional(v.id("events")), // Link to specific event

      // Identification
      rowLabel: v.string(), // "A", "B", "1", "2"
      seatNumber: v.number(), // 1, 2, 3...
      displayLabel: v.optional(v.string()), // "A-12" for display

      // Position on canvas (for rendering)
      xPosition: v.number(),
      yPosition: v.number(),

      // Status
      status: v.union(
        v.literal('available'),
        v.literal('selected'),   // Currently being selected by a user
        v.literal('held'),       // Temporarily reserved (10 min hold)
        v.literal('booked'),     // Confirmed reservation
        v.literal('reserved'),   // Reserved by organizers
        v.literal('unavailable') // Broken, removed, etc.
      ),

      // Seat type and features
      seatType: v.union(
        v.literal('standard'),
        v.literal('wheelchair'),
        v.literal('companion'), // Next to wheelchair
        v.literal('aisle'),
        v.literal('box'),      // Private box
        v.literal('standing')  // Standing room
      ),

      // Quality scoring (for AI recommendations)
      viewQualityScore: v.optional(v.number()), // 0-100
      accessibilityScore: v.optional(v.number()), // 0-100

      // References
      currentHoldId: v.optional(v.id("seatHolds")),
      registrationId: v.optional(v.id("registrations")),

      // Metadata
      properties: v.optional(v.any()), // Custom attributes

      // Audit
      lastStatusChange: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_section", ["sectionId"])
      .index("by_event", ["eventId"])
      .index("by_status", ["status"])
      .index("by_section_row", ["sectionId", "rowLabel"])
      .index("by_hold", ["currentHoldId"])
      .index("by_registration", ["registrationId"]),

    // Seat Holds (temporary reservations with TTL)
    seatHolds: defineTable({
      eventId: v.id("events"),
      seatIds: v.array(v.id("seats")),

      // User information
      userId: v.optional(v.id("users")),
      sessionId: v.string(), // Browser session ID

      // Hold timing
      holdExpiresAt: v.number(), // Timestamp when hold expires
      holdDurationMs: v.number(), // Usually 600000 (10 minutes)

      // AI Recommendation context (if seats were recommended)
      aiScore: v.optional(v.number()), // 0-100 recommendation confidence
      selectionReason: v.optional(v.string()), // "Best value", "Great view"
      recommendationFactors: v.optional(v.object({
        priceMatch: v.number(),
        viewQuality: v.number(),
        groupCohesion: v.number(),
        accessibility: v.number(),
      })),

      // Status
      status: v.union(
        v.literal('active'),
        v.literal('expired'),
        v.literal('converted'), // Converted to booking
        v.literal('released')   // Manually released
      ),

      // Metadata
      userAgent: v.optional(v.string()),
      ipAddress: v.optional(v.string()),

      // Audit
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_event", ["eventId"])
      .index("by_user", ["userId"])
      .index("by_session", ["sessionId"])
      .index("by_status", ["status"])
      .index("by_expiry", ["holdExpiresAt"]),

    // Seat Events (audit trail for all seat status changes)
    seatEvents: defineTable({
      seatId: v.id("seats"),
      eventId: v.id("events"),

      // Event details
      eventType: v.union(
        v.literal('hold_created'),
        v.literal('hold_expired'),
        v.literal('hold_released'),
        v.literal('booking_confirmed'),
        v.literal('booking_cancelled'),
        v.literal('status_changed'),
        v.literal('seat_created'),
        v.literal('seat_updated')
      ),

      // State transition
      fromStatus: v.optional(v.string()),
      toStatus: v.string(),

      // Actor
      userId: v.optional(v.id("users")),
      sessionId: v.optional(v.string()),

      // Context
      holdId: v.optional(v.id("seatHolds")),
      registrationId: v.optional(v.id("registrations")),
      metadata: v.optional(v.any()),

      // Timestamp
      occurredAt: v.number(),
    })
      .index("by_seat", ["seatId"])
      .index("by_event", ["eventId"])
      .index("by_type", ["eventType"])
      .index("by_timestamp", ["occurredAt"])
      .index("by_user", ["userId"]),
    // --- Enterprise Venue Design System ---
    venueDesigns: defineTable({
      venueId: v.optional(v.string()), // Flexible for now
      name: v.string(),
      designVersion: v.number(),
      designState: v.any(), // full snapshot JSON
      baseArchetype: v.optional(v.string()),
      customArchetype: v.optional(v.any()),
      designLayers: v.array(v.any()),
      tenantId: v.optional(v.string()), // Optional for MVP
      createdBy: v.id("users"),
      isTemplate: v.boolean(),
      templateCategory: v.optional(v.string()),
      approvalState: v.string(),
      lastPublishedAt: v.optional(v.number()),
    })
      .index("byVenue", ["venueId"]),
    // .index("byTenant", ["tenantId"]), // Tenant ID might not be indexed yet if not fully implemented

    stages: defineTable({
      designId: v.id("venueDesigns"),
      name: v.string(),
      type: v.string(),
      geometry: v.any(),
      position: v.any(),
      properties: v.any(),
      lightingGrid: v.optional(v.any()),
      audioZones: v.optional(v.array(v.any())),
      safetyMargins: v.optional(v.any()),
    }).index("byDesign", ["designId"]),

    // Enhanced Zones (Hierarchical)
    venueZones: defineTable({
      designId: v.id("venueDesigns"),
      parentZoneId: v.optional(v.id("venueZones")),
      name: v.string(),
      type: v.string(),
      category: v.string(),
      boundary: v.any(), // GeoJSON or Konva Path
      capacityConfig: v.any(),
      accessPoints: v.array(v.any()),
      connectivity: v.any(),
      amenities: v.array(v.any()),
      pricingTierId: v.optional(v.id("ticketTiers")), // Link to existing tiers
      viewScore: v.optional(v.number()),
      safetyRating: v.optional(v.number()),
      display: v.any(),
    })
      .index("byDesign", ["designId"])
      .index("byParent", ["parentZoneId"]),

    seatRules: defineTable({
      zoneId: v.id("venueZones"),
      generationType: v.string(),
      parameters: v.any(),
      numberingSchema: v.any(),
      seatDistribution: v.optional(v.any()),
      accessibilityRules: v.optional(v.any()),
      validationRules: v.optional(v.any()),
      active: v.boolean(),
    }).index("byZone", ["zoneId"]),

    amenities: defineTable({
      designId: v.id("venueDesigns"),
      zoneId: v.optional(v.id("venueZones")),
      type: v.string(),
      name: v.string(),
      boundary: v.any(),
      capacity: v.optional(v.number()),
      servicePoints: v.array(v.any()),
      queueArea: v.optional(v.any()),
      equipment: v.array(v.any()),
      staffRequired: v.number(),
      revenueZone: v.boolean(),
    }).index("byDesign", ["designId"]),

    collaborationEvents: defineTable({
      designId: v.id("venueDesigns"),
      userId: v.id("users"),
      action: v.string(),
      elementType: v.string(),
      elementId: v.optional(v.string()),
      changeset: v.any(),
      comment: v.optional(v.string()),
      timestamp: v.number(),
    }).index("byDesign", ["designId"]),

    designAiRecommendations: defineTable({
      designId: v.id("venueDesigns"),
      type: v.string(),
      confidence: v.number(),
      currentState: v.any(),
      suggestedChanges: v.any(),
      impact: v.any(),
      applied: v.boolean(),
      createdAt: v.number(),
    }).index("byDesign", ["designId"]),

    // --- Real-time Seat Status & Mapping ---
    designSeats: defineTable({
      designId: v.id("venueDesigns"),
      zoneId: v.id("venueZones"),
      row: v.optional(v.string()),
      number: v.optional(v.number()),
      name: v.string(), // E.g. "A-12"
      x: v.number(),
      y: v.number(),
      status: v.string(), // "available", "reserved", "sold", "blocked"
      price: v.number(),
      attributes: v.optional(v.any()), // { accessible: true, companion: true }
      eventId: v.optional(v.id("events")), // Link to specific event instance if needed
      reservedUntil: v.optional(v.number()), // For temporary cart hold
      buyerId: v.optional(v.string()),
    })
      .index("byDesign", ["designId"])
      .index("byZone", ["zoneId"])
      .index("byEventStatus", ["eventId", "status"]),

    // ==================== MARKETPLACE & SUPPLIERS ====================
    suppliers: defineTable({
      tenantId: v.optional(v.id("tenants")),
      userId: v.id("users"), // Linked admin user
      slug: v.string(), // Unique SEO handle
      name: v.string(),
      description: v.optional(v.string()),
      categories: v.array(v.string()), // photographer, decor, makeup, etc.

      // Branding
      logoUrl: v.optional(v.string()),
      coverUrl: v.optional(v.string()),

      // Contact & Social
      contact: v.object({
        email: v.string(),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
      }),

      // Location
      location: v.object({
        city: v.string(),
        country: v.string(),
        address: v.optional(v.string()),
        coordinates: v.optional(v.object({
          lat: v.number(),
          lon: v.number(),
        })),
      }),

      // Performance
      rating: v.number(),
      reviewCount: v.number(),
      verified: v.boolean(),

      // Status
      status: v.union(
        v.literal('active'),
        v.literal('pending'),
        v.literal('suspended'),
        v.literal('inactive')
      ),

      // Showcasing
      portfolios: v.optional(v.array(
        v.object({
          url: v.string(),
          type: v.union(v.literal('image'), v.literal('video')),
          caption: v.optional(v.string()),
        })
      )),

      // Availability
      availability: v.optional(v.array(v.number())), // Array of timestamps for unavailable dates

      // Audit
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_rating", ["rating"])
      .searchIndex("supplier_search", {
        searchField: "name",
        filterFields: ["status", "location.city", "location.country"],
      }),

    services: defineTable({
      supplierId: v.id("suppliers"),
      name: v.string(),
      description: v.string(),
      price: v.number(),
      currency: v.string(),
      features: v.array(v.string()),
      active: v.boolean(),
    }).index("by_supplier", ["supplierId"]),

    // ==================== COMMERCE & MESSAGING ====================
    leads: defineTable({
      supplierId: v.id("suppliers"),
      userId: v.id("users"), // The client
      eventId: v.optional(v.id("events")), // Linked event context

      status: v.union(
        v.literal('new'),
        v.literal('viewed'),
        v.literal('contacted'),
        v.literal('quoted'),
        v.literal('booked'),
        v.literal('declined'),
        v.literal('expired'),
        v.literal('archived')
      ),

      details: v.object({
        eventDate: v.optional(v.number()),
        guestCount: v.optional(v.number()),
        budget: v.optional(v.number()),
        requirements: v.string(),
        location: v.optional(v.string()),
      }),

      lastActionAt: v.number(),

      quote: v.optional(v.object({
        amount: v.number(),
        currency: v.string(),
        validUntil: v.optional(v.number()),
        note: v.optional(v.string()),
        services: v.optional(v.array(v.id("services"))),
      })),

      conversationId: v.optional(v.id("conversations")),

      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_supplier", ["supplierId"])
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_supplier_status", ["supplierId", "status"]),

    transactions: defineTable({
      leadId: v.optional(v.id("leads")),
      payerId: v.optional(v.id("users")), // Keeping for backward compatibility
      payeeId: v.optional(v.id("suppliers")),

      // Event Payment Fields
      eventId: v.optional(v.id("events")),
      userId: v.optional(v.id("users")), // Payer/User

      amount: v.number(),
      type: v.string(), // escrow_in, payout, ticket_sale
      status: v.string(), // held, released, refunded, success
      timestamp: v.number(),
      metadata: v.optional(v.any()),
    })
      .index("by_payer", ["payerId"])
      .index("by_payee", ["payeeId"])
      .index("by_lead", ["leadId"])
      .index("by_event", ["eventId"])
      .index("by_user", ["userId"]),

    reviews: defineTable({
      supplierId: v.id("suppliers"),
      userId: v.id("users"),
      rating: v.number(), // 1-5
      comment: v.string(),

      // Verified Purchase/Booking
      leadId: v.optional(v.id("leads")),
      verified: v.boolean(),

      response: v.optional(v.object({
        comment: v.string(),
        respondedAt: v.number(),
      })),

      createdAt: v.number(),
    })
      .index("by_supplier", ["supplierId"])
      .index("by_rating", ["rating"]),

    conversations: defineTable({
      participants: v.array(v.id("users")), // User IDs involved

      // Context links (Polymorphic-ish)
      entityId: v.optional(v.string()), // e.g., RFQ ID
      entityType: v.optional(v.string()), // "rfq", "support", "organizer"

      lastMessageAt: v.number(),
      lastMessagePreview: v.optional(v.string()),

      // Read status: Map of UserId -> Unread Count
      unreadCounts: v.optional(v.any()),

      status: v.string(), // active, archived
    })
      .index("by_recency", ["lastMessageAt"]),

    messages: defineTable({
      conversationId: v.id("conversations"),
      senderId: v.id("users"),

      content: v.string(),
      type: v.union(
        v.literal('text'),
        v.literal('image'),
        v.literal('offer'),
        v.literal('file')
      ),

      metadata: v.optional(v.any()), // For file details, offer data, etc.

      readBy: v.array(v.id("users")), // Who has seen this

      createdAt: v.number(),
    })
      .index("by_conversation", ["conversationId"]),

    payouts: defineTable({
      supplierId: v.id("users"),
      amount: v.number(),
      status: v.string(), // "pending", "completed", "rejected"
      method: v.string(), // "bkash", "bank_transfer", etc.
      requestedAt: v.number(),
      processedAt: v.optional(v.number()),
      transactionRef: v.optional(v.string()), // Reference from external payment
      notes: v.optional(v.string())
    })
      .index("by_status", ["status"])
      .index("by_supplier", ["supplierId"]),

    audit_logs: defineTable({
      adminId: v.id("users"),
      action: v.string(), // e.g., "USER_STATUS_CHANGE", "EVENT_DELETE"
      targetId: v.optional(v.string()),
      details: v.any(),
      timestamp: v.number()
    }).index("by_timestamp", ["timestamp"]),
  }, { schemaValidation: false });
