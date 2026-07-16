import { ReactNode, useEffect, useRef, useState } from "react";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";
import { tabFromPath, tabIndex, tabRoutes, type Tab } from "../../src/lib/routes";

interface AppLayoutProps {
  title: string;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  children: ReactNode;
  /** Modales, toasts, etc. Se renderizan fuera del contenedor animado
   *  para que su `position:absolute` no quede atrapado por el `transform`
   *  de la animación de deslizamiento entre pestañas. */
  overlay?: ReactNode;
}

export default function AppLayout({ title, tab, onTabChange, children, overlay }: AppLayoutProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const previousTabRef = useRef<Tab>(tab);
  const skipNextPush = useRef(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Al montar: si la URL ya apunta a una pestaña conocida (recarga, marcador,
  // enlace compartido), sincronizamos el estado con esa ruta en vez de "Hoy".
  useEffect(() => {
    const initialTab = tabFromPath(window.location.pathname);
    if (initialTab && initialTab !== tab) {
      skipNextPush.current = true;
      onTabChange(initialTab);
    } else if (!initialTab) {
      window.history.replaceState({ tab }, "", tabRoutes[tab]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Botón atrás/adelante del navegador.
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const targetTab = (event.state?.tab as Tab | undefined) ?? tabFromPath(window.location.pathname);
      if (targetTab) {
        skipNextPush.current = true;
        onTabChange(targetTab);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onTabChange]);

  // Cada cambio de pestaña: dirección del slide, scroll a top, y URL.
  useEffect(() => {
    const previous = previousTabRef.current;
    if (previous !== tab) {
      setDirection(tabIndex(tab) >= tabIndex(previous) ? "forward" : "back");
      previousTabRef.current = tab;

      if (skipNextPush.current) {
        skipNextPush.current = false;
      } else {
        window.history.pushState({ tab }, "", tabRoutes[tab]);
      }
    }
    screenRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [tab]);

  return (
    <div className="app-stage">
      <div className="phone-shell">
        <Header title={title} />
        <main
          className="screen screen-with-header"
          ref={screenRef}
          role="main"
          aria-label={title}
        >
          <div key={tab} className={`screen-slide screen-slide-${direction}`}>
            {children}
          </div>
        </main>
        <BottomNavigation activeTab={tab} onTabChange={onTabChange} />
        {overlay}
      </div>
      <div className="desktop-hint">
        <strong>RITMO · Entrenador personal</strong>
        La versión conectada sincroniza perfil, peso, preferencias, compra y entrenamientos mediante Supabase.
      </div>
    </div>
  );
}
