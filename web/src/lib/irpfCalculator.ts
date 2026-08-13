/**
 * Lógica de cálculo do Imposto de Renda Pessoa Física (IRPF) separada da interface.
 * As regras de IRRF podem ser atualizadas aqui quando houver mudança nas tabelas oficiais.
 */

export interface IRPFInput {
  salarioMensal: number;
  dependentes: number;
  outrasDeducoes: number;
  previdenciaOficial: number;
  previdenciaPrivada: number;
  pensaoAlimenticia: number;
}

export interface IRPFResult {
  salarioMensal: number;
  salarioAnual: number;
  totalDeducoes: number;
  baseCalculoAnual: number;
  irrfAnual: number;
  irrfMensal: number;
  salarioLiquidoMensal: number;
  aliquotaEfetiva: number;
  deducoes: {
    dependentes: number;
    previdenciaOficial: number;
    previdenciaPrivada: number;
    pensaoAlimenticia: number;
    outrasDeducoes: number;
  };
}

/**
 * Tabela IRRF 2024 (podem ser atualizadas quando houver mudança oficial)
 */
const IRRF_TABLE = [
  { limite: 2259.20, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
  { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { limite: Infinity, aliquota: 0.275, deducao: 896.00 },
];

/**
 * Valor de dedução por dependente (2024)
 */
const DEPENDENTE_DEDUCAO = 189.59;

/**
 * Limite de dedução de previdência privada (12% do salário anual)
 */
const PREVIDENCIA_PRIVADA_LIMITE_PORCENTO = 0.12;

function calculateIRRF(baseAnual: number): number {
  for (const bracket of IRRF_TABLE) {
    if (baseAnual <= bracket.limite) {
      const imposto = baseAnual * bracket.aliquota - bracket.deducao;
      return Math.max(0, imposto);
    }
  }
  // Último bracket
  const lastBracket = IRRF_TABLE[IRRF_TABLE.length - 1];
  return Math.max(0, baseAnual * lastBracket.aliquota - lastBracket.deducao);
}

export function calculateIRPF(input: IRPFInput): IRPFResult {
  const { salarioMensal, dependentes, outrasDeducoes, previdenciaOficial, previdenciaPrivada, pensaoAlimenticia } = input;

  const salarioAnual = salarioMensal * 12;

  // Cálculo das deduções
  const deducaoDependentes = dependentes * DEPENDENTE_DEDUCAO * 12;
  const deducaoPrevidenciaOficial = Math.min(previdenciaOficial * 12, salarioAnual); // Não pode exceder o salário
  
  // Previdência privada: limite de 12% do salário anual
  const limitePrevidenciaPrivada = salarioAnual * PREVIDENCIA_PRIVADA_LIMITE_PORCENTO;
  const deducaoPrevidenciaPrivada = Math.min(previdenciaPrivada * 12, limitePrevidenciaPrivada);
  
  const deducaoPensaoAlimenticia = pensaoAlimenticia * 12;
  const deducaoOutras = outrasDeducoes * 12;

  const totalDeducoes = deducaoDependentes + deducaoPrevidenciaOficial + deducaoPrevidenciaPrivada + deducaoPensaoAlimenticia + deducaoOutras;
  
  const baseCalculoAnual = Math.max(0, salarioAnual - totalDeducoes);
  const irrfAnual = calculateIRRF(baseCalculoAnual);
  const irrfMensal = irrfAnual / 12;

  const salarioLiquido = salarioMensal - irrfMensal;
  
  const aliquotaEfetiva = salarioAnual > 0 ? (irrfAnual / salarioAnual) * 100 : 0;

  return {
    salarioMensal,
    salarioAnual,
    totalDeducoes,
    baseCalculoAnual,
    irrfAnual,
    irrfMensal,
    salarioLiquidoMensal: Math.max(0, salarioLiquido),
    aliquotaEfetiva,
    deducoes: {
      dependentes: deducaoDependentes,
      previdenciaOficial: deducaoPrevidenciaOficial,
      previdenciaPrivada: deducaoPrevidenciaPrivada,
      pensaoAlimenticia: deducaoPensaoAlimenticia,
      outrasDeducoes: deducaoOutras,
    },
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
}