import { useState, FormEvent } from 'react';
import { useSiteData } from '../../components/public/SiteProvider';
import { calculateIRPF, parseCurrency, type IRPFInput, type IRPFResult } from '../../lib/irpfCalculator';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatCurrencyInput(value: string): string {
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  const formatted = (parseInt(numeric, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  return formatted;
}

function formatNumberInput(value: string): string {
  return value.replace(/\D/g, '');
}

export function CalculadoraIRPFPage() {
  useSiteData();

  const [salario, setSalario] = useState('');
  const [dependentes, setDependentes] = useState('');
  const [outrasDeducoes, setOutrasDeducoes] = useState('');
  const [previdenciaOficial, setPrevidenciaOficial] = useState('');
  const [previdenciaPrivada, setPrevidenciaPrivada] = useState('');
  const [pensaoAlimenticia, setPensaoAlimenticia] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<IRPFResult | null>(null);

  const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setSalario(formatted);
    setErrors(prev => ({ ...prev, salario: '' }));
  };

  const handleDependentesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberInput(e.target.value);
    const num = formatted ? Math.min(99, Math.max(0, parseInt(formatted, 10))) : '';
    setDependentes(num.toString());
    setErrors(prev => ({ ...prev, dependentes: '' }));
  };

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    key: string,
  ) => {
    const formatted = formatCurrencyInput(e.target.value);
    setter(formatted);
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const salarioNum = parseCurrency(salario);
    if (!salario || salarioNum <= 0) errs.salario = 'Informe um salário maior que zero';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const input: IRPFInput = {
      salarioMensal: parseCurrency(salario),
      dependentes: parseInt(dependentes || '0', 10),
      outrasDeducoes: parseCurrency(outrasDeducoes),
      previdenciaOficial: parseCurrency(previdenciaOficial),
      previdenciaPrivada: parseCurrency(previdenciaPrivada),
      pensaoAlimenticia: parseCurrency(pensaoAlimenticia),
    };

    const calculated = calculateIRPF(input);
    setResult(calculated);
  };

  const handleClear = () => {
    setSalario('');
    setDependentes('');
    setOutrasDeducoes('');
    setPrevidenciaOficial('');
    setPrevidenciaPrivada('');
    setPensaoAlimenticia('');
    setErrors({});
    setResult(null);
  };

  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">Calculadora de Imposto de Renda Pessoal</h1>
          <p className="mt-2 text-blue-100">Calcule uma estimativa do seu IRPF mensal e anual de forma rápida e simples.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-800">Dados para cálculo</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Salário bruto mensal *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={salario}
                    onChange={handleSalarioChange}
                    placeholder="0,00"
                    inputMode="decimal"
                    maxLength={15}
                    aria-invalid={!!errors.salario}
                  />
                </div>
                {errors.salario && <p className="mt-1 text-sm font-medium text-red-600">{errors.salario}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Dependentes</label>
                <input
                  type="text"
                  className="text-input"
                  value={dependentes}
                  onChange={handleDependentesChange}
                  placeholder="0"
                  aria-invalid={!!errors.dependentes}
                />
                {errors.dependentes && <p className="mt-1 text-sm font-medium text-red-600">{errors.dependentes}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Previdência oficial (mensal)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={previdenciaOficial}
                    onChange={(e) => handleCurrencyChange(e, setPrevidenciaOficial, 'previdenciaOficial')}
                    placeholder="0,00"
                    inputMode="decimal"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Previdência privada (mensal)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={previdenciaPrivada}
                    onChange={(e) => handleCurrencyChange(e, setPrevidenciaPrivada, 'previdenciaPrivada')}
                    placeholder="0,00"
                    inputMode="decimal"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Pensão alimentícia (mensal)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={pensaoAlimenticia}
                    onChange={(e) => handleCurrencyChange(e, setPensaoAlimenticia, 'pensaoAlimenticia')}
                    placeholder="0,00"
                    inputMode="decimal"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Outras deduções (mensal)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={outrasDeducoes}
                    onChange={(e) => handleCurrencyChange(e, setOutrasDeducoes, 'outrasDeducoes')}
                    placeholder="0,00"
                    inputMode="decimal"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <button type="submit" className="btn btn--primary flex-1">
              Calcular IRPF
            </button>
            <button type="button" className="btn btn--ghost flex-1" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-6 shadow-sm">
            <h3 className="mb-4 text-center text-xl font-bold text-brand-blue">Sua estimativa de IRPF</h3>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Salário informado</dt>
                <dd className="font-bold text-slate-800">{formatCurrency(result.salarioMensal)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Salário anual</dt>
                <dd className="font-bold text-brand-blue">{formatCurrency(result.salarioAnual)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Total de deduções</dt>
                <dd className="font-bold text-slate-800">{formatCurrency(result.totalDeducoes)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Base de cálculo anual</dt>
                <dd className="font-bold text-brand-blue">{formatCurrency(result.baseCalculoAnual)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">IRRF anual</dt>
                <dd className="font-bold text-red-600">{formatCurrency(result.irrfAnual)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">IRRF mensal</dt>
                <dd className="font-bold text-red-600">{formatCurrency(result.irrfMensal)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Aliquota efetiva</dt>
                <dd className="font-bold text-slate-800">{result.aliquotaEfetiva.toFixed(2)}%</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Salário líquido mensal</dt>
                <dd className="font-bold text-green-700">{formatCurrency(result.salarioLiquidoMensal)}</dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-500">Dedução por dependentes</dt>
                <dd className="font-bold text-slate-800">{formatCurrency(result.deducoes.dependentes)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-500">Dedução previdência oficial</dt>
                <dd className="font-bold text-slate-800">{formatCurrency(result.deducoes.previdenciaOficial)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-500">Dedução previdência privada</dt>
                <dd className="font-bold text-slate-800">{formatCurrency(result.deducoes.previdenciaPrivada)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-500">Dedução pensão alimentícia</dt>
                <dd className="font-bold text-slate-800">{formatCurrency(result.deducoes.pensaoAlimenticia)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <dt className="text-sm text-slate-500">Outras deduções</dt>
                <dd className="font-bold text-slate-800">{formatCurrency(result.deducoes.outrasDeducoes)}</dd>
              </div>
            </div>

            <p className="mt-5 text-xs text-slate-500 text-center">
              Os valores apresentados são estimativas e podem variar conforme as regras oficiais de IRPF,
              bem como outras rendas, despesas e condições individuais. Consulte um contador para a avaliação completa.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
