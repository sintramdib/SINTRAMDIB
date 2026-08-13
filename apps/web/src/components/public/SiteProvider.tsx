import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../../lib/api';
import { fileUrl } from '../../config';

interface SiteSettings {
  site_name: string;
  site_short: string;
  site_legal_name: string;
  site_addr: string;
  site_email: string;
  site_whatsapp: string;
  site_whatsapp_display: string;
  site_phone1: string;
  site_phone2: string;
  site_facebook: string;
  site_instagram: string;
  site_youtube: string;
  site_footer_about: string;
  hero_headline: string;
  hero_subtitle: string;
}

interface PublicNews {
  id: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  category: string | null;
  author: string | null;
  headline: boolean;
  imagePath: string | null;
  publishedAt: string | null;
}

interface PublicBanner {
  id: string;
  title: string;
  description: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  imagePath: string | null;
  main: boolean;
  position: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface SiteContextValue {
  settings: SiteSettings | null;
  news: PublicNews[];
  banners: PublicBanner[];
  loading: boolean;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [news, setNews] = useState<PublicNews[]>([]);
  const [banners, setBanners] = useState<PublicBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, n, b] = await Promise.all([
          api.get('/api/public/settings'),
          api.get('/api/public/news?limit=6'),
          api.get('/api/public/banners'),
        ]);
        setSettings(s.data.settings);
        setNews(n.data.news);
        setBanners(b.data.banners);
      } catch (err) {
        console.error('Erro ao carregar dados do site:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const value = { settings, news, banners, loading };
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSiteData deve ser usado dentro de SiteProvider');
  return ctx;
}

export { fileUrl };