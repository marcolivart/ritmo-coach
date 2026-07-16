interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="app-header">
      <h1 className="app-header-title">{title}</h1>
    </header>
  );
}
