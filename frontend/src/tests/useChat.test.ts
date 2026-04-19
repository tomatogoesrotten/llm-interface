import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "@/lib/useChat";
import * as api from "@/lib/api";

beforeEach(() => { vi.restoreAllMocks(); });

describe("useChat", () => {
  it("loads history on mount", async () => {
    vi.spyOn(api, "createSession").mockResolvedValue({ id: "s" });
    vi.spyOn(api, "getHistory").mockResolvedValue([
      { role: "user", content: "prev" },
      { role: "assistant", content: "reply" },
    ] as any);
    const { result } = renderHook(() => useChat());
    await waitFor(() => expect(result.current.messages).toHaveLength(2));
  });

  it("sendMessage appends user then streams assistant tokens", async () => {
    vi.spyOn(api, "createSession").mockResolvedValue({ id: "s" });
    vi.spyOn(api, "getHistory").mockResolvedValue([]);
    vi.spyOn(api, "streamChat").mockImplementation(async (_c, onToken) => {
      onToken("Hel"); onToken("lo");
    });

    const { result } = renderHook(() => useChat());
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => { await result.current.sendMessage("hi"); });

    expect(result.current.messages.map(m => [m.role, m.content])).toEqual([
      ["user", "hi"],
      ["assistant", "Hello"],
    ]);
  });
});
