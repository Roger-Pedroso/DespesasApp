import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useExpensas } from '../context/ExpensasContext';
import { formatarMoeda, MESES } from '../utils/constants';
import { useMonthNavigation } from '../utils/useMonthNavigation';
import { COLORS, SHADOW, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../utils/theme';
import ExpenseItem from '../components/ExpenseItem';
import MonthSelector from '../components/MonthSelector';

const HomeScreen = ({ navigation }) => {
  const {
    mesSelecionado, anoSelecionado, despesas, loading,
    totalMes, carregarDados, removerDespesa, trocarMes,
  } = useExpensas();

  const { irParaMesAnterior, irParaProximoMes } = useMonthNavigation(
    mesSelecionado,
    anoSelecionado,
    trocarMes,
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDados(mesSelecionado, anoSelecionado);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigation, carregarDados, mesSelecionado, anoSelecionado]);

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
        <ActivityIndicator style={styles.loading} size="large" color={COLORS.primary} />
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  titulo: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  addBtnText: { color: COLORS.textInverse, fontWeight: '700', fontSize: 14 },
  totalCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOW.md,
  },
  totalLabel: { color: COLORS.border, fontSize: 13, marginBottom: SPACING.sm },
  totalValor: { color: COLORS.textInverse, fontSize: 32, fontWeight: '800' },
  totalQtd: { color: COLORS.border, fontSize: 13, marginTop: SPACING.sm },
  loading: { marginTop: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon: { fontSize: 56, marginBottom: SPACING.lg },
  emptyText: { fontSize: 16, color: COLORS.textTertiary, marginBottom: SPACING.xl },
  emptyBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  emptyBtnText: { color: COLORS.textInverse, fontWeight: '700' },
  list: { paddingBottom: 20 },
});

export default HomeScreen;
