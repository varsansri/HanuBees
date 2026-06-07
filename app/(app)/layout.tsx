import BottomNav from "@/components/ui/BottomNav";
import BeeProvider from "@/components/bee/BeeProvider";
import BeeBall from "@/components/bee/BeeBall";
import ContributeProvider from "@/components/consumer/ContributeProvider";
import ContributeSheet from "@/components/consumer/ContributeSheet";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BeeProvider>
      <ContributeProvider>
        <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
          {children}
          <BeeBall />
          <BottomNav />
          <ContributeSheet />
        </div>
      </ContributeProvider>
    </BeeProvider>
  );
}
