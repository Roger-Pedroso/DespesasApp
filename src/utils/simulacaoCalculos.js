/**
 * Módulo de cálculos para simulação de poupança
 * Funções puras para cálculos de juros simples e compostos
 */

/**
 * Valida parâmetros de entrada
 * @throws {Error} se qualquer parâmetro é inválido
 */
const validarParametros = (mensal, alvo, taxa) => {
  if (typeof mensal !== 'number' || mensal <= 0) {
    throw new Error('Valor mensal deve ser um número positivo');
  }
  if (typeof alvo !== 'number' || alvo <= 0) {
    throw new Error('Valor alvo deve ser um número positivo');
  }
  if (typeof taxa !== 'number' || taxa < 0 || taxa > 100) {
    throw new Error('Taxa deve estar entre 0 e 100%');
  }
  if (alvo < mensal) {
    throw new Error('Valor alvo deve ser maior que a poupança mensal');
  }
};

/**
 * Simula poupança com juros simples
 * Juros incidem apenas sobre o capital inicial, não sobre contribuições
 * Fórmula: Saldo = (Mensal × N) + Juros
 * 
 * @param {number} mensal - Valor poupado por mês (R$)
 * @param {number} alvo - Valor alvo (R$)
 * @param {number} taxa - Taxa mensal (0-100, em %)
 * @returns {Object} { meses, saldoFinal, jurosGanhos, progressao[] }
 */
export const simularJurosSimples = (mensal, alvo, taxa) => {
  validarParametros(mensal, alvo, taxa);

  const taxaDecimal = taxa / 100;
  const progressao = [];
  let saldo = 0;
  let meses = 0;
  let jurosAcumulados = 0;

  // Simula mês a mês
  while (saldo < alvo && meses < 10000) {
    meses++;
    
    // Juros simples incidem sobre o saldo anterior
    const jurosDoMes = saldo * taxaDecimal;
    jurosAcumulados += jurosDoMes;
    
    // Adiciona contribuição + juros
    saldo = (mensal * meses) + jurosAcumulados;

    // Armazena apenas primeiros 120 meses + últimos para memória
    if (meses <= 120 || meses % 12 === 0 || saldo >= alvo) {
      progressao.push({
        mes: meses,
        saldo: parseFloat(saldo.toFixed(2)),
        juros: parseFloat(jurosDoMes.toFixed(2)),
        jurosAcumulados: parseFloat(jurosAcumulados.toFixed(2)),
      });
    }
  }

  return {
    meses,
    saldoFinal: parseFloat(saldo.toFixed(2)),
    jurosGanhos: parseFloat(jurosAcumulados.toFixed(2)),
    progressao,
    tipo: 'simples',
  };
};

/**
 * Simula poupança com juros compostos
 * Juros incidem sobre o saldo total (capital + contribuições + juros anteriores)
 * Fórmula: Saldo = (Saldo_Anterior + Mensal) × (1 + Taxa)
 * 
 * @param {number} mensal - Valor poupado por mês (R$)
 * @param {number} alvo - Valor alvo (R$)
 * @param {number} taxa - Taxa mensal (0-100, em %)
 * @returns {Object} { meses, saldoFinal, jurosGanhos, progressao[] }
 */
export const simularJurosCompostos = (mensal, alvo, taxa) => {
  validarParametros(mensal, alvo, taxa);

  const taxaDecimal = taxa / 100;
  const progressao = [];
  let saldo = 0;
  let meses = 0;
  let jurosAcumulados = 0;
  let saldoAnterior = 0;

  // Simula mês a mês
  while (saldo < alvo && meses < 10000) {
    meses++;
    saldoAnterior = saldo;
    
    // Juros compostos: (Saldo + Contribuição) × (1 + Taxa) - Saldo - Contribuição
    saldo = (saldo + mensal) * (1 + taxaDecimal);
    
    // Juros ganhos neste mês
    const jurosDoMes = saldo - saldoAnterior - mensal;
    jurosAcumulados += jurosDoMes;

    // Armazena apenas primeiros 120 meses + últimos para memória
    if (meses <= 120 || meses % 12 === 0 || saldo >= alvo) {
      progressao.push({
        mes: meses,
        saldo: parseFloat(saldo.toFixed(2)),
        juros: parseFloat(jurosDoMes.toFixed(2)),
        jurosAcumulados: parseFloat(jurosAcumulados.toFixed(2)),
      });
    }
  }

  return {
    meses,
    saldoFinal: parseFloat(saldo.toFixed(2)),
    jurosGanhos: parseFloat(jurosAcumulados.toFixed(2)),
    progressao,
    tipo: 'composto',
  };
};

/**
 * Função unificada de simulação
 * @param {number} mensal - Valor mensal
 * @param {number} alvo - Valor alvo
 * @param {number} taxa - Taxa (0-100%)
 * @param {string} tipoJuros - 'simples' ou 'composto'
 * @returns {Object} Resultado da simulação
 */
export const simular = (mensal, alvo, taxa, tipoJuros = 'composto') => {
  try {
    validarParametros(mensal, alvo, taxa);

    if (tipoJuros === 'simples') {
      return simularJurosSimples(mensal, alvo, taxa);
    } else {
      return simularJurosCompostos(mensal, alvo, taxa);
    }
  } catch (error) {
    return {
      erro: error.message,
      meses: null,
      saldoFinal: null,
      jurosGanhos: null,
      progressao: [],
    };
  }
};

/**
 * Calcula o valor final após N meses (sem iteração)
 * Útil para validações rápidas
 */
export const calcularSaldoAposMeses = (mensal, taxa, meses, tipoJuros = 'composto') => {
  const taxaDecimal = taxa / 100;
  
  if (tipoJuros === 'simples') {
    // Juros simples: Soma simples de contribuições com juros na mesma progressão que a iteração
    // Simulando o cálculo iterativo: saldo = (mensal * meses) + (saldo_anterior * taxa)
    let saldo = 0;
    let jurosAcum = 0;
    for (let i = 0; i < meses; i++) {
      jurosAcum += saldo * taxaDecimal;
      saldo = (mensal * (i + 1)) + jurosAcum;
    }
    return saldo;
  } else {
    // Juros compostos: Fórmula de série geométrica para anuidades
    if (taxaDecimal === 0) {
      return mensal * meses;
    }
    return mensal * (Math.pow(1 + taxaDecimal, meses + 1) - (1 + taxaDecimal)) / taxaDecimal;
  }
};
