import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  let prompt;
  try {
    const body = await req.json();
    prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (e) {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    const systemPrompt = `You are an event planning assistant. Generate event details based on the user's description.

CRITICAL: Return ONLY valid JSON with properly escaped strings. No newlines in string values - use spaces instead.

Return this exact JSON structure:
{
  "title": "Event title (catchy and professional, single line)",
  "description": "Detailed event description in a single paragraph. Use spaces instead of line breaks. Make it 2-3 sentences describing what attendees will learn and experience.",
  "category": "One of: tech, music, sports, art, food, business, health, education, gaming, networking, outdoor, community",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free"
}

User's event idea: ${prompt}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- All string values must be on a single line with no line breaks
- Use spaces instead of \\n or line breaks in description
- Make title catchy and under 80 characters
- Description should be 2-3 sentences, informative, single paragraph
- suggestedTicketType should be either "free" or "paid"
`;

    let text;
    try {
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      text = response.text();
    } catch (apiError) {
      console.error("Gemini Primary Model Error, attempting fallback:", apiError);

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

    const eventData = JSON.parse(cleanedText);

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error generating event:", error);

    // DEV_FALLBACK
    const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_AUTH === "true";
    if (isDev) {
      console.log("Using DEV_FALLBACK for AI event generation");
      return NextResponse.json({
        title: "The Grand Royal Gala",
        description: "An exquisite evening of networking and celebration in a premium setting. Experience the height of luxury with curated experiences and distinguished guests.",
        category: "networking",
        suggestedCapacity: 150,
        suggestedTicketType: "paid"
      });
    }

    return NextResponse.json(
      { error: "AI service currently at capacity. Please try again shortly." },
      { status: 500 }
    );
  }
}
