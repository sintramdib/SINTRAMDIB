/**
 * Lógica de cálculo da rescisão de contrato de trabalho separada da interface.
 * As tabelas INSS/IRRF e as regras de FGTS podem ser atualizadas aqui quando houver mudança oficial.
 * Baseado nas regras da CLT vigentes. O resultado é uma ESTIMATIVA.
 */

export type TipoRescisao =
  | 'sem_justa_causa'
  | 'justa_causa'
  | 'pedido_demissao'
  | 'rescisao_acordo'
  | 'prazo_determinado';

export type AvisoPrevio = 'trabalhado' | 'indenizado' | 'dispensado';

export interface RescisaoInput {
  salarioBrutoMensal: number;
  dataAdmissao: string;
  dataDesligamento: string;
  tipoRescisao: TipoRescisao;
  avisoPrevio: AvisoPrevio;
  feriasVencidas: boolean;
  dependentes: number;
  outrasVerbasProventos: number;
  outrasVerbasDescontos: number;
  fgtsSaldo: number;
}

export interface DeducoesRescisao {
  inss: number;
  irrf: number;
  fgts: number;
  multaFgts: number;
  outrasVerbasDescontos: number;
}

export interface RescisaoResult {
  salarioBrutoMensal: number;
  saldoSalario: number;
  avisoPrevio: number;
  decimoTerceiroProporcional: number;
  feriasVencidas: number;
  feriasProporcionais: number;
  fgts: number;
  multaFgts: number;
  inss: number;
  irrf: number;
  totalProventos: number;
  totalDescontos: number;
  valorLiquido: number;
  mesesTrabalhadosAno: number;
  mesesTrabalhadosFGTS: number;
  deducoes: DeducoesRescisao;
  isento: boolean;
}

/**
 * Tabelas INSS 2024 (podem ser atualizadas quando houver mudança oficial)
 */
const INSS_TABLE = [
  { limite: 1412.0, aliquota: 0.075 },
  { limite: 2666.68, aliquota: 0.09 },
  { limite: 4000.03, aliquota: 0.12 },
  { limite: 7786.02, aliquota: 0.14 },
];

/**
 * Tabela IRRF 2024 (podem ser atualizadas quando houver mudança oficial)
 */
