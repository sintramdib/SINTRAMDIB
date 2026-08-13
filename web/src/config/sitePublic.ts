export const union = {
  name: 'Sindicato STICOMBE',
  shortName: 'STICOMBE',
  legalName: 'Sindicato dos Trabalhadores nas Indústrias da Construção e do Mobiliário de Brasília',
  logoLabel: 'STICOMBE',
  logoSub: 'Sindicato dos Trabalhadores da Construção e do Mobiliário do DF',
  address: 'SCRN 706/707 Bloco B - Número 12 - Cep: 70740-620 - Brasília-DF',
  phones: ['(61) 3347-8833', '(61) 3349-1606', '(61) 3349-1656'],
  whatsapp: '556133491606',
  whatsappDisplay: '(61) 3349-1606',
  email: 'sticombe@sticombe.org.br',
  socials: {
    facebook: 'http://www.facebook.com/sticombebrasilia',
    instagram: 'http://www.facebook.com/sticombebrasilia',
    youtube: 'https://www.youtube.com/@sticombebrasilia',
    whatsapp: 'https://wa.me/556133491606',
  },
};

// Serviços / acesso rápido exibidos na home.
export const quickServices = [
  {
    title: 'Carteirinha Digital / Homologação',
    description: 'Emita sua carteirinha e confira informações sobre homologação.',
    href: '/servicos/homologacao',
    icon: '▷',
  },
  {
    title: 'Agendamento Médico / Odontológico',
    description: 'Agende consultas através dos convênios do sindicato.',
    href: '/servicos/agendamento',
    icon: '🩺',
  },
  {
    title: 'Consultoria Jurídica',
    description: 'Acompanhamento jurídico para os trabalhadores associados.',
    href: '/juridico',
    icon: '⚖',
  },
  {
    title: 'Calculadora de 13º',
    description: 'Calcule seu décimo terceiro salário.',
    href: '/convencoes',
    icon: '🧮',
  },
];

export const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'O Sindicato', href: '/sindicato' },
   { label: 'Calculadora de 13º', href: '/convencoes' },
   { label: 'Calculadora de Rescisão', href: '/calculadora-rescisao' },
   { label: 'Calculadora de IRPF', href: '/calculadora-irpf' },
  { label: 'Benefícios / Convênios', href: '/beneficios' },
  { label: 'Jurídico', href: '/juridico' },
  { label: 'Notícias', href: '/noticias' },
  { label: 'Fale Conosco', href: '/contato' },
];