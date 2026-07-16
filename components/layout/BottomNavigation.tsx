import {
  Home,
  Utensils,
  Dumbbell,
  BarChart3,
  CircleUserRound,
  type LucideIcon,
} from "lucide-react";
import type { Tab } from "../../src/lib/routes";

interface NavItem {
  key: Tab;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { key: "today", label: "Hoy", icon: Home },
  { key: "food", label: "Comida", icon: Utensils },
  { key: "training", label: "Entreno", icon: Dumbbell },
  { key: "progress", label: "Progreso", icon: BarChart3 },
  { key: "profile", label: "Perfil", icon: CircleUserRound },
];

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            className={`nav-button ${isActive ? "active" : ""}`}
            onClick={() => onTabChange(item.key)}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
          >
            <span className="nav-icon-wrap" aria-hidden="true">
              <Icon size={24} strokeWidth={isActive ? 2.6 : 2} />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
