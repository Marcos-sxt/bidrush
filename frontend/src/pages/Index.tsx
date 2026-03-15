import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import AppSidebar from "@/components/AppSidebar";
import TopNav from "@/components/TopNav";
import TestnetGuard from "@/components/TestnetGuard";
import Footer from "@/components/Footer";
import DashboardView from "@/components/views/DashboardView";
import JobView from "@/components/views/JobView";
import AlertasView from "@/components/views/AlertasView";
import DisputeView from "@/components/views/DisputeView";
import ConnectView from "@/components/views/ConnectView";
import ProfileSelectView from "@/components/views/ProfileSelectView";
import JobBoardView from "@/components/views/JobBoardView";
import UserView from "@/components/views/UserView";
import LeilaoFlashView from "@/components/views/LeilaoFlashView";
import type { LeilaoFlashAuctionData } from "@/components/views/LeilaoFlashView";

const Index = () => {
  const [activeView, setActiveView] = useState("connect");
  const [leilaoFlashAuction, setLeilaoFlashAuction] = useState<LeilaoFlashAuctionData | null>(null);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected && activeView !== "connect") {
      setActiveView("connect");
    }
  }, [isConnected, activeView]);

  const handleStartLeilaoFlash = (data: LeilaoFlashAuctionData) => {
    setLeilaoFlashAuction(data);
    setActiveView("leilao_flash");
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView onStartLeilaoFlash={handleStartLeilaoFlash} />;
      case "leilao_flash":
        return (
          <LeilaoFlashView
            auction={leilaoFlashAuction}
            onBack={() => {
              setLeilaoFlashAuction(null);
              setActiveView("dashboard");
            }}
          />
        );
      case "trabalhos":
        return <JobView />;
      case "alertas":
        return <AlertasView />;
      case "mensagens":
        return <DisputeView />;
      case "configuracoes":
        return <UserView />;
      case "profile":
        return <ProfileSelectView onSelect={(type) => setActiveView(type === "client" ? "dashboard" : "job_board")} />;
      case "job_board":
        return <JobBoardView />;
      case "user":
        return <UserView />;
      case "connect":
        return <ConnectView onConnect={() => setActiveView("profile")} />;
      default:
        return <DashboardView onStartLeilaoFlash={handleStartLeilaoFlash} />;
    }
  };

  if (activeView === "connect") {
    return <ConnectView onConnect={() => setActiveView("profile")} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNav />
        <TestnetGuard />
        <main className="flex-1 p-6 overflow-y-auto">{renderView()}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
