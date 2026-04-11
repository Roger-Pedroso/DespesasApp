import {
  isValidDate,
  isValidBRL,
  isValidDescricao,
  isValidCategoria,
  isValidFormaPagamento,
  isValidRecorrencia,
  isValidDespesa,
  sanitizarDescricao,
} from '../validators';

describe('isValidDate', () => {
  it('aceita data válida', () => {
    expect(isValidDate('2024-04-15')).toBe(true);
  });

  it('rejeita formato incorreto', () => {
    expect(isValidDate('15/04/2024')).toBe(false);
    expect(isValidDate('2024-13-01')).toBe(false);
    expect(isValidDate('2024-04-32')).toBe(false);
  });

  it('rejeita strings não-data', () => {
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('abc')).toBe(false);
  });
});

describe('isValidBRL', () => {
  it('aceita valores positivos válidos', () => {
    expect(isValidBRL(100)).toBe(true);
    expect(isValidBRL(0.01)).toBe(true);
    expect(isValidBRL(999999.99)).toBe(true);
    expect(isValidBRL('100')).toBe(true);
  });

  it('rejeita zero e negativos', () => {
    expect(isValidBRL(0)).toBe(false);
    expect(isValidBRL(-1)).toBe(false);
  });

  it('rejeita valor acima do limite', () => {
    expect(isValidBRL(1000000)).toBe(false);
  });

  it('rejeita undefined e null', () => {
    expect(isValidBRL(undefined)).toBe(false);
    expect(isValidBRL(null)).toBe(false);
  });

  it('rejeita string não-numérica', () => {
    expect(isValidBRL('abc')).toBe(false);
  });
});

describe('isValidDescricao', () => {
  it('aceita descrição normal', () => {
    expect(isValidDescricao('Almoço')).toBe(true);
  });

  it('aceita exatamente 255 caracteres', () => {
    expect(isValidDescricao('a'.repeat(255))).toBe(true);
  });

  it('rejeita 256 caracteres', () => {
    expect(isValidDescricao('a'.repeat(256))).toBe(false);
  });

  it('rejeita string vazia ou apenas espaços', () => {
    expect(isValidDescricao('')).toBe(false);
    expect(isValidDescricao('   ')).toBe(false);
  });

  it('rejeita não-string', () => {
    expect(isValidDescricao(null)).toBe(false);
    expect(isValidDescricao(123)).toBe(false);
  });
});

describe('isValidFormaPagamento', () => {
  it('aceita formas válidas', () => {
    expect(isValidFormaPagamento('debito')).toBe(true);
    expect(isValidFormaPagamento('credito')).toBe(true);
    expect(isValidFormaPagamento('pix')).toBe(true);
  });

  it('rejeita forma inválida', () => {
    expect(isValidFormaPagamento('boleto')).toBe(false);
    expect(isValidFormaPagamento('')).toBe(false);
  });

  it('rejeita null e undefined', () => {
    expect(isValidFormaPagamento(null)).toBe(false);
    expect(isValidFormaPagamento(undefined)).toBe(false);
  });
});

describe('isValidRecorrencia', () => {
  it('aceita recorrências válidas', () => {
    expect(isValidRecorrencia('unica')).toBe(true);
    expect(isValidRecorrencia('mensal')).toBe(true);
  });

  it('rejeita recorrência inválida', () => {
    expect(isValidRecorrencia('bimestral')).toBe(false);
    expect(isValidRecorrencia('')).toBe(false);
  });
});

describe('isValidCategoria', () => {
  it('aceita categoria quando lista fornecida', () => {
    expect(isValidCategoria('alimentacao', ['alimentacao', 'transporte'])).toBe(true);
  });

  it('rejeita categoria fora da lista', () => {
    expect(isValidCategoria('lazer', ['alimentacao', 'transporte'])).toBe(false);
  });

  it('aceita qualquer string não-vazia quando lista vazia', () => {
    expect(isValidCategoria('qualquer_coisa', [])).toBe(true);
    expect(isValidCategoria('', [])).toBe(false);
  });
});

describe('sanitizarDescricao', () => {
  it('remove caracteres HTML perigosos', () => {
    const resultado = sanitizarDescricao('<script>alert("xss")</script>');
    expect(resultado).not.toContain('<');
    expect(resultado).not.toContain('>');
    expect(resultado).not.toContain('"');
    expect(resultado).not.toContain("'");
  });

  it('preserva texto normal', () => {
    expect(sanitizarDescricao('  Almoço  ')).toBe('Almoço');
  });

  it('limita a 255 caracteres', () => {
    const longa = 'a'.repeat(300);
    expect(sanitizarDescricao(longa).length).toBe(255);
  });

  it('resultado exato para entrada com aspas', () => {
    expect(sanitizarDescricao('Mercado "Pão de Açúcar"')).toBe('Mercado Pão de Açúcar');
  });
});

describe('isValidDespesa', () => {
  const despesaValida = {
    descricao: 'Almoço',
    valor: 25.5,
    categoria: 'alimentacao',
    forma_pagamento: 'pix',
    recorrencia: 'unica',
    data: '2024-04-10',
  };

  it('aceita despesa válida', () => {
    const result = isValidDespesa(despesaValida);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejeita despesa com campo inválido e retorna erros', () => {
    const result = isValidDespesa({ ...despesaValida, valor: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('null lança TypeError ao acessar propriedades', () => {
    // The function does not guard against null input — passing null throws.
    // This documents the current behavior so future changes are intentional.
    expect(() => isValidDespesa(null)).toThrow(TypeError);
  });

  it('acumula múltiplos erros', () => {
    const result = isValidDespesa({
      descricao: '',
      valor: 0,
      categoria: '',
      forma_pagamento: 'invalida',
      recorrencia: 'invalida',
      data: 'invalida',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});
