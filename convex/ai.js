import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Gemini API endpoint (free tier)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// System context for Royal Class Events
const SYSTEM_CONTEXT = `You are the Royal Class Events AI Copilot. You are an expert at writing premium, high-end event descriptions and providing strategic advice for the Bangladesh market.

Your writing style is:
- Elegant and sophisticated
- Uses compelling, action-oriented language
- Highlights exclusivity and premium experience
- Appeals to affluent audiences in Bangladesh
- Includes emotional triggers and urgency

Currency is in BDT (৳). Always be concise but impactful.`;

/**
 * Helper to call Gemini API
 */
async function callGemini(prompt, apiKey) {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `${SYSTEM_CONTEXT}\n\n${prompt}`
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
            }
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Generate a premium event description
 */
export const generateDescription = action({
    args: {
        title: v.string(),
        category: v.optional(v.string()),
        location: v.optional(v.string()),
        date: v.optional(v.string()),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Get API key from environment
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const prompt = `Write a compelling, premium event description for:

Event Title: ${args.title}
Category: ${args.category || "General Event"}
Location: ${args.location || "Dhaka, Bangladesh"}
Date: ${args.date || "Upcoming"}

Requirements:
1. Write 2-3 paragraphs (150-200 words total)
2. Start with a captivating hook
3. Highlight what makes this event special
4. Include a call-to-action
5. Make it sound exclusive and premium
6. Do NOT use markdown formatting - plain text only

Respond with ONLY the description text, no titles or labels.`;

        try {
            const description = await callGemini(prompt, apiKey);
            return {
                success: true,
                content: description.trim(),
            };
        } catch (error) {
            console.error("Gemini API error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
});

/**
 * Analyze event for success prediction and pricing tips
 */
export const analyzeEvent = action({
    args: {
        title: v.string(),
        category: v.optional(v.string()),
        price: v.number(),
        capacity: v.number(),
        location: v.optional(v.string()),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const prompt = `Analyze this event and provide strategic advice:

Event: ${args.title}
Category: ${args.category || "General"}
Ticket Price: ৳${args.price}
Capacity: ${args.capacity} seats
Location: ${args.location || "Dhaka"}

Provide a brief analysis with:
1. SUCCESS SCORE: X/10 (based on title appeal, pricing for Bangladesh market, and category popularity)
2. PRICING VERDICT: Is ৳${args.price} too high, too low, or just right for this type of event in Bangladesh?
3. TOP 3 TIPS: Quick actionable suggestions to improve ticket sales

Keep response under 150 words. Be direct and actionable.`;

        try {
            const analysis = await callGemini(prompt, apiKey);
            return {
                success: true,
                content: analysis.trim(),
            };
        } catch (error) {
            console.error("Gemini API error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
});

/**
 * Generate catchy event title suggestions
 */
export const suggestTitles = action({
    args: {
        category: v.string(),
        keywords: v.optional(v.string()),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const prompt = `Generate 5 premium, catchy event title suggestions for:

Category: ${args.category}
Keywords/Theme: ${args.keywords || "luxury, exclusive"}

Requirements:
- Titles should sound exclusive and premium
- Appeal to affluent Bangladesh audience
- Be memorable and shareable
- Mix of English and Bangla-influenced titles is fine

Return ONLY a numbered list of 5 titles, nothing else.`;

        try {
            const titles = await callGemini(prompt, apiKey);
            return {
                success: true,
                content: titles.trim(),
            };
        } catch (error) {
            console.error("Gemini API error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
});
