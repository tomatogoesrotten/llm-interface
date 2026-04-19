const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

export async function createSession(): Promise<{ id: string }> {
  const r = await fetch(`${BASE}/sessions`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) throw new Error(`createSession failed: ${r.status}`);
  return r.json();
}

export async function getHistory(): Promise<ChatMessage[]> {
  const r = await fetch(`${BASE}/sessions/me/messages`, {
    credentials: "include",
  });
  if (r.status === 401 || r.status === 404) return [];
  if (!r.ok) throw new Error(`getHistory failed: ${r.status}`);
  return r.json();
}

export async function streamChat(
  content: string,
  onToken: (t: string) => void,
): Promise<void> {
  const r = await fetch(`${BASE}/chat/stream`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!r.ok || !r.body) throw new Error(`streamChat failed: ${r.status}`);
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) onToken(decoder.decode(value, { stream: true }));
  }
  const tail = decoder.decode();
  if (tail) onToken(tail);
}
