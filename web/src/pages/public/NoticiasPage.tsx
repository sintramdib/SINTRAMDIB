import { ContentPlaceholder } from '../../components/public/ContentPlaceholder';

export function NoticiasPage() {
  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">Notícias</h1>
          <p className="mt-2 text-blue-100">Fique por dentro das últimas notícias da categoria.</p>
        </div>
      </div>
      <ContentPlaceholder
        title="Mural de Notícias"
        description="Artigos recentes com foto, data e título. A listagem será alimentada pela dashboard."
      />
    </>
  );
}