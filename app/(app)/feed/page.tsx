import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/feed/PostCard";
import Link from "next/link";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select(`*, profiles(username, display_name, avatar_url)`)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 0" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5" style={{ paddingTop: 8 }}>
        <h1 className="font-brand text-2xl text-amber">Hanubees</h1>
        <div className="flex gap-2">
          {["Feed", "Top", "New"].map((tab) => (
            <button key={tab} className="btn-ghost"
              style={{ padding: "6px 14px", fontSize: 12 }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="card text-center" style={{ padding: 48 }}>
            <p style={{ color: "var(--fg2)", marginBottom: 16, fontSize: 15 }}>
              No posts yet. Be the first to share your health journey.
            </p>
            <Link href="/post/new" className="btn-primary"
              style={{ display: "inline-block", width: "auto", padding: "10px 24px" }}>
              Share your story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
