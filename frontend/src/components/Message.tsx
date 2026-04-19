import { ChatMessage } from "@/lib/api";

export function Message({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  const empty = !m.content;
  return (
    <div
      data-testid={`msg-${m.role}`}
      className="group flex gap-4 px-5 py-5 border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors"
    >
      <Avatar isUser={isUser} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-[13px] font-semibold tracking-tight ${isUser ? "text-white" : "gradient-text"}`}>
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/30 font-medium">
            {isUser ? "user" : "model"}
          </span>
        </div>
        <div className="text-[14.5px] leading-[1.65] text-white/85 whitespace-pre-wrap break-words">
          {empty ? (
            isUser ? null : <StreamingPlaceholder />
          ) : (
            <>
              {m.content}
              {!isUser && <span className="caret" aria-hidden />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({ isUser }: { isUser: boolean }) {
  if (isUser) {
    return (
      <div className="shrink-0 h-8 w-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-[12px] font-semibold text-white/80">
        U
      </div>
    );
  }
  return (
    <div className="shrink-0 h-8 w-8 rounded-lg gradient-bg shadow-[0_8px_24px_-10px_rgba(168,85,247,0.6)] flex items-center justify-center text-[12px] font-semibold text-white">
      A
    </div>
  );
}

function StreamingPlaceholder() {
  return (
    <span className="inline-flex items-center gap-1 text-white/40">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 dot-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 dot-pulse" style={{ animationDelay: "0.15s" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 dot-pulse" style={{ animationDelay: "0.3s" }} />
    </span>
  );
}
