"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/api";
import { Message } from "./Message";

export function ChatWindow({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-10">Start the conversation…</p>
      )}
      {messages.map((m, i) => (
        <Message key={i} m={m} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
