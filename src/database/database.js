import * as SQLite from 'expo-sqlite';
import { isValidDespesa, isValidDate, sanitizarDescricao } from '../utils/validators';
import { handleError, logError } from '../utils/errorHandler';

let db;

export const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('despesas.db');
  }
  return db;
};

export const initDatabase = async () => {
  const database = await getDatabase();
  try {
    // Criar tabelas (CREATE TABLE IF NOT EXISTS não sobrescreve tabelas existentes)
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS despesas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL CHECK(length(descricao) > 0),
        valor REAL NOT NULL CHECK(valor > 0),
        categoria TEXT NOT NULL,
        recorrencia TEXT NOT NULL DEFAULT 'unica',
        forma_pagamento TEXT NOT NULL DEFAULT 'debito',
        data TEXT NOT NULL,
        mes INTEGER NOT NULL CHECK(mes >= 1 AND mes <= 12),
        ano INTEGER NOT NULL CHECK(ano > 1900),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        descricao TEXT NOT NULL,
        valor REAL NOT NULL CHECK(valor > 0),
        categoria TEXT NOT NULL,
        forma_pagamento TEXT NOT NULL DEFAULT 'debito',
        recorrencia TEXT NOT NULL DEFAULT 'unica',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL UNIQUE,
        limite REAL NOT NULL CHECK(limite > 0),
        ano_mes TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_despesas_mes_ano ON despesas(mes, ano);
      CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria);
      CREATE INDEX IF NOT EXISTS idx_despesas_forma_pagamento ON despesas(forma_pagamento);
      CREATE INDEX IF NOT EXISTS idx_despesas_recorrencia ON despesas(recorrencia);
      CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);
      CREATE INDEX IF NOT EXISTS idx_templates_nome ON templates(nome);
      CREATE INDEX IF NOT EXISTS idx_budgets_ano_mes ON budgets(ano_mes);
    `);
    console.log('[DATABASE] ✅ Tables created/verified');
    
    // Migration: adicionar coluna tipo_gasto se não existir
    const schema = await database.getAllAsync(`PRAGMA table_info(despesas)`);
    const temTipoGasto = schema && schema.some(col => col.name === 'tipo_gasto');
    
    if (!temTipoGasto) {
      try {
        console.log('[DATABASE] 🔄 Migrando banco: adicionando tipo_gasto...');
        await database.execAsync(`
          ALTER TABLE despesas ADD COLUMN tipo_gasto TEXT NOT NULL DEFAULT 'essencial' CHECK(tipo_gasto IN ('essencial', 'desejo', 'poupar'));
        `);
        await database.execAsync(`
          CREATE INDEX IF NOT EXISTS idx_despesas_tipo_gasto ON despesas(tipo_gasto);
        `);
        console.log('[DATABASE] ✅ Migração concluída: tipo_gasto adicionado');
      } catch (alterError) {
        console.error('[DATABASE] ❌ Erro ao migrar:', alterError.message);
        throw alterError;
      }
    } else {
      console.log('[DATABASE] ✅ Coluna tipo_gasto já existe');
    }
    
    console.log('[DATABASE] ✅ Database inicializado com sucesso');
  } catch (error) {
    const handled = handleError(error, 'initDatabase');
    logError(error, { action: 'initDatabase' });
    throw handled;
  }
};

export const inserirDespesa = async (despesa) => {
  try {
    // Validar dados de entrada
    const validacao = isValidDespesa(despesa);
    if (!validacao.valid) {
      const error = new Error(`Validação falhou: ${validacao.errors.join(', ')}`);
      error.type = 'validation_error';
      throw error;
    }

    const database = await getDatabase();
    const { descricao, valor, categoria, tipo_gasto, recorrencia, forma_pagamento, data } = despesa;
    
    // Sanitizar descrição
    const descricaoSanitizada = sanitizarDescricao(descricao);

    if (!isValidDate(data)) {
      const error = new Error(`Data inválida: ${data}`);
      error.type = 'validation_error';
      throw error;
    }

    const dateObj = new Date(data + 'T12:00:00');
    const mes = dateObj.getMonth() + 1;
    const ano = dateObj.getFullYear();

    const result = await database.runAsync(
      `INSERT INTO despesas (descricao, valor, categoria, tipo_gasto, recorrencia, forma_pagamento, data, mes, ano)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [descricaoSanitizada, valor, categoria, tipo_gasto || 'essencial', recorrencia, forma_pagamento, data, mes, ano]
    );

    console.log('[DATABASE] ✅ Despesa inserida:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    const handled = handleError(error, 'inserirDespesa');
    logError(error, { action: 'inserirDespesa', despesa });
    throw handled;
  }
};

export const buscarDespesasPorMes = async (mes, ano) => {
  try {
    const database = await getDatabase();
    const rows = await database.getAllAsync(
      `SELECT * FROM despesas WHERE mes = ? AND ano = ? ORDER BY data DESC`,
      [mes, ano]
    );
    return rows;
  } catch (error) {
    const handled = handleError(error, 'buscarDespesasPorMes');
    logError(error, { action: 'buscarDespesasPorMes', mes, ano });
    throw handled;
  }
};

export const buscarDespesasPorCategoria = async (mes, ano) => {
  try {
    const database = await getDatabase();
    const rows = await database.getAllAsync(
      `SELECT categoria, SUM(valor) as total, COUNT(*) as quantidade
       FROM despesas
       WHERE mes = ? AND ano = ?
       GROUP BY categoria
       ORDER BY total DESC`,
      [mes, ano]
    );
    return rows;
  } catch (error) {
    const handled = handleError(error, 'buscarDespesasPorCategoria');
    logError(error, { action: 'buscarDespesasPorCategoria', mes, ano });
    throw handled;
  }
};

