import { ContentPlaceholder } from '../../components/public/ContentPlaceholder';

export function ConvencoesPage() {
  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">Convenções Coletivas</h1>
          <p className="mt-2 text-blue-100">Acesse e baixe as convenções e acordos coletivos em PDF.</p>
        </div>
      </div>
      <ContentPlaceholder
        title="Convenções e Acordos Coletivos"
        description="Aqui serão listadas as convenções coletivas por categoria com download de PDFs."
      />
    </>
  );
}