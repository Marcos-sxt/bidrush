import { Zap, ShieldCheck, Loader2 } from "lucide-react";
import { useConnect, useAccount, useReadContract } from "wagmi";
import { useEffect } from "react";
import { monadTestnet } from "viem/chains";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contracts";

/**
 * ConnectView - Bem-vindo ao Futuro
 * (Standalone page layout, doesn't need standard sidebar)
 */
const ConnectView = ({ onConnect }: { onConnect: () => void }) => {
  const { connect, connectors, isPending } = useConnect();
  const { isConnected } = useAccount();

  // Fetch total registered users from contract
  const { data: totalUsers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTotalUsers",
  });

  const oracleCount = totalUsers ? Number(totalUsers) : "---";



  const handleConnect = () => {
    if (isConnected) {
      onConnect();
      return;
    }

    const metaMask = connectors.find(c => c.id === 'metaMaskSDK' || c.id === 'metaMask' || c.name === 'MetaMask');
    const targetConnector = metaMask || connectors[0];

    connect(
      { connector: targetConnector, chainId: monadTestnet.id },
      {
        onSuccess: () => {
          onConnect();
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground">
            WEB3 PLATFORM
          </span>
        </div>

        {/* Card */}
        <div className="w-full glass-elevated rounded-3xl p-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-display italic text-foreground mb-3">
            Bem-vindo ao Futuro
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Conecte sua identidade digital para começar.
          </p>

          <button 
            onClick={handleConnect}
            disabled={isPending}
            className="w-full py-4 px-6 rounded-2xl gradient-purple text-primary-foreground font-bold flex items-center justify-center gap-3 animate-glow-breathe hover:opacity-90 transition-all mb-8 disabled:opacity-50 disabled:animate-none"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {isPending ? "Conectando..." : "Conectar Carteira"}
          </button>

          {/* Network Stats */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05] flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1.5">
                STATUS DE REDE
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-green" />
                <span className="text-xs font-medium text-foreground">Testnet</span>
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05] flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1.5">
                LATÊNCIA
              </span>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-foreground">12ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Oracles info */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            <div className="w-8 h-8 rounded-full border border-background bg-zinc-800" />
            <div className="w-8 h-8 rounded-full border border-background bg-zinc-700" />
            <div className="w-8 h-8 rounded-full border border-background bg-zinc-600" />
            <div className="w-8 h-8 rounded-full border border-background bg-white/[0.1] flex items-center justify-center text-[10px] text-white">
              +
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Junte-se a <span className="text-foreground font-semibold">{oracleCount} oráculos ativos</span>
          </p>
        </div>

      </div>
      
      {/* Footer Links */}
      <div className="absolute bottom-8 flex gap-6 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
        <a href="#" className="hover:text-primary transition-colors">Termos de uso</a>
        <a href="#" className="hover:text-primary transition-colors">Documentação</a>
        <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
      </div>
    </div>
  );
};

export default ConnectView;
