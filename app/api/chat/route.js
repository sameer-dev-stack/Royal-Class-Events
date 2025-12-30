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

    // DEV_FALLBACK: If no API key, return mock response in development
    if (!process.env.GEMINI_API_KEY) {
      const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_AUTH === "true";
      if (isDev) {
        console.log("Using DEV_FALLBACK for chat API");
        return NextResponse.json({
          role: "assistant",
          content: "Welcome to Royal Class Events! I am your AI concierge. Currently, I am operating in development mode with mock responses. How can I assist you with our elite experiences today?"
        });
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct the chat history with a system instruction
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{
            text: `You are the AI Concierge for "Royal Class Events", a premium event management platform. 
          
          Your name is "Royal Assistant".
          Your tone should be professional, polite, and helpful (like a high-end hotel concierge).

          Key Platform Features to know:
          - We host exclusive events (Galas, Tech Meetups, VIP Parties).
          - Organizers can use AI to generate event details.
          - We have a "Demand Prediction" feature for organizers.
          - Users can buy tickets (Free/Paid) and get QR codes.
          - We have an "Explore" page to find events.

          If asked about technical support, direct them to contact support@royalclassevents.com.
          If asked to create an event, guide them to the "Create Event" page.
          Do not make up specific event details unless they are in the context of the conversation.
          
          Keep responses concise (under 3 sentences when possible) unless explaining a complex feature.` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am the Royal Assistant, ready to assist our esteemed guests and organizers with the utmost professionalism." }],
        },
        // ... previous messages would ideally be mapped here, but for this simple version we'll just append the last user message to the new prompt or rely on the client sending full context if we were building a full history engine. 
        // For a simple stateless endpoint, we often just pass the last prompt with context. 
        // However, Gemini's `startChat` maintains history if we keep the object alive. Since this is a serverless function, we need to reconstruct history from the request if we want multi-turn.
      ],
    });

    // For this implementation, we will feed the conversation history from the client into the chat session
    // filtering out the system message we just added manually to avoid duplication if the client sends it,
    // though typically the client just sends user/model pairs.

    // Valid roles for Gemini are 'user' and 'model'.
    const validHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start a new chat with the history provided by the client
    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `System Instruction: You are the AI Concierge for "Royal Class Events". Be helpful, polite, and brief.` }],
        },
        {
          role: "model",
          parts: [{ text: "I am ready to assist." }],
        },
        ...validHistory
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chatSession.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ role: "assistant", content: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
