import { ChatMessage } from "@/lib/api";

export function Sidebar({
  messages,
  ready,
  sending,
}: {
  messages: ChatMessage[];
  ready: boolean;
  sending: boolean;
}) {
  const userCount = messages.filter((m) => m.role === "user").length;
  const assistantCount = messages.filter((m) => m.role === "assistant").length;
  const status = !ready ? "connecting" : sending ? "streaming" : "idle";
  const statusColor =
    status === "streaming"
      ? "bg-violet-400"
      : status === "idle"
      ? "bg-emerald-400"
      : "bg-amber-400";

  return (
    <aside className="hidden md:flex md:w-72 lg:w-80 shrink-0 flex-col glass border-r border-white/[0.06]">
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg gradient-bg shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] flex items-center justify-center">
            <span className="text-white font-semibold text-sm">L</span>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">
              Lumen
            </div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-medium">
              LLM Interface
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-white/[0.06]">
        <SectionLabel>Session</SectionLabel>
        <Row label="Status">
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${statusColor} ${status === "streaming" ? "dot-pulse" : ""}`} />
            <span className="capitalize">{status}</span>
          </span>
        </Row>
        <Row label="Model">
          <span className="font-mono text-[12px]">gpt-4o-mini</span>
        </Row>
        <Row label="Transport">
          <span className="font-mono text-[12px]">text/plain</span>
        </Row>
      </div>

      <div className="px-5 py-4 border-b border-white/[0.06]">
        <SectionLabel>Activity</SectionLabel>
        <Row label="Turns">
          <span className="font-mono">{userCount}</span>
        </Row>
        <Row label="Replies">
          <span className="font-mono">{assistantCount}</span>
        </Row>
      </div>

      <div className="mt-auto px-5 py-4 text-[11px] text-white/35 leading-relaxed">
        <div>
          Session is stored in an{" "}
          <span className="text-white/60 font-medium">HttpOnly</span> cookie.
        </div>
        <div className="mt-1">
          History rebuilt from Postgres on every request.
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.18em] text-white/35 font-semibold mb-2.5">
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 text-[13px]">
      <span className="text-white/50">{label}</span>
      <span className="text-white/85">{children}</span>
    </div>
  );
}
