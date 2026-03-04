import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  buscarDespesasPorMes,
  buscarDespesasPorCategoria,
  buscarResumoPorFormaPagamento,
  inserirDespesa,
  deletarDespesa,
  propagarRecorrencias,
} from '../database/database';

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
    carregarDados(mes, ano);
  };

  const totalMes = despesas.reduce((acc, d) => acc + d.valor, 0);

  return (
    <ExpensasContext.Provider
      value={{
        mesSelecionado,
        anoSelecionado,
        despesas,
        porCategoria,
        porFormaPagamento,
        loading,
        totalMes,
        carregarDados,
        adicionarDespesa,
        removerDespesa,
        trocarMes,
      }}
    >
      {children}
    </ExpensasContext.Provider>
  );
};

export const useExpensas = () => useContext(ExpensasContext);
