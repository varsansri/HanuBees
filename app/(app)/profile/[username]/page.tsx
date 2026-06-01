import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio")
    .eq("username", username)
    .single();

  if (!profile) return { title: "Profile — Hanubees" };

  const title = `${profile.display_name} (@${username}) — Hanubees`;
  const description = profile.bio
    ? `${profile.bio} · Health & wellness community on Hanubees.`
    : `${profile.display_name} is sharing their health journey on Hanubees.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: "Hanubees", type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfileClient username={username} />;
}
