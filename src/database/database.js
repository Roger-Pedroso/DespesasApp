import * as SQLite from 'expo-sqlite';

let db;

export const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('despesas.db');
  }
  return db;
};

export const initDatabase = async () => {
  const database = await getDatabase();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS despesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      categoria TEXT NOT NULL,
      recorrencia TEXT NOT NULL DEFAULT 'unica',
      forma_pagamento TEXT NOT NULL DEFAULT 'debito',
      data TEXT NOT NULL,
      mes INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
};

export const inserirDespesa = async (despesa) => {
  const database = await getDatabase();
  const { descricao, valor, categoria, recorrencia, forma_pagamento, data } = despesa;
  const dateObj = new Date(data);
  const mes = dateObj.getMonth() + 1;
  const ano = dateObj.getFullYear();
  const result = await database.runAsync(
    `INSERT INTO despesas (descricao, valor, categoria, recorrencia, forma_pagamento, data, mes, ano)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [descricao, valor, categoria, recorrencia, forma_pagamento, data, mes, ano]
  );
  return result.lastInsertRowId;
};

export const buscarDespesasPorMes = async (mes, ano) => {
  const database = await getDatabase();
  const rows = await database.getAllAsync(
    `SELECT * FROM despesas WHERE mes = ? AND ano = ? ORDER BY data DESC`,
    [mes, ano]
  );
  return rows;
};

export const buscarDespesasPorCategoria = async (mes, ano) => {
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
};

export const buscarResumoPorFormaPagamento = async (mes, ano) => {
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
};

export const deletarDespesa = async (id) => {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM despesas WHERE id = ?`, [id]);
};

export const propagarRecorrencias = async (mes, ano) => {
  const database = await getDatabase();

  const recorrenciasMensais = await database.getAllAsync(
    `SELECT descricao, valor, categoria, recorrencia, forma_pagamento, MAX(data) as data
     FROM despesas
     WHERE recorrencia IN ('mensal', 'semanal', 'diaria')
       AND (ano < ? OR (ano = ? AND mes < ?))
     GROUP BY descricao, valor, categoria, recorrencia, forma_pagamento`,
    [ano, ano, mes]
  );

  for (const d of recorrenciasMensais) {
    const existe = await database.getFirstAsync(
      `SELECT id FROM despesas
       WHERE descricao = ? AND valor = ? AND categoria = ? AND recorrencia = ? AND forma_pagamento = ? AND mes = ? AND ano = ?`,
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
       WHERE descricao = ? AND valor = ? AND categoria = ? AND recorrencia = ? AND forma_pagamento = ? AND mes = ? AND ano = ?`,
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
};

export const buscarTodasDespesas = async () => {
  const database = await getDatabase();
  const rows = await database.getAllAsync(
    `SELECT * FROM despesas ORDER BY data DESC`
  );
  return rows;
};
