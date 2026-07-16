import { Cloud } from "lucide-react";

interface HeaderProps {
  title: string;
  avatarInitial?: string;
  syncing?: boolean;
}

export default function Header({ title, avatarInitial, syncing }: HeaderProps) {
  return (
    <header className="app-header">
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
