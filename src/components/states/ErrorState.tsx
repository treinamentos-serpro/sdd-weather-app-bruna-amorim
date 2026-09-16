interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md"
      role="alert"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Não foi possível carregar</h2>
          <p className="mt-2 text-sm text-white/75">{message}</p>
        </div>
        <button
          className="rounded-xl bg-accent-500 px-5 py-3 font-semibold text-white transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
          onClick={onRetry}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    </section>
  );
}
