import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useExpensas } from '../context/ExpensasContext';
import { formatarMoeda, MESES } from '../utils/constants';
import ExpenseItem from '../components/ExpenseItem';
import MonthSelector from '../components/MonthSelector';

const HomeScreen = ({ navigation }) => {
  const {
    mesSelecionado, anoSelecionado, despesas, loading,
    totalMes, carregarDados, removerDespesa, trocarMes,
  } = useExpensas();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDados(mesSelecionado, anoSelecionado);
    });
    return unsubscribe;
  }, [navigation, mesSelecionado, anoSelecionado]);

  const irParaMesAnterior = () => {
    if (mesSelecionado === 1) {
      trocarMes(12, anoSelecionado - 1);
    } else {
      trocarMes(mesSelecionado - 1, anoSelecionado);
    }
  };

  const irParaProximoMes = () => {
    if (mesSelecionado === 12) {
      trocarMes(1, anoSelecionado + 1);
    } else {
      trocarMes(mesSelecionado + 1, anoSelecionado);
    }
  };

  const confirmarDelete = (id) => {
    Alert.alert('Excluir despesa', 'Deseja excluir esta despesa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removerDespesa(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Minhas Despesas</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.addBtnText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      <MonthSelector
        mes={mesSelecionado}
        ano={anoSelecionado}
        onAnterior={irParaMesAnterior}
        onProximo={irParaProximoMes}
      />

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total do mês</Text>
        <Text style={styles.totalValor}>{formatarMoeda(totalMes)}</Text>
        <Text style={styles.totalQtd}>{despesas.length} {despesas.length === 1 ? 'despesa' : 'despesas'}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} size="large" color="#6C5CE7" />
      ) : despesas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Nenhuma despesa em {MESES[mesSelecionado - 1]}</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <Text style={styles.emptyBtnText}>Adicionar despesa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={despesas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ExpenseItem despesa={item} onDelete={confirmarDelete} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titulo: { fontSize: 24, fontWeight: '800', color: '#2D3436' },
  addBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  totalCard: {
    backgroundColor: '#6C5CE7',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  totalLabel: { color: '#DFE6E9', fontSize: 13, marginBottom: 4 },
  totalValor: { color: '#fff', fontSize: 32, fontWeight: '800' },
  totalQtd: { color: '#DFE6E9', fontSize: 13, marginTop: 4 },
  loading: { marginTop: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#B2BEC3', marginBottom: 20 },
  emptyBtn: { backgroundColor: '#6C5CE7', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  list: { paddingBottom: 20 },
});

export default HomeScreen;
