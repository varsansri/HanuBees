import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PostDetail from "./PostDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("content, post_type, profiles(username)")
    .eq("id", id)
    .single();

  if (!post) return { title: "Post — Hanubees" };
  return {
    title: `${(post.content as string).slice(0, 60)}... — Hanubees`,
    description: (post.content as string).slice(0, 160),
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(username, display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  // Increment views
  await supabase.from("posts").update({ views: (post.views || 0) + 1 }).eq("id", id);

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(username, display_name)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  return <PostDetail post={post} comments={comments || []} />;
}
