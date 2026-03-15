import { User, Wallet, Star, Briefcase, DollarSign, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contracts";

const UserView = () => {
  const { address } = useAccount();

  // 1. Fetch native MON balance
  const { data: balanceData } = useBalance({
    address,
  });

  // 2. Fetch BidRush Profile Stats
  const { data: profile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProfile",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const p = profile as any;
  const isRegistered = p?.exists;

  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Não conectado";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display text-foreground font-semibold flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          Perfil de Usuário
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="font-mono bg-white/[0.04] px-2 py-1 rounded-md text-xs">{formattedAddress}</span>
          {isRegistered ? (
            <span className="text-success text-xs font-bold tracking-wider uppercase border border-success/30 bg-success/10 px-2 py-1 rounded-md">
              On-chain
            </span>
          ) : (
            <span className="text-destructive text-xs font-bold tracking-wider uppercase border border-destructive/30 bg-destructive/10 px-2 py-1 rounded-md">
              Não Registrado
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wallet Balance Card */}
        <div className="glass rounded-3xl p-6 border border-white/[0.05] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Carteira</h3>
          </div>
          
          <div className="space-y-1">
            <p className="text-4xl font-display font-medium text-foreground">
              {balanceData ? Number(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4) : "0.0000"} <span className="text-lg text-primary">{balanceData?.symbol || "MON"}</span>
            </p>
            <p className="text-xs text-muted-foreground">Saldo disponível na Monad Testnet</p>
          </div>
        </div>

        {/* Rep & Jobs Card */}
        <div className="glass rounded-3xl p-6 border border-white/[0.05] lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" />
            Reputação BidRush
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Quality Score</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-foreground">{p ? p.qualityScore.toString() : "0"}</span>
                <span className="text-xs text-muted-foreground pb-1">/ 100</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Trabalhos Concluídos</span>
              <div className="flex items-end gap-2 text-primary">
                <Briefcase className="w-4 h-4 mb-1" />
                <span className="text-2xl font-bold">{p ? p.completedJobs.toString() : "0"}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Disputas Ganhas</span>
              <div className="flex items-end gap-2 text-success">
                <ShieldAlert className="w-4 h-4 mb-1" />
                <span className="text-2xl font-bold">{p ? p.disputesWon.toString() : "0"}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Disputas Perdidas</span>
              <div className="flex items-end gap-2 text-destructive">
                <ShieldAlert className="w-4 h-4 mb-1" />
                <span className="text-2xl font-bold">{p ? p.disputesLost.toString() : "0"}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Financial History */}
      <div className="glass rounded-3xl p-6 border border-white/[0.05]">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-success" />
          Volume Financeiro
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors">
             <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
               <ArrowDownRight className="w-5 h-5 text-success" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Total Recebido</p>
               <p className="text-xl font-medium text-foreground">
                 {p ? (Number(p.totalEarned) / 1e18).toFixed(4) : "0.0000"} <span className="text-sm text-muted-foreground text-success">MON</span>
               </p>
             </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors">
             <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
               <ArrowUpRight className="w-5 h-5 text-destructive" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Total Gasto</p>
               <p className="text-xl font-medium text-foreground">
                 {p ? (Number(p.totalSpent) / 1e18).toFixed(4) : "0.0000"} <span className="text-sm text-muted-foreground text-destructive">MON</span>
               </p>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserView;
