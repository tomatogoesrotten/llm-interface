"use client";
import { useChat } from "@/lib/useChat";
import { ChatWindow } from "@/components/ChatWindow";
import { MessageInput } from "@/components/MessageInput";
import { Sidebar } from "@/components/Sidebar";

export default function Page() {
  const { messages, ready, sending, error, sendMessage } = useChat();
  return (
    <main className="h-screen w-full flex">
      <Sidebar messages={messages} ready={ready} sending={sending} />
      <section className="flex-1 flex flex-col min-w-0">
        <header className="glass border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden h-7 w-7 rounded-md gradient-bg flex items-center justify-center text-white text-[12px] font-semibold">
              L
            </div>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold tracking-tight">
                New Chat
              </div>
              <div className="text-[11px] text-white/40">
                Streaming · single session
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/40">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                !ready
                  ? "bg-amber-400"
                  : sending
                  ? "bg-violet-400 dot-pulse"
                  : "bg-emerald-400"
              }`}
            />
            <span>
              {!ready ? "Connecting" : sending ? "Streaming" : "Ready"}
            </span>
          </div>
        </header>

        {!ready ? (
          <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 dot-pulse" />
              <span>Loading session…</span>
            </div>
          </div>
        ) : (
          <ChatWindow messages={messages} />
        )}

        {error && (
          <div className="mx-auto w-full max-w-3xl px-4">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
              {error}
            </div>
          </div>
        )}

        <MessageInput onSend={sendMessage} disabled={!ready || sending} />
      </section>
    </main>
  );
}
