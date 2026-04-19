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

  return (
    <div className="flex gap-2 p-2 border-t bg-white">
      <textarea
        aria-label="message"
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        placeholder="Type a message…"
        className="flex-1 resize-none rounded-lg border p-2 focus:outline-none focus:ring"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="rounded-lg bg-blue-600 px-4 text-white disabled:opacity-40"
      >
        Send
      </button>
    </div>
  );
}
