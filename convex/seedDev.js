import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const MOCK_USERS = [
    {
        email: "admin@royal.com",
        role: "admin",
        externalId: "mock-admin-id",
    },
    {
        email: "organizer@royal.com",
        role: "organizer",
        externalId: "mock-organizer-id",
    },
    {
        email: "attendee@royal.com",
        role: "attendee",
        externalId: "mock-attendee-id",
    },
];

const EVENT_TEMPLATES = [
    {
        title: "The Royal Gala 2025",
        description: "An exclusive evening of elegance, fine dining, and networking with the elite.",
        category: "social",
        price: 5000,
        city: "Dhaka",
        venueName: "The Westin Grand Ballroom",
        image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200",
    },
    {
        title: "Tech Innovators Summit",
        description: "Join the brightest minds in technology for a day of keynotes and workshops.",
        category: "conference",
        price: 1500,
        city: "Dhaka",
        venueName: "BICC",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
    },
];

export const seedFinal = internalMutation({
    args: { clearRequest: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        console.log("🌱 Starting FINAL Seed Attempt...");

        // 1. Roles Setup
        const rolesToSeed = ["admin", "organizer", "attendee"];
        for (const roleKey of rolesToSeed) {
            const existing = await ctx.db.query("roles").withIndex("by_key", q => q.eq("key", roleKey)).first();
            if (!existing) {
                await ctx.db.insert("roles", {
                    key: roleKey,
                    name: roleKey.charAt(0).toUpperCase() + roleKey.slice(1),
                    description: `Default ${roleKey} role`,
                    permissions: roleKey === "admin" ? ["*"] : ["view"],
                    isSystem: true
                });
            }
        }

        // 2. Mock Users
        const userIdMap = {};
        for (const mockUser of MOCK_USERS) {
            let user = await ctx.db.query("users").withIndex("by_email", q => q.eq("profile.primaryEmail.address", mockUser.email)).first();
            if (!user) {
                console.log(`Inserting user: ${mockUser.email}`);
                const userId = await ctx.db.insert("users", {
                    externalId: mockUser.externalId,
                    authProvider: "internal",
                    profile: {
                        legalFirstName: "Mock",
                        legalLastName: "User",
                        title: "Mock User",
                        department: "Dev",
                        employeeId: "MOCK001",
                        employeeType: "full_time",
                        timezone: "Asia/Dhaka",
                        locale: "en-US",
                        currencyPreference: "BDT",
                        dataProcessingConsent: { consentedAt: Date.now(), version: "1.0", purposes: [] },
                        mfaEnabled: false,
                        accessibility: { requiresClosedCaptions: false, wheelchairAccess: false, dietaryRestrictions: [] },
                        primaryEmail: {
                            address: mockUser.email,
                            verified: true,
                            isMarketingAllowed: true,
                            isTransactionalAllowed: true
                        }
                    },
                    status: "active",
                    statusChangedAt: Date.now(),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    version: 1,
                });
                user = await ctx.db.get(userId);
            }
            userIdMap[mockUser.role] = user._id;
        }

        const adminId = userIdMap["admin"];
        const organizerId = userIdMap["organizer"];
        const attendeeId = userIdMap["attendee"];

        // 3. Mock Tenant (Required for some tables)
        let tenant = await ctx.db.query("tenants").first();
        if (!tenant) {
            const tenantId = await ctx.db.insert("tenants", {
                externalId: "mock-tenant",
                legalName: "Royal Class Events Ltd",
                tradingName: "Royal Class Events",
                headquarters: {
                    street: "Main St", city: "Dhaka", state: "Dhaka", postalCode: "1200", country: "Bangladesh", countryCode: "BD", timezone: "Asia/Dhaka"
                },
                registrationNumber: "12345",
                taxId: "TAX123",
                incorporationDate: Date.now(),
                incorporationCountry: "Bangladesh",
                defaultCurrency: "BDT",
                paymentTerms: 30,
                compliance: { gdprApplicable: false, ccpaApplicable: false, hipaaApplicable: false, soc2Compliant: false, iso27001Certified: false, dataResidencyRegion: "BD" },
                billingPlan: {
                    planId: "pro", name: "Pro", tier: "pro", limits: { maxUsers: 100, maxAttendees: 10000, storageGb: 10, apiCallsPerMonth: 1000000 },
                    billingCycle: "monthly", nextBillingDate: Date.now() + 2592000000, autoRenew: true
                },
                branding: { logoUrl: "", primaryColor: "#d97706", secondaryColor: "#000000", fontFamily: "Inter", emailTemplateId: undefined },
                status: "active",
                tags: ["royal", "premium"],
                createdBy: adminId,
                createdAt: Date.now(),
                updatedBy: adminId,
                updatedAt: Date.now(),
                version: 1,
            });
            tenant = await ctx.db.get(tenantId);
        }

        // 4. Mock Venue
        let venue = await ctx.db.query("venues").first();
        if (!venue) {
            const venueId = await ctx.db.insert("venues", {
                tenantId: tenant._id,
                externalId: "mock-venue-1",
                name: "The Royal Ballroom",
                type: "hotel",
                address: {
                    formatted: "The Westin, Dhaka", line1: "Main St", city: "Dhaka", state: "Dhaka", postalCode: "1200", country: "Bangladesh", countryCode: "BD",
                    coordinates: { lat: 23.7937, lon: 90.4066, accuracy: 10 }, timezone: "Asia/Dhaka"
                },
                capacities: { theater: 500, classroom: 200, banquet: 400, uShape: 100, reception: 600, standing: 1000 },
                facilities: {
                    wifi: { available: true, speedMbps: 100, coverage: "full", captivePortal: false },
                    power: { outletsPerPerson: 1, voltage: "220V", phases: 1, backupGenerator: true },
                    av: { builtIn: true, projector: true, screens: 2, soundSystem: true, microphones: 4, videoConferencing: true, technicianOnSite: true },
                    accessibility: { wheelchairAccess: true, elevators: 2, accessibleRestrooms: true, hearingAssistance: true, brailleSignage: false, serviceAnimalFriendly: true },
                    security: { cctv: true, securityStaff: true, metalDetectors: true, bagCheck: true, emergencyExits: 4, firstAidRoom: true }
                },
                contacts: [],
                pricing: { hourlyRate: 5000, dailyRate: 40000, weekendRate: 50000, overtimeRate: 7000, minimumHours: 4, depositPercentage: 50, cancellationPolicy: "strict", includedServices: [], extraServices: [] },
                compliance: { licenses: [], insurance: { liabilityAmount: 1000000, certificateNumber: "INS-001", expiry: Date.now() + 31536000000 }, fireSafety: { certificateNumber: "FIRE-001", expiry: Date.now() + 31536000000, maxOccupancy: 1000 } },
                availability: { blackoutDates: [], maintenanceSchedule: [], bookingLeadTimeDays: 7, maxBookingDays: 365 },
                media: { floorPlans: [], photos: [] },
                ratings: { average: 5, count: 0, reviews: [] },
                status: "active",
                createdAt: Date.now(), updatedAt: Date.now(), version: 1
            });
            venue = await ctx.db.get(venueId);
        }

        // 5. Events
        const now = Date.now();
        const createdEventIds = [];
        for (const tpl of EVENT_TEMPLATES) {
            const slug = tpl.title.toLowerCase().replace(/ /g, "-");
            const existing = await ctx.db.query("events").withIndex("by_slug", q => q.eq("slug", slug)).first();
            if (existing) {
                createdEventIds.push(existing._id);
                continue;
            }

            const eventId = await ctx.db.insert("events", {
                externalId: `evt-${Math.random()}`,
                tenantId: tenant._id,
                eventType: tpl.category,
                classification: "public",
                complianceLevel: "standard",
                title: { en: tpl.title },
                description: { en: tpl.description },
                slug: slug,
                organizingDepartment: "Events",
                costCenter: "CC001",
                ownerId: organizerId,
                committeeIds: [],
                timeConfiguration: {
                    startDateTime: now + 86400000 * 7,
                    endDateTime: now + 86400000 * 7 + 14400000,
                    timezone: "Asia/Dhaka",
                    localStartTime: new Date(now + 86400000 * 7).toISOString(),
                    localEndTime: new Date(now + 86400000 * 7 + 14400000).toISOString(),
                    durationMinutes: 240,
                    isRecurring: false,
                    supportsMultipleTimezones: false,
                    primaryTimezone: "Asia/Dhaka",
                    secondaryTimezones: [],
                    setupBufferMinutes: 60,
                    teardownBufferMinutes: 60,
                    attendeeBufferBefore: 30,
                    attendeeBufferAfter: 30
                },
                locationConfig: {
                    type: "physical",
                    physicalVenues: [{
                        venueId: venue._id,
                        purpose: "main",
                        capacity: 500,
                        setupStyle: "banquet",
                        bookingReference: "REF123",
                        costCenter: "CC001",
                        contactPerson: { name: "Manager", phone: "123", email: "venue@test.com", emergencyContact: "911" }
                    }],
                },
                capacityConfig: {
                    totalCapacity: 500,
                    reservedCapacity: 0,
                    waitlistEnabled: true,
                    waitlistCapacity: 50,
                    overflowStrategy: "waitlist",
                    groupAllocations: [],
                    maxDensityPercent: 100,
                    socialDistancingRequired: false
                },
                registrationConfig: {
                    opensAt: now,
                    closesAt: now + 86400000 * 6,
                    requireApproval: false,
                    requireNDA: false,
                    requireBackgroundCheck: false,
                    customFields: [],
                    invitationOnly: false,
                    invitationMode: "multi_use",
                    checkInOpensBeforeMinutes: 60,
                    checkInClosesAfterMinutes: 60,
                    checkInMethods: ["qr"],
                    requirePhotoId: false,
                    requireCovidTest: false
                },
                financials: {
                    budget: 50000,
                    actualCost: 10000,
                    forecastCost: 45000,
                    revenueTarget: 100000,
                    actualRevenue: 25000,
                    pricingModel: tpl.price > 0 ? "paid" : "free",
                    currency: "BDT",
                    taxInclusive: true,
                    taxRate: 15,
                    taxJurisdiction: "BD",
                    paymentProcessor: "sslcommerz",
                    merchantAccountId: "test",
                    paymentTerms: "immediate",
                    refundPolicy: "no_refund",
                    requirePO: false
                },
                marketing: {
                    publicListing: true,
                    seoOptimized: true,
                    metaTitle: tpl.title,
                    metaDescription: tpl.description,
                    keywords: ["event", tpl.category],
                    socialSharingEnabled: true
                },
                content: {
                    agendaPublished: true,
                    speakerBiosPublished: true,
                    materialsAvailable: false,
                    recordingAvailable: false,
                    coverImage: { url: tpl.image, altText: tpl.title },
                    gallery: [],
                    documents: []
                },
                risk: {
                    securityLevel: "low",
                    insuranceRequired: false,
                    permits: [],
                    firstAidStaff: 1,
                    securityStaff: 2,
                    evacuationRoutes: [],
                    dataProcessingAgreementSigned: true
                },
                logistics: {
                    cateringRequired: true,
                    dietaryRequirements: ["veg", "non-veg"],
                    avEquipment: [],
                    signageRequired: true,
                    signageLocations: ["entry"]
                },
                status: {
                    current: "live",
                    changedAt: now,
                    changedBy: organizerId,
                    milestones: []
                },
                analytics: {
                    views: 120, uniqueViews: 100, saves: 15, shares: 5, conversionRate: 0.1, dropOffRate: 0.5, loadTime: 200, uptime: 100, errorRate: 0, predictedNps: 80, sentimentScore: 0.9,
                    registrations: 25, revenue: 25 * tpl.price, attendanceRate: 0, npsScore: 0
                },
                metadata: {
                    legacyProps: { city: tpl.city, venueName: tpl.venueName, ticketPrice: tpl.price, themeColor: "#d97706" },
                    tags: [tpl.category], categories: [tpl.category]
                },
                audit: {
                    createdBy: adminId, createdAt: now, updatedBy: adminId, updatedAt: now, version: 1, changeLog: []
                }
            });
            createdEventIds.push(eventId);
        }

        // 6. Registrations & Payments
        for (const eventId of createdEventIds) {
            const regId = await ctx.db.insert("registrations", {
                tenantId: tenant._id,
                eventId: eventId,
                userId: attendeeId,
                externalId: `ext-reg-${eventId}`,
                registrationNumber: `REG-${Math.floor(Math.random() * 100000)}`,
                ticketQuantity: 1,
                unitPrice: 500,
                status: { current: "confirmed" },
            });

            await ctx.db.insert("payments", {
                tenantId: tenant._id,
                registrationId: regId,
                externalId: `ext-pay-${eventId}`,
                paymentNumber: `PAY-${Math.floor(Math.random() * 100000)}`,
                status: { current: "captured" },
            });
        }

        console.log("✅ FINAL Seed Complete!");
        return { success: true };
    }
});
