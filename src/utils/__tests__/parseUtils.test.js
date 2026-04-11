import { parseMonetario, parseTaxa } from '../parseUtils';

describe('parseMonetario', () => {
  // Formato brasileiro completo
  it('deve converter "1.234,56" em 1234.56', () => {
    expect(parseMonetario('1.234,56')).toBe(1234.56);
  });

  it('deve converter "1234,56" em 1234.56', () => {
    expect(parseMonetario('1234,56')).toBe(1234.56);
  });

  it('deve converter "0,01" em 0.01', () => {
    expect(parseMonetario('0,01')).toBe(0.01);
  });

  it('deve converter "1.000.000,00" em 1000000', () => {
    expect(parseMonetario('1.000.000,00')).toBe(1000000);
  });

  // Formato com ponto — ambiguidade
  it('deve tratar "1.23" (2 dígitos após ponto) como decimal: 1.23', () => {
    expect(parseMonetario('1.23')).toBe(1.23);
  });

  it('deve tratar "1.1" (1 dígito após ponto) como decimal: 1.1 — bug fix', () => {
    expect(parseMonetario('1.1')).toBe(1.1);
  });

  it('deve tratar "1.234" (3 dígitos após ponto) como milhar: 1234', () => {
    expect(parseMonetario('1.234')).toBe(1234);
  });

  it('deve tratar "1.000.000" (múltiplos pontos) como milhar: 1000000', () => {
    expect(parseMonetario('1.000.000')).toBe(1000000);
  });

  it('deve converter "1234.56" (formato internacional, 2 dígitos) em 1234.56', () => {
    expect(parseMonetario('1234.56')).toBe(1234.56);
  });

  // Valores simples
  it('deve converter "1234" em 1234', () => {
    expect(parseMonetario('1234')).toBe(1234);
  });

  it('deve converter "0" em 0', () => {
    expect(parseMonetario('0')).toBe(0);
  });

  // Guards
  it('deve retornar 0 para string vazia', () => {
    expect(parseMonetario('')).toBe(0);
  });

  it('deve retornar 0 para null', () => {
    expect(parseMonetario(null)).toBe(0);
  });

  it('deve retornar 0 para undefined', () => {
    expect(parseMonetario(undefined)).toBe(0);
  });

  it('deve retornar 0 para texto não-numérico', () => {
    expect(parseMonetario('abc')).toBe(0);
  });

  it('deve ignorar símbolos como R$', () => {
    expect(parseMonetario('R$ 1.234,56')).toBe(1234.56);
  });
});

describe('parseTaxa', () => {
  it('deve converter "0.5" em 0.5', () => {
    expect(parseTaxa('0.5')).toBe(0.5);
  });

  it('deve converter "0,5" em 0.5', () => {
    expect(parseTaxa('0,5')).toBe(0.5);
  });

  it('deve converter "1" em 1', () => {
    expect(parseTaxa('1')).toBe(1);
  });

  it('deve converter "0.001" em 0.001', () => {
    expect(parseTaxa('0.001')).toBe(0.001);
  });

  it('deve retornar 0 para string vazia', () => {
    expect(parseTaxa('')).toBe(0);
  });

  it('deve retornar 0 para null', () => {
    expect(parseTaxa(null)).toBe(0);
  });

  it('deve retornar 0 para undefined', () => {
    expect(parseTaxa(undefined)).toBe(0);
  });
});
