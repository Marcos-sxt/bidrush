import { useState, useEffect, useMemo } from "react";
import { Rocket, ArrowLeft, Users, ShieldCheck } from "lucide-react";
import { useAccount } from "wagmi";

const AUCTION_DURATION_SEC = 10;

const MOCK_ADDRESSES = [
  "0x88a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f2a9",
  "0x12b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b",
  "0x34d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d",
  "0x56f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f",
  "0x78a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a",
  "0x9ab4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b",
  "0xbcd6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d",
  "0xdef8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f",
];

export type LeilaoFlashAuctionData = {
  title: string;
  description: string;
  budget: number;
  repTier: string;
  deadlineDays: number;
};

type MockBid = {
  id: string;
  timestamp: string;
  oracleAddr: string;
  bidMon: number;
  deliveryHrs: number;
  score: number;
  isLeading: boolean;
};

function compositeScore(bidMon: number, deliveryHrs: number, score: number): number {
  if (deliveryHrs <= 0) return 0;
  return (bidMon * 100 / deliveryHrs) * (score / 100);
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

type Props = {
  auction: LeilaoFlashAuctionData | null;
  onBack: () => void;
};

const LeilaoFlashView = ({ auction, onBack }: Props) => {
  const { address } = useAccount();
  const [countdown, setCountdown] = useState(AUCTION_DURATION_SEC);
  const [bids, setBids] = useState<MockBid[]>([]);
  const [ended, setEnded] = useState(false);
  const [bidAmount, setBidAmount] = useState("15");
  const [deliveryHrs, setDeliveryHrs] = useState("72");
  const [userScore] = useState(() => 50 + Math.floor(Math.random() * 45)); // 50–95 mock

  const data = auction ?? {
    title: "Neural Interface Architecture",
    description: "Implementing a low-latency neural-to-web bridge using decentralized oracle nodes for real-time biometric verification.",
    budget: 100,
    repTier: "BRONZE",
    deadlineDays: 60,
  };

  // Countdown 10s
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 0.01) {
          clearInterval(t);
          setEnded(true);
          return 0;
        }
        return Math.max(0, c - 0.1);
      });
    }, 100);
    return () => clearInterval(t);
  }, [ended]);

  // Mock bids stream (every 1–2s)
  useEffect(() => {
    if (ended) return;
    const addMockBid = () => {
      const addr = MOCK_ADDRESSES[Math.floor(Math.random() * MOCK_ADDRESSES.length)];
      const bidMon = Number((data.budget * (0.5 + Math.random() * 0.5)).toFixed(2));
      const deliveryHrs = 24 + Math.floor(Math.random() * 120);
      const score = 50 + Math.floor(Math.random() * 50);
      setBids((prev) => {
        const newBid: MockBid = {
          id: `${Date.now()}-${addr}`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) + "." + String(Math.floor(Math.random() * 100)).padStart(2, "0"),
          oracleAddr: addr,
          bidMon,
          deliveryHrs,
          score,
          isLeading: false,
        };
        const withNew = [...prev, newBid];
        const withScores = withNew.map((b) => ({ ...b, composite: compositeScore(b.bidMon, b.deliveryHrs, b.score) }));
        withScores.sort((a, b) => b.composite - a.composite);
        const leaderId = withScores[0]?.id;
        return withScores.map((b) => ({ ...b, isLeading: b.id === leaderId }));
      });
    };
    const interval = setInterval(addMockBid, 1200 + Math.random() * 800);
    return () => clearInterval(interval);
  }, [ended, data.budget]);

  const sortedBids = useMemo(() => {
    return [...bids].sort((a, b) => compositeScore(b.bidMon, b.deliveryHrs, b.score) - compositeScore(a.bidMon, a.deliveryHrs, a.score));
  }, [bids]);

  const leader = sortedBids[0];
  const currentHighBid = leader?.bidMon ?? 0;
  const totalBidders = sortedBids.length;

  const handleSubmitBid = () => {
    const mon = parseFloat(bidAmount);
    const hrs = parseInt(deliveryHrs, 10);
    if (isNaN(mon) || isNaN(hrs) || mon <= 0 || hrs <= 0) return;
    const ts = new Date().toLocaleTimeString("pt-BR", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) + "." + String(Math.floor(Math.random() * 100)).padStart(2, "0");
    const newBid: MockBid = {
      id: `user-${Date.now()}`,
      timestamp: ts,
      oracleAddr: address ? shortAddr(address) : "0x1a...3b4c",
      bidMon: mon,
      deliveryHrs: hrs,
      score: userScore,
      isLeading: false,
    };
    setBids((prev) => {
      const withNew = [...prev, newBid];
      const withScores = withNew.map((b) => ({ ...b, composite: compositeScore(b.bidMon, b.deliveryHrs, b.score) }));
      withScores.sort((a, b) => b.composite - a.composite);
      const leaderId = withScores[0]?.id;
      return withScores.map((b) => ({ ...b, isLeading: b.id === leaderId }));
    });
  };

  const countdownDisplay = ended
    ? "0:00.0"
    : `${Math.floor(countdown / 60)}:${String(Math.floor(countdown % 60)).padStart(2, "0")}.${Math.floor((countdown % 1) * 10)}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </button>

      {/* Timer + High bid + Bidders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Leilão encerra em
          </div>
          <div className={`text-4xl font-mono font-bold ${ended ? "text-muted-foreground" : "text-primary"}`}>
            {countdownDisplay}
          </div>
          {ended && <div className="text-xs text-amber-400 mt-2 font-bold">Encerrado</div>}
        </div>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Maior oferta
          </div>
          <div className="text-3xl font-bold text-green-500">
            {currentHighBid.toLocaleString("pt-BR")} MON
          </div>
        </div>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 text-center flex flex-col justify-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Total de lances
          </div>
          <div className="flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-3xl font-bold text-foreground">{totalBidders}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Project details */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Detalhes do projeto
          </h3>
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">{data.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Escrow verificado
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold">
                Tier {data.repTier}
              </span>
            </div>
            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] uppercase text-muted-foreground">Orçamento máx.</span>
              <div className="text-2xl font-bold text-foreground">{data.budget.toLocaleString("pt-BR")} MON</div>
            </div>
          </div>
        </div>

        {/* Live bid terminal */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              Terminal de lances ao vivo
            </h3>
            <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase">
              Tempo real
            </span>
          </div>

          <div className="flex-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden flex flex-col min-h-[280px]">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="p-3">Horário</th>
                    <th className="p-3">Endereço</th>
                    <th className="p-3">Lance (MON)</th>
                    <th className="p-3">Prazo (h)</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBids.slice(0, 12).map((b) => (
                    <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{b.timestamp}</td>
                      <td className="p-3 font-mono text-xs text-foreground">{b.oracleAddr}</td>
                      <td className="p-3 font-bold text-foreground">{b.bidMon.toLocaleString("pt-BR")}</td>
                      <td className="p-3 text-sm text-muted-foreground">{b.deliveryHrs}h</td>
                      <td className="p-3 text-sm text-foreground">{b.score}</td>
                      <td className="p-3">
                        {b.isLeading ? (
                          <span className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">
                            Líder
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-muted-foreground text-[10px] font-bold uppercase">
                            Superado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bid form - only when not ended */}
          {!ended && (
            <div className="mt-6 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Lance (MON)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Prazo de entrega (horas)
                </label>
                <input
                  type="number"
                  min="1"
                  value={deliveryHrs}
                  onChange={(e) => setDeliveryHrs(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="sm:col-span-4">
                <button
                  onClick={handleSubmitBid}
                  className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Rocket className="w-4 h-4" />
                  Enviar lance
                </button>
              </div>
            </div>
          )}

          {ended && leader && (
            <div className="mt-6 p-6 rounded-2xl bg-green-500/10 border border-green-500/30">
              <div className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-2">Vencedor (maior oferta × menor prazo × score)</div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-mono text-foreground">{leader.oracleAddr}</span>
                <span className="font-bold text-green-400">{leader.bidMon.toLocaleString("pt-BR")} MON</span>
                <span className="text-muted-foreground">{leader.deliveryHrs}h</span>
                <span className="text-muted-foreground">Score {leader.score}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeilaoFlashView;
