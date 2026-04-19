"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/api";
import { Message } from "./Message";

export function ChatWindow({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl">
        {messages.map((m, i) => (
          <Message key={i} m={m} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 h-12 w-12 rounded-2xl gradient-bg shadow-[0_18px_40px_-12px_rgba(99,102,241,0.55)] flex items-center justify-center">
          <span className="text-white text-lg font-semibold">L</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          <span className="gradient-text">Start the conversation</span>
        </h2>
        <p className="mt-2 text-[14px] text-white/50 leading-relaxed">
          Ask anything. Replies stream token-by-token from the server, with
          history persisted to Postgres so the model remembers prior turns.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-2 text-left">
          <Hint>Explain async generators in Python.</Hint>
          <Hint>Write a SQL query for the top 5 customers by revenue.</Hint>
          <Hint>What is the difference between SSE and chunked transfer?</Hint>
        </div>
      </div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-lg px-3.5 py-2.5 text-[13px] text-white/65">
      {children}
    </div>
  );
}
