type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'DISABLED';
type BannerStatus = 'ACTIVE' | 'INACTIVE';

const newsTone: Record<NewsStatus, string> = {
  PUBLISHED: 'badge--active',
  DRAFT: 'badge--warn',
  SCHEDULED: 'badge--info',
  DISABLED: 'badge--danger',
};

const bannerTone: Record<BannerStatus, string> = {
  ACTIVE: 'badge--active',
  INACTIVE: 'badge--danger',
};

const newsLabel: Record<NewsStatus, string> = {
  PUBLISHED: 'Publicada',
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  DISABLED: 'Desativada',
};

const bannerLabel: Record<BannerStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
};

interface Props {
  status: NewsStatus | BannerStatus;
  kind: 'news' | 'banner';
}

export function ContentBadge({ status, kind }: Props) {
  const tone = kind === 'news' ? newsTone[status as NewsStatus] : bannerTone[status as BannerStatus];
  const label = kind === 'news' ? newsLabel[status as NewsStatus] : bannerLabel[status as BannerStatus];
  return <span className={`badge ${tone ?? 'badge--neutral'}`}>{label}</span>;
}