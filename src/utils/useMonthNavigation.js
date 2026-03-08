import { useCallback } from 'react';

/**
 * Hook reutilizável para navegação entre meses
 * Encapsula lógica de mudança de mês anterior/próximo
 *
 * @param {number} mesSelecionado - Mês atual (1-12)
 * @param {number} anoSelecionado - Ano atual
 * @param {Function} trocarMes - Callback para trocar mês
 * @returns {object} { irParaMesAnterior, irParaProximoMes }
 *
 * @example
 * const { irParaMesAnterior, irParaProximoMes } = useMonthNavigation(
 *   mesSelecionado,
 *   anoSelecionado,
 *   trocarMes
 * );
 */
export const useMonthNavigation = (
  mesSelecionado,
  anoSelecionado,
  trocarMes,
) => {
  const irParaMesAnterior = useCallback(() => {
    if (mesSelecionado === 1) {
      trocarMes(12, anoSelecionado - 1);
    } else {
      trocarMes(mesSelecionado - 1, anoSelecionado);
    }
  }, [mesSelecionado, anoSelecionado, trocarMes]);

  const irParaProximoMes = useCallback(() => {
    if (mesSelecionado === 12) {
      trocarMes(1, anoSelecionado + 1);
    } else {
      trocarMes(mesSelecionado + 1, anoSelecionado);
    }
  }, [mesSelecionado, anoSelecionado, trocarMes]);

  return { irParaMesAnterior, irParaProximoMes };
};
