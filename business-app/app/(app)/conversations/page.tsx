export const dynamic = "force-dynamic";

export default function Conversations() {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Conversations</h1>
      <p style={{ color: "var(--fg2)" }}>See what customers ask your agent and step in when you want.</p>
      <div className="card" style={{ marginTop: 16, color: "var(--fg2)" }}>Coming next — your agent ↔ customer chats, with the option to intervene.</div>
    </div>
  );
}
