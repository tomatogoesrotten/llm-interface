import { ChatMessage } from "@/lib/api";

export function Message({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div
        data-testid={`msg-${m.role}`}
        className={`max-w-[75%] rounded-2xl px-4 py-2 whitespace-pre-wrap
          ${isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}`}
      >
        {m.content || (isUser ? "" : "…")}
      </div>
    </div>
  );
}
