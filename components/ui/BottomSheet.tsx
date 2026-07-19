import { ReactNode, useEffect, useRef, useState } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Nombre accesible del diálogo (aria-label). */
  label: string;
  children: ReactNode;
  /** Si es false, ni Esc ni el backdrop cierran (p. ej. durante un borrado). */
  dismissible?: boolean;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Sheet inferior con semántica de diálogo: foco atrapado, Esc, cierre
 *  animado y devolución del foco al elemento que lo abrió.
 *  IMPORTANTE: renderizar siempre vía el prop `overlay` de AppLayout — nunca
 *  dentro del contenedor animado de la pestaña (su transform rompería el
 *  position:absolute del backdrop). */
export default function BottomSheet({ open, onClose, label, children, dismissible = true }: BottomSheetProps) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Garantía de cierre: si el navegador tiene las animaciones congeladas
  // (pestaña en segundo plano), animationend no llega y el sheet quedaría
  // atascado. Este temporizador fuerza el desmontaje.
  useEffect(() => {
    if (!closing) return;
    const fallback = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      previousFocusRef.current?.focus?.();
    }, 400);
    return () => window.clearTimeout(fallback);
  }, [closing]);

  // Al abrir: recordar el foco previo y llevarlo dentro del diálogo.
  useEffect(() => {
    if (!open || !visible) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open, visible]);

  // Esc + trampa de foco (Tab cicla dentro del panel).
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((element) => element.offsetParent !== null);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, dismissible, onClose]);

  if (!visible) return null;

  const handleAnimationEnd = () => {
    if (closing) {
      setVisible(false);
      setClosing(false);
      previousFocusRef.current?.focus?.();
    }
  };

  return (
    <div
      className={`sheet-backdrop ${closing ? "closing" : ""}`}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        ref={panelRef}
        className="sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        <div className="sheet-handle" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
