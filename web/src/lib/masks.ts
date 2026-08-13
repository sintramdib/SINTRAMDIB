export function digitsOnly(v: string): string {
  return (v ?? '').replace(/\D/g, '');
}

/** Formata dígitos com um template de `#` para dígitos. */
function maskDigits(digits: string, template: string, placeholder: string): string {
  let out = '';
  let d = 0;
  for (const ch of template) {
    if (ch === placeholder) {
      if (d >= digits.length) break;
      out += digits[d];
      d++;
    } else if (ch === ')') {
      out += ')';
    } else if (ch === '(') {
      out += '(';
    } else {
      out += ch;
    }
  }
  return out;
}

export function maskCpf(v: string): string {
  return maskDigits(digitsOnly(v), '###.###.###-##', '#').slice(0, 14);
}

export function maskCep(v: string): string {
  return maskDigits(digitsOnly(v), '#####-###', '#').slice(0, 9);
}

export function maskPhone(v: string): string {
  const d = digitsOnly(v);
  if (d.length <= 10) return maskDigits(d, '(##) ####-####', '#').slice(0, 14);
  return maskDigits(d, '(##) #####-####', '#').slice(0, 15);
}

export function maskRg(v: string): string {
  // RG aceita letras e dígitos, sem máscara fixa — apenas limita e mantém alfanuméricos.
  return (v ?? '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20).toUpperCase();
}