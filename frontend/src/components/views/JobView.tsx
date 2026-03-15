import {
  MessageSquare,
  Check,
  Upload,
  FileArchive,
  Lock,
  Clock,
  Shield,
  Star,
  AlertTriangle,
} from "lucide-react";

const deliverables = [
  { text: "Dashboard UI com métricas de staking", done: true },
  { text: "Integração com Smart Contract de Staking", done: true },
  { text: "Testes unitários e de integração", done: false },
];

const timelineSteps = [
  { label: "Contrato Criado", date: "10 Nov, 2024", done: true },
  { label: "Fundos Depositados", date: "10 Nov, 2024", done: true },
  { label: "Aguardando Revisão", date: "Em andamento", done: false, active: true },
];

const JobView = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Desenvolvimento Interface dApp Staking
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Contrato #BR-7721-A
          </p>
        </div>
        <span className="ml-auto px-4 py-1.5 rounded-full bg-primary/[0.12] border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
          Smart Contract Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Freelancer Card */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center text-sm font-bold text-primary-foreground">
                AR
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Alex Rivera
                </h3>
                <p className="text-xs text-muted-foreground">
                  Senior Fullstack Web3 Developer
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= 4 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    4.8 (127 jobs)
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-primary/[0.12] border border-primary/20 text-primary text-xs font-semibold flex items-center gap-2 hover:bg-primary/[0.18] transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
                Chat Freelancer
              </button>
            </div>
          </div>

          {/* Escopo */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">
              Escopo e Entrega
            </h3>
            <div className="space-y-3">
              {deliverables.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      d.done
                        ? "bg-success/20 border border-success/30"
                        : "bg-white/[0.04] border border-white/[0.08]"
                    }`}
                  >
                    {d.done && <Check className="w-3 h-3 text-success" />}
                  </div>
                  <span
                    className={`text-sm ${
                      d.done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {d.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">
              Área de Trabalho
            </h3>
            <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/30 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arraste arquivos ou clique para upload
              </p>
              <p className="text-xs text-muted-foreground">
                Max 50MB • ZIP, PDF, Figma
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-success/[0.06] border border-success/10">
              <FileArchive className="w-5 h-5 text-success" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  final-delivery-v1.zip
                </p>
                <p className="text-xs text-muted-foreground">
                  24.3 MB • Enviado há 2 horas
                </p>
              </div>
              <Check className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>

        {/* Right Column - Escrow */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/[0.12] flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                  Escrow em Custódia
                </h3>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  2,450.00{" "}
                  <span className="text-sm font-medium text-primary">USDT</span>
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-0 ml-2 mb-6">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        step.done
                          ? "bg-success border-success"
                          : step.active
                          ? "bg-primary border-primary animate-pulse"
                          : "bg-transparent border-white/20"
                      }`}
                    />
                    {i < timelineSteps.length - 1 && (
                      <div className="w-px h-10 bg-white/[0.08]" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={`text-sm font-medium ${
                        step.done || step.active
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <button className="w-full py-3.5 rounded-xl bg-success text-success-foreground text-sm font-semibold glow-green hover:opacity-90 transition-all">
              ✓ Aprovar e Liberar Pagamento
            </button>
            <button className="w-full mt-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/[0.06] transition-colors">
              <AlertTriangle className="w-4 h-4" />
              Abrir Disputa
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Iniciado em", value: "10 Nov", icon: Clock },
              { label: "Prazo Final", value: "24 Dez", icon: Clock },
              { label: "Tempo Decorrido", value: "14 dias", icon: Clock },
              { label: "Segurança", value: "Multi-Sig", icon: Shield },
            ].map((card) => (
              <div
                key={card.label}
                className="glass rounded-xl p-3 flex flex-col gap-1"
              >
                <card.icon className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-sm font-semibold text-foreground">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobView;
