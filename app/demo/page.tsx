import type { Metadata } from "next";
import DemoChat from "./DemoChat";

export const metadata: Metadata = {
  title: "Hanubees — your business, as an AI agent",
  description: "Chat with a live Hanubees agent. This is the exact product we build for businesses: an AI that answers your customers instantly, 24/7, from your own info.",
  openGraph: {
    title: "Hanubees — your business, as an AI agent",
    description: "Chat with a live Hanubees agent — the product we build for businesses.",
    images: ["/bee.png"],
  },
};

export default function DemoPage() {
  return <DemoChat />;
}
