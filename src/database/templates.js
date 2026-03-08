/**
 * Função para adicionar suporte a Templates de Despesas
 */

export const buscarTemplates = async (database) => {
  const rows = await database.getAllAsync(
    `SELECT id, descricao, valor, categoria, forma_pagamento, recorrencia
     FROM templates
     ORDER BY nome ASC`
  );
  return rows;
};

export const criarTemplate = async (database, template) => {
  const { nome, descricao, valor, categoria, forma_pagamento, recorrencia } = template;
  
  const result = await database.runAsync(
    `INSERT INTO templates (nome, descricao, valor, categoria, forma_pagamento, recorrencia)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, descricao, valor, categoria, forma_pagamento, recorrencia]
  );
  
  return result.lastInsertRowId;
};

export const deletarTemplate = async (database, id) => {
  await database.runAsync(`DELETE FROM templates WHERE id = ?`, [id]);
};

export const atualizarTemplate = async (database, id, template) => {
  const { nome, descricao, valor, categoria, forma_pagamento, recorrencia } = template;
  
  await database.runAsync(
    `UPDATE templates 
     SET nome = ?, descricao = ?, valor = ?, categoria = ?, forma_pagamento = ?, recorrencia = ?
     WHERE id = ?`,
    [nome, descricao, valor, categoria, forma_pagamento, recorrencia, id]
  );
};
