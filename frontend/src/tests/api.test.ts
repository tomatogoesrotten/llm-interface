import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamChat, createSession, getHistory } from "@/lib/api";

function mockStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}

beforeEach(() => { vi.restoreAllMocks(); });

describe("api", () => {
  it("createSession POSTs with credentials and returns id", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "abc" }), { status: 200 }) as any
    );
    const out = await createSession();
    expect(out).toEqual({ id: "abc" });
    const init = f.mock.calls[0][1];
    expect((init as RequestInit).credentials).toBe("include");
  });

  it("streamChat yields tokens as they arrive", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockStreamResponse(["Hel", "lo", " world"]) as any
    );
    const seen: string[] = [];
    await streamChat("hi", (t) => seen.push(t));
    expect(seen.join("")).toBe("Hello world");
  });

  it("getHistory returns messages array", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ role: "user", content: "hi", created_at: "x" }]), { status: 200 }) as any
    );
    const msgs = await getHistory();
    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe("user");
  });

  it("getHistory returns [] on 401/404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 401 }) as any);
    expect(await getHistory()).toEqual([]);
  });
});
