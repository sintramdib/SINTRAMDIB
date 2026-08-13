import { useState, FormEvent } from 'react';
import { useSiteData } from '../../components/public/SiteProvider';
import { calculate13thSalary, parseCurrency, type CalculatorInput } from '../../lib/calculator';

type Parcela = 'primeira' | 'segunda' | 'completo';

export function Calculadora13Page() {
  useSiteData();

  const [salario, setSalario] = useState('');
  const [meses, setMeses] = useState('12');
  const [parcela, setParcela] = useState<Parcela>('completo');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    salarioInformado: number;
    mesesTrabalhados: number;
    decimoTerceiroBruto: number;
    primeiraParcela: number;
    inss: number;
    irrf: number;
    segundaParcela: number;
    decimoTerceiroCompleto: number;
    totalLiquidoEstimado: number;
  } | null>(null);

  const formatSalario = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (!numeric) return '';
    const formatted = (parseInt(numeric, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return formatted;
  };

  const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSalario(e.target.value);
    setSalario(formatted);
    setErrors(prev => ({ ...prev, salario: '' }));
  };

  const handleMesesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const num = value ? Math.min(12, Math.max(1, parseInt(value, 10))) : '';
    setMeses(num.toString());
    setErrors(prev => ({ ...prev, meses: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const salarioNum = parseCurrency(salario);
    const mesesNum = parseInt(meses, 10);

    if (!salario || salarioNum <= 0) errs.salario = 'Informe um salário maior que zero';
    if (!meses || mesesNum < 1) errs.meses = 'Meses deve ser no mínimo 1';
    if (mesesNum > 12) errs.meses = 'Meses não pode ser maior que 12';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const input: CalculatorInput = {
      salarioBruto: parseCurrency(salario),
      mesesTrabalhados: parseInt(meses, 10),
      parcela,
    };

    const calculated = calculate13thSalary(input);
    setResult(calculated);
  };

  const handleClear = () => {
    setSalario('');
    setMeses('12');
    setParcela('completo');
    setErrors({});
    setResult(null);
  };

  const format = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">Calculadora de 13º Salário</h1>
          <p className="mt-2 text-blue-100">Calcule uma estimativa do seu décimo terceiro salário de forma rápida e simples.</p>
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
                <label className="block text-sm font-medium text-slate-600">Meses trabalhados no ano *</label>
                <input
                  type="number"
                  className="text-input"
                  value={meses}
                  onChange={handleMesesChange}
                  min={1}
                  max={12}
                  placeholder="12"
                  aria-invalid={!!errors.meses}
                />
                {errors.meses && <p className="mt-1 text-sm font-medium text-red-600">{errors.meses}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-slate-600">Parcela a calcular</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {(['primeira', 'segunda', 'completo'] as Parcela[]).map((p) => (
                  <label
                    key={p}
                    className={`flex items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition ${parcela === p
                      ? 'border-brand-blue bg-brand-blue/5'
                      : 'border-slate-200 hover:border-brand-blue'}`}
                  >
                    <input
                      type="radio"
                      name="parcela"
                      value={p}
                      checked={parcela === p}
                      onChange={() => setParcela(p)}
                      className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="font-medium text-slate-700 capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="btn btn--primary flex-1"
              disabled={parcela === 'segunda' && !result}
            >
              Calcular 13º
            </button>
            <button type="button" className="btn btn--ghost flex-1" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-6 shadow-sm">
            <h3 className="mb-4 text-center text-xl font-bold text-brand-blue">Seu 13º salário estimado</h3>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Salário informado</dt>
                <dd className="font-bold text-slate-800">{format(result.salarioInformado)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Meses trabalhados</dt>
                <dd className="font-bold text-slate-800">{result.mesesTrabalhados}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">13º salário bruto</dt>
                <dd className="font-bold text-brand-blue">{format(result.decimoTerceiroBruto)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">1ª parcela</dt>
                <dd className="font-bold text-slate-800">{format(result.primeiraParcela)}</dd>
              </div>

              {parcela !== 'primeira' && (
                <>
                  <div className="rounded-lg bg-white p-3">
                    <dt className="text-sm text-slate-500">INSS</dt>
                    <dd className="font-bold text-red-600">- {format(result.inss)}</dd>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <dt className="text-sm text-slate-500">IRRF</dt>
                    <dd className="font-bold text-red-600">- {format(result.irrf)}</dd>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <dt className="text-sm text-slate-500">2ª parcela</dt>
                    <dd className="font-bold text-slate-800">{format(result.segundaParcela)}</dd>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <dt className="text-sm text-slate-500">Total líquido estimado</dt>
                    <dd className="font-bold text-green-700">{format(result.totalLiquidoEstimado)}</dd>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <dt className="text-sm text-slate-500">13º completo</dt>
                    <dd className="font-bold text-brand-blue">{format(result.decimoTerceiroCompleto)}</dd>
                  </div>
                </>
              )}
            </dl>

            <p className="mt-5 text-xs text-slate-500 text-center">
              Os valores apresentados são estimativas e podem variar conforme as regras de INSS, IRRF, remuneração variável,
              adicionais, faltas, afastamentos e outras condições trabalhistas.
            </p>
          </div>
        )}
      </div>
    </>
  );
}