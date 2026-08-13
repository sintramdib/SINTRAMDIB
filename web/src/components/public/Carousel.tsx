import { useEffect, useState } from 'react';

export interface Slide {
  title: string;
  subtitle?: string | null;
  /** URL de imagem (se vazia, usa um gradiente de fundo). */
  image?: string;
  /** Classes tailwind para o fundo gradiente (usado quando não há imagem). */
  bg?: string;
  link?: string;
  cta?: string;
}

export function Carousel({ slides, autoMs = 6000 }: { slides: Slide[]; autoMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), autoMs);
    return () => clearInterval(t);
  }, [slides.length, autoMs]);

  if (slides.length === 0) return null;

  const go = (i: number, el?: HTMLElement) => {
    setIndex(((i % slides.length) + slides.length) % slides.length);
    el?.scrollIntoView({ block: 'nearest' });
  };

  return (
    <div className="relative overflow-hidden bg-brand-blueDark">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={i} className="relative min-w-full">
            {s.image ? (
              <img src={s.image} alt={s.title} className="h-[280px] w-full object-cover opacity-60 sm:h-[420px]" />
            ) : (
              <div className={`h-[280px] w-full sm:h-[420px] ${s.bg ?? 'bg-brand-blue'}`} />
            )}
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto max-w-7xl px-4">
                <h1 className="max-w-2xl text-2xl font-extrabold text-white drop-shadow sm:text-4xl">
                  {s.title}
                </h1>
                {s.subtitle && <p className="mt-3 max-w-xl text-sm text-blue-50 sm:text-base">{s.subtitle}</p>}
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-block rounded bg-brand-yellow px-5 py-2.5 font-bold text-brand-blueDark hover:bg-brand-yellowDark"
                  >
                    {s.cta ?? 'Saiba mais'}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            ‹
          </button>
          <button
            aria-label="Próximo"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-brand-yellow' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}