interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-glass backdrop-blur-md">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-white/75">{hint}</p>
    </section>
  );
}
