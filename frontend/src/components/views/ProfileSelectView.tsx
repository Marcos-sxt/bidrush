import { Building2, Rocket, ShieldCheck, ArrowRight, Loader2, Fingerprint } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contracts";

const ProfileSelectView = ({ onSelect }: { onSelect: (profile: string) => void }) => {
  const { address } = useAccount();

  // Read Profile
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProfile",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const isRegistered = profile ? (profile as any).exists : false;

  // Write Registration
  const { data: hash, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Automatically refetch profile after registration is confirmed
  if (isConfirmed && !isRegistered) {
    refetchProfile();
  }

  const handleRegister = () => {
    // @ts-ignore
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "registerUser",
    });
  };

  const isRegistering = isPending || isConfirming;

  if (isLoadingProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto py-12 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto py-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 animate-glow-breathe">
           <Fingerprint className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-4xl font-display text-foreground font-semibold mb-4">
          Identidade <span className="italic text-gradient-purple">Desconhecida</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-12">
          Seu endereço ainda não possui um perfil na BidRush. 
          Registre-se gratuitamente on-chain para interagir com a rede.
        </p>

        <button 
          onClick={handleRegister}
          disabled={isRegistering}
          className="w-full max-w-sm py-4 px-6 rounded-2xl gradient-purple text-primary-foreground font-bold flex items-center justify-center gap-3 animate-glow-breathe hover:opacity-90 transition-all disabled:opacity-50 disabled:animate-none"
        >
          {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
          {isPending ? "Confirmando na Carteira..." : isConfirming ? "Minerando Transação..." : "Registrar Perfil On-chain"}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-5xl mx-auto py-12">
      
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-5xl font-display text-foreground font-semibold">
          Escolha seu <span className="italic text-gradient-purple">perfil</span>
        </h2>
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
          Selecione como você deseja interagir com a rede descentralizada de talentos BidRush.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
        
        {/* Client Card */}
        <button 
          onClick={() => onSelect('client')}
          className="group text-left glass rounded-3xl p-10 hover:bg-white/[0.04] transition-all border border-white/[0.05] hover:border-primary/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors border border-white/[0.05]">
              <Building2 className="w-7 h-7 text-white group-hover:text-primary transition-colors" />
            </div>
            
            <h3 className="text-3xl font-display font-semibold mb-4 text-foreground">
              Quero Contratar
            </h3>
            
            <p className="text-sm leading-relaxed text-muted-foreground mb-12">
              Publique projetos, gerencie equipes globais e liquide pagamentos via smart contracts com garantia total.
            </p>
            
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
              FLUXO DE CLIENTE
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Freelancer Card */}
        <button 
          onClick={() => onSelect('freelancer')}
          className="group text-left glass rounded-3xl p-10 hover:bg-white/[0.04] transition-all border border-white/[0.05] hover:border-success/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-8 group-hover:bg-success/20 transition-colors border border-white/[0.05]">
              <Rocket className="w-7 h-7 text-success group-hover:text-success transition-colors" />
            </div>
            
            <h3 className="text-3xl font-display font-semibold mb-4 text-foreground">
              Quero Trabalhar
            </h3>
            
            <p className="text-sm leading-relaxed text-muted-foreground mb-12">
              Encontre oportunidades em Web3, construa sua reputação on-chain e receba pagamentos instantâneos em stablecoins.
            </p>
            
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-success uppercase">
              FLUXO DE FREELANCER
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

      </div>

      {/* Trust Pill */}
      <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.03] border border-white/[0.05]">
        <ShieldCheck className="w-4 h-4 text-success" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
          TRANSAÇÕES SEGURADAS POR SMART CONTRACTS
        </span>
      </div>

    </div>
  );
};

export default ProfileSelectView;
