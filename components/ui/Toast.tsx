/** Aviso efímero. Renderizar en el overlay de AppLayout. */
export default function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
