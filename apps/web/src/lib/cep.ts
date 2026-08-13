export interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Consulta ViaCEP. Em caso de erro ou CEP inválido, resolve com `null`
 * para não quebrar o preenchimento do formulário.
 */
export async function fetchCep(cep: string): Promise<CepResult | null> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    return null;
  }
}