/**
 * Quick Test Script for Intelligence Service
 * Run in Convex Dashboard Functions tab
 */

// Test 1: Predict Demand for a Tech Event in Dhaka
const testPredictDemand = async () => {
    const result = await ctx.runAction(api.intelligence.predictEventDemand, {
        category: "tech",
        location: "Dhaka",
        startDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        capacity: 100,
        ticketType: "paid",
    });

    console.log("Demand Prediction:", result);
    // Expected: { success: true, demandScore: 85-90, confidence: 0.75-1.0 }
};

// Test 2: Forecast Revenue
const testForecastRevenue = async () => {
    const result = await ctx.runAction(api.intelligence.forecastRevenue, {
        demandScore: 85,
        capacity: 100,
        ticketPrice: 500,
        ticketType: "paid",
    });

    console.log("Revenue Forecast:", result);
    // Expected: expectedRevenue around 42500
};

// Test 3: Suggest Price
const testSuggestPrice = async () => {
    const result = await ctx.runAction(api.intelligence.suggestPrice, {
        category: "gala",
        location: "Dhaka",
        demandScore: 90,
        capacity: 200,
    });

    console.log("Price Suggestion:", result);
    // Expected: suggestedPrice around 2000-2500
};

// Test 4: Calculate Dynamic Price
const testDynamicPrice = async () => {
    const result = await ctx.runAction(api.intelligence.calculateDynamicPrice, {
        basePrice: 500,
        minPrice: 350,
        maxPrice: 750,
        registrations: 75, // 75% sold
        capacity: 100,
        daysUntilEvent: 10,
    });

    console.log("Dynamic Price:", result);
    // Expected: Surge pricing, newPrice around 575 (+15%)
};

/**
 * How to use in Convex Dashboard:
 * 1. Open your Convex Dashboard
 * 2. Go to Functions tab
 * 3. Select 'intelligence' module
 * 4. Choose any action (e.g., predictEventDemand)
 * 5. Enter test data in JSON format
 * 6. Click "Run"
 * 
 * Example test data for predictEventDemand:
 * {
 *   "category": "tech",
 *   "location": "Dhaka",
 *   "startDate": 1735315200000,
 *   "capacity": 100,
 *   "ticketType": "paid"
 * }
 */
