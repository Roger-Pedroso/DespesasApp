import { useCallback, useState } from 'react';
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
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const carregarInsights = useCallback(async (mes, ano) => {
    setLoadingInsights(true);
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

      setInsights({
        tendencia,
        comparacao,
        topCategorias: topCats,
        previsao,
        scoreEconomia: economia,
        piorDia,
        carregadoEm: new Date().toISOString(),
      });
    } catch (error) {
      const handled = handleError(error, 'useInsights.carregarInsights');
      logError(error, { action: 'useInsights.carregarInsights', mes, ano });
      throw handled;
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  return {
    insights,
    loadingInsights,
    carregarInsights,
  };
};
