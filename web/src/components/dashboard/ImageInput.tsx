import { useRef, useState } from 'react';

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

interface Props {
  /** URL corrente da imagem já salva (para prévia). */
  currentUrl?: string | null;
  onChange: (dataUrl: string | null) => void;
  /* Usado para zerar quando "trocar" for explícito */
  label?: string;
}

export function ImageInput({ currentUrl, onChange, label = 'Selecionar imagem' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = (file?: File | null) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('Formato inválido. Use PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Imagem muito grande (máx. 5 MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      onChange(url);
    };
    reader.onerror = () => setError('Não foi possível ler a imagem.');
    reader.readAsDataURL(file);
  };

  const clear = () => {
    setPreview(null);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const shown = preview ?? currentUrl;

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="grid h-24 w-36 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {shown ? (
            <img src={shown} alt="Prévia" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400">Sem imagem</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => inputRef.current?.click()}>
            {preview || currentUrl ? 'Trocar imagem' : label}
          </button>
          {(preview || currentUrl) && (
            <button type="button" className="btn btn--danger-text btn--sm" onClick={clear}>
              Remover
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
        </div>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}