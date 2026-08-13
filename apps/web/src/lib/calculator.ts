/**
 * Lógica de cálculo do 13º salário separada da interface.
 * As regras de INSS/IRRF podem ser atualizadas aqui quando houver mudança nas tabelas oficiais.
 */

export interface CalculatorInput {
  salarioBruto: number;
  mesesTrabalhados: number;
  parcela: 'primeira' | 'segunda' | 'completo';
}

export interface CalculatorResult {
  salarioInformado: number;
  mesesTrabalhados: number;
  decimoTerceiroBruto: number;
  primeiraParcela: number;
  inss: number;
  irrf: number;
  segundaParcela: number;
  decimoTerceiroCompleto: number;
  totalLiquidoEstimado: number;
}

/**
 * Tabelas INSS 2024 (podem ser atualizadas quando houver mudança oficial)
 */
const INSS_TABLE = [
  { limite: 1412.00, aliquota: 0.075 },
  { limite: 2666.68, aliquota: 0.09 },
  { limite: 4000.03, aliquota: 0.12 },
  { limite: 7786.02, aliquota: 0.14 },
];

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
  return Math.min(inss, INSS_TABLE[INSS_TABLE.length - 1].limite * INSS_TABLE[INSS_TABLE.length - 1].aliquota);
}

function calculateIRRF(base: number): number {
  let irrf = 0;
  for (const bracket of IRRF_TABLE) {
    if (base <= bracket.limite) {
      irrf = base * bracket.aliquota - bracket.deducao;
      break;
    }
  }
  return Math.max(0, irrf);
}

export function calculate13thSalary(input: CalculatorInput): CalculatorResult {
  const { salarioBruto, mesesTrabalhados, parcela } = input;

  // Cálculo base do 13º bruto
  const decimoTerceiroBruto = (salarioBruto / 12) * mesesTrabalhados;
  const primeiraParcela = decimoTerceiroBruto / 2;

  let inss = 0;
  let irrf = 0;
  let segundaParcela = 0;
  let decimoTerceiroCompleto = decimoTerceiroBruto;
  let totalLiquidoEstimado = 0;

  switch (parcela) {
    case 'primeira':
      // 1ª parcela: metade do 13º bruto, sem descontos
      totalLiquidoEstimado = primeiraParcela;
      break;

    case 'segunda':
      // 2ª parcela: metade restante menos INSS e IRRF sobre o total do 13º
      inss = calculateINSS(decimoTerceiroBruto);
      const baseIrrf = decimoTerceiroBruto - inss;
      irrf = calculateIRRF(baseIrrf);
      segundaParcela = primeiraParcela - inss - irrf;
      totalLiquidoEstimado = segundaParcela;
      decimoTerceiroCompleto = decimoTerceiroBruto;
      break;

    case 'completo':
      // 13º completo: mostrar tudo
      inss = calculateINSS(decimoTerceiroBruto);
      const baseIrrfCompleto = decimoTerceiroBruto - inss;
      irrf = calculateIRRF(baseIrrfCompleto);
      segundaParcela = primeiraParcela - inss - irrf;
      totalLiquidoEstimado = primeiraParcela + segundaParcela;
      decimoTerceiroCompleto = decimoTerceiroBruto;
      break;
  }

  return {
    salarioInformado: salarioBruto,
    mesesTrabalhados,
    decimoTerceiroBruto,
    primeiraParcela,
    inss,
    irrf,
    segundaParcela: Math.max(0, segundaParcela),
    decimoTerceiroCompleto,
    totalLiquidoEstimado: Math.max(0, totalLiquidoEstimado),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
}