import { Cloud } from "lucide-react";

interface HeaderProps {
  title: string;
  avatarInitial?: string;
  syncing?: boolean;
  scrolled?: boolean;
}

export default function Header({ title, avatarInitial, syncing, scrolled }: HeaderProps) {
  return (
    <header className={`app-header ${scrolled ? "scrolled" : ""}`}>
      <h1 className="app-header-title">{title}</h1>
      {avatarInitial && (
        <div className="app-header-actions">
          {syncing && (
            <span className="sync-chip" aria-live="polite">
              <Cloud size={13} /> Guardando
            </span>
          )}
          <div className="avatar avatar-small" aria-hidden="true">{avatarInitial}</div>
        </div>
      )}
    </header>
  );
}
