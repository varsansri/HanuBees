"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InsightsSection from "./InsightsSection";

const YELLOW = "#ffbe00";
const MUTED  = "#a9a9a7";

interface JournalEntry {
  id: string; name: string; category: string;
  dose_amount: string; dose_unit: string; dose_time: string;
}

export default function InsightsPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("dose_time", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <p style={{ color: MUTED }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
        <Link href="/journal" style={{ color: MUTED, display: "flex", textDecoration: "none", alignItems: "center", gap: 4, fontSize: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Journal
        </Link>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif" }}>
          Insights
        </h2>
      </div>
      <div style={{ padding: "16px" }}>
        <InsightsSection entries={entries} />
      </div>
    </div>
  );
}
