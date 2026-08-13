import { ContentPlaceholder } from '../../components/public/ContentPlaceholder';

export function ContatoPage() {
  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">Fale Conosco</h1>
          <p className="mt-2 text-blue-100">Entre em contato com o sindicato.</p>
        </div>
      </div>
      <ContentPlaceholder
        title="Contato"
        description="Formulário de contato, endereço, telefones e canais de atendimento serão exibidos aqui."
      />
    </>
  );
}