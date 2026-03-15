import { Zap, ArrowRight, Activity, Users, TrendingUp, Clock, Sparkles, CheckCircle2 } from "lucide-react";

const suggestions = [
  {
    title: "Smart Contract Audit",
    budget: "4,500",
    budgetLabel: "USDC",
    type: "PREÇO FIXO",
    tags: ["Rust", "Security", "Solana"],
    match: "98% Match de Perfil",
    icon: "check",
    desc: "Revisão abrangente de segurança para protocolo de empréstimo cross-chain em Solana.",
  },
  {
    title: "DeFi UI Design",
    budget: "2,800",
    budgetLabel: "USDC",
    type: "BUDGET EST.",
    tags: ["Figma", "Web3 UX", "Motion"],
    match: "Recomendado com base em seu portfólio",
    icon: "sparkles",
    desc: "Redesign completo da dashboard de governança para protocolo Blue Chip.",
  },
  {
    title: "EVM Bridge Integration",
    budget: "6,200",
    budgetLabel: "USDC",
    type: "CONTRATO MENSAL",
    tags: ["Solidity", "EVM", "Hardhat"],
    match: "92% Match de Perfil",
    icon: "check",
    desc: "Integrar ponte LayerZero para novos mercados de liquidez.",
  },
];

const AlertasView = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-display italic text-gradient-purple leading-tight">
          Central de Inteligência
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Matchmaking algorítmico e oportunidades de alta prioridade em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - AI Suggestions */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-display text-foreground">
              Sugestões da IA
            </h3>
            <span className="px-2.5 py-1 rounded-md bg-primary/[0.15] text-primary text-[10px] font-bold tracking-widest uppercase">
              Smart Match
            </span>
          </div>

          {suggestions.map((s, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:border-primary/20 transition-all group flex flex-col"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-6">
                  <h4 className="text-lg font-bold text-foreground mb-2">
                    {s.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {s.desc}
                  </p>
                  <div className="flex items-center gap-2">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-display italic text-gradient-purple">{s.budget}</span>
                    <span className="text-sm font-semibold text-muted-foreground">{s.budgetLabel}</span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">
                    {s.type}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {s.icon === "check" ? (
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">
                    {s.match}
                  </span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-colors text-xs font-bold text-foreground">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-display text-foreground">Alertas Flash</h3>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Urgente</span>
          </div>

          {/* Flash Auction 1 */}
          <div className="glass rounded-2xl p-5 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Leilão Ativo</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <span className="text-sm font-bold font-mono text-foreground">01:45</span>
              </div>
            </div>

            <h4 className="text-lg font-bold text-foreground mb-6">
              Bug Fix: Emergency Patch
            </h4>

            {/* Current Bid */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lance Atual:</span>
                <span className="font-bold text-success">
                  1,250 USDC
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full w-[62%] rounded-full bg-success glow-green" />
              </div>
            </div>

            <button className="w-full py-3.5 rounded-xl bg-success/20 text-success border border-success/30 text-sm font-bold hover:bg-success hover:text-success-foreground transition-all flex items-center justify-center gap-2">
              Entrar no Leilão
            </button>
          </div>

          {/* Flash Auction 2 */}
          <div className="glass rounded-2xl p-5 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Alta Demanda</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <span className="text-sm font-bold font-mono text-foreground">08:22</span>
              </div>
            </div>

            <h4 className="text-lg font-bold text-foreground mb-6">
              Zk-Proof Implementation
            </h4>

            {/* Current Bid */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lance Atual:</span>
                <span className="font-bold text-success">
                  3,100 USDC
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full w-[35%] rounded-full bg-success glow-green" />
              </div>
            </div>

            <button className="w-full py-3.5 rounded-xl bg-success/20 text-success border border-success/30 text-sm font-bold hover:bg-success hover:text-success-foreground transition-all flex items-center justify-center gap-2">
              Entrar no Leilão
            </button>
          </div>

          {/* Ecosystem */}
          <div className="glass rounded-2xl p-5 mt-4">
            <h3 className="text-md font-display italic text-foreground mb-5">
              Resumo do Ecossistema
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                 <span className="text-sm text-muted-foreground">Gás Médio (Ethereum)</span>
                 <span className="text-sm font-mono text-foreground">24 Gwei</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-sm text-muted-foreground">Projetos Ativos (24h)</span>
                 <span className="text-sm font-mono text-foreground">142</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-sm text-muted-foreground">Valor Total Transacionado</span>
                 <span className="text-sm text-success font-mono font-bold">1.2M USDC</span>
              </div>
            </div>
            <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground leading-relaxed">
              TENDÊNCIA: ALTA DEMANDA POR DESENVOLVEDORES CAIRO E NOIR NO ECOSSISTEMA L2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertasView;
