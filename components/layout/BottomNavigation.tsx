import {
  Home,
  Utensils,
  Dumbbell,
  ChartLine,
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
  { key: "progress", label: "Progreso", icon: ChartLine },
  { key: "profile", label: "Perfil", icon: CircleUserRound },
];

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

/** Dock flotante: la pestaña activa se expande en una píldora con su etiqueta;
 *  las inactivas quedan como iconos. */
export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            className={`nav-button pressable ${isActive ? "active" : ""}`}
            onClick={() => onTabChange(item.key)}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
          >
            <Icon size={22} strokeWidth={isActive ? 2.6 : 2} aria-hidden="true" />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
