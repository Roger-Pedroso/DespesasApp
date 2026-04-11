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
  const [error, setError] = useState(null);

  const carregarInsights = useCallback(async (mes, ano) => {
    setLoading(true);
    setError(null);
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
    } catch (err) {
      const handled = handleError(err, 'useInsights.carregarInsights');
      logError(err, { action: 'useInsights.carregarInsights', mes, ano });
      setError(handled.userMessage || 'Não foi possível carregar os dados.');
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
    error,
    carregarInsights,
  };
};
