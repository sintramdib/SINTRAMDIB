import { Link } from 'react-router-dom';
import { useSiteData } from './SiteProvider';

const usefulLinks: { label: string; href: string }[] = [
  { label: 'MTE', href: 'https://www.gov.br/trabalho-e-emprego/pt-br' },
  { label: 'Previdência', href: 'https://www.gov.br/previdencia/pt-br' },
  { label: 'TRT-10', href: 'https://www.trt10.jus.br/' },
  { label: 'MPT', href: 'https://mpt.mp.br/' },
  { label: 'Defensoria Pública (DF)', href: 'https://www.defensoria.df.gov.br/' },
  { label: 'Sinduscon-DF', href: 'https://www.sinduscondf.org.br/' },
  { label: 'Seconci-DF', href: 'https://www.seconci-df.org.br/' },
];

export function Footer() {
  const { settings } = useSiteData();

  return (
    <footer className="bg-brand-blueDark text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded bg-brand-yellow text-xs font-black text-brand-blueDark">
              {(settings?.site_short ?? 'STICOMBE').slice(0, 3)}
            </div>
            <div className="font-extrabold">{settings?.site_short ?? 'STICOMBE'}</div>
          </div>
          <p className="text-sm text-blue-100">{settings?.site_legal_name ?? 'Sindicato dos Trabalhadores nas Indústrias da Construção e do Mobiliário de Brasília'}</p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <a href={settings?.site_facebook ?? 'http://www.facebook.com/sticombebrasilia'} target="_blank" rel="noreferrer" className="hover:text-brand-yellow">Facebook</a>
            <a href={settings?.site_instagram ?? 'http://www.facebook.com/sticombebrasilia'} target="_blank" rel="noreferrer" className="hover:text-brand-yellow">Instagram</a>
            <a href={settings?.site_youtube ?? 'https://www.youtube.com/@sticombebrasilia'} target="_blank" rel="noreferrer" className="hover:text-brand-yellow">YouTube</a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold">Links úteis</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            {usefulLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer" className="hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-bold">Informações</h3>
          <p className="mb-2 text-sm text-blue-100">{settings?.site_addr ?? 'SCRN 706/707 Bloco B - Número 12 - Cep: 70740-620 - Brasília-DF'}</p>
          <p className="mb-2 text-sm">
            {(settings?.site_phone1 ?? '(61) 3347-8833')} | {(settings?.site_phone2 ?? '(61) 3349-1606')}
          </p>
          <p className="mb-2 text-sm">
            <a href={`mailto:${settings?.site_email ?? 'sticombe@sticombe.org.br'}`} className="hover:text-brand-yellow">
              {settings?.site_email ?? 'sticombe@sticombe.org.br'}
            </a>
          </p>
          <p className="text-sm">
            WhatsApp:{' '}
            <a href={settings?.site_whatsapp ? `https://wa.me/${settings.site_whatsapp}` : 'https://wa.me/556133491606'} target="_blank" rel="noreferrer" className="hover:text-brand-yellow">
              {settings?.site_whatsapp_display ?? '(61) 3349-1606'}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-blue-200">
        © {new Date().getFullYear()} {settings?.site_name ?? 'Sindicato STICOMBE'} · Todos os direitos reservados. Desenvolvido por{' '}
        <Link to="https://example.com" className="underline-offset-2 hover:underline">
          Assinatura Digital
        </Link>
      </div>
    </footer>
  );
}