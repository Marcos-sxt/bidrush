import { Clock, Users, Building, ShieldCheck, TrendingUp } from "lucide-react";

const JobBoardView = () => {
  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-display italic text-foreground leading-tight">
            Job Board
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Descubra as próximas missões de elite no ecossistema.
          </p>
        </div>

        {/* Filters */}
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
            Padrão
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.08] text-foreground shadow-sm transition-colors">
            Leilões Flash
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
            Arquivados
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        
        {/* Flash Auction Card */}
        <div className="glass-elevated rounded-2xl p-6 border border-success/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent opacity-50" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex gap-4 items-start flex-1">
              <div className="w-12 h-12 rounded-xl bg-teal-900/30 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground">Smart Contract Security Audit</h3>
                  <span className="text-xs text-muted-foreground">• 2h ago</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Auditoria crítica para um novo protocolo de Lending RWA. Requer experiência comprovada em vulnerabilidades de reentrância e lógica de oráculos.
                </p>
                <div className="flex items-center gap-6 mt-4 !mt-6">
                  <div className="flex items-center gap-2 text-success">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-bold font-mono">00:42:15 restantes</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">14 Lances ativos</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Empresa Verificada</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 min-w-[200px] shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold tracking-widest text-success uppercase mb-1">
                  Lance Atual (Flash Auction)
                </span>
                <span className="text-3xl font-bold text-success font-mono">4.20 ETH</span>
                <span className="text-xs text-muted-foreground mt-1">≈ $9,450.00 USDC</span>
              </div>
              <button className="w-full mt-2 py-3 px-6 rounded-xl bg-success text-success-foreground font-bold uppercase tracking-wider text-xs hover:bg-success/90 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]">
                Lançar Lance
              </button>
            </div>
          </div>
        </div>

        {/* Standard Job 1 */}
        <div className="glass rounded-2xl p-6 hover:bg-white/[0.03] transition-colors border border-white/[0.05]">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex gap-4 items-start flex-1">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-display text-muted-foreground">N</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground">Next.js DApp Frontend Dev</h3>
                  <span className="text-xs text-muted-foreground">• 5h ago</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Implementação de interface para DEX agregadora. Uso obrigatório de Tailwind, Wagmi e Viem. Design Figma já finalizado.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-white/[0.05] text-xs text-muted-foreground border border-white/[0.05]">React</span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.05] text-xs text-muted-foreground border border-white/[0.05]">Ethers.js</span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.05] text-xs text-muted-foreground border border-white/[0.05]">Tailwind CSS</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 min-w-[200px] shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">
                  Recompensa
                </span>
                <span className="text-3xl font-bold text-gradient-purple font-mono">2,500 USDC</span>
                <span className="text-xs text-muted-foreground mt-1">Pagamento Milestone</span>
              </div>
              <button className="w-full mt-2 py-3 px-6 rounded-xl bg-white/[0.08] text-foreground font-bold uppercase tracking-wider text-xs hover:bg-white/[0.12] transition-colors border border-white/[0.05]">
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>

        {/* Standard Job 2 */}
        <div className="glass rounded-2xl p-6 hover:bg-white/[0.03] transition-colors border border-white/[0.05]">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex gap-4 items-start flex-1">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-display text-muted-foreground">W</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground">Content Writing: Web3 Native</h3>
                  <span className="text-xs text-muted-foreground">• 12h ago</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Produção de 4 artigos técnicos sobre Layer 2 Scaling e Account Abstraction para blog institucional.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-white/[0.05] text-xs text-muted-foreground border border-white/[0.05]">Copywriting</span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.05] text-xs text-muted-foreground border border-white/[0.05]">Technical</span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.05] text-xs text-muted-foreground border border-white/[0.05]">Marketing</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 min-w-[200px] shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">
                  Recompensa
                </span>
                <span className="text-3xl font-bold text-gradient-purple font-mono">800 USDC</span>
                <span className="text-xs text-muted-foreground mt-1">Fixo por entrega</span>
              </div>
              <button className="w-full mt-2 py-3 px-6 rounded-xl bg-white/[0.08] text-foreground font-bold uppercase tracking-wider text-xs hover:bg-white/[0.12] transition-colors border border-white/[0.05]">
                Ver Detalhes
              </button>
            </div>
          </div>
          
          {/* Bottom Stats Row for Job 2 */}
          <div className="mt-8 pt-4 border-t border-white/[0.05] flex items-center justify-between">
            <div className="flex -space-x-2 items-center">
              <div className="w-6 h-6 rounded-full bg-zinc-600 border border-background"></div>
              <div className="w-6 h-6 rounded-full bg-zinc-500 border border-background"></div>
              <div className="w-6 h-6 rounded-full bg-zinc-400 border border-background"></div>
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] text-primary border border-background font-bold tracking-wider">+8</div>
              <div className="ml-4 flex flex-col">
                 <span className="text-[10px] font-bold tracking-widest text-foreground uppercase">Active Workers</span>
                 <span className="text-xs text-muted-foreground">12 Online Now</span>
              </div>
            </div>
            
            <div className="w-px h-8 bg-white/[0.05]"></div>
            
            <div className="flex flex-col text-center">
              <span className="text-[10px] font-bold tracking-widest text-foreground uppercase">Total Volume</span>
              <span className="text-sm font-bold text-success mt-0.5">142.8 ETH</span>
            </div>
            
            <div className="w-px h-8 bg-white/[0.05]"></div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold tracking-widest text-foreground uppercase">Match Rate</span>
                <span className="text-sm font-bold text-foreground mt-0.5">98.4%</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobBoardView;
