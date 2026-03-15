import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  Bell,
  Zap,
  Plus,
  User,
  Compass,
} from "lucide-react";
import { useAccount } from "wagmi";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "trabalhos", label: "Trabalhos", icon: Briefcase },
  { id: "mensagens", label: "Mensagens", icon: MessageSquare },
  { id: "alertas", label: "Central de Alertas", icon: Bell },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

const AppSidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const { address } = useAccount();
  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "0x1a...3b4c";

  return (
    <aside className="w-[240px] min-h-screen flex flex-col bg-sidebar">
      {/* Logo */}
      <div className="p-5 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              BidRush
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-primary font-semibold">
              Decentralized Hub
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary/[0.12] text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 space-y-4">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/40 bg-primary/[0.08] text-primary text-sm font-semibold transition-all hover:bg-primary/[0.15]">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>

        <button 
          onClick={() => onViewChange('user')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-white/[0.04] transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              User Profile
            </p>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {formattedAddress}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
