"use client";
import { useChat } from "@/lib/useChat";
import { ChatWindow } from "@/components/ChatWindow";
import { MessageInput } from "@/components/MessageInput";

export default function Page() {
  const { messages, ready, sending, error, sendMessage } = useChat();
  return (
    <main className="h-screen max-w-2xl mx-auto flex flex-col border-x">
      <header className="p-4 border-b bg-white">
        <h1 className="text-lg font-semibold">Chat</h1>
      </header>
      {!ready ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
      ) : (
        <ChatWindow messages={messages} />
      )}
      {error && <div className="px-4 py-2 text-sm text-red-600">{error}</div>}
      <MessageInput onSend={sendMessage} disabled={!ready || sending} />
    </main>
  );
}
