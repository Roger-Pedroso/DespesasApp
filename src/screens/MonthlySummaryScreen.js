import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useExpensas } from '../context/ExpensasContext';
import { formatarMoeda, MESES, getFormaPagamentoInfo } from '../utils/constants';
import { useMonthNavigation } from '../utils/useMonthNavigation';
import MonthSelector from '../components/MonthSelector';

const MonthlySummaryScreen = ({ navigation }) => {
  const {
    mesSelecionado, anoSelecionado, despesas, porFormaPagamento,
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

  const mediaGastos = despesas.length > 0 ? totalMes / despesas.length : 0;
  const maiorDespesa = despesas.reduce((max, d) => d.valor > max ? d.valor : max, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MonthSelector
        mes={mesSelecionado}
        ano={anoSelecionado}
        onAnterior={irParaMesAnterior}
        onProximo={irParaProximoMes}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6C5CE7" />
      ) : (
        <>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total em {MESES[mesSelecionado - 1]}</Text>
            <Text style={styles.heroValor}>{formatarMoeda(totalMes)}</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{despesas.length}</Text>
                <Text style={styles.heroStatLabel}>despesas</Text>
              </View>
              <View style={styles.heroSep} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{formatarMoeda(mediaGastos)}</Text>
                <Text style={styles.heroStatLabel}>média por despesa</Text>
              </View>
              <View style={styles.heroSep} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{formatarMoeda(maiorDespesa)}</Text>
                <Text style={styles.heroStatLabel}>maior despesa</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Por Forma de Pagamento</Text>
          {porFormaPagamento.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Sem dados neste mês</Text>
            </View>
          ) : (
            porFormaPagamento.map((item) => {
              const fp = getFormaPagamentoInfo(item.forma_pagamento);
              const pct = totalMes > 0 ? (item.total / totalMes) * 100 : 0;
              return (
                <View key={item.forma_pagamento} style={styles.payCard}>
                  <View style={styles.payHeader}>
                    <View style={styles.payLeft}>
                      <View style={[styles.payIconBox, { backgroundColor: fp.cor + '22' }]}>
                        <Text style={styles.payIcon}>{fp.icon}</Text>
                      </View>
                      <View>
                        <Text style={styles.payLabel}>{fp.label}</Text>
                        <Text style={styles.payQtd}>{item.quantidade} transações</Text>
                      </View>
                    </View>
                    <View style={styles.payRight}>
                      <Text style={styles.payValor}>{formatarMoeda(item.total)}</Text>
                      <Text style={[styles.payPct, { color: fp.cor }]}>{pct.toFixed(1)}%</Text>
                    </View>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.bar, { width: `${pct}%`, backgroundColor: fp.cor }]} />
                  </View>
                </View>
              );
            })
          )}

          <Text style={styles.sectionTitle}>Dias com mais gastos</Text>
          {despesas.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Sem dados neste mês</Text>
            </View>
          ) : (
            (() => {
              const porDia = despesas.reduce((acc, d) => {
                acc[d.data] = (acc[d.data] || 0) + d.valor;
                return acc;
              }, {});
              const top5 = Object.entries(porDia)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
              return (
                <View style={styles.daysCard}>
                  {top5.map(([dia, val], idx) => {
                    const dateObj = new Date(dia + 'T00:00:00');
                    const pct = totalMes > 0 ? (val / totalMes) * 100 : 0;
                    return (
                      <View key={dia} style={styles.dayRow}>
                        <Text style={styles.dayRank}>#{idx + 1}</Text>
                        <View style={styles.dayInfo}>
                          <Text style={styles.dayLabel}>{dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</Text>
                          <View style={styles.dayBarBg}>
                            <View style={[styles.dayBar, { width: `${pct}%` }]} />
                          </View>
                        </View>
                        <Text style={styles.dayValor}>{formatarMoeda(val)}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })()
          )}
          <View style={{ height: 30 }} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  heroCard: {
    backgroundColor: '#6C5CE7', marginHorizontal: 16, marginVertical: 10,
    borderRadius: 20, padding: 22, alignItems: 'center',
  },
  heroLabel: { color: '#DFE6E9', fontSize: 13, marginBottom: 4 },
  heroValor: { color: '#fff', fontSize: 36, fontWeight: '800', marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around' },
  heroStat: { alignItems: 'center' },
  heroStatVal: { color: '#fff', fontSize: 14, fontWeight: '700' },
  heroStatLabel: { color: '#DFE6E9', fontSize: 11, marginTop: 2 },
  heroSep: { width: 1, height: 30, backgroundColor: '#ffffff33' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#636E72', textTransform: 'uppercase', marginTop: 18, marginBottom: 8, marginHorizontal: 16, letterSpacing: 0.5 },
  emptySection: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyText: { color: '#B2BEC3', fontSize: 14 },
  payCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginVertical: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  payHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  payLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  payIcon: { fontSize: 20 },
  payLabel: { fontSize: 15, fontWeight: '600', color: '#2D3436' },
  payQtd: { fontSize: 12, color: '#B2BEC3', marginTop: 2 },
  payRight: { alignItems: 'flex-end' },
  payValor: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  payPct: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  barBg: { height: 6, backgroundColor: '#F5F6FA', borderRadius: 3, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
  daysCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginVertical: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  dayRank: { fontSize: 12, fontWeight: '700', color: '#B2BEC3', width: 22 },
  dayInfo: { flex: 1 },
  dayLabel: { fontSize: 13, color: '#2D3436', marginBottom: 4 },
  dayBarBg: { height: 5, backgroundColor: '#F5F6FA', borderRadius: 3, overflow: 'hidden' },
  dayBar: { height: 5, backgroundColor: '#6C5CE7', borderRadius: 3 },
  dayValor: { fontSize: 13, fontWeight: '700', color: '#2D3436' },
});

export default MonthlySummaryScreen;
