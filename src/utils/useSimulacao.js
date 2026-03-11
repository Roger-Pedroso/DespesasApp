/**
 * Hook customizado para gerenciar estado da simulação
 * Gerencia inputs, cálculos e resultados
 */

import { useState, useCallback, useEffect } from 'react';
import { simular } from './simulacaoCalculos';

const VALORES_PADRAO = {
  mensal: 1000,
  alvo: 50000,
  taxa: 1,
  tipoJuros: 'composto', // 'simples' ou 'composto'
};

export const useSimulacao = () => {
  // Estados de entrada
  const [mensal, setMensal] = useState(VALORES_PADRAO.mensal);
  const [alvo, setAlvo] = useState(VALORES_PADRAO.alvo);
  const [taxa, setTaxa] = useState(VALORES_PADRAO.taxa);
  const [tipoJuros, setTipoJuros] = useState(VALORES_PADRAO.tipoJuros);

  // Estado de resultado
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [calculando, setCalculando] = useState(false);

  /**
   * Executa a simulação com os parâmetros atuais
   */
  const executarSimulacao = useCallback(async () => {
    setCalculando(true);
    setErro(null);

    try {
      // Simula com pequeno delay para dar feedback ao usuário
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = simular(mensal, alvo, taxa, tipoJuros);

      if (res.erro) {
        setErro(res.erro);
        setResultado(null);
      } else {
        setResultado(res);
      }
    } catch (error) {
      setErro(error.message || 'Erro ao calcular simulação');
      setResultado(null);
    } finally {
      setCalculando(false);
    }
  }, [mensal, alvo, taxa, tipoJuros]);

  /**
   * Executa simulação automaticamente quando inputs mudam
   * (Debounce de 500ms para evitar cálculos excessivos)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      executarSimulacao();
    }, 500);

    return () => clearTimeout(timer);
  }, [mensal, alvo, taxa, tipoJuros, executarSimulacao]);

  /**
   * Atualiza valor mensal com validação
   */
  const atualizarMensal = useCallback((novoValor) => {
    const parsed = parseFloat(novoValor);
    if (!isNaN(parsed) && parsed >= 0) {
      setMensal(parsed);
    }
  }, []);

  /**
   * Atualiza valor alvo com validação
   */
  const atualizarAlvo = useCallback((novoValor) => {
    const parsed = parseFloat(novoValor);
    if (!isNaN(parsed) && parsed >= 0) {
      setAlvo(parsed);
    }
  }, []);

  /**
   * Atualiza taxa com validação (0-100%)
   */
  const atualizarTaxa = useCallback((novoValor) => {
    const parsed = parseFloat(novoValor);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      setTaxa(parsed);
    }
  }, []);

  /**
   * Alterna entre juros simples e compostos
   */
  const alternarTipoJuros = useCallback(() => {
    setTipoJuros(prev => prev === 'simples' ? 'composto' : 'simples');
  }, []);

  /**
   * Reseta para valores padrão
   */
  const resetar = useCallback(() => {
    setMensal(VALORES_PADRAO.mensal);
    setAlvo(VALORES_PADRAO.alvo);
    setTaxa(VALORES_PADRAO.taxa);
    setTipoJuros(VALORES_PADRAO.tipoJuros);
    setResultado(null);
    setErro(null);
  }, []);

  /**
   * Carrega um preset de simulação
   */
  const carregarPreset = useCallback((preset) => {
    setMensal(preset.mensal);
    setAlvo(preset.alvo);
    setTaxa(preset.taxa);
    setTipoJuros(preset.tipoJuros || VALORES_PADRAO.tipoJuros);
  }, []);

  return {
    // Inputs
    mensal,
    alvo,
    taxa,
    tipoJuros,

    // Métodos de atualização
    atualizarMensal,
    atualizarAlvo,
    atualizarTaxa,
    alternarTipoJuros,
    resetar,
    carregarPreset,

    // Resultado
    resultado,
    erro,
    calculando,

    // Método manual (opcional)
    executarSimulacao,
  };
};

/**
 * Presets de simulação comum
 * Útil para teste rápido de cenários
 */
export const PRESETS_SIMULACAO = {
  conservador: {
    nome: 'Conservador',
    mensal: 500,
    alvo: 50000,
    taxa: 0.5,
    tipoJuros: 'composto',
  },
  moderado: {
    nome: 'Moderado',
    mensal: 1000,
    alvo: 50000,
    taxa: 1,
    tipoJuros: 'composto',
  },
  agressivo: {
    nome: 'Agressivo',
    mensal: 2000,
    alvo: 100000,
    taxa: 1.5,
    tipoJuros: 'composto',
  },
  muitoAgressivo: {
    nome: 'Muito Agressivo',
    mensal: 5000,
    alvo: 200000,
    taxa: 2,
    tipoJuros: 'composto',
  },
};
