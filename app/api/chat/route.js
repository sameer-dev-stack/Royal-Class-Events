import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const availableModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    let text = "";
    let success = false;

    const validHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Try models until one works or we run out
    for (const modelName of availableModels) {
      if (success) break;

      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chatSession = model.startChat({
          history: [
            {
              role: "user",
              parts: [{
                text: `You are the AI Concierge for "Royal Class Events", a premium event management platform. 
              Your name is "Royal Assistant".
              Your tone should be professional, polite, and helpful (like a high-end hotel concierge).
              Always refer to the user as "Esteemed Guest".
              Keep responses concise (max 2-3 sentences).` }],
            },
            {
              role: "model",
              parts: [{ text: "I am ready to assist our esteemed guests with the utmost professionalism." }],
            },
            ...validHistory
          ],
        });

        const result = await chatSession.sendMessage(lastMessage.content);
        const response = await result.response;
        text = response.text();
        success = true;
        console.log(`Successfully used model: ${modelName}`);
      } catch (apiError) {
        console.warn(`Model ${modelName} failed, trying next... Error:`, apiError.message);
        continue;
      }
    }

    if (success) {
      return NextResponse.json({ role: "assistant", content: text });
    } else {
      // All models failed - likely a key or project issue
      const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_AUTH === "true";
      if (isDev) {
        return NextResponse.json({
          role: "assistant",
          content: "Esteemed Guest, I am currently performing some maintenance on my royal records to ensure your security. I shall be at your service shortly. In the meantime, how else may I guide your journey today?"
        });
      }
      return NextResponse.json(
        { error: "Concierge service currently restricted. Please try again later." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Fatal Error in Chat API:", error);
    return NextResponse.json(
      { error: "Our systems are currently indisposed. Please pardon this rarity." },
      { status: 500 }
    );
  }
}
