interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Carregando dados meteorológicos...',
}: LoadingStateProps) {
  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-glass backdrop-blur-md"
      role="status"
    >
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent-400" />
      <p className="mt-4 text-base font-medium text-white">{message}</p>
    </section>
  );
}