export const buscarResumoPorFormaPagamento = async (mes, ano) => {
  try {
    const database = await getDatabase();
    const rows = await database.getAllAsync(
      `SELECT forma_pagamento, SUM(valor) as total, COUNT(*) as quantidade
       FROM despesas
       WHERE mes = ? AND ano = ?
       GROUP BY forma_pagamento
       ORDER BY total DESC`,
      [mes, ano]
    );
    return rows;
  } catch (error) {
    const handled = handleError(error, 'buscarResumoPorFormaPagamento');
    logError(error, { action: 'buscarResumoPorFormaPagamento', mes, ano });
    throw handled;
  }
};

export const deletarDespesa = async (id) => {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`ID inválido: ${id}`);
    }
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM despesas WHERE id = ?`, [id]);
    console.log('[DATABASE] ✅ Despesa deletada:', id);
  } catch (error) {
    const handled = handleError(error, 'deletarDespesa');
    logError(error, { action: 'deletarDespesa', id });
    throw handled;
  }
};

/**
 * Propagar despesas recorrentes para um novo mês/ano com transações
 * IMPORTANTE: Usa transações para garantir atomicidade
 */
export const propagarRecorrencias = async (mes, ano) => {
  const database = await getDatabase();

  // Validar entrada
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error(`Mês inválido: ${mes}`);
  }
  if (!Number.isInteger(ano) || ano < 1900) {
    throw new Error(`Ano inválido: ${ano}`);
  }

  try {
    // ========== RECORRÊNCIAS MENSAIS, SEMANAIS, DIÁRIAS ==========
    const recorrenciasMensais = await database.getAllAsync(
      `SELECT descricao, valor, categoria, recorrencia, forma_pagamento, MAX(data) as data
       FROM despesas
       WHERE recorrencia IN ('mensal', 'semanal', 'diaria')
         AND (ano < ? OR (ano = ? AND mes < ?))
       GROUP BY descricao, valor, categoria, recorrencia, forma_pagamento`,
      [ano, ano, mes]
    );

    // Iniciar transação
    await database.execAsync('BEGIN TRANSACTION');

    for (const d of recorrenciasMensais) {
      const existe = await database.getFirstAsync(
        `SELECT id FROM despesas
         WHERE descricao = ? AND valor = ? AND categoria = ? AND recorrencia = ? 
               AND forma_pagamento = ? AND mes = ? AND ano = ?`,
        [d.descricao, d.valor, d.categoria, d.recorrencia, d.forma_pagamento, mes, ano]
      );

      if (!existe) {
        const diaOriginal = new Date(d.data + 'T12:00:00').getDate();
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dia = Math.min(diaOriginal, ultimoDia);
        const novaData = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

        await database.runAsync(
          `INSERT INTO despesas (descricao, valor, categoria, recorrencia, forma_pagamento, data, mes, ano)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [d.descricao, d.valor, d.categoria, d.recorrencia, d.forma_pagamento, novaData, mes, ano]
        );
      }
    }

    // ========== RECORRÊNCIAS ANUAIS ==========
    const recorrenciasAnuais = await database.getAllAsync(
      `SELECT descricao, valor, categoria, recorrencia, forma_pagamento, MAX(data) as data
       FROM despesas
       WHERE recorrencia = 'anual'
         AND mes = ? AND ano < ?
       GROUP BY descricao, valor, categoria, recorrencia, forma_pagamento`,
      [mes, ano]
    );

    for (const d of recorrenciasAnuais) {
      const existe = await database.getFirstAsync(
        `SELECT id FROM despesas
         WHERE descricao = ? AND valor = ? AND categoria = ? AND recorrencia = ? 
               AND forma_pagamento = ? AND mes = ? AND ano = ?`,
        [d.descricao, d.valor, d.categoria, d.recorrencia, d.forma_pagamento, mes, ano]
      );

      if (!existe) {
        const diaOriginal = new Date(d.data + 'T12:00:00').getDate();
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dia = Math.min(diaOriginal, ultimoDia);
        const novaData = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

        await database.runAsync(
          `INSERT INTO despesas (descricao, valor, categoria, recorrencia, forma_pagamento, data, mes, ano)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [d.descricao, d.valor, d.categoria, d.recorrencia, d.forma_pagamento, novaData, mes, ano]
        );
      }
    }

    // Confirmar transação
    await database.execAsync('COMMIT');
    console.log('[DATABASE] ✅ Recorrências propagadas para', `${mes}/${ano}`);
  } catch (error) {
    // Reverter transação em caso de erro
    try {
      await database.execAsync('ROLLBACK');
    } catch (rollbackError) {
      console.error('[DATABASE] ❌ Erro ao fazer ROLLBACK:', rollbackError);
    }

    const handled = handleError(error, 'propagarRecorrencias');
    logError(error, { action: 'propagarRecorrencias', mes, ano });
    throw handled;
  }
};

export const buscarTodasDespesas = async () => {
  try {
    const database = await getDatabase();
    const rows = await database.getAllAsync(
      `SELECT * FROM despesas ORDER BY data DESC`
    );
    return rows;
  } catch (error) {
    const handled = handleError(error, 'buscarTodasDespesas');
    logError(error, { action: 'buscarTodasDespesas' });
    throw handled;
  }
};

