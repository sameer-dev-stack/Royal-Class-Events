/**
 * Intelligence Layer - Convex Bridge
 * Connects to Python microservice for AI predictions
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

// For local development - Python service runs on localhost:8000
// In production, this would be set via environment variables
const PYTHON_SERVICE_URL = "http://localhost:8000";

/**
 * Predict event demand by calling Python service
 */
export const predictEventDemand = action({
    args: {
        category: v.string(),
        location: v.string(),
        startDate: v.number(), // timestamp
        capacity: v.number(),
        ticketType: v.union(v.literal("free"), v.literal("paid")),
    },
    handler: async (ctx, args) => {
        try {
            // Convert timestamp to ISO string
            const startDateISO = new Date(args.startDate).toISOString();

            // Call Next.js API route (which then calls Python service)
            // Next.js runs locally and can access localhost:8000
            const response = await fetch(`http://localhost:3000/api/intelligence/predict-demand`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    category: args.category,
                    location: args.location,
                    start_date: startDateISO,
                    capacity: args.capacity,
                    ticket_type: args.ticketType,
                }),
            });

            if (!response.ok) {
                throw new Error(`Python service error: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error("Prediction failed");
            }

            return {
                success: true,
                demandScore: result.data.demand_score,
                confidence: result.data.confidence,
                factors: result.data.factors,
            };
        } catch (error) {
            console.error("Error calling Python service:", error);

            // Return fallback prediction if service is down
            return {
                success: false,
                error: error.message,
                demandScore: 50, // Neutral score
                confidence: 0.1,
                factors: null,
            };
        }
    },
});

/**
 * Forecast revenue for an event
 */
export const forecastRevenue = action({
    args: {
        demandScore: v.number(),
        capacity: v.number(),
        ticketPrice: v.number(),
        ticketType: v.union(v.literal("free"), v.literal("paid")),
    },
    handler: async (ctx, args) => {
        try {
            const response = await fetch(`${PYTHON_SERVICE_URL}/forecast-revenue`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    demand_score: args.demandScore,
                    capacity: args.capacity,
                    ticket_price: args.ticketPrice,
                    ticket_type: args.ticketType,
                }),
            });

            if (!response.ok) {
                throw new Error(`Python service error: ${response.statusText}`);
            }

            const result = await response.json();

            return {
                success: true,
                expectedSales: result.data.expected_sales,
                minRevenue: result.data.min_revenue,
                expectedRevenue: result.data.expected_revenue,
                maxRevenue: result.data.max_revenue,
                sellThroughProbability: result.data.sell_through_probability,
            };
        } catch (error) {
            console.error("Error forecasting revenue:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
});

/**
 * Get price suggestion for a new event
 */
export const suggestPrice = action({
    args: {
        category: v.string(),
        location: v.string(),
        demandScore: v.number(),
        capacity: v.number(),
    },
    handler: async (ctx, args) => {
        try {
            const response = await fetch(`${PYTHON_SERVICE_URL}/suggest-price`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    category: args.category,
                    location: args.location,
                    demand_score: args.demandScore,
                    capacity: args.capacity,
                }),
            });

            if (!response.ok) {
                throw new Error(`Python service error: ${response.statusText}`);
            }

            const result = await response.json();

            return {
                success: true,
                suggestedPrice: result.data.suggested_price,
                minPrice: result.data.min_price,
                maxPrice: result.data.max_price,
                reasoning: result.data.reasoning,
            };
        } catch (error) {
            console.error("Error getting price suggestion:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
});

/**
 * Calculate dynamic price for an existing event
 */
export const calculateDynamicPrice = action({
    args: {
        basePrice: v.number(),
        minPrice: v.number(),
        maxPrice: v.number(),
        registrations: v.number(),
        capacity: v.number(),
        daysUntilEvent: v.number(),
    },
    handler: async (ctx, args) => {
        try {
            const response = await fetch(`${PYTHON_SERVICE_URL}/calculate-dynamic-price`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    base_price: args.basePrice,
                    min_price: args.minPrice,
                    max_price: args.maxPrice,
                    registrations: args.registrations,
                    capacity: args.capacity,
                    days_until_event: args.daysUntilEvent,
                }),
            });

            if (!response.ok) {
                throw new Error(`Python service error: ${response.statusText}`);
            }

            const result = await response.json();

            return {
                success: true,
                newPrice: result.data.new_price,
                changePct: result.data.change_pct,
                reason: result.data.reason,
                strategy: result.data.strategy,
            };
        } catch (error) {
            console.error("Error calculating dynamic price:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
});
