import BottomNav from "@/components/ui/BottomNav";
import BeeProvider from "@/components/bee/BeeProvider";
import BeeBall from "@/components/bee/BeeBall";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BeeProvider>
      <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
        {children}
        <BeeBall />
        <BottomNav />
      </div>
    </BeeProvider>
  );
}
