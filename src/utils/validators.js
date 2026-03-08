/**
 * Validators - Funções de validação robustas
 */

/**
 * Valida se uma data está em formato RFC 3339 (YYYY-MM-DD)
 * @param {string} dateStr - Data em string
 * @returns {boolean}
 */
export const isValidDate = (dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const [year, month, day] = dateStr.split('-').map(Number);

  // Validar ranges
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Validar dia para o mês específico
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
  );
};

/**
 * Valida se um valor é um número BRL válido
 * @param {number | string} valor - Valor a validar
 * @returns {boolean}
 */
export const isValidBRL = (valor) => {
  const num = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
  return !isNaN(num) && num > 0 && num <= 999999.99;
};

/**
 * Valida se uma descrição é válida (não vazia, não muito longa)
 * @param {string} descricao - Descrição
 * @returns {boolean}
 */
export const isValidDescricao = (descricao) => {
  if (typeof descricao !== 'string') return false;
  const trimmed = descricao.trim();
  return trimmed.length > 0 && trimmed.length <= 255;
};

/**
 * Valida categorias válidas
 * @param {string} categoria - Categoria
 * @param {array} categoriasValidas - Lista de categorias válidas
 * @returns {boolean}
 */
export const isValidCategoria = (categoria, categoriasValidas = []) => {
  if (categoriasValidas.length === 0) {
    // Se não houver lista, apenas valida string não-vazia
    return typeof categoria === 'string' && categoria.trim().length > 0;
  }
  return categoriasValidas.includes(categoria);
};

/**
 * Valida formas de pagamento válidas
 * @param {string} formaPagamento - Forma de pagamento
 * @returns {boolean}
 */
export const isValidFormaPagamento = (formaPagamento) => {
  const formasValidas = ['debito', 'credito', 'pix'];
  return formasValidas.includes(formaPagamento);
};

/**
 * Valida recorrências válidas
 * @param {string} recorrencia - Tipo de recorrência
 * @returns {boolean}
 */
export const isValidRecorrencia = (recorrencia) => {
  const recorrenciasValidas = ['unica', 'diaria', 'semanal', 'mensal', 'anual'];
  return recorrenciasValidas.includes(recorrencia);
};

/**
 * Valida despesa completa
 * @param {object} despesa - Objeto de despesa
 * @param {array} categoriasValidas - Lista de categorias válidas (opcional)
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export const isValidDespesa = (despesa, categoriasValidas = []) => {
  const errors = [];

  if (!isValidDescricao(despesa.descricao)) {
    errors.push('Descrição inválida (1-255 caracteres)');
  }

  if (!isValidBRL(despesa.valor)) {
    errors.push('Valor inválido (deve ser > 0 e <= 999.999,99)');
  }

  if (!isValidCategoria(despesa.categoria, categoriasValidas)) {
    errors.push('Categoria inválida');
  }

  if (!isValidFormaPagamento(despesa.forma_pagamento)) {
    errors.push('Forma de pagamento inválida');
  }

  if (!isValidRecorrencia(despesa.recorrencia)) {
    errors.push('Recorrência inválida');
  }

  if (!isValidDate(despesa.data)) {
    errors.push('Data inválida (use formato YYYY-MM-DD)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitiza descrição removendo caracteres perigosos
 * @param {string} descricao - Descrição
 * @returns {string}
 */
export const sanitizarDescricao = (descricao) => {
  return descricao
    .trim()
    .replace(/[<>\"']/g, '') // Remove caracteres HTML/SQL perigosos
    .slice(0, 255); // Limita a 255 caracteres
};
