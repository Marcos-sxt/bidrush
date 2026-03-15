import { AlertTriangle, Zap } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import { monadTestnet } from "viem/chains";

/**
 * Banner exibido quando a carteira está em rede diferente da Monad Testnet.
 * O BidRush usa apenas Testnet; transações na Mainnet usariam MON real.
 */
const TestnetGuard = () => {
  const { isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongChain = isConnected && chain?.id !== monadTestnet.id;
  if (!isWrongChain) return null;

  const handleSwitch = () => {
    switchChain({ chainId: monadTestnet.id });
  };

  return (
    <div className="sticky top-0 z-50 w-full px-4 py-3 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-sm font-medium text-amber-200">
          Sua carteira está na rede <strong>{chain?.name ?? "outra"}</strong>. O BidRush usa apenas{" "}
          <strong>Monad Testnet</strong> — assim seu saldo da testnet é usado e você não gasta MON real.
        </p>
      </div>
      <button
        onClick={handleSwitch}
        disabled={isSwitching}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all shrink-0"
      >
        <Zap className="w-4 h-4" />
        {isSwitching ? "Trocando..." : "Trocar para Monad Testnet"}
      </button>
    </div>
  );
};

export default TestnetGuard;
