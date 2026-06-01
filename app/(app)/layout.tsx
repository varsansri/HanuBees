import BottomNav from "@/components/ui/BottomNav";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {children}
      <BottomNav />
    </div>
  );
}
