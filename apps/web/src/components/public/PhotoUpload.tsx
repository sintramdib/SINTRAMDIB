import { useRef, useState } from 'react';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

interface Props {
  onChange: (dataUrl: string | null) => void;
}

export function PhotoUpload({ onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (file?: File | null) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('Formato de imagem inválido. Use PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Foto muito grande. O limite é 5 MB.');
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onChange(dataUrl);
      setBusy(false);
    };
    reader.onerror = () => {
      setError('Não foi possível ler a imagem.');
      setBusy(false);
    };
    reader.readAsDataURL(file);
  };

  const remove = () => {
    setPreview(null);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200">
        {preview ? (
          <img src={preview} alt="Prévia" className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-full w-full place-items-center text-3xl text-slate-400"
            aria-label="Adicionar foto"
          >
            {busy ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-blue" />
            ) : (
              '📷'
            )}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded bg-brand-blue px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-blueDark"
        >
          {preview ? 'Alterar' : 'Adicionar foto'}
        </button>
        {preview && (
          <button
            type="button"
            onClick={remove}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Remover
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          capture="user"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <p className="mt-1 text-xs text-slate-400">Máx. 5 MB · PNG, JPG ou WEBP</p>
      {error && <p className="mt-1 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}