/**
 * Busca e Filtros Avançados para Despesas
 */

import { handleError, logError } from '../utils/errorHandler';
import { sanitizarDescricao } from '../utils/validators';
import { getDatabase } from './database';

/**
 * Buscar despesas com filtros avançados
 * @param {object} filtros - { descricao, categoria, formaPagamento, dataInicio, dataFim, valorMin, valorMax }
 * @param {number} mes - Mês (opcional)
 * @param {number} ano - Ano (opcional)
 * @returns {array} - Despesas filtradas
 */
export const buscarDespesasComFiltros = async (filtros = {}, mes = null, ano = null) => {
  try {
    const database = await getDatabase();
    
    let query = 'SELECT * FROM despesas WHERE 1=1';
    const params = [];

    // Filtro por mês/ano (padrão)
    if (mes && ano) {
      query += ' AND mes = ? AND ano = ?';
      params.push(mes, ano);
    }

    // Filtro por descrição (busca parcial)
    if (filtros.descricao && filtros.descricao.trim()) {
      const descricaoSanitizada = sanitizarDescricao(filtros.descricao);
      query += ' AND descricao LIKE ?';
      params.push(`%${descricaoSanitizada}%`);
    }

    // Filtro por categoria
    if (filtros.categoria) {
      query += ' AND categoria = ?';
      params.push(filtros.categoria);
    }

    // Filtro por forma de pagamento
    if (filtros.formaPagamento) {
      query += ' AND forma_pagamento = ?';
      params.push(filtros.formaPagamento);
    }

    // Filtro por intervalo de datas
    if (filtros.dataInicio) {
      query += ' AND data >= ?';
      params.push(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      query += ' AND data <= ?';
      params.push(filtros.dataFim);
    }

    // Filtro por intervalo de valores
    if (filtros.valorMin !== undefined && filtros.valorMin > 0) {
      query += ' AND valor >= ?';
      params.push(filtros.valorMin);
    }
    if (filtros.valorMax !== undefined && filtros.valorMax > 0) {
      query += ' AND valor <= ?';
      params.push(filtros.valorMax);
    }

    query += ' ORDER BY data DESC, id DESC';

    const rows = await database.getAllAsync(query, params);
    return rows || [];
  } catch (error) {
    const handled = handleError(error, 'buscarDespesasComFiltros');
    logError(error, { action: 'buscarDespesasComFiltros', filtros, mes, ano });
    throw handled;
  }
};

/**
 * Buscar despesas por período customizado
 * @param {string} dataInicio - Data em formato YYYY-MM-DD
 * @param {string} dataFim - Data em formato YYYY-MM-DD
 * @returns {object} - { despesas, total, media, maiorDespesa }
 */
export const buscarPorPeriodoCustomizado = async (dataInicio, dataFim) => {
  try {
    const database = await getDatabase();

    const despesas = await database.getAllAsync(
      `SELECT * FROM despesas 
       WHERE data >= ? AND data <= ? 
       ORDER BY data DESC`,
      [dataInicio, dataFim]
    );

    const total = despesas.reduce((acc, d) => acc + d.valor, 0);
    const media = despesas.length > 0 ? total / despesas.length : 0;
    const maiorDespesa = despesas.length > 0 
      ? Math.max(...despesas.map(d => d.valor)) 
      : 0;

    return {
      despesas,
      total,
      media,
      maiorDespesa,
      quantidade: despesas.length,
    };
  } catch (error) {
    const handled = handleError(error, 'buscarPorPeriodoCustomizado');
    logError(error, { action: 'buscarPorPeriodoCustomizado', dataInicio, dataFim });
    throw handled;
  }
};

/**
 * Comparar dois períodos
 * @param {string} periodo1Inicio
 * @param {string} periodo1Fim
 * @param {string} periodo2Inicio
 * @param {string} periodo2Fim
 * @returns {object} - Comparação entre períodos
 */
export const compararPeriodos = async (periodo1Inicio, periodo1Fim, periodo2Inicio, periodo2Fim) => {
  try {
    const p1 = await buscarPorPeriodoCustomizado(periodo1Inicio, periodo1Fim);
    const p2 = await buscarPorPeriodoCustomizado(periodo2Inicio, periodo2Fim);

    const variacao = p2.total - p1.total;
    const percentualVariacao = p1.total > 0 ? (variacao / p1.total) * 100 : 0;

    return {
      periodo1: p1,
      periodo2: p2,
      variacao,
      percentualVariacao,
      piorOuMelhor: percentualVariacao < 0 ? 'melhor' : 'pior',
    };
  } catch (error) {
    const handled = handleError(error, 'compararPeriodos');
    logError(error, { action: 'compararPeriodos' });
    throw handled;
  }
};

/**
 * Buscar despesas acumuladas por período
 */
export const buscarGastoAcumulado = async (dataInicio, dataFim) => {
  try {
    const database = await getDatabase();

    const resultado = await database.getAllAsync(
      `SELECT 
        data,
        SUM(valor) OVER (ORDER BY data ASC) as acumulado,
        SUM(valor) as gasto_dia
       FROM despesas 
       WHERE data >= ? AND data <= ? 
       GROUP BY data
       ORDER BY data ASC`,
      [dataInicio, dataFim]
    );

    return resultado || [];
  } catch (error) {
    const handled = handleError(error, 'buscarGastoAcumulado');
    logError(error, { action: 'buscarGastoAcumulado', dataInicio, dataFim });
    throw handled;
  }
};
