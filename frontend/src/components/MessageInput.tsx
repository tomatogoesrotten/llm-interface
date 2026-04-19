"use client";
import { useState, KeyboardEvent } from "react";

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const empty = !value.trim();

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="mx-auto max-w-3xl">
        <div className="glass-strong rounded-2xl gradient-ring transition-shadow shadow-[0_20px_60px_-25px_rgba(0,0,0,0.7)]">
          <div className="flex items-end gap-2 p-2">
            <textarea
              aria-label="message"
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type a message…"
              className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[14.5px] leading-[1.5] text-white placeholder:text-white/30 focus:outline-none max-h-48"
            />
            <button
              onClick={submit}
              disabled={disabled || empty}
              aria-label="send"
              className={`shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all ${
                disabled || empty
                  ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                  : "gradient-bg shadow-[0_8px_24px_-8px_rgba(99,102,241,0.7)] hover:brightness-110 active:scale-[0.97]"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              <span className="sr-only">Send</span>
            </button>
          </div>
          <div className="px-4 pb-2 pt-0 flex items-center justify-between text-[11px] text-white/30">
            <span>
              <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04] font-mono text-[10px]">
                Enter
              </kbd>{" "}
              send
              <span className="mx-2 text-white/15">·</span>
              <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04] font-mono text-[10px]">
                Shift+Enter
              </kbd>{" "}
              newline
            </span>
            <span className="font-mono">{value.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
