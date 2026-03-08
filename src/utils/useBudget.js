import { useState, useEffect } from 'react';
import {
  criarOrcamento,
  buscarOrcamentos,
  deletarOrcamento,
  buscarSugestoesDeDesvio,
} from '../database/budgets';

export const useBudget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar orçamentos ao montar
  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      // Gerar ano_mes atual (YYYY-MM)
      const now = new Date();
      const ano_mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const data = await buscarOrcamentos(ano_mes);
      setBudgets(data);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budgetData) => {
    try {
      // Converter ano e mes para ano_mes (YYYY-MM)
      const ano_mes = `${budgetData.ano}-${String(budgetData.mes).padStart(2, '0')}`;
      const result = await criarOrcamento({ ...budgetData, ano_mes });
      await loadBudgets(); // Recarregar lista
      return result;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  };

  const deleteBudget = async (id) => {
    try {
      await deletarOrcamento(id);
      await loadBudgets(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      throw error;
    }
  };

  const getSuggestions = async (budgetId) => {
    try {
      // Usar ano_mes atual
      const now = new Date();
      const ano_mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const suggestions = await buscarSugestoesDeDesvio(ano_mes);
      return suggestions;
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      throw error;
    }
  };

  return {
    budgets,
    loading,
    createBudget,
    deleteBudget,
    getSuggestions,
  };
};
