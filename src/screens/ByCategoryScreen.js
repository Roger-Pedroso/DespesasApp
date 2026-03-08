import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { useExpensas } from '../context/ExpensasContext';
import { formatarMoeda, MESES } from '../utils/constants';
import { useMonthNavigation } from '../utils/useMonthNavigation';
import CategoryCard from '../components/CategoryCard';
import MonthSelector from '../components/MonthSelector';

const ByCategoryScreen = ({ navigation }) => {
  const {
    mesSelecionado, anoSelecionado, porCategoria,
    loading, totalMes, carregarDados, trocarMes,
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

  return (
    <View style={styles.container}>
      <MonthSelector
        mes={mesSelecionado}
        ano={anoSelecionado}
        onAnterior={irParaMesAnterior}
        onProximo={irParaProximoMes}
      />

      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Total em {MESES[mesSelecionado - 1]}</Text>
        <Text style={styles.totalValor}>{formatarMoeda(totalMes)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6C5CE7" />
      ) : porCategoria.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Sem despesas em {MESES[mesSelecionado - 1]}</Text>
        </View>
      ) : (
        <FlatList
          data={porCategoria}
          keyExtractor={(item) => item.categoria}
          renderItem={({ item }) => <CategoryCard item={item} total={totalMes} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>{porCategoria.length} {porCategoria.length === 1 ? 'categoria' : 'categorias'}</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  totalBanner: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 4,
    borderRadius: 14, padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  totalLabel: { fontSize: 14, color: '#636E72', fontWeight: '500' },
  totalValor: { fontSize: 20, fontWeight: '800', color: '#6C5CE7' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#636E72', textTransform: 'uppercase', marginHorizontal: 16, marginVertical: 8, letterSpacing: 0.5 },
  list: { paddingBottom: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#B2BEC3' },
});

export default ByCategoryScreen;
