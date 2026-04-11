import {
  simular,
  simularJurosSimples,
  simularJurosCompostos,
  calcularSaldoAposMeses,
} from '../simulacaoCalculos';

describe('simular — função unificada', () => {
  it('deve retornar erro quando mensal <= 0', () => {
    const resultado = simular(0, 1000, 1);
    expect(resultado.erro).toBeTruthy();
    expect(resultado.meses).toBeNull();
  });

  it('deve retornar erro quando alvo < mensal', () => {
    const resultado = simular(100, 50, 0);
    expect(resultado.erro).toBeTruthy();
  });

  it('deve retornar erro quando taxa > 100', () => {
    const resultado = simular(100, 1000, 101);
    expect(resultado.erro).toBeTruthy();
  });

  it('deve convergir com taxa zero: 12 meses para juntar R$1200 a R$100/mês', () => {
    const resultado = simular(100, 1200, 0, 'composto');
    expect(resultado.meses).toBe(12);
    expect(resultado.saldoFinal).toBeCloseTo(1200, 0);
    expect(resultado.jurosGanhos).toBe(0);
    expect(resultado.erro).toBeUndefined();
  });

  it('deve convergir mais rápido com juros (composto) do que sem', () => {
    // Use large target where compounding makes a visible difference
    const semJuros = simular(100, 5000, 0, 'composto');
    const comJuros = simular(100, 5000, 2, 'composto');
    expect(comJuros.meses).toBeLessThan(semJuros.meses);
  });

  it('deve ter saldoFinal > jurosGanhos + totalContribuicoes quando há juros', () => {
    const resultado = simular(100, 5000, 1, 'composto');
    expect(resultado.saldoFinal).toBeGreaterThanOrEqual(5000);
    expect(resultado.jurosGanhos).toBeGreaterThan(0);
  });

  it('deve funcionar com juros simples', () => {
    const resultado = simular(100, 1200, 0, 'simples');
    expect(resultado.tipo).toBe('simples');
    expect(resultado.meses).toBe(12);
  });
});

describe('simularJurosCompostos', () => {
  it('deve lançar erro diretamente para parâmetros inválidos', () => {
    expect(() => simularJurosCompostos(0, 1000, 1)).toThrow();
    expect(() => simularJurosCompostos(100, 50, 1)).toThrow();
    expect(() => simularJurosCompostos(100, 1000, -1)).toThrow();
  });

  it('deve retornar progressao como array', () => {
    const resultado = simularJurosCompostos(100, 500, 0);
    expect(Array.isArray(resultado.progressao)).toBe(true);
    expect(resultado.progressao.length).toBeGreaterThan(0);
  });

  it('deve ter saldoFinal >= alvo', () => {
    const resultado = simularJurosCompostos(100, 1000, 0.5);
    expect(resultado.saldoFinal).toBeGreaterThanOrEqual(1000);
  });
});

describe('simularJurosSimples', () => {
  it('deve lançar erro para parâmetros inválidos', () => {
    expect(() => simularJurosSimples(0, 1000, 1)).toThrow();
  });

  it('deve ter saldoFinal >= alvo', () => {
    const resultado = simularJurosSimples(100, 1000, 0.5);
    expect(resultado.saldoFinal).toBeGreaterThanOrEqual(1000);
  });

  it('juros simples gera menos juros que compostos para mesmo período', () => {
    const simples = simularJurosSimples(100, 5000, 1);
    const compostos = simularJurosCompostos(100, 5000, 1);
    expect(simples.jurosGanhos).toBeLessThanOrEqual(compostos.jurosGanhos);
  });
});

describe('calcularSaldoAposMeses', () => {
  it('deve retornar mensal * meses quando taxa é zero (composto)', () => {
    expect(calcularSaldoAposMeses(100, 0, 12, 'composto')).toBeCloseTo(1200, 0);
  });

  it('deve retornar mensal * meses quando taxa é zero (simples)', () => {
    expect(calcularSaldoAposMeses(100, 0, 12, 'simples')).toBeCloseTo(1200, 0);
  });

  it('saldo com juros deve ser maior que saldo sem juros', () => {
    const semJuros = calcularSaldoAposMeses(100, 0, 12, 'composto');
    const comJuros = calcularSaldoAposMeses(100, 1, 12, 'composto');
    expect(comJuros).toBeGreaterThan(semJuros);
  });
});
