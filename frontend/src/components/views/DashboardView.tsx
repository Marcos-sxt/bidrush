import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Zap,
  Send,
  ArrowUp,
  Loader2,
  Calendar,
  ClipboardList
} from "lucide-react";
import type { LeilaoFlashAuctionData } from "./LeilaoFlashView";

type Message = {
  role: "user" | "ai";
  text: string;
  time: string;
};

const SYSTEM_PROMPT = `
You are an expert AI Oracle for the BidRush decentralized freelancer platform.
Your goal is to extract EXACTLY 3 parameters from the user's idea to construct a Smart Contract "Flash Auction".
The parameters are:
1. Budget (in MON tokens)
2. Deadline (in days or specific date)
3. Reputation Tier Required (BRONZE, SILVER, or GOLD)

Guide the conversation politely. Once you have all 3 parameters, you MUST output a JSON block at the very end of your message in exactly this format so the frontend can parse it:
\`\`\`json
{
  "ready": true,
  "budget": 150,
  "deadline": "15 dias",
  "deadlineDays": 15,
  "repTier": "SILVER"
}
\`\`\`
If you don't have all parameters yet, set "ready": false and ask the user for what's missing. You are talking to a Portuguese speaker.
`;

type DashboardViewProps = {
  /** Sempre chamado ao clicar em Iniciar Leilão Flash — fluxo 100% mockado (sem tx on-chain). */
  onStartLeilaoFlash: (data: LeilaoFlashAuctionData) => void;
};

