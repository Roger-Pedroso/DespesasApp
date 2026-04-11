import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAlocacao } from '../utils/useAlocacao';
import { useMonthNavigation } from '../utils/useMonthNavigation';
import { buscarBreakdownPoupar } from '../database/allocation';
import { MESES } from '../utils/constants';
import { COLORS } from '../utils/theme';

const BudgetAllocationScreen = () => {
  const { alocacao, loading, carregarAlocacao } = useAlocacao();
  const { mesSelecionado, anoSelecionado, proximoMes, mesPrevio } = useMonthNavigation();
  const [breakdownPoupar, setBreakdownPoupar] = useState(null);
  const [breakdownError, setBreakdownError] = useState(null);

  useEffect(() => {
    carregarAlocacao(mesSelecionado, anoSelecionado);
  }, [mesSelecionado, anoSelecionado, carregarAlocacao]);

  // Carregar breakdown de Poupar
  useEffect(() => {
    const carregarBreakdown = async () => {
      try {
        const breakdown = await buscarBreakdownPoupar(mesSelecionado, anoSelecionado);
        setBreakdownPoupar(breakdown);
      } catch (error) {
        setBreakdownError('Não foi possível carregar o detalhamento.');
        setBreakdownPoupar({ investimentos: 0, reserva_emergencia: 0, total: 0 });
      }
    };

    carregarBreakdown();
  }, [mesSelecionado, anoSelecionado]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!alocacao) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nenhum dado disponível</Text>
      </View>
    );
  }

  const renderCard = (tipo, icon, label, percentAlvo) => {
    const data = alocacao[tipo];
    const percentReal = data.percentReal.toFixed(1);
    const valor = data.valor.toFixed(2).replace('.', ',');
    const alvo = data.alvo.toFixed(2).replace('.', ',');

    const statusColor =
      data.status === 'OK' ? COLORS.success :
      data.status === 'AVISO' ? COLORS.warning : COLORS.danger;

    const statusEmoji =
      data.status === 'OK' ? '✅' :
      data.status === 'AVISO' ? '⚠️' : '❌';

    // Se for Poupar, renderizar com breakdown
    if (tipo === 'poupar' && breakdownPoupar) {
      return (
        <View key={tipo} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <Text style={styles.cardIcon}>{icon}</Text>
              <View>
                <Text style={styles.cardLabel}>{label}</Text>
                <Text style={styles.cardSubLabel}>Alvo: {percentAlvo}%</Text>
              </View>
            </View>
            <Text style={[styles.statusEmoji, { color: statusColor }]}>
              {statusEmoji}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(percentReal, 100)}%`,
                    backgroundColor: statusColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>{percentReal}%</Text>
          </View>

          <View style={styles.valuesContainer}>
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>Gasto</Text>
              <Text style={styles.valueAmount}>R$ {valor}</Text>
            </View>
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>Alvo</Text>
              <Text style={styles.valueAmount}>R$ {alvo}</Text>
            </View>
          </View>

          {/* Erro de breakdown */}
          {breakdownError && (
            <Text style={styles.breakdownErrorText}>{breakdownError}</Text>
          )}

          {/* Breakdown de subcategorias */}
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Discriminação:</Text>
            
            {breakdownPoupar.investimentos > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownIcon}>💼</Text>
                <View style={styles.breakdownItemText}>
                  <Text style={styles.breakdownLabel}>Investimentos</Text>
                  <Text style={styles.breakdownValue}>
                    R$ {breakdownPoupar.investimentos.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            )}

            {breakdownPoupar.reserva_emergencia > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownIcon}>🚨</Text>
                <View style={styles.breakdownItemText}>
                  <Text style={styles.breakdownLabel}>Reserva de Emergência</Text>
                  <Text style={styles.breakdownValue}>
                    R$ {breakdownPoupar.reserva_emergencia.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            )}

            {breakdownPoupar.investimentos === 0 && breakdownPoupar.reserva_emergencia === 0 && (
              <Text style={styles.breakdownEmpty}>Nenhuma categoria registrada</Text>
            )}
          </View>

          <Text style={[styles.recomendacao, { color: statusColor }]}>
            {data.recomendacao}
          </Text>
        </View>
      );
    }

    // Renderização padrão para outros tipos
    return (
      <View key={tipo} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text style={styles.cardIcon}>{icon}</Text>
            <View>
              <Text style={styles.cardLabel}>{label}</Text>
              <Text style={styles.cardSubLabel}>Alvo: {percentAlvo}%</Text>
            </View>
          </View>
          <Text style={[styles.statusEmoji, { color: statusColor }]}>
            {statusEmoji}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percentReal, 100)}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>{percentReal}%</Text>
        </View>

        <View style={styles.valuesContainer}>
          <View style={styles.valueBox}>
            <Text style={styles.valueLabel}>Gasto</Text>
            <Text style={styles.valueAmount}>R$ {valor}</Text>
          </View>
          <View style={styles.valueBox}>
            <Text style={styles.valueLabel}>Alvo</Text>
            <Text style={styles.valueAmount}>R$ {alvo}</Text>
          </View>
        </View>

        <Text style={[styles.recomendacao, { color: statusColor }]}>
          {data.recomendacao}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💳 Alocação 50/30/20</Text>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={mesPrevio} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MESES[mesSelecionado - 1]} / {anoSelecionado}
          </Text>
          <TouchableOpacity onPress={proximoMes} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total do Mês</Text>
        <Text style={styles.totalAmount}>
          R$ {alocacao.totalMes.toFixed(2).replace('.', ',')}
        </Text>
      </View>

      {/* Cards */}
      {renderCard('essencial', '💰', 'Essencial', 50)}
      {renderCard('desejo', '🎉', 'Desejos', 30)}
      {renderCard('poupar', '🏦', 'Poupar', 20)}

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Dicas</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Mantenha 50% com gastos essenciais como moradia, alimentação e transporte
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Use 30% para desejos como lazer, assinaturas e entretenimento
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Reserve 20% para poupar e investimentos em seu futuro
          </Text>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusEmoji: {
    fontSize: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'right',
  },
  valuesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  valueBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  valueAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  recomendacao: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipBullet: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    marginRight: 8,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 20,
  },
  spacer: {
    height: 20,
  },
  breakdownContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breakdownIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  breakdownItemText: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  breakdownValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  breakdownEmpty: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  breakdownErrorText: {
    fontSize: 11,
    color: COLORS.danger,
    marginBottom: 8,
  },
});

export default BudgetAllocationScreen;
