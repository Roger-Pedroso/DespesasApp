/**
 * Dashboard e Insights - Dados agregados para análise
 */

import { handleError, logError } from '../utils/errorHandler';
import { getDatabase } from './database';

/**
 * Buscar tendência dos últimos 12 meses
 * @param {number} mes - Mês atual
 * @param {number} ano - Ano atual
 * @returns {array} - Array com totais por mês
 */
export const buscarTendencia12Meses = async (mes, ano) => {
  try {
    const database = await getDatabase();
    
    // Calcular range de 12 meses
    let anoInicio = ano;
    let mesInicio = mes - 11;
    if (mesInicio <= 0) {
      anoInicio -= 1;
      mesInicio += 12;
    }

    const resultado = await database.getAllAsync(
      `SELECT 
        ano, mes,
        SUM(valor) as total,
        COUNT(*) as quantidade
       FROM despesas
       WHERE (ano > ? OR (ano = ? AND mes >= ?)) AND (ano < ? OR (ano = ? AND mes <= ?))
       GROUP BY ano, mes
       ORDER BY ano ASC, mes ASC`,
      [anoInicio, anoInicio, mesInicio, ano, ano, mes]
    );

    return resultado || [];
  } catch (error) {
    const handled = handleError(error, 'buscarTendencia12Meses');
    logError(error, { action: 'buscarTendencia12Meses', mes, ano });
    throw handled;
  }
};

/**
 * Comparar mês atual com mês anterior
 * @param {number} mes - Mês atual
 * @param {number} ano - Ano atual
 * @returns {object} - Comparação
 */
export const compararMesAtualVsAnterior = async (mes, ano) => {
  try {
    const database = await getDatabase();

    // Calcular mês anterior
    let mesAnterior = mes - 1;
    let anoAnterior = ano;
    if (mesAnterior <= 0) {
      mesAnterior = 12;
      anoAnterior -= 1;
    }

    const mesAtual = await database.getFirstAsync(
      `SELECT 
        SUM(valor) as total,
        COUNT(*) as quantidade,
        AVG(valor) as media
       FROM despesas
       WHERE mes = ? AND ano = ?`,
      [mes, ano]
    );

    const mesAnt = await database.getFirstAsync(
      `SELECT 
        SUM(valor) as total,
        COUNT(*) as quantidade,
        AVG(valor) as media
       FROM despesas
       WHERE mes = ? AND ano = ?`,
      [mesAnterior, anoAnterior]
    );

    const totalAtual = mesAtual?.total || 0;
    const totalAnt = mesAnt?.total || 0;
    const variacao = totalAtual - totalAnt;
    const percentualVariacao = totalAnt > 0 ? (variacao / totalAnt) * 100 : 0;

    return {
      mesAtual: {
        total: totalAtual,
        quantidade: mesAtual?.quantidade || 0,
        media: mesAtual?.media || 0,
      },
      mesAnterior: {
        total: totalAnt,
        quantidade: mesAnt?.quantidade || 0,
        media: mesAnt?.media || 0,
      },
      variacao,
      percentualVariacao,
    };
  } catch (error) {
    const handled = handleError(error, 'compararMesAtualVsAnterior');
    logError(error, { action: 'compararMesAtualVsAnterior', mes, ano });
    throw handled;
  }
};

/**
 * Top N categorias com mais gasto
 * @param {number} mes - Mês
 * @param {number} ano - Ano
 * @param {number} limit - Quantos top items retornar (default 5)
 * @returns {array} - Top categorias
 */
export const buscarTopCategorias = async (mes, ano, limit = 5) => {
  try {
    const database = await getDatabase();

    const resultado = await database.getAllAsync(
      `SELECT 
        categoria,
        SUM(valor) as total,
        COUNT(*) as quantidade,
        AVG(valor) as media
       FROM despesas
       WHERE mes = ? AND ano = ?
       GROUP BY categoria
       ORDER BY total DESC
       LIMIT ?`,
      [mes, ano, limit]
    );

    return resultado || [];
  } catch (error) {
    const handled = handleError(error, 'buscarTopCategorias');
    logError(error, { action: 'buscarTopCategorias', mes, ano, limit });
    throw handled;
  }
};

/**
 * Prever gasto até fim do mês
 * @param {number} mes - Mês
 * @param {number} ano - Ano
 * @returns {object} - Previsão
 */
