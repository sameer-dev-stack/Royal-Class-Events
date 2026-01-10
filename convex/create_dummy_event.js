
import { mutation } from "./_generated/server";

export default mutation(async ({ db }) => {
    const id = await db.insert("events", {
        title: { en: "Royal Concert Test" },
        description: { en: "A test event for Royal Seat Engine" },
        slug: "royal-concert-test-" + Date.now(),
        eventType: "social",
        classification: "public",
        complianceLevel: "standard",
        ownerId: (await db.query("users").first())._id, // Grab first user as owner
        organizingDepartment: "IT",
        costCenter: "test",
        committeeIds: [],
        financials: {
            budget: 0,
            actualCost: 0,
            forecastCost: 0,
            revenueTarget: 0,
            actualRevenue: 0,
            pricingModel: "paid",
            currency: "BDT",
            taxInclusive: false,
            taxRate: 0,
            taxJurisdiction: "BD",
            paymentProcessor: "sslcommerz",
            merchantAccountId: "default",
            paymentTerms: "immediate",
            refundPolicy: "standard",
            requirePO: false
        },
        analytics: {
            views: 0,
            uniqueViews: 0,
            saves: 0,
            shares: 0,
            conversionRate: 0,
            dropOffRate: 0,
            loadTime: 0,
            uptime: 0,
            errorRate: 0,
            predictedNps: 0,
            sentimentScore: 0
        },
        metadata: {
            tags: [],
            categories: [],
        },
        audit: {
            createdBy: (await db.query("users").first())._id,
            createdAt: Date.now(),
            updatedBy: (await db.query("users").first())._id,
            updatedAt: Date.now(),
            version: 1,
            changeLog: []
        },
        risk: {
            securityLevel: "low",
            insuranceRequired: false,
            firstAidStaff: 0,
            securityStaff: 0,
            evacuationRoutes: [],
            dataProcessingAgreementSigned: true
        },
        logistics: {
            cateringRequired: false,
            avEquipment: [],
            signageRequired: false,
            signageLocations: []
        },
        content: {
            agendaPublished: false,
            speakerBiosPublished: false,
            materialsAvailable: false,
            recordingAvailable: false,
            gallery: [],
            documents: []
        },
        marketing: {
            publicListing: true,
            seoOptimized: false,
            socialSharingEnabled: false,
            metaTitle: "",
            metaDescription: "",
            keywords: []
        },
        registrationConfig: {
            opensAt: Date.now(),
            closesAt: Date.now() + 86400000,
            requireApproval: false,
            requireNDA: false,
            requireBackgroundCheck: false,
            customFields: [],
            invitationOnly: false,
            invitationMode: "open",
            checkInOpensBeforeMinutes: 0,
            checkInClosesAfterMinutes: 0,
            checkInMethods: [],
            requirePhotoId: false,
            requireCovidTest: false
        },
        capacityConfig: {
            totalCapacity: 100,
            reservedCapacity: 0,
            waitlistEnabled: false,
            waitlistCapacity: 0,
            overflowStrategy: "none",
            groupAllocations: [],
            maxDensityPercent: 0,
            socialDistancingRequired: false
        }
    });
    console.log("Created Dummy Event ID:", id);
    return id;
});
