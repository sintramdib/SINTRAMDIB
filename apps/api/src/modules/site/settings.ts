import { z } from 'zod';
import { prisma } from '../../lib/prisma';

/** Chaves de configurações consumidas pelo site público. */
export const SETTING_KEYS = [
  'site_name',
  'site_short',
  'site_legal_name',
  'site_addr',
  'site_email',
  'site_whatsapp',
  'site_whatsapp_display',
  'site_phone1',
  'site_phone2',
  'site_facebook',
  'site_instagram',
  'site_youtube',
  'site_footer_about',
  'hero_headline',
  'hero_subtitle',
] as const;

export const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: 'Sindicato STICOMBE',
  site_short: 'STICOMBE',
  site_legal_name: 'Sindicato dos Trabalhadores nas Indústrias da Construção e do Mobiliário de Brasília',
  site_addr: 'SCRN 706/707 Bloco B - Número 12 - Cep: 70740-620 - Brasília-DF',
  site_email: 'sticombe@sticombe.org.br',
  site_whatsapp: '556133491606',
  site_whatsapp_display: '(61) 3349-1606',
  site_phone1: '(61) 3347-8833',
  site_phone2: '(61) 3349-1606',
  site_facebook: 'http://www.facebook.com/sticombebrasilia',
  site_instagram: 'http://www.facebook.com/sticombebrasilia',
  site_youtube: 'https://www.youtube.com/@sticombebrasilia',
  site_footer_about: 'Defendemos os direitos dos trabalhadores da construção civil e do mobiliário.',
  hero_headline: 'Defendendo os direitos dos trabalhadores da construção',
  hero_subtitle: 'O sindicato atua na base territorial do DF e entorno pelos direitos da categoria.',
};

export async function ensureDefaultSettings() {
  const rows = SETTING_KEYS.map((key) => ({
    key,
    value: DEFAULT_SETTINGS[key] ?? '',
  }));
  await prisma.siteSetting.createMany({ data: rows, skipDuplicates: true });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany();
  const out: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    const found = rows.find((r) => r.key === key);
    out[key] = found?.value ?? DEFAULT_SETTINGS[key] ?? '';
  }
  return out;
}

/** Atualiza parcialmente as configurações (valores validados/sanitizados). */
export async function updateSettings(body: Record<string, unknown>) {
  const entries = Object.entries(body)
    .filter(([k, v]) => (SETTING_KEYS as readonly string[]).includes(k))
    .map(([k, v]) => ({ key: k, value: typeof v === 'string' ? v.trim().slice(0, 400) : '' }));

  await Promise.all(
    entries.map((e) =>
      prisma.siteSetting.upsert({
        where: { key: e.key },
        update: { value: e.value },
        create: { key: e.key, value: e.value, group: 'geral' },
      }),
    ),
  );
  return getAllSettings();
}

export const settingsUpdateSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]).catch(''));