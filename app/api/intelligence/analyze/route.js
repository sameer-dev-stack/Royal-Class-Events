import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    let category, capacity;
    try {
        const body = await req.json();
        category = body.category;
        capacity = body.capacity;
        const { location, start_date, ticket_type } = body;

        if (!category || !location) {
            return NextResponse.json(
                { error: "Insufficient event details for analysis" },
                { status: 400 }
            );
        }

        let model;
        try {
            model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        } catch (e) {
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }

        const systemPrompt = `You are an expert event success analyst and revenue strategist for "Royal Class Events", a premium event marketplace.
Analyze the following event details and provide a comprehensive prediction.

Event Details:
- Category: ${category}
- Location: ${location}
- Start Date: ${start_date}
- Capacity: ${capacity}
- Ticket Type: ${ticket_type}

CRITICAL: Return ONLY valid JSON.
The JSON must follow this exact structure:
{
  "demandScore": number (0-100),
  "confidence": number (0 to 1),
  "suggestedPrice": {
    "suggested": number,
    "min": number,
    "max": number,
    "reasoning": "Brief explanation of price tiers"
  },
  "revenueForecast": {
    "expected": number,
    "min": number,
    "max": number,
    "sales": number (expected ticket sales count)
  },
  "reasoning": "A 2-3 sentence strategic analysis of why this event will succeed or what to watch out for."
}

Rules:
- If ticket_type is "free", suggestedPrice and revenueForecast values should be 0.
- Consider seasonal trends for the given start date.
- Consider the premium nature of the "Royal Class" brand.
- Demand score should be realistic based on category and location.
`;

        let text;
        try {
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            text = response.text();
        } catch (apiError) {
            console.error("Gemini Primary Model Error, attempting fallback:", apiError);

            // Fallback to 1.5-flash if 2.0-flash fails
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await fallbackModel.generateContent(systemPrompt);
            const response = await result.response;
            text = response.text();
        }

        // Clean the response
        let cleanedText = text.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/```\n?/g, "");
        }

        const analysisData = JSON.parse(cleanedText);

        return NextResponse.json({
            success: true,
            data: analysisData
        });
    } catch (error) {
        console.error("AI Analysis Error:", error);

        // DEV_FALLBACK: If Gemini quota is exceeded or other errors occur in development
        const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_AUTH === "true";
        if (isDev) {
            console.log("Using DEV_FALLBACK for AI analysis due to error:", error.message);
            return NextResponse.json({
                success: true,
                data: {
                    demandScore: Math.floor(Math.random() * 30) + 65,
                    confidence: 0.82,
                    suggestedPrice: {
                        suggested: 2500,
                        min: 1500,
                        max: 5000,
                        reasoning: "Based on local market demand for " + (category || "event") + " events."
                    },
                    revenueForecast: {
                        expected: 2500 * ((capacity || 100) * 0.7),
                        min: 1500 * ((capacity || 100) * 0.5),
                        max: 5000 * ((capacity || 100) * 0.9),
                        sales: Math.floor((capacity || 100) * 0.7)
                    },
                    reasoning: "This event shows high potential due to its category and strategic location. The timing aligns well with recent trends in premium event hosting."
                }
            });
        }

        return NextResponse.json(
            { error: "AI service currently at capacity. Please try again shortly." },
            { status: 429 }
        );
    }
}
