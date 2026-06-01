import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PostDetail from "./PostDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("content, post_type, profiles(username, display_name)")
    .eq("id", id)
    .single();

  if (!post) return { title: "Post — Hanubees" };

  const profiles = post.profiles as unknown as { username: string; display_name: string };
  const title = `${profiles?.display_name || "Someone"} on Hanubees`;
  const description = (post.content as string).slice(0, 160);
  const ogImage = `https://hanubees.com/api/og?id=${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      siteName: "Hanubees",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
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

  const profiles = post.profiles as unknown as { username: string; display_name: string };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    "headline": `${profiles?.display_name || "Someone"} on Hanubees`,
    "description": (post.content as string).slice(0, 200),
    "datePublished": post.created_at,
    "url": `https://hanubees.com/post/${post.id}`,
    "author": {
      "@type": "Person",
      "name": profiles?.display_name || "Anonymous",
      "url": `https://hanubees.com/profile/${profiles?.username}`,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hanubees",
      "url": "https://hanubees.com",
      "logo": { "@type": "ImageObject", "url": "https://hanubees.com/bee.png" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetail post={post} comments={comments || []} />
    </>
  );
}
