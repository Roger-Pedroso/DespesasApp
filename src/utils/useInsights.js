import { useCallback, useState, useEffect } from 'react';
import {
  buscarTendencia12Meses,
  compararMesAtualVsAnterior,
  buscarTopCategorias,
  preverGastoAteFinaldoMes,
  calcularScoreEconomia,
  buscarPiorDia,
} from '../database/insights';
import { handleError, logError } from '../utils/errorHandler';

/**
 * Hook para Dashboard e Insights
 */
export const useInsights = () => {
  const [trends, setTrends] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [topCategories, setTopCategories] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [economyScore, setEconomyScore] = useState(null);
  const [worstDay, setWorstDay] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregarInsights = useCallback(async (mes, ano) => {
    setLoading(true);
    try {
      const [
        tendencia,
        comparacao,
        topCats,
        previsao,
        economia,
        piorDia,
      ] = await Promise.all([
        buscarTendencia12Meses(mes, ano),
        compararMesAtualVsAnterior(mes, ano),
        buscarTopCategorias(mes, ano),
        preverGastoAteFinaldoMes(mes, ano),
        calcularScoreEconomia(mes, ano),
        buscarPiorDia(mes, ano),
      ]);

      setTrends(tendencia);
      setComparison(comparacao);
      setTopCategories(topCats);
      setForecast(previsao);
      setEconomyScore(economia?.score || 50);
      setWorstDay(piorDia);
    } catch (error) {
      const handled = handleError(error, 'useInsights.carregarInsights');
      logError(error, { action: 'useInsights.carregarInsights', mes, ano });
      throw handled;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados ao montar
  useEffect(() => {
    const now = new Date();
    carregarInsights(now.getMonth() + 1, now.getFullYear());
  }, [carregarInsights]);

  return {
    trends,
    comparison,
    topCategories,
    forecast,
    economyScore,
    worstDay,
    loading,
    carregarInsights,
  };
};
