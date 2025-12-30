// Sample script to create a venue with seat map
// Run this in Convex dashboard or via mutation

import { api } from "./_generated/api";

/**
 * This script demonstrates how to create a venue with a seat map layout
 * 
 * To use:
 * 1. Create a venue first (or use existing venue ID)
 * 2. Call createVenueLayout mutation with the venue ID
 * 3. The system will automatically generate seats based on layout type
 */

// Example payload for creating a theater layout
const exampleTheaterLayout = {
    venueId: "YOUR_VENUE_ID_HERE", // Replace with actual venue ID
    layoutType: "theater",
    sections: [
        {
            name: "VIP Front Row",
            sectionType: "vip",
            rowCount: 2,
            seatsPerRow: 10,
            basePrice: 5000, // BDT
            color: "#9C27B0", // Purple
            displayOrder: 0,
        },
        {
            name: "Premium Center",
            sectionType: "premium",
            rowCount: 5,
            seatsPerRow: 12,
            basePrice: 3000, // BDT
            color: "#2196F3", // Blue
            displayOrder: 1,
        },
        {
            name: "Standard Seating",
            sectionType: "standard",
            rowCount: 10,
            seatsPerRow: 15,
            basePrice: 1500, // BDT
            color: "#4CAF50", // Green
            displayOrder: 2,
        },
        {
            name: "Accessible Seating",
            sectionType: "accessible",
            rowCount: 1,
            seatsPerRow: 4,
            basePrice: 1500, // BDT
            color: "#FF9800", // Orange
            displayOrder: 3,
        },
    ],
};

// Example conference room layout
const exampleConferenceLayout = {
    venueId: "YOUR_VENUE_ID_HERE",
    layoutType: "conference",
    sections: [
        {
            name: "Main Floor",
            sectionType: "standard",
            rowCount: 8,
            seatsPerRow: 10,
            basePrice: 2000,
            color: "#4CAF50",
            displayOrder: 0,
        },
        {
            name: "Balcony",
            sectionType: "premium",
            rowCount: 3,
            seatsPerRow: 8,
            basePrice: 2500,
            color: "#2196F3",
            displayOrder: 1,
        },
    ],
};

// Example stadium layout
const exampleStadiumLayout = {
    venueId: "YOUR_VENUE_ID_HERE",
    layoutType: "stadium",
    sections: [
        {
            name: "Lower Bowl",
            sectionType: "premium",
            rowCount: 10,
            seatsPerRow: 30,
            basePrice: 4000,
            color: "#2196F3",
            displayOrder: 0,
        },
        {
            name: "Upper Bowl",
            sectionType: "standard",
            rowCount: 15,
            seatsPerRow: 40,
            basePrice: 2000,
            color: "#4CAF50",
            displayOrder: 1,
        },
        {
            name: "Skybox",
            sectionType: "vip",
            rowCount: 1,
            seatsPerRow: 10,
            basePrice: 10000,
            color: "#9C27B0",
            displayOrder: 2,
        },
    ],
};

/**
 * Usage instructions:
 * 
 * 1. In Convex Dashboard:
 *    - Go to Functions tab
 *    - Find seatMaps.createVenueLayout
 *    - Paste one of the example layouts above
 *    - Click "Run"
 * 
 * 2. Programmatically:
 *    const result = await ctx.runMutation(api.seatMaps.createVenueLayout, exampleTheaterLayout);
 * 
 * 3. The function will:
 *    - Create price zones for each section
 *    - Create sections with the specified properties
 *    - Automatically generate seats with coordinates based on layout type
 *    - Enable seat map on the venue
 *    - Return section IDs and seat counts
 */

export default {
    exampleTheaterLayout,
    exampleConferenceLayout,
    exampleStadiumLayout,
};
