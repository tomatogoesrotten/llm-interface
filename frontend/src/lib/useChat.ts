"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createSession, getHistory, streamChat, ChatMessage } from "./api";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      try {
        let hist = await getHistory();
        if (hist.length === 0) {
          await createSession();
          hist = await getHistory();
        }
        setMessages(hist);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true); setError(null);
    setMessages(m => [...m, { role: "user", content }, { role: "assistant", content: "" }]);
    try {
      await streamChat(content, (tok) => {
        setMessages(m => {
          const copy = m.slice();
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + tok };
          return copy;
        });
      });
    } catch (e: any) {
      setError(e?.message ?? "error");
    } finally {
      setSending(false);
    }
  }, [sending]);

  return { messages, ready, sending, error, sendMessage };
}
