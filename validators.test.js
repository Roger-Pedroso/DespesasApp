/**
 * Testes para funções de validação (validators.js)
 * Executar: npm test -- validators.test.js
 */

import {
  isValidDate,
  isValidBRL,
  isValidDescricao,
  isValidCategoria,
  isValidFormaPagamento,
  isValidRecorrencia,
  isValidDespesa,
  sanitizarDescricao,
} from './src/utils/validators';

describe('validators.js', () => {
  describe('isValidDate()', () => {
    test('Deve aceitar data válida em formato YYYY-MM-DD', () => {
      expect(isValidDate('2026-03-08')).toBe(true);
      expect(isValidDate('2025-12-31')).toBe(true);
      expect(isValidDate('2024-02-29')).toBe(true); // Ano bissexto
    });

    test('Deve rejeitar data inválida', () => {
      expect(isValidDate('2024-02-30')).toBe(false); // Fevereiro não tem 30 dias
      expect(isValidDate('2025-02-29')).toBe(false); // 2025 não é bissexto
      expect(isValidDate('2026-13-01')).toBe(false); // Mês inválido
      expect(isValidDate('2026-03-32')).toBe(false); // Dia inválido
      expect(isValidDate('08/03/2026')).toBe(false); // Formato errado
      expect(isValidDate('invalid')).toBe(false);
    });
  });

  describe('isValidBRL()', () => {
    test('Deve aceitar valores BRL válidos', () => {
      expect(isValidBRL(0.01)).toBe(true);
      expect(isValidBRL(10)).toBe(true);
      expect(isValidBRL(999999.99)).toBe(true);
      expect(isValidBRL('10.50')).toBe(true);
      expect(isValidBRL('10,50')).toBe(true);
    });

    test('Deve rejeitar valores inválidos', () => {
      expect(isValidBRL(0)).toBe(false);
      expect(isValidBRL(-10)).toBe(false);
      expect(isValidBRL(1000000)).toBe(false);
      expect(isValidBRL('abc')).toBe(false);
      expect(isValidBRL(NaN)).toBe(false);
    });
  });

  describe('isValidDescricao()', () => {
    test('Deve aceitar descrição válida', () => {
      expect(isValidDescricao('Almoço')).toBe(true);
      expect(isValidDescricao('Compra no supermercado')).toBe(true);
      expect(isValidDescricao('A')).toBe(true);
    });

    test('Deve rejeitar descrição inválida', () => {
      expect(isValidDescricao('')).toBe(false);
      expect(isValidDescricao('   ')).toBe(false);
      expect(isValidDescricao(null)).toBe(false);
      expect(isValidDescricao(123)).toBe(false);
      expect(isValidDescricao('a'.repeat(256))).toBe(false); // > 255 caracteres
    });
  });

  describe('isValidFormaPagamento()', () => {
    test('Deve aceitar formas de pagamento válidas', () => {
      expect(isValidFormaPagamento('debito')).toBe(true);
      expect(isValidFormaPagamento('credito')).toBe(true);
      expect(isValidFormaPagamento('pix')).toBe(true);
    });

    test('Deve rejeitar formas inválidas', () => {
      expect(isValidFormaPagamento('dinheiro')).toBe(false);
      expect(isValidFormaPagamento('')).toBe(false);
      expect(isValidFormaPagamento('DEBITO')).toBe(false);
    });
  });

  describe('isValidRecorrencia()', () => {
    test('Deve aceitar recorrências válidas', () => {
      expect(isValidRecorrencia('unica')).toBe(true);
      expect(isValidRecorrencia('diaria')).toBe(true);
      expect(isValidRecorrencia('semanal')).toBe(true);
      expect(isValidRecorrencia('mensal')).toBe(true);
      expect(isValidRecorrencia('anual')).toBe(true);
    });

    test('Deve rejeitar recorrências inválidas', () => {
      expect(isValidRecorrencia('bimestral')).toBe(false);
      expect(isValidRecorrencia('')).toBe(false);
    });
  });

  describe('isValidDespesa()', () => {
    const despesaValida = {
      descricao: 'Almoço',
      valor: 50.00,
      categoria: 'alimentacao',
      forma_pagamento: 'debito',
      recorrencia: 'unica',
      data: '2026-03-08',
    };

    test('Deve aceitar despesa válida', () => {
      const resultado = isValidDespesa(despesaValida);
      expect(resultado.valid).toBe(true);
      expect(resultado.errors).toHaveLength(0);
    });

    test('Deve rejeitar despesa com descrição inválida', () => {
      const resultado = isValidDespesa({ ...despesaValida, descricao: '' });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors.length).toBeGreaterThan(0);
    });

    test('Deve rejeitar despesa com valor inválido', () => {
      const resultado = isValidDespesa({ ...despesaValida, valor: 0 });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors.length).toBeGreaterThan(0);
    });

    test('Deve rejeitar despesa com data inválida', () => {
      const resultado = isValidDespesa({ ...despesaValida, data: 'invalid' });
      expect(resultado.valid).toBe(false);
      expect(resultado.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizarDescricao()', () => {
    test('Deve remover caracteres perigosos', () => {
      expect(sanitizarDescricao('Almoço<script>')).toContain('Almo');
      expect(sanitizarDescricao('Compra "especial"')).toBe('Compra especial');
      expect(sanitizarDescricao("Café's")).toBe('Cafés');
    });

    test('Deve limpar espaços e limitar a 255 caracteres', () => {
      expect(sanitizarDescricao('  Almoço  ')).toBe('Almoço');
      expect(sanitizarDescricao('a'.repeat(300)).length).toBeLessThanOrEqual(255);
    });
  });
});
