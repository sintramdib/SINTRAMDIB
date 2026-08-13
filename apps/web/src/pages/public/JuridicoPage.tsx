import { ContentPlaceholder } from '../../components/public/ContentPlaceholder';

export function JuridicoPage() {
  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">Jurídico</h1>
          <p className="mt-2 text-blue-100">Assistência jurídica para os trabalhadores associados.</p>
        </div>
      </div>
      <ContentPlaceholder
        title="Consultoria Jurídica"
        description="Informações e contato da assessoria jurídica do sindicato para os associados."
      />
    </>
  );
}