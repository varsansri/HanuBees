"use client";
// Anonymous, on-device persistence for the consumer hub (no login).
// Stores: a stable anon id, the list of agents you've chatted with, per-agent message
// history, and which agents you follow — all in localStorage.

export type ChatEntry = {
  slug: string; name: string;
  category?: string | null; city?: string | null; logo_url?: string | null;
  last?: string; at: number;
};
export type Msg = { role: "user" | "assistant"; content: string };

const CHATS = "hb_chats", FOLLOWS = "hb_follows", AID = "hb_aid";

function read<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export function anonId(): string {
  let id = read<string | null>(AID, null);
  if (!id) { id = "anon-" + Math.random().toString(36).slice(2) + Date.now().toString(36); write(AID, id); }
  return id;
}

export function getChats(): ChatEntry[] {
  return read<ChatEntry[]>(CHATS, []).sort((a, b) => b.at - a.at);
}
export function upsertChat(e: Partial<ChatEntry> & { slug: string; name: string }) {
  const list = read<ChatEntry[]>(CHATS, []);
  const i = list.findIndex((c) => c.slug === e.slug);
  const merged = { ...(i >= 0 ? list[i] : {}), ...e, at: Date.now() } as ChatEntry;
  if (i >= 0) list[i] = merged; else list.push(merged);
  write(CHATS, list);
}

export function getMsgs(slug: string): Msg[] { return read<Msg[]>("hb_msgs_" + slug, []); }
export function setMsgs(slug: string, msgs: Msg[]) { write("hb_msgs_" + slug, msgs.slice(-60)); }

export function getFollows(): string[] { return read<string[]>(FOLLOWS, []); }
export function isFollowing(slug: string): boolean { return getFollows().includes(slug); }
export function toggleFollow(slug: string): boolean {
  const f = getFollows(); const i = f.indexOf(slug);
  if (i >= 0) f.splice(i, 1); else f.push(slug);
  write(FOLLOWS, f); return f.includes(slug);
}
