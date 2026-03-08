import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  buscarDespesasPorMes,
  buscarDespesasPorCategoria,
  buscarResumoPorFormaPagamento,
  inserirDespesa,
  deletarDespesa,
  propagarRecorrencias,
} from '../database/database';
import { CATEGORIAS } from '../utils/constants';

const ExpensasContext = createContext();

export const ExpensasProvider = ({ children }) => {
  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());
  const [despesas, setDespesas] = useState([]);
  const [porCategoria, setPorCategoria] = useState([]);
  const [porFormaPagamento, setPorFormaPagamento] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarDados = useCallback(async (mes, ano) => {
    setLoading(true);
    try {
      const [lista, cats, pagamentos] = await Promise.all([
        buscarDespesasPorMes(mes, ano),
        buscarDespesasPorCategoria(mes, ano),
        buscarResumoPorFormaPagamento(mes, ano),
      ]);
      setDespesas(lista);
      setPorCategoria(cats);
      setPorFormaPagamento(pagamentos);
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarDespesa = async (despesa) => {
    await inserirDespesa(despesa);
    await carregarDados(mesSelecionado, anoSelecionado);
  };

  const removerDespesa = async (id) => {
    await deletarDespesa(id);
    await carregarDados(mesSelecionado, anoSelecionado);
  };

  const trocarMes = async (mes, ano) => {
    setMesSelecionado(mes);
    setAnoSelecionado(ano);
    await propagarRecorrencias(mes, ano);
    await carregarDados(mes, ano);
  };

  const totalMes = despesas.reduce((acc, d) => acc + d.valor, 0);

  const value = {
    mesSelecionado,
    anoSelecionado,
    despesas,
    porCategoria,
    porFormaPagamento,
    loading,
    totalMes,
    categorias: CATEGORIAS.map(c => c.value),
    carregarDados,
    adicionarDespesa,
    removerDespesa,
    trocarMes,
  };

  return (
    <ExpensasContext.Provider value={value}>
      {children}
    </ExpensasContext.Provider>
  );
};

ExpensasProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useExpensas = () => {
  const context = useContext(ExpensasContext);
  if (!context) {
    throw new Error('useExpensas deve ser usado dentro de ExpensasProvider');
  }
  return context;
};
