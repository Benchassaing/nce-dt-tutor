"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Send,
  Mic,
  Volume2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
  Bot,
  User,
  ChevronDown,
} from "lucide-react";

interface TutorChatProps {
  topicId: string;
  step: string;
  initialContext?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  step?: string;
}

export function TutorChat({ topicId, step, initialContext }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Can you explain this more simply?",
    "Give me a real-life example from Mauritius",
    "What are the key terms I should remember?",
    "How does this relate to the NCE exam?",
    "I don't understand this part",
  ];

  useEffect(() => {
    if (initialContext && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello! I'm your Design & Technology tutor. Today we're learning about **${step}**. 

${initialContext}

Feel free to ask me anything! You can:
- Ask for simpler explanations
- Request Mauritius-specific examples
- Get help with key terms
- Ask how this appears in exams

What would you like to know more about?`,
          timestamp: new Date(),
          step,
        },
      ]);
    }
    scrollToBottom();
  }, [initialContext, step, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
      step,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Simulate AI response - in production, call API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const responses = [
        `Great question! Let me explain that in a simpler way... 🌟\n\nIn Mauritius, this concept applies directly to...`,
        `That's a common point of confusion! Think of it like this...\n\nFor example, in Port Louis, we see...`,
        `Excellent! You're thinking like a designer. Here's how it connects to your NCE exam...\n\nPast papers often ask...`,
      ];
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        step,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Tutor error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    handleSend(new Event("submit"));
  };

  const handleFeedback = (messageId: string, positive: boolean) => {
    // Track feedback for RLHF
    console.log("Feedback:", messageId, positive);
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-0">
        <div className="h-[400px] flex flex-col">
          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {msg.role === "user" ? (
                      <AvatarFallback>U</AvatarFallback>
                    ) : (
                      <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    )}
                  >
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">{msg.content}</div>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-green-600"
                          onClick={() => handleFeedback(msg.id, true)}
                          aria-label="Helpful"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                          onClick={() => handleFeedback(msg.id, false)}
                          aria-label="Not helpful"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                          aria-label="Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-primary"
                          aria-label="Read aloud"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 animate-pulse">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-2xl px-4 py-2.5 rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {showSuggestions && messages.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3"
                    onClick={() => handleSuggestion(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-primary"
                aria-label="Voice input"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about this topic..."
                className="flex-1"
                disabled={isLoading}
                aria-label="Chat input"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}