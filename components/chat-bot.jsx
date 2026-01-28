"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Sparkles, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am your Royal Assistant. How can I help you navigate our exclusive events today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I'm having trouble connecting to the concierge service right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className={cn(
            "h-16 w-16 rounded-full shadow-2xl transition-all duration-300",
            isOpen
              ? "bg-destructive hover:bg-destructive/90 rotate-90"
              : "bg-gradient-to-br from-[#D4AF37] to-[#8C7326] hover:from-[#8C7326] hover:to-[#8C7326] hover:scale-110 shadow-[0_0_30px_rgba(217,119,6,0.5)]"
          )}
          aria-label={isOpen ? "Close Assistant" : "Open Assistant"}
        >
          {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageSquare className="h-7 w-7 text-white" />}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-6 z-50 w-[90vw] md:w-[400px] h-[550px] max-h-[75vh] flex flex-col rounded-3xl border border-[#D4AF37]/30 bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-[#8C7326]/20 to-transparent">
              <div className="h-8 w-8 rounded-full bg-[#8C7326] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Royal Concierge</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Online
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex max-w-[80%] gap-2",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={cn(
                        "rounded-[1.4rem] px-4 py-3 text-sm shadow-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-[#8C7326] text-white rounded-tr-none"
                          : "bg-muted/50 text-foreground rounded-tl-none border border-border"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="flex max-w-[80%] gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted/50 rounded-[1.4rem] rounded-tl-none px-4 py-4 flex items-center gap-1.5 border border-border">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background/50">
              <div className="relative flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="h-12 pr-12 bg-background border-input focus-visible:ring-[#D4AF37] rounded-2xl"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 h-9 w-9 rounded-xl bg-[#8C7326] hover:bg-[#8C7326] text-white shadow-lg"
                  aria-label="Send message to concierge"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-muted-foreground">
                  Powered by Gemini AI • Royal Class Events
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