const DashboardView = ({ onStartLeilaoFlash }: DashboardViewProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Olá! Sou o Oráculo de Matchmaking da MonadWork. Descreva o job que você quer criar (ex: 'Preciso de um auditor para meu smart contract em Rust') e eu te ajudarei a definir o Orçamento, Prazo e o Tier de Reputação ideal para o Leilão Flash.",
      time: "Agora",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contractParams, setContractParams] = useState({
    ready: false,
    title: "",
    budget: 0,
    deadline: "",
    deadlineDays: 0,
    repTier: "BRONZE",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save the user input as title if no title exists yet
    if (!contractParams.title) {
      setContractParams(prev => ({ ...prev, title: input.substring(0, 40) + "..." }));
    }

    try {
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        { role: "user", content: userMessage.text }
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: apiMessages,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponseText = data.choices[0]?.message?.content || "Desculpe, houve um erro ao consultar o oráculo.";

      const jsonMatch = aiResponseText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);

      let cleanResponse = aiResponseText;
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsedParams = JSON.parse(jsonMatch[1]);
          if (parsedParams.ready) {
            setContractParams(prev => ({ ...prev, ...parsedParams }));
          }
          cleanResponse = aiResponseText.replace(/\`\`\`json\n([\s\S]*?)\n\`\`\`/, "").trim();
        } catch (e) {
          console.error("Failed to parse Oracle JSON", e);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: cleanResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Falha de conexão com a rede neural do Oráculo (API Key ausente ou inválida).",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAuction = () => {
    if (!contractParams.ready) return;
    // Fluxo 100% mockado: só navega para a tela de Leilão Flash com os dados (sem transação on-chain).
    onStartLeilaoFlash({
      title: contractParams.title,
      description: `${contractParams.title}\n\nRequisitos definidos via AI Oracle. Prazo: ${contractParams.deadlineDays} dias. Reputação Mínima: ${contractParams.repTier}.`,
      budget: contractParams.budget,
      repTier: contractParams.repTier,
      deadlineDays: contractParams.deadlineDays,
    });
  };

  const handleCreateJobManual = () => {
    alert("Criação de Job Direto (sem leilão) será implementada em breve no contrato.");
  };

  // UI Helpers
  const maxBudgetDisplay = contractParams.budget > 0 ? contractParams.budget.toLocaleString() : "---";
  const deadlineDisplay = contractParams.ready ? contractParams.deadline : "---";

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden">
      {/* AI Oracle Chat Section */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] overflow-hidden backdrop-blur-sm self-stretch">
        {/* Chat Header */}
        <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(138,43,226,0.15)] animate-glow-breathe-slow">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Matchmaker Oracle</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Cérebro IA Ativo</span>
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Monad Testnet
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[85%] rounded-[2rem] px-7 py-5 shadow-sm transition-all ${message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none shadow-[0_10px_30px_rgba(138,43,226,0.2)]"
                  : "bg-white/[0.03] border border-white/[0.06] text-foreground rounded-tl-none"
                  }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <span className={`text-[10px] mt-3 block font-medium opacity-60 ${message.role === "user" ? "text-right" : "text-left"
                  }`}>
                  {message.time}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-[2rem] rounded-tl-none px-7 py-5">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-8 bg-white/[0.01] border-t border-white/[0.06]">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Descreva seu projeto para o Oráculo..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-5 pl-7 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all group-hover:bg-white/[0.05]"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl gradient-purple flex items-center justify-center text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:gradient-gray"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 text-center font-medium uppercase tracking-widest opacity-40">
            Powered by Groq Llama 3.3 • Verificado por MonadWork
          </p>
        </div>
      </div>

      {/* Contract Parameters Card */}
      <div className="w-full lg:w-96 flex flex-col bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] overflow-hidden backdrop-blur-md self-stretch">
        <div className="p-8 border-b border-white/[0.06] bg-white/[0.01]">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
            <ClipboardList className="w-4 h-4" />
            Configurações do Contrato
          </h3>
        </div>

        <div className="p-8 space-y-10 flex-1 overflow-y-auto">
          <div className="space-y-8">
            {/* Budget */}
            <div>
              <label className="text-sm text-muted-foreground flex items-center justify-between mb-3">
                Orçamento Máximo
                <span className="text-[10px] uppercase font-bold text-primary/80 tracking-tighter bg-primary/10 px-2 py-0.5 rounded">Escrow</span>
              </label>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold tracking-tight ${contractParams.ready ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {maxBudgetDisplay}
                </span>
                <span className="text-sm font-bold text-muted-foreground tracking-widest">MON</span>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">
                Prazo de Entrega
              </label>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <span className={`text-sm font-mono tracking-wide ${contractParams.ready ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {deadlineDisplay}
                </span>
                <Calendar className={`w-4 h-4 ${contractParams.ready ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>

            {/* Reputation */}
            <div>
              <label className="text-sm text-muted-foreground">
                Reputação Mínima
              </label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["BRONZE", "SILVER", "GOLD"].map((tier) => {
                  const isActive = contractParams.ready && contractParams.repTier === tier;

                  return (
                    <button
                      key={tier}
                      disabled
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all ${isActive
                        ? "gradient-purple text-primary-foreground shadow-[0_0_15px_rgba(138,43,226,0.3)]"
                        : "bg-white/[0.04] text-muted-foreground border border-white/[0.06]"
                        }`}
                    >
                      {tier}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.04] space-y-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs">
              <strong>Modo demo (pitch):</strong> ao clicar em &quot;Iniciar Leilão Flash&quot; você vai para a tela do leilão de 10s com lances simulados. Nenhuma transação on-chain.
            </div>
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCreateJobManual}
                className="py-4 px-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[10px] font-bold text-muted-foreground hover:bg-white/[0.06] transition-all uppercase tracking-wider flex flex-col items-center justify-center gap-2 text-center"
              >
                <Send className="w-4 h-4 text-muted-foreground" />
                Postar Job Manual
              </button>
              <button
                onClick={handleCreateAuction}
                disabled={!contractParams.ready}
                title="Abrir tela do leilão flash (10s, tudo mockado)"
                className={`py-4 px-3 rounded-2xl text-[10px] font-bold flex flex-col items-center justify-center gap-2 uppercase tracking-wider text-center transition-all
                  ${contractParams.ready
                    ? "gradient-purple text-primary-foreground animate-glow-breathe hover:opacity-90 cursor-pointer shadow-[0_0_20px_rgba(138,43,226,0.4)]"
                    : "bg-white/[0.02] border border-white/[0.04] text-muted-foreground cursor-not-allowed"}
                `}
              >
                <Zap className="w-4 h-4" />
                Iniciar Leilão Flash
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
