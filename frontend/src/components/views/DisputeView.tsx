import {
  AlertTriangle,
  Clock,
  Coins,
  ExternalLink,
  FileImage,
  Video,
  Github,
  Globe,
  Gavel,
} from "lucide-react";

const DisputeView = () => {
  return (
    <div className="space-y-6">
      {/* Red Warning Banner */}
      <div className="rounded-2xl bg-destructive/[0.08] border border-destructive/20 p-5">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-bold text-destructive uppercase tracking-wider">
              Disputa Ativa: Contrato #BR-9902-X
            </span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Tempo Restante:{" "}
                <span className="text-foreground font-semibold">23h 14m</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Recompensa Arbitragem:{" "}
                <span className="text-primary font-semibold">45 USDC</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Side */}
        <div className="glass rounded-2xl p-5 border-destructive/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive">
              MC
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Visão do Contratante
              </h3>
              <p className="text-xs text-muted-foreground">Marcus Chen</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-4">
            <p className="text-sm text-foreground leading-relaxed">
              A entrega não corresponde ao escopo definido no contrato. O
              dashboard de staking não inclui os gráficos de performance em
              tempo real conforme especificado no milestone 2. Além disso, a
              responsividade mobile está completamente quebrada.
            </p>
          </div>

          <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">
            Evidências Anexadas
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <FileImage className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground flex-1">
                screenshot-bugs-mobile.png
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <Video className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground flex-1">
                video-walkthrough-issues.mp4
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-destructive/[0.06] border border-destructive/10">
            <p className="text-xs text-muted-foreground">Valor em custódia</p>
            <p className="text-lg font-bold text-foreground">
              2,450.00{" "}
              <span className="text-sm text-destructive">USDT</span>
            </p>
          </div>
        </div>

        {/* Freelancer Side */}
        <div className="glass rounded-2xl p-5 border-success/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-xs font-bold text-primary-foreground">
              AR
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Prova do Freelancer
              </h3>
              <p className="text-xs text-muted-foreground">Alex Rivera</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-4">
            <p className="text-sm text-foreground leading-relaxed">
              Todas as funcionalidades foram implementadas seguindo TDD com
              cobertura de 94%. Os gráficos de performance estão no branch
              'feature/charts' conforme comunicado no chat. A versão mobile
              está funcional — os screenshots do cliente foram tirados em
              viewport não suportado (320px), fora do escopo original.
            </p>
          </div>

          <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">
            Evidências Técnicas
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <Github className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground flex-1">
                GitHub Repo — Branch 'main'
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground flex-1">
                IPFS Deploy Hash — QmX7...k9pL
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-success/[0.06] border border-success/10">
            <p className="text-xs text-muted-foreground">Test Coverage</p>
            <p className="text-lg font-bold text-foreground">
              94%{" "}
              <span className="text-sm text-success">Passing</span>
            </p>
          </div>
        </div>
      </div>

      {/* Arbitration Panel */}
      <div className="glass rounded-2xl p-6 border-primary/10">
        <div className="flex items-center gap-2 mb-5">
          <Gavel className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Painel de Veredito On-Chain
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="py-4 rounded-xl bg-destructive/[0.08] border border-destructive/20 text-sm font-semibold text-destructive hover:bg-destructive/[0.15] transition-all flex items-center justify-center gap-2">
            Votar a favor do Cliente
          </button>
          <button className="py-4 rounded-xl bg-success/[0.08] border border-success/20 text-sm font-semibold text-success hover:bg-success/[0.15] transition-all flex items-center justify-center gap-2">
            Votar a favor do Freelancer
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Est. Gas Fee: 0.0034 MON • Voto é irreversível e registrado on-chain
        </p>
      </div>
    </div>
  );
};

export default DisputeView;
