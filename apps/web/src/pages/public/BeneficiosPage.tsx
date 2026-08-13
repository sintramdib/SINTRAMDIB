import { ContentPlaceholder } from '../../components/public/ContentPlaceholder';

export function BeneficiosPage() {
  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">Benefícios / Convênios</h1>
          <p className="mt-2 text-blue-100">Vantagens exclusivas para os trabalhadores associados.</p>
        </div>
      </div>
      <ContentPlaceholder
        title="Convênios & Parceiros"
        description="Carteirinha digital, agendamento médico e odontológico, entre outros convênios."
      />
    </>
  );
}