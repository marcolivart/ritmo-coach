import { ReactNode } from "react";

interface SettingRowProps {
  icon: ReactNode;
  name: string;
  value?: string;
  /** Elemento a la derecha (chevron, pill, botón…). */
  trailing?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

/** Fila de ajuste. Si tiene onClick se renderiza como <button> real
 *  (focusable y accesible), nunca como <div onClick>. */
export default function SettingRow({ icon, name, value, trailing, onClick, danger }: SettingRowProps) {
  const content = (
    <>
      <div className={`setting-icon ${danger ? "danger" : ""}`} aria-hidden="true">{icon}</div>
      <div className="setting-copy">
        <div className="setting-name">{name}</div>
        {value && <div className="setting-value">{value}</div>}
      </div>
      {trailing}
    </>
  );
  if (onClick) {
    return (
      <button type="button" className="setting-row pressable" onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div className="setting-row">{content}</div>;
}
