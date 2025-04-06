"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { motion } from "framer-motion";
import { getChats } from "@/server/actions";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

// New component to render bot messages with structure
const BotMessageContent = ({ text }: { text: string }) => {
  const parts = text.split('\n\n');
  const title = parts[0];
  const paragraphs = parts.slice(1);

  // Basic check if there's content
  if (!text.trim()) {
    return null;
  }

  return (
    <div className="space-y-2">
      {title && <h4 className="font-semibold">{title}</h4>} 
      {paragraphs.length > 0 ? (
        paragraphs.map((para, index) => (
          <p key={index} className="text-sm">
            {para}
          </p>
        ))
      ) : ( 
        // If no paragraphs split by \n\n, render the original text (minus title if split worked)
        <p className="text-sm">
          {paragraphs.length === 0 && parts.length === 1 ? text : paragraphs.join('\n\n')}
        </p>
      )}
    </div>
  );
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async() => {
        const chatHistory = await getChats();
        if (chatHistory) {
          const formattedMessages = chatHistory.flatMap((entry, index) => [
            { id: index * 2, text: entry.question, sender: "user" as const },
            { id: index * 2 + 1, text: entry.answer, sender: "bot" as const },
          ]);
          setMessages(formattedMessages);
        }
    }
    fetch()
  } , [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: "user",
    };

    const botMsg: Message = {
      id: Date.now() + 1,
      text: "Got it! Let me think... 🤔",
      sender: "bot",
    };

    setMessages((prev) => [...prev, userMsg]);

    setInput("");

    // Simulate bot response after delay
    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  return (
    <div className="flex flex-col h-screen w-full mx-auto border-x">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-[75%] ${
                msg.sender === "user"
                  ? "bg-blue-600 text-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {/* Use BotMessageContent for bot, simple text for user */}
              {msg.sender === "bot" ? (
                <BotMessageContent text={msg.text} />
              ) : (
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar pinned to bottom */}
      <div className="border-t px-4 py-3 bg-background flex gap-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={!input.trim()}>
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