export const preverGastoAteFinaldoMes = async (mes, ano) => {
  try {
    const database = await getDatabase();

    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const ultimoDia = new Date(ano, mes, 0).getDate();

    const gastoAteHoje = await database.getFirstAsync(
      `SELECT SUM(valor) as total FROM despesas 
       WHERE mes = ? AND ano = ? AND CAST(substr(data, 9, 2) AS INTEGER) <= ?`,
      [mes, ano, diaAtual]
    );

    const totalAteHoje = gastoAteHoje?.total || 0;
    const mediaPorDia = diaAtual > 0 ? totalAteHoje / diaAtual : 0;
    const previsaoTotal = mediaPorDia * ultimoDia;

    return {
      totalAteHoje,
      diaAtual,
      ultimoDia,
      diasRestantes: ultimoDia - diaAtual,
      mediaPorDia,
      previsaoTotal,
      percentualDoMes: (diaAtual / ultimoDia) * 100,
    };
  } catch (error) {
    const handled = handleError(error, 'preverGastoAteFinaldoMes');
    logError(error, { action: 'preverGastoAteFinaldoMes', mes, ano });
    throw handled;
  }
};

/**
 * Score de economia - comparar com média histórica
 * @param {number} mes - Mês
 * @param {number} ano - Ano
 * @returns {object} - Score e análise
 */
export const calcularScoreEconomia = async (mes, ano) => {
  try {
    const database = await getDatabase();

    // Total do mês atual
    const mesAtual = await database.getFirstAsync(
      `SELECT SUM(valor) as total FROM despesas WHERE mes = ? AND ano = ?`,
      [mes, ano]
    );
    const totalAtual = mesAtual?.total || 0;

    // Média histórica (últimos 6 meses)
    const historicoMeses = [];
    for (let i = 1; i <= 6; i++) {
      let m = mes - i;
      let a = ano;
      if (m <= 0) {
        m += 12;
        a -= 1;
      }
      historicoMeses.push({ mes: m, ano: a });
    }

    const historico = await database.getAllAsync(
      `SELECT SUM(valor) as total FROM despesas 
       WHERE (mes = ? AND ano = ?) 
          OR (mes = ? AND ano = ?)
          OR (mes = ? AND ano = ?)
          OR (mes = ? AND ano = ?)
          OR (mes = ? AND ano = ?)
          OR (mes = ? AND ano = ?)`,
      historicoMeses.flatMap(h => [h.mes, h.ano])
    );

    const totalHistorico = historico.reduce((acc, h) => acc + (h.total || 0), 0);
    const mediaHistorica = totalHistorico / historico.length;

    const diferenca = mediaHistorica - totalAtual;
    const percentualDiferenca = mediaHistorica > 0 ? (diferenca / mediaHistorica) * 100 : 0;

    // Score: 0-100
    let score = 50; // Base
    if (percentualDiferenca > 0) {
      // Está economizando
      score += Math.min(percentualDiferenca, 50);
    } else {
      // Está gastando mais
      score -= Math.min(Math.abs(percentualDiferenca), 50);
    }
    score = Math.max(0, Math.min(100, score)); // Limpar entre 0-100

    return {
      totalAtual,
      mediaHistorica,
      diferenca,
      percentualDiferenca,
      score,
      status: percentualDiferenca > 0 ? 'economizando' : 'acima_da_media',
    };
  } catch (error) {
    const handled = handleError(error, 'calcularScoreEconomia');
    logError(error, { action: 'calcularScoreEconomia', mes, ano });
    throw handled;
  }
};

/**
 * Dia com maior gasto do mês
 * @param {number} mes - Mês
 * @param {number} ano - Ano
 * @returns {object} - Dia e valor
 */
export const buscarPiorDia = async (mes, ano) => {
  try {
    const database = await getDatabase();

    const resultado = await database.getFirstAsync(
      `SELECT 
        data,
        SUM(valor) as total,
        COUNT(*) as quantidade
       FROM despesas
       WHERE mes = ? AND ano = ?
       GROUP BY data
       ORDER BY total DESC
       LIMIT 1`,
      [mes, ano]
    );

    return resultado || null;
  } catch (error) {
    const handled = handleError(error, 'buscarPiorDia');
    logError(error, { action: 'buscarPiorDia', mes, ano });
    throw handled;
  }
};
