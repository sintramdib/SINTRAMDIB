export function ContentPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <h1 className="text-2xl font-extrabold text-brand-blue">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>
        <span className="mt-5 inline-block rounded bg-brand-blue/10 px-4 py-2 text-xs font-semibold text-brand-blue">
          Página em construção
        </span>
      </div>
    </section>
  );
}