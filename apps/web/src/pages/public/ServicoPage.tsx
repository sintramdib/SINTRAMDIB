import { useParams } from 'react-router-dom';
import { ContentPlaceholder } from '../../components/public/ContentPlaceholder';

const TITLES: Record<string, { t: string; d: string }> = {
  homologacao: {
    t: 'Carteirinha Digital / Homologação',
    d: 'Emita sua carteirinha digital e confira as informações sobre homologação.',
  },
  agendamento: {
    t: 'Agendamento Médico / Odontológico',
    d: 'Agende consultas médicas e odontológicas pelos convênios do sindicato.',
  },
};

export function ServicoPage() {
  const { slug = 'servico' } = useParams<{ slug: string }>();
  const meta = TITLES[slug] ?? { t: 'Serviço', d: 'Este serviço está sendo estruturado.' };
  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">{meta.t}</h1>
          <p className="mt-2 text-blue-100">{meta.d}</p>
        </div>
      </div>
      <ContentPlaceholder title={meta.t} description={meta.d} />
    </>
  );
}