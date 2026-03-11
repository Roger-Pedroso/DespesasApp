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

const BudgetAllocationScreen = () => {
  const { alocacao, loading, carregarAlocacao } = useAlocacao();
  const { mesSelecionado, anoSelecionado, proximoMes, mesPrevio } = useMonthNavigation();
  const [breakdownPoupar, setBreakdownPoupar] = useState(null);

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
        console.warn('Erro ao carregar breakdown:', error);
        setBreakdownPoupar({ investimentos: 0, reserva_emergencia: 0, total: 0 });
      }
    };

    carregarBreakdown();
  }, [mesSelecionado, anoSelecionado]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
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
      data.status === 'OK' ? '#2ED573' :
      data.status === 'AVISO' ? '#FFB84D' : '#FF4757';

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
    backgroundColor: '#F5F6FA',
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
    color: '#2D3436',
    marginBottom: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
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
    color: '#6C5CE7',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  totalSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6C5CE7',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
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
    color: '#2D3436',
  },
  cardSubLabel: {
    fontSize: 11,
    color: '#636E72',
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
    backgroundColor: '#E8EAED',
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
    color: '#2D3436',
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
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 11,
    color: '#636E72',
    fontWeight: '600',
  },
  valueAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3436',
    marginTop: 2,
  },
  recomendacao: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipBullet: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '700',
    marginRight: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#636E72',
    flex: 1,
    lineHeight: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#636E72',
    marginTop: 20,
  },
  spacer: {
    height: 20,
  },
  breakdownContainer: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#636E72',
    marginBottom: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
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
    color: '#2D3436',
  },
  breakdownValue: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
  },
  breakdownEmpty: {
    fontSize: 11,
    color: '#B2BEC3',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default BudgetAllocationScreen;