const IRRF_TABLE = [
  { limite: 2259.2, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
  { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { limite: Infinity, aliquota: 0.275, deducao: 896.0 },
];

const FGTS_ALIQUOTA = 0.08;
const FGTS_MULTA = 0.4;
const DEPENDENTE_DEDUCAO_MENSAL = 189.59;

const toDate = (value: string): Date => {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const diffDays = (a: Date, b: Date): number => {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

function countMonthsInclusive(start: Date, end: Date): number {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  return Math.max(0, months);
}

function calculateINSS(base: number): number {
  let inss = 0;
  let remaining = base;
  let previousLimit = 0;
  for (const bracket of INSS_TABLE) {
    const taxable = Math.min(remaining, bracket.limite - previousLimit);
    if (taxable <= 0) break;
    inss += taxable * bracket.aliquota;
    remaining -= taxable;
    previousLimit = bracket.limite;
    if (remaining <= 0) break;
  }
  const teto = INSS_TABLE[INSS_TABLE.length - 1].limite * INSS_TABLE[INSS_TABLE.length - 1].aliquota;
  return Math.min(inss, teto);
}

function calculateIRRF(base: number, dependentes: number): number {
  const deducaoDependentes = dependentes * DEPENDENTE_DEDUCAO_MENSAL * 12;
  const baseComDed = Math.max(0, base - deducaoDependentes);
  for (const bracket of IRRF_TABLE) {
    if (baseComDed <= bracket.limite) {
      return Math.max(0, baseComDed * bracket.aliquota - bracket.deducao);
    }
  }
  const last = IRRF_TABLE[IRRF_TABLE.length - 1];
  return Math.max(0, baseComDed * last.aliquota - last.deducao);
}

export function calculateRescisao(input: RescisaoInput): RescisaoResult {
  const {
    salarioBrutoMensal,
    dataAdmissao,
    dataDesligamento,
    tipoRescisao,
    avisoPrevio,
    feriasVencidas,
    dependentes,
    outrasVerbasProventos,
    outrasVerbasDescontos,
    fgtsSaldo,
  } = input;

  const adm = toDate(dataAdmissao);
  const deslig = toDate(dataDesligamento);

  // --- Saldo de salário: proporcional dos dias trabalhados no mês do desligamento ---
  const mesmoMesAdmissao = adm.getFullYear() === deslig.getFullYear() && adm.getMonth() === deslig.getMonth();
  let diasSaldo = 0;
  if (mesmoMesAdmissao) {
    diasSaldo = diffDays(adm, deslig) + 1;
  } else {
    const primeiroDiaMes = new Date(deslig.getFullYear(), deslig.getMonth(), 1);
    diasSaldo = diffDays(primeiroDiaMes, deslig) + 1;
  }
  const saldoSalario = (salarioBrutoMensal / 30) * Math.max(0, diasSaldo);

  // --- 13º salário proporcional ---
  const mesesAno = countMonthsInclusive(new Date(deslig.getFullYear(), 0, 1), deslig);
  const decimoTerceiroProporcional = (salarioBrutoMensal / 12) * Math.max(0, mesesAno);

  // --- Férias proporcionais + 1/3 ---
  const mesesFGTS = countMonthsInclusive(adm, deslig);
  const mesesFeriasProp = Math.min(mesesAno, 12);
  const feriasProporcionaisBase = (salarioBrutoMensal / 12) * mesesFeriasProp;
  const feriasProporcionais = feriasProporcionaisBase * (4 / 3);

  // --- Férias vencidas + 1/3 (apenas se direito ao 13º mês completo desde a última férias) ---
  const feriasVencidasCalc = feriasVencidas ? salarioBrutoMensal * (4 / 3) : 0;

  // --- Aviso prévio ---
  // Base: salário bruto médio (simplificado como salário bruto informado)
  let aviso = 0;
  if (avisoPrevio === 'trabalhado') {
    aviso = salarioBrutoMensal;
  } else if (avisoPrevio === 'indenizado') {
    aviso = salarioBrutoMensal;
  }
  // 'dispensado' => 0

  // --- FGTS ---
  const fgtsMeses = salarioBrutoMensal * FGTS_ALIQUOTA * mesesFGTS;
  const fgtsTotal = fgtsMeses + fgtsSaldo;

  // --- Multa de 40% sobre FGTS ---
  // Incide sobre o saldo da conta FGTS nas demissões sem justa causa e em prazo determinado
  let multaFgts = 0;
  if (tipoRescisao === 'sem_justa_causa' || tipoRescisao === 'prazo_determinado') {
    multaFgts = fgtsTotal * FGTS_MULTA;
  }

  // --- Cálculo dos proventos e descontos ---
  // Justa causa: isento de verbas indenizatórias
  const isJusta = tipoRescisao === 'justa_causa';

  let proventos =
    saldoSalario +
    aviso +
    decimoTerceiroProporcional +
    feriasVencidasCalc +
    feriasProporcionais +
    fgtsTotal +
    multaFgts +
    outrasVerbasProventos;

  if (isJusta) {
    proventos = 0;
  }

  // INSS e IRRF incidem sobre o total de verbas indenizatórias + salariais (base composta)
  let inss = 0;
  let irrf = 0;
  if (!isJusta) {
    const baseINSS = proventos;
    inss = calculateINSS(baseINSS);
    const baseIRRF = proventos - inss;
    irrf = calculateIRRF(baseIRRF, dependentes);
  }

  const totalProventos = Math.max(0, proventos);
  const totalDescontos = inss + irrf + outrasVerbasDescontos;
  const valorLiquido = Math.max(0, totalProventos - totalDescontos);

  return {
    salarioBrutoMensal,
    saldoSalario,
    avisoPrevio: aviso,
    decimoTerceiroProporcional,
    feriasVencidas: feriasVencidasCalc,
    feriasProporcionais,
    fgts: fgtsTotal,
    multaFgts,
    inss,
    irrf,
    totalProventos,
    totalDescontos,
    valorLiquido,
    mesesTrabalhadosAno: mesesAno,
    mesesTrabalhadosFGTS: mesesFGTS,
    deducoes: {
      inss,
      irrf,
      fgts: fgtsTotal,
      multaFgts,
      outrasVerbasDescontos,
    },
    isento: isJusta,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
}
