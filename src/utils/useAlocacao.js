import { useState, useCallback, useEffect } from 'react';
import { calcularAlocacao50_30_20 } from '../database/allocation';
import { handleError, logError } from '../utils/errorHandler';

/**
 * Hook para gerenciar alocação 50/30/20
 */
export const useAlocacao = () => {
  const [alocacao, setAlocacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cacheTime, setCacheTime] = useState(null);

  const carregarAlocacao = useCallback(async (mes, ano) => {
    setLoading(true);
    try {
      const resultado = await calcularAlocacao50_30_20(mes, ano);
      setAlocacao(resultado);
      setCacheTime(Date.now());
    } catch (error) {
      const handled = handleError(error, 'useAlocacao.carregarAlocacao');
      logError(error, { action: 'useAlocacao.carregarAlocacao', mes, ano });
      throw handled;
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarregar alocação ao montar ou a cada 5 minutos
  useEffect(() => {
    const now = new Date();
    carregarAlocacao(now.getMonth() + 1, now.getFullYear());
  }, [carregarAlocacao]);

  const recarregar = useCallback(async () => {
    const now = new Date();
    await carregarAlocacao(now.getMonth() + 1, now.getFullYear());
  }, [carregarAlocacao]);

  return {
    alocacao,
    loading,
    carregarAlocacao,
    recarregar,
  };
};
