import { Link } from 'react-router-dom';
import { Carousel, type Slide } from '../../components/public/Carousel';
import { quickServices } from '../../config/sitePublic';
import { useSiteData, fileUrl } from '../../components/public/SiteProvider';

export function HomePage() {
  const { settings, news, banners, loading } = useSiteData();

  if (loading) {
    return (
      <div className="pub pub--center">
        <span className="spinner" />
      </div>
    );
  }

  // Hero slides: use main banner + hero from settings
  const mainBanner = banners.find((b) => b.main && b.status === 'ACTIVE');
  const heroSlides: Slide[] = [
    {
      title: settings?.hero_headline ?? 'Defendendo os direitos dos trabalhadores da construção',
      subtitle: settings?.hero_subtitle ?? 'O sindicato atua na base territorial do DF e entorno pelos direitos da categoria.',
      bg: 'bg-gradient-to-br from-brand-blue via-brand-blueDark to-slate-900',
      cta: 'Sobre o sindicato',
      link: '/sindicato',
    },
    ...(mainBanner
      ? [{
          title: mainBanner.title,
          subtitle: mainBanner.description,
          image: fileUrl(mainBanner.imagePath),
          link: mainBanner.buttonLink ?? undefined,
          cta: mainBanner.buttonText ?? 'Saiba mais',
        }]
      : []),
  ];

  const latestNews = news.slice(0, 4);

  return (
    <div>
      <Carousel slides={heroSlides} />

      {/* Acesso rápido */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-brand-blue">Acesso rápido</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickServices.map((s) => (
            <Link
              key={s.title}
              to={s.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-lg bg-brand-blue/10 text-lg text-brand-blue">
                {s.icon}
              </div>
              <h3 className="mb-1 font-bold text-slate-800 group-hover:text-brand-blue">{s.title}</h3>
              <p className="text-sm text-slate-500">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA associado */}
      <section className="bg-brand-blue py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Seja um Associado</h2>
            <p className="mt-2 max-w-xl text-blue-100">
              Associe-se e tenha acesso a convênios, benefícios e toda a estrutura jurídica do sindicato.
            </p>
          </div>
          <Link
            to="/seja-socio"
            className="rounded bg-brand-yellow px-6 py-3 text-center font-bold text-brand-blueDark hover:bg-brand-yellowDark"
          >
            Quero me associar
          </Link>
        </div>
      </section>

      {/* Notícias */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-brand-blue">Notícias recentes</h2>
          <Link to="/noticias" className="font-semibold text-brand-blue hover:underline">
            Ver todas →
          </Link>
        </div>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latestNews.length > 0 ? (
            latestNews.map((n, i) => (
              <article
                key={n.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div
                  className={`h-32 ${n.imagePath ? 'bg-cover bg-center' : `bg-gradient-to-br ${['from-blue-200 to-indigo-400', 'from-indigo-200 to-blue-400', 'from-slate-200 to-slate-400', 'from-yellow-100 to-amber-400'][i % 4]}`}`}
                  style={{ backgroundImage: n.imagePath ? `url(${fileUrl(n.imagePath)})` : undefined }}
                />
                <div className="p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                    {n.category ?? 'Notícia'} · {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('pt-BR') : ''}
                  </span>
                  <h3 className="mt-1 font-semibold leading-snug text-slate-800">{n.title}</h3>
                </div>
              </article>
            ))
          ) : (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <article key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className={`h-32 bg-gradient-to-br ${['from-blue-200 to-indigo-400', 'from-indigo-200 to-blue-400', 'from-slate-200 to-slate-400', 'from-yellow-100 to-amber-400'][i % 4]}`} />
                  <div className="p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                      Notícia · DD/MM/AAAA
                    </span>
                    <h3 className="mt-1 font-semibold leading-snug text-slate-800">
                      Nenhuma notícia publicada ainda
                    </h3>
                  </div>
                </article>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Outros acessos */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-1 font-bold">WhatsApp</h3>
            <p className="text-sm text-slate-500">Fale direto com o sindicato.</p>
            <a href={`https://wa.me/${settings?.site_whatsapp ?? '556133491606'}`} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-brand-blue hover:underline">
              Falar no WhatsApp →
            </a>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-1 font-bold">Calendário de feriados</h3>
            <p className="text-sm text-slate-500">Fique por dentro das datas.</p>
            <Link to="/contato" className="mt-2 inline-block font-semibold text-brand-blue hover:underline">
              Ver calendário →
            </Link>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-1 font-bold">Área do Associado</h3>
            <p className="text-sm text-slate-500">Acesse sua carteirinha digital.</p>
            <Link to="/seja-socio" className="mt-2 inline-block font-semibold text-brand-blue hover:underline">
              Acessar área →
            </Link>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-1 font-bold">YouTube</h3>
            <p className="text-sm text-slate-500">Veja a atuação do sindicato.</p>
            <a href={settings?.site_youtube ?? 'https://www.youtube.com/@sticombebrasilia'} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-brand-blue hover:underline">
              Acessar canal →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}