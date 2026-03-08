/**
 * Error Handler - Tratamento centralizado de erros
 */

/**
 * Categorias de erro
 */
export const ERROR_TYPES = {
  VALIDATION: 'validation_error',
  DATABASE: 'database_error',
  DATABASE_LOCKED: 'database_locked',
  DUPLICATE: 'duplicate_error',
  NOT_FOUND: 'not_found',
  UNKNOWN: 'unknown_error',
};

/**
 * Handler global de erros
 * @param {Error} error - Erro capturado
 * @param {string} context - Contexto onde ocorreu (ex: 'addExpense', 'deleteExpense')
 * @returns {object} - { type, message, userMessage }
 */
export const handleError = (error, context = 'unknown') => {
  const errorMessage = error?.message || String(error);

  console.error(`[ERROR - ${context}]`, {
    message: errorMessage,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
  });

  // Detector de tipo de erro
  if (errorMessage.includes('UNIQUE constraint failed')) {
    return {
      type: ERROR_TYPES.DUPLICATE,
      message: errorMessage,
      userMessage: 'Despesa duplicada. Esta combinação já existe.',
    };
  }

  if (errorMessage.includes('database is locked')) {
    return {
      type: ERROR_TYPES.DATABASE_LOCKED,
      message: errorMessage,
      userMessage: 'Banco de dados está bloqueado. Tente novamente em alguns segundos.',
    };
  }

  if (errorMessage.includes('NOT NULL constraint failed')) {
    return {
      type: ERROR_TYPES.VALIDATION,
      message: errorMessage,
      userMessage: 'Dados obrigatórios faltando.',
    };
  }

  if (errorMessage.includes('CHECK constraint failed')) {
    return {
      type: ERROR_TYPES.VALIDATION,
      message: errorMessage,
      userMessage: 'Valor inválido.',
    };
  }

  if (errorMessage.includes('no such table')) {
    return {
      type: ERROR_TYPES.DATABASE,
      message: errorMessage,
      userMessage: 'Erro na estrutura do banco de dados. Reinicie o app.',
    };
  }

  return {
    type: ERROR_TYPES.UNKNOWN,
    message: errorMessage,
    userMessage: 'Erro desconhecido. Tente novamente.',
  };
};

/**
 * Logger de erro estruturado
 * @param {Error} error
 * @param {object} context - Contexto adicional
 */
export const logError = (error, context = {}) => {
  const log = {
    timestamp: new Date().toISOString(),
    message: error?.message || String(error),
    stack: error?.stack,
    context,
  };

  console.error('[STRUCTURED ERROR LOG]', JSON.stringify(log, null, 2));

  // TODO: Integrar com serviço de logging (ex: Sentry, Firebase)
};

/**
 * Wrapper seguro para funções assíncronas
 * @param {Function} fn - Função async
 * @param {string} context - Contexto
 * @returns {Promise}
 */
export const safeAsync = async (fn, context = 'safeAsync') => {
  try {
    return await fn();
  } catch (error) {
    const handled = handleError(error, context);
    logError(error, { context, handled });
    throw handled;
  }
};
