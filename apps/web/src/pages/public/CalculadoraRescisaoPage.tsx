import { useState, FormEvent } from 'react';
import { useSiteData } from '../../components/public/SiteProvider';
import {
  calculateRescisao,
  parseCurrency,
  type RescisaoInput,
  type RescisaoResult,
  type TipoRescisao,
  type AvisoPrevio,
} from '../../lib/rescisaoCalculator';

function formatCurrencyInput(value: string): string {
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  const formatted = (parseInt(numeric, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  return formatted;
}

function formatNumberInput(value: string): string {
  return value.replace(/\D/g, '');
}

export function CalculadoraRescisaoPage() {
  useSiteData();

  const [salario, setSalario] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [dataDesligamento, setDataDesligamento] = useState('');
  const [tipoRescisao, setTipoRescisao] = useState<TipoRescisao>('sem_justa_causa');
  const [avisoPrevio, setAvisoPrevio] = useState<AvisoPrevio>('trabalhado');
  const [feriasVencidas, setFeriasVencidas] = useState(false);
  const [dependentes, setDependentes] = useState('');
  const [outrasProventos, setOutrasProventos] = useState('');
  const [outrasDescontos, setOutrasDescontos] = useState('');
  const [fgtsSaldo, setFgtsSaldo] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RescisaoResult | null>(null);

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    key: string,
  ) => {
    const formatted = formatCurrencyInput(e.target.value);
    setter(formatted);
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    key: string,
  ) => {
    const formatted = formatNumberInput(e.target.value);
    setter(formatted);
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const salarioNum = parseCurrency(salario);
    if (!salario || salarioNum <= 0) errs.salario = 'Informe um salário maior que zero';
    if (!dataAdmissao) errs.dataAdmissao = 'Informe a data de admissão';
    if (!dataDesligamento) errs.dataDesligamento = 'Informe a data de desligamento';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const input: RescisaoInput = {
      salarioBrutoMensal: parseCurrency(salario),
      dataAdmissao,
      dataDesligamento,
      tipoRescisao,
      avisoPrevio,
      feriasVencidas,
      dependentes: parseInt(dependentes || '0', 10),
      outrasVerbasProventos: parseCurrency(outrasProventos),
      outrasVerbasDescontos: parseCurrency(outrasDescontos),
      fgtsSaldo: parseCurrency(fgtsSaldo),
    };

    const calculated = calculateRescisao(input);
    setResult(calculated);
  };

  const handleClear = () => {
    setSalario('');
    setDataAdmissao('');
    setDataDesligamento('');
    setTipoRescisao('sem_justa_causa');
    setAvisoPrevio('trabalhado');
    setFeriasVencidas(false);
    setDependentes('');
    setOutrasProventos('');
    setOutrasDescontos('');
    setFgtsSaldo('');
    setErrors({});
    setResult(null);
  };

  const format = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const tipoOptions: { value: TipoRescisao; label: string }[] = [
    { value: 'sem_justa_causa', label: 'Demissão sem justa causa' },
    { value: 'justa_causa', label: 'Demissão por justa causa' },
    { value: 'pedido_demissao', label: 'Pedido de demissão' },
    { value: 'rescisao_acordo', label: 'Rescisão por acordo' },
    { value: 'prazo_determinado', label: 'Término de contrato por prazo determinado' },
  ];

  const avisoOptions: { value: AvisoPrevio; label: string }[] = [
    { value: 'trabalhado', label: 'Trabalhado' },
    { value: 'indenizado', label: 'Indenizado' },
    { value: 'dispensado', label: 'Dispensado' },
  ];

  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-extrabold">Calculadora de Rescisão</h1>
          <p className="mt-2 text-blue-100">
            Calcule uma estimativa dos valores da rescisão do seu contrato de trabalho de forma rápida e simples.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-800">Dados para cálculo</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Tipo de desligamento *</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tipoOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition ${
                        tipoRescisao === opt.value
                          ? 'border-brand-blue bg-brand-blue/5'
                          : 'border-slate-200 hover:border-brand-blue'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoRescisao"
                        value={opt.value}
                        checked={tipoRescisao === opt.value}
                        onChange={() => setTipoRescisao(opt.value)}
                        className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="font-medium text-slate-700 text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Salário bruto mensal *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={salario}
                    onChange={(e) => handleCurrencyChange(e, setSalario, 'salario')}
                    placeholder="0,00"
                    inputMode="decimal"
                    maxLength={15}
                    aria-invalid={!!errors.salario}
                  />
                </div>
                {errors.salario && <p className="mt-1 text-sm font-medium text-red-600">{errors.salario}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Data de admissão *</label>
                <input
                  type="date"
                  className="text-input"
                  value={dataAdmissao}
                  onChange={(e) => setDataAdmissao(e.target.value)}
                  aria-invalid={!!errors.dataAdmissao}
                />
                {errors.dataAdmissao && <p className="mt-1 text-sm font-medium text-red-600">{errors.dataAdmissao}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Data de desligamento *</label>
                <input
                  type="date"
                  className="text-input"
                  value={dataDesligamento}
                  onChange={(e) => setDataDesligamento(e.target.value)}
                  aria-invalid={!!errors.dataDesligamento}
                />
                {errors.dataDesligamento && (
                  <p className="mt-1 text-sm font-medium text-red-600">{errors.dataDesligamento}</p>
                )}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Aviso prévio *</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {avisoOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition ${
                        avisoPrevio === opt.value
                          ? 'border-brand-blue bg-brand-blue/5'
                          : 'border-slate-200 hover:border-brand-blue'
                      }`}
                    >
                      <input
                        type="radio"
                        name="avisoPrevio"
                        value={opt.value}
                        checked={avisoPrevio === opt.value}
                        onChange={() => setAvisoPrevio(opt.value)}
                        className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="font-medium text-slate-700 capitalize text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Dependentes</label>
                <input
                  type="text"
                  className="text-input"
                  value={dependentes}
                  onChange={(e) => handleNumberChange(e, setDependentes, 'dependentes')}
                  placeholder="0"
                  aria-invalid={!!errors.dependentes}
                />
                {errors.dependentes && <p className="mt-1 text-sm font-medium text-red-600">{errors.dependentes}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Férias vencidas</label>
                <div className="flex items-center h-full pt-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={feriasVencidas}
                      onChange={(e) => setFeriasVencidas(e.target.checked)}
                      className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="font-medium text-slate-700">Tenho férias vencidas a receber</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Saldo da conta FGTS</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={fgtsSaldo}
                    onChange={(e) => handleCurrencyChange(e, setFgtsSaldo, 'fgtsSaldo')}
                    placeholder="0,00"
                    inputMode="decimal"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Outras verbas (proventos)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={outrasProventos}
                    onChange={(e) => handleCurrencyChange(e, setOutrasProventos, 'outrasProventos')}
                    placeholder="0,00"
                    inputMode="decimal"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-600">Outros descontos</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    className="text-input pl-7"
                    value={outrasDescontos}
                    onChange={(e) => handleCurrencyChange(e, setOutrasDescontos, 'outrasDescontos')}
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
              Calcular rescisão
            </button>
            <button type="button" className="btn btn--ghost flex-1" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-6 shadow-sm">
            <h3 className="mb-4 text-center text-xl font-bold text-brand-blue">
              {result.isento ? 'Rescisão por justa causa' : 'Estimativa da rescisão'}
            </h3>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Saldo de salário</dt>
                <dd className="font-bold text-slate-800">{format(result.saldoSalario)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Aviso prévio</dt>
                <dd className="font-bold text-slate-800">{format(result.avisoPrevio)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">13º salário proporcional</dt>
                <dd className="font-bold text-brand-blue">{format(result.decimoTerceiroProporcional)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Férias proporcionais + 1/3</dt>
                <dd className="font-bold text-slate-800">{format(result.feriasProporcionais)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Férias vencidas + 1/3</dt>
                <dd className="font-bold text-slate-800">{format(result.feriasVencidas)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">FGTS (contribuições + saque)</dt>
                <dd className="font-bold text-slate-800">{format(result.fgts)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Multa de 40% do FGTS</dt>
                <dd className="font-bold text-red-600">{format(result.multaFgts)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-sm text-slate-500">Total de proventos</dt>
                <dd className="font-bold text-green-700">{format(result.totalProventos)}</dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-500">INSS sobre a rescisão</dt>
                <dd className="font-bold text-red-600">- {format(result.deducoes.inss)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-500">IRRF sobre a rescisão</dt>
                <dd className="font-bold text-red-600">- {format(result.deducoes.irrf)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-500">Outros descontos</dt>
                <dd className="font-bold text-red-600">- {format(result.deducoes.outrasVerbasDescontos)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-500">Total de descontos</dt>
                <dd className="font-bold text-red-600">- {format(result.totalDescontos)}</dd>
              </div>
              <div className="rounded-lg bg-white p-3 sm:col-span-2">
                <dt className="text-sm text-slate-500">Meses trabalhados no ano</dt>
                <dd className="font-bold text-slate-800">{result.mesesTrabalhadosAno}</dd>
              </div>
              <div className="rounded-lg bg-white p-3 sm:col-span-2">
                <dt className="text-sm text-slate-500">Meses trabalhados no FGTS</dt>
                <dd className="font-bold text-slate-800">{result.mesesTrabalhadosFGTS}</dd>
              </div>
              <div className="rounded-lg bg-brand-blue/10 p-3 sm:col-span-2">
                <dt className="text-sm text-slate-600">Valor líquido estimado da rescisão</dt>
                <dd className="font-bold text-brand-blue text-lg">{format(result.valorLiquido)}</dd>
              </div>
            </div>

            <p className="mt-5 text-xs text-slate-500 text-center">
              Os valores apresentados são estimativas baseadas nas regras da CLT vigentes e podem variar de acordo com
              as condições específicas do contrato, FGTS real depositado, horas extras, adicionais, faltas e outras
              verbas. Consulte um contador ou advogado para a avaliação completa da sua rescisão.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
