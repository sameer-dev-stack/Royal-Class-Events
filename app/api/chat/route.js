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

    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (e) {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    const validHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{
            text: `You are the AI Concierge for "Royal Class Events", a premium event management platform. 
          Your name is "Royal Assistant".
          Your tone should be professional, polite, and helpful (like a high-end hotel concierge).
          Keep responses concise (max 2-3 sentences).` }],
        },
        {
          role: "model",
          parts: [{ text: "I am ready to assist our esteemed guests with the utmost professionalism." }],
        },
        ...validHistory
      ],
    });

    const lastMessage = messages[messages.length - 1];
    let text;
    try {
      const result = await chatSession.sendMessage(lastMessage.content);
      const response = await result.response;
      text = response.text();
    } catch (apiError) {
      console.error("Gemini Primary Model Error in Chat, attempting fallback:", apiError);

      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const fallbackSession = fallbackModel.startChat({
        history: [
          { role: "user", parts: [{ text: "System Instruction: You are the Royal Assistant for Royal Class Events. Be brief and polite." }] },
          { role: "model", parts: [{ text: "Understood." }] },
          ...validHistory
        ],
      });
      const result = await fallbackSession.sendMessage(lastMessage.content);
      const response = await result.response;
      text = response.text();
    }

    return NextResponse.json({ role: "assistant", content: text });
  } catch (error) {
    console.error("Error in chat API:", error);

    // DEV_FALLBACK: If Gemini quota is exceeded or other errors occur in development
    const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_AUTH === "true";
    if (isDev) {
      console.log("Using DEV_FALLBACK for Chat API");
      return NextResponse.json({
        role: "assistant",
        content: "I am currently performing some maintenance on my royal records, but I can still assist you! How can I help with your elite event planning today?"
      });
    }

    return NextResponse.json(
      { error: "Concierge service currently at capacity. Please try again shortly." },
      { status: 500 }
    );
  }
}
