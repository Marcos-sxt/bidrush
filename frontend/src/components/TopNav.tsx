import { Search, Bell, Wifi, LogOut, AlertTriangle } from "lucide-react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { monadTestnet } from "viem/chains";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TopNav = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "0x1a...3b4c";

  const isOnTestnet = chain?.id === monadTestnet.id;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] w-full">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar contratos, freelancers..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Network pill - mostra rede real; se não for Testnet, botão para trocar */}
        {!isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            <span className="text-xs font-medium text-muted-foreground">Monad Testnet</span>
          </div>
        ) : isOnTestnet ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-green" />
            <span className="text-xs font-medium text-foreground">Monad Testnet</span>
          </div>
        ) : (
          <button
            onClick={() => switchChain({ chainId: monadTestnet.id })}
            disabled={isSwitching}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{chain?.name ?? "Outra rede"}</span>
            <span className="text-[10px] opacity-80">→ Testnet</span>
          </button>
        )}

        {/* Wallet Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors outline-none cursor-pointer">
              <Wifi className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">
                {formattedAddress}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="className=w-48 bg-surface-elevated border-white/[0.08]">
            <DropdownMenuItem 
              onClick={() => disconnect()}
              className="text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Deslogar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification */}
        <button className="relative p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
