/**
 * Orçamentos e Metas
 */

import { handleError, logError } from '../utils/errorHandler';
import { getDatabase } from './database';

/**
 * Criar orçamento para uma categoria em um mês
 * @param {object} budget - { categoria, limite, ano_mes }
 * @returns {number} - ID do orçamento
 */
export const criarOrcamento = async (budget) => {
  try {
    const database = await getDatabase();
    const { categoria, limite, ano_mes } = budget;

    // Verificar se já existe
    const existe = await database.getFirstAsync(
      `SELECT id FROM budgets WHERE categoria = ? AND ano_mes = ?`,
      [categoria, ano_mes]
    );

    if (existe) {
      // Atualizar existente
      await database.runAsync(
        `UPDATE budgets SET limite = ? WHERE categoria = ? AND ano_mes = ?`,
        [limite, categoria, ano_mes]
      );
      return existe.id;
    }

    // Criar novo
    const result = await database.runAsync(
      `INSERT INTO budgets (categoria, limite, ano_mes)
       VALUES (?, ?, ?)`,
      [categoria, limite, ano_mes]
    );

    return result.lastInsertRowId;
  } catch (error) {
    const handled = handleError(error, 'criarOrcamento');
    logError(error, { action: 'criarOrcamento', budget });
    throw handled;
  }
};

/**
 * Buscar orçamentos de um período (ano-mes)
 * @param {string} ano_mes - Formato YYYY-MM
 * @returns {array} - Orçamentos
 */
export const buscarOrcamentos = async (ano_mes) => {
  try {
    const database = await getDatabase();
    const [anoStr, mesStr] = ano_mes.split('-');
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    const resultado = await database.getAllAsync(
      `SELECT b.id, b.categoria, b.limite,
              COALESCE(SUM(d.valor), 0) as gasto_atual
       FROM budgets b
       LEFT JOIN despesas d
         ON d.categoria = b.categoria
         AND d.mes = ?
         AND d.ano = ?
       WHERE b.ano_mes = ?
       GROUP BY b.id, b.categoria, b.limite`,
      [mes, ano, ano_mes]
    );

    return resultado.map(row => {
      const percentualUsado = row.limite > 0 ? (row.gasto_atual / row.limite) * 100 : 0;
      return {
        ...row,
        mes,
        ano,
        percentualUsado,
        disponivel: row.limite - row.gasto_atual,
        status: percentualUsado > 100 ? 'EXCEDIDO' :
                percentualUsado >= 80 ? 'AVISO' :
                'OK',
      };
    });
  } catch (error) {
    const handled = handleError(error, 'buscarOrcamentos');
    logError(error, { action: 'buscarOrcamentos', ano_mes });
    throw handled;
  }
};

/**
 * Deletar orçamento
 * @param {number} id - ID do orçamento
 */
export const deletarOrcamento = async (id) => {
  try {
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM budgets WHERE id = ?`, [id]);
  } catch (error) {
    const handled = handleError(error, 'deletarOrcamento');
    logError(error, { action: 'deletarOrcamento', id });
    throw handled;
  }
};

/**
 * Histórico de cumprimento de metas
 * @param {string} categoria - Categoria para análise
 * @param {number} ultimosN - Últimos N meses (default 6)
 * @returns {array} - Histórico
 */
export const buscarHistoricoOrcamento = async (categoria, ultimosN = 6) => {
  try {
    const database = await getDatabase();

    const resultado = await database.getAllAsync(
      `SELECT 
        mes, ano,
        SUM(valor) as gasto
       FROM despesas
       WHERE categoria = ? AND (ano > ? OR (ano = ? AND mes > ?))
       GROUP BY ano, mes
       ORDER BY ano DESC, mes DESC
       LIMIT ?`,
      [categoria, new Date().getFullYear() - 1, new Date().getFullYear(), 
       new Date().getMonth() + 1 - ultimosN, ultimosN]
    );

    return resultado || [];
  } catch (error) {
    const handled = handleError(error, 'buscarHistoricoOrcamento');
    logError(error, { action: 'buscarHistoricoOrcamento', categoria, ultimosN });
    throw handled;
  }
};

/**
 * Sugestões de categorias com desvio
 * @param {string} ano_mes - Período (YYYY-MM)
 * @returns {array} - Categorias com maior desvio
 */
export const buscarSugestoesDeDesvio = async (ano_mes) => {
  try {
    const database = await getDatabase();
    const [mesStr, anoStr] = ano_mes.split('-');
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    // Buscar gastos por categoria
    const gastos = await database.getAllAsync(
      `SELECT 
        categoria,
        SUM(valor) as total
       FROM despesas
       WHERE mes = ? AND ano = ?
       GROUP BY categoria
       ORDER BY total DESC`,
      [mes, ano]
    );

    // Buscar orçamentos
    const orcamentos = await database.getAllAsync(
      `SELECT categoria, limite FROM budgets WHERE ano_mes = ?`,
      [ano_mes]
    );

    // Calcular desvios
    const desvios = gastos
      .map(gasto => {
        const orcamento = orcamentos.find(o => o.categoria === gasto.categoria);
        if (!orcamento) return null;

        const desvio = gasto.total - orcamento.limite;
        const percentualDesvio = orcamento.limite > 0 ? (desvio / orcamento.limite) * 100 : 0;

        return {
          categoria: gasto.categoria,
          orcamento: orcamento.limite,
          gasto: gasto.total,
          desvio,
          percentualDesvio,
        };
      })
      .filter(d => d !== null && d.desvio > 0) // Apenas com desvio positivo
      .sort((a, b) => b.percentualDesvio - a.percentualDesvio)
      .slice(0, 5); // Top 5

    return desvios;
  } catch (error) {
    const handled = handleError(error, 'buscarSugestoesDeDesvio');
    logError(error, { action: 'buscarSugestoesDeDesvio', ano_mes });
    throw handled;
  }
};
