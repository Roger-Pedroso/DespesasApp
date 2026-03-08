/**
 * Cálculos de Alocação 50/30/20
 * Regra: 50% Essencial, 30% Desejos, 20% Poupar
 */

import { handleError, logError } from '../utils/errorHandler';
import { getDatabase } from './database';

/**
 * Calcular alocação 50/30/20 para um período
 * @param {number} mes - Mês (1-12)
 * @param {number} ano - Ano
 * @returns {object} - Dados de alocação com recomendações
 */
export const calcularAlocacao50_30_20 = async (mes, ano) => {
  try {
    const database = await getDatabase();

    // Verificar se tipo_gasto coluna existe antes de usar
    const schema = await database.getAllAsync(`PRAGMA table_info(despesas)`);
    const temTipoGasto = schema && schema.some(col => col.name === 'tipo_gasto');
    
    if (!temTipoGasto) {
      // Se coluna não existe ainda, retornar dados vazios
      console.warn('[ALOCACAO] ⚠️ Coluna tipo_gasto não existe. Aguardando migração...');
      return {
        essencial: { total: 0, alvo: 0, percent: 0, alvoPercent: 50, quantidade: 0 },
        desejo: { total: 0, alvo: 0, percent: 0, alvoPercent: 30, quantidade: 0 },
        poupar: { total: 0, alvo: 0, percent: 0, alvoPercent: 20, quantidade: 0 },
        totalMes: 0,
        status: 'sem-dados',
        recomendacao: 'Adicionando despesas...',
      };
    }

    // Buscar total de gastos por tipo
    const resultado = await database.getAllAsync(
      `SELECT 
        tipo_gasto,
        SUM(valor) as total,
        COUNT(*) as quantidade
       FROM despesas
       WHERE mes = ? AND ano = ?
       GROUP BY tipo_gasto`,
      [mes, ano]
    );

    // Calcular totais
    let essencial = 0, desejo = 0, poupar = 0;
    resultado.forEach(row => {
      if (row.tipo_gasto === 'essencial') essencial = row.total || 0;
      else if (row.tipo_gasto === 'desejo') desejo = row.total || 0;
      else if (row.tipo_gasto === 'poupar') poupar = row.total || 0;
    });

    const totalMes = essencial + desejo + poupar;

    // Calcular alvo (50/30/20)
    const alvoEssencial = totalMes * 0.5;
    const alvoDesejo = totalMes * 0.3;
    const alvoPoupar = totalMes * 0.2;

    // Calcular percentuais reais
    const percentEssencial = totalMes > 0 ? (essencial / totalMes) * 100 : 0;
    const percentDesejo = totalMes > 0 ? (desejo / totalMes) * 100 : 0;
    const percentPoupar = totalMes > 0 ? (poupar / totalMes) * 100 : 0;

    // Determinar status
    const getStatus = (percentReal, percentAlvo) => {
      const diferenca = percentReal - percentAlvo;
      if (Math.abs(diferenca) <= 2) return 'OK';
      if (Math.abs(diferenca) <= 5) return 'AVISO';
      return 'EXCEDIDO';
    };

    const getRecomendacao = (tipo, percentReal, percentAlvo, valor, alvo) => {
      const diferenca = percentReal - percentAlvo;
      
      if (Math.abs(diferenca) <= 2) {
        return `${tipo} sob controle! 🎯`;
      }
      
      if (diferenca > 0) {
        return `Você está ${Math.abs(diferenca).toFixed(1)}% acima do alvo de ${tipo.toLowerCase()}`;
      } else {
        return `Você está ${Math.abs(diferenca).toFixed(1)}% abaixo do alvo de ${tipo.toLowerCase()}`;
      }
    };

    return {
      totalMes,
      essencial: {
        valor: essencial,
        alvo: alvoEssencial,
        percentAlvo: 50,
        percentReal: percentEssencial,
        status: getStatus(percentEssencial, 50),
        recomendacao: getRecomendacao('Essencial', percentEssencial, 50, essencial, alvoEssencial),
      },
      desejo: {
        valor: desejo,
        alvo: alvoDesejo,
        percentAlvo: 30,
        percentReal: percentDesejo,
        status: getStatus(percentDesejo, 30),
        recomendacao: getRecomendacao('Desejos', percentDesejo, 30, desejo, alvoDesejo),
      },
      poupar: {
        valor: poupar,
        alvo: alvoPoupar,
        percentAlvo: 20,
        percentReal: percentPoupar,
        status: getStatus(percentPoupar, 20),
        recomendacao: getRecomendacao('Poupar', percentPoupar, 20, poupar, alvoPoupar),
      },
    };
  } catch (error) {
    const handled = handleError(error, 'calcularAlocacao50_30_20');
    logError(error, { action: 'calcularAlocacao50_30_20', mes, ano });
    throw handled;
  }
};

/**
 * Buscar despesas de um tipo específico
 * @param {string} tipo_gasto - 'essencial', 'desejo' ou 'poupar'
 * @param {number} mes - Mês
 * @param {number} ano - Ano
 * @returns {array} - Array de despesas
 */
export const buscarDespesasPorTipo = async (tipo_gasto, mes, ano) => {
  try {
    const database = await getDatabase();

    const despesas = await database.getAllAsync(
      `SELECT * FROM despesas
       WHERE tipo_gasto = ? AND mes = ? AND ano = ?
       ORDER BY data DESC`,
      [tipo_gasto, mes, ano]
    );

    return despesas || [];
  } catch (error) {
    const handled = handleError(error, 'buscarDespesasPorTipo');
    logError(error, { action: 'buscarDespesasPorTipo', tipo_gasto, mes, ano });
    throw handled;
  }
};
