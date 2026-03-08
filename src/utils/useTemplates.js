import { useCallback, useState } from 'react';
import { buscarTemplates, criarTemplate, deletarTemplate, atualizarTemplate } from '../database/templates';
import { getDatabase } from '../database/database';
import { handleError, logError } from '../utils/errorHandler';

/**
 * Hook para gerenciar templates de despesas
 */
export const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const carregarTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const database = await getDatabase();
      const lista = await buscarTemplates(database);
      setTemplates(lista || []);
    } catch (error) {
      const handled = handleError(error, 'carregarTemplates');
      logError(error, { action: 'carregarTemplates' });
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const adicionarTemplate = useCallback(async (template) => {
    try {
      const database = await getDatabase();
      await criarTemplate(database, template);
      await carregarTemplates();
    } catch (error) {
      const handled = handleError(error, 'adicionarTemplate');
      logError(error, { action: 'adicionarTemplate', template });
      throw handled;
    }
  }, [carregarTemplates]);

  const removerTemplate = useCallback(async (id) => {
    try {
      const database = await getDatabase();
      await deletarTemplate(database, id);
      await carregarTemplates();
    } catch (error) {
      const handled = handleError(error, 'removerTemplate');
      logError(error, { action: 'removerTemplate', id });
      throw handled;
    }
  }, [carregarTemplates]);

  const editarTemplate = useCallback(async (id, template) => {
    try {
      const database = await getDatabase();
      await atualizarTemplate(database, id, template);
      await carregarTemplates();
    } catch (error) {
      const handled = handleError(error, 'editarTemplate');
      logError(error, { action: 'editarTemplate', id, template });
      throw handled;
    }
  }, [carregarTemplates]);

  return {
    templates,
    loadingTemplates,
    carregarTemplates,
    adicionarTemplate,
    removerTemplate,
    editarTemplate,
  };
};
