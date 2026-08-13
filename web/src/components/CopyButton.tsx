import { useState } from 'react';

export function CopyButton({ value, label = 'Copiar link' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button className="btn btn--ghost" onClick={copy}>
      {copied ? 'Copiado ✓' : label}
    </button>
  );
}