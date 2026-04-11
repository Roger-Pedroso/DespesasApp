/**
 * Utilitários de data — centraliza formatação e construção de strings de data
 */

/** Formata número para 2 dígitos: 5 → "05" */
export const pad2 = (value) => String(value).padStart(2, '0');

/** Constrói string YYYY-MM a partir de ano e mês numéricos */
export const buildAnoMes = (ano, mes) => `${ano}-${pad2(mes)}`;

/** Retorna data de hoje como string ISO YYYY-MM-DD */
export const hojeISO = () => new Date().toISOString().split('T')[0];

/** Formata string ISO para data no formato pt-BR (DD/MM/AAAA) */
export const formatarDataPtBR = (isoDateStr) =>
  new Date(isoDateStr + 'T00:00:00').toLocaleDateString('pt-BR');

/** Formata string ISO para data com dia da semana abreviado (ex: "qua., 05 de abr.") */
export const formatarDiaComSemana = (isoDateStr) =>
  new Date(isoDateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
