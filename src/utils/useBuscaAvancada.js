import { useCallback, useState } from 'react';
import { 
  buscarDespesasComFiltros, 
  buscarPorPeriodoCustomizado,
  compararPeriodos,
  buscarGastoAcumulado,
} from '../database/search';
import { handleError, logError } from '../utils/errorHandler';

/**
 * Hook para busca e filtros avançados
 */
export const useBuscaAvancada = () => {
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState({});

  const buscar = useCallback(async (filtros, mes = null, ano = null) => {
    setLoadingBusca(true);
    try {
      const resultado = await buscarDespesasComFiltros(filtros, mes, ano);
      setResultadosBusca(resultado);
      setFiltrosAtivos(filtros);
      return resultado;
    } catch (error) {
      const handled = handleError(error, 'useBuscaAvancada.buscar');
      logError(error, { action: 'useBuscaAvancada.buscar', filtros });
      throw handled;
    } finally {
      setLoadingBusca(false);
    }
  }, []);

  const buscarPeriodo = useCallback(async (dataInicio, dataFim) => {
    setLoadingBusca(true);
    try {
      const resultado = await buscarPorPeriodoCustomizado(dataInicio, dataFim);
      setResultadosBusca(resultado.despesas);
      return resultado;
    } catch (error) {
      const handled = handleError(error, 'useBuscaAvancada.buscarPeriodo');
      logError(error, { action: 'useBuscaAvancada.buscarPeriodo' });
      throw handled;
    } finally {
      setLoadingBusca(false);
    }
  }, []);

  const compararDoisPeriodos = useCallback(async (p1Inicio, p1Fim, p2Inicio, p2Fim) => {
    setLoadingBusca(true);
    try {
      const resultado = await compararPeriodos(p1Inicio, p1Fim, p2Inicio, p2Fim);
      return resultado;
    } catch (error) {
      const handled = handleError(error, 'useBuscaAvancada.compararDoisPeriodos');
      logError(error, { action: 'useBuscaAvancada.compararDoisPeriodos' });
      throw handled;
    } finally {
      setLoadingBusca(false);
    }
  }, []);

  const limparBusca = useCallback(() => {
    setResultadosBusca([]);
    setFiltrosAtivos({});
  }, []);

  return {
    resultadosBusca,
    loadingBusca,
    filtrosAtivos,
    buscar,
    buscarPeriodo,
    compararDoisPeriodos,
    limparBusca,
  };
};
