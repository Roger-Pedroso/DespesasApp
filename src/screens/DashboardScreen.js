import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useInsights } from '../utils/useInsights';
import { COLORS, BORDER_RADIUS, SPACING } from '../utils/theme';

const DashboardScreen = () => {
  const {
    trends,
    comparison,
    topCategories,
    forecast,
    economyScore,
    worstDay,
    loading,
    error,
    carregarInsights,
  } = useInsights();

  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    const now = new Date();
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => carregarInsights(now.getMonth() + 1, now.getFullYear())}
        >
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTrendChart = useCallback(() => {
    if (!trends || trends.length === 0) return null;

    const maxValue = Math.max(...trends.map((t) => t.total || 0));
    if (!maxValue || maxValue === 0) return null;
    
    const screenWidth = Dimensions.get('window').width - 32;
    const barWidth = screenWidth / 12 - 8;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📈 Últimos 12 Meses</Text>
        <View style={styles.chartContent}>
          <View style={styles.chartBars}>
            {trends.map((trend, idx) => {
              const mesLabel = String(trend.mes || '').padStart(2, '0');
              return (
                <View key={idx} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (trend.total / maxValue) * 150,
                        backgroundColor: COLORS.primary,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{mesLabel}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartNote}>
            Máximo: R$ {(maxValue || 0).toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>
    );
  }, [trends]);

  const renderComparison = useCallback(() => {
    if (!comparison) return null;

    const mes_atual = comparison.mesAtual?.total || 0;
    const mes_anterior = comparison.mesAnterior?.total || 0;
    const variance = mes_atual - mes_anterior;
    const percentageChange = mes_anterior > 0 ? ((variance / mes_anterior) * 100).toFixed(1) : 0;
    const trend = variance > 0 ? '📈 Aumento' : '📉 Redução';
    const trendColor = variance > 0 ? COLORS.danger : COLORS.success;

    return (
      <View style={styles.comparisonContainer}>
        <Text style={styles.chartTitle}>📊 Comparação com Mês Anterior</Text>

        <View style={styles.comparisonRow}>
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonLabel}>Mês Atual</Text>
            <Text style={styles.comparisonValue}>
              R$ {(mes_atual || 0).toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={[styles.comparisonCard, styles.comparisonCardAlt]}>
            <Text style={styles.comparisonLabel}>Mês Anterior</Text>
            <Text style={styles.comparisonValue}>
              R$ {(mes_anterior || 0).toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        <View
          style={[styles.varianceContainer, { backgroundColor: trendColor }]}
        >
          <Text style={styles.varianceText}>{trend}</Text>
          <Text style={styles.varianceValue}>
            {variance > 0 ? '+' : ''}
            {Math.abs(variance).toFixed(2).replace('.', ',')} ({percentageChange}%)
          </Text>
        </View>
      </View>
    );
  }, [comparison]);

  const renderTopCategories = useCallback(() => {
    if (!topCategories || topCategories.length === 0) return null;

    const total = topCategories.reduce((sum, cat) => sum + (cat.total || 0), 0);
    if (total === 0) return null;

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.chartTitle}>🏷️ Top 5 Categorias</Text>

        {topCategories.map((category, idx) => {
          const percentage = ((((category.total || 0) / total) * 100) || 0).toFixed(1);
          return (
            <View key={idx} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.categoria || 'N/A'}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.categoryValue}>
                R$ {(category.total || 0).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          );
        })}

        <Text style={styles.totalText}>
          Total: R$ {(total || 0).toFixed(2).replace('.', ',')}
        </Text>
      </View>
    );
  }, [topCategories]);

  const renderForecast = useCallback(() => {
    if (!forecast) return null;

    const totalMesAtual = forecast.totalAteHoje || 0;
    const previsaoTotal = forecast.previsaoTotal || 0;
    const diasRestantes = forecast.diasRestantes || 0;
    const mediaPorDia = forecast.mediaPorDia || 0;

    return (
      <View style={styles.forecastContainer}>
        <Text style={styles.chartTitle}>🔮 Previsão até Fim do Mês</Text>

        <View style={styles.forecastContent}>
          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>Gasto Atual</Text>
            <Text style={styles.forecastValue}>
              R$ {(totalMesAtual || 0).toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>Projeção Final</Text>
            <Text style={styles.forecastValue}>
              R$ {(previsaoTotal || 0).toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>Dias Restantes</Text>
            <Text style={styles.forecastValue}>{diasRestantes}</Text>
          </View>
        </View>

        <Text style={styles.forecastNote}>
          Média diária: R$ {(mediaPorDia || 0).toFixed(2).replace('.', ',')}
        </Text>
      </View>
    );
  }, [forecast]);

  const renderEconomyScore = useCallback(() => {
    if (economyScore === null || economyScore === undefined) return null;

    const scoreColor =
      economyScore >= 80 ? COLORS.success : economyScore >= 50 ? COLORS.warning : COLORS.danger;

    return (
      <View style={styles.scoreContainer}>
        <Text style={styles.chartTitle}>💰 Score de Economia</Text>

        <View style={styles.scoreCircle}>
          <View
            style={[
              styles.scoreCircleInner,
              { borderColor: scoreColor },
            ]}
          >
            <Text style={styles.scoreValue}>{economyScore}</Text>
            <Text style={styles.scoreLabel}>/ 100</Text>
          </View>
        </View>

        <View style={[styles.scoreStatus, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreStatusText}>
            {economyScore >= 80
              ? '🌟 Excelente controle'
              : economyScore >= 50
              ? '⚠️ Atenção necessária'
              : '🚨 Gastos altos'}
          </Text>
        </View>
      </View>
    );
  }, [economyScore]);

  const renderWorstDay = useCallback(() => {
    if (!worstDay || !worstDay.data) return null;

    return (
      <View style={styles.worstDayContainer}>
        <Text style={styles.chartTitle}>⚠️ Dia com Maior Gasto</Text>

        <View style={styles.worstDayCard}>
          <View style={styles.worstDayInfo}>
            <Text style={styles.worstDayDate}>{worstDay.data || 'N/A'}</Text>
            <Text style={styles.worstDayAmount}>
              R$ {(worstDay.total || 0).toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={styles.worstDayExpenses}>
            <Text style={styles.expensesLabel}>
              {worstDay.quantidade || 0} despesa{(worstDay.quantidade || 0) !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [worstDay]);

  return (
    <View style={styles.container}>
      {/* Abas de Navegação */}
      <View style={styles.tabContainer}>
        {[
          { label: 'Visão Geral', value: 'overview' },
          { label: 'Análise Detalhada', value: 'detailed' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab,
              activeTab === tab.value && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.value && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' ? (
          <>
            {renderEconomyScore()}
            {renderComparison()}
            {renderWorstDay()}
          </>
        ) : (
          <>
            {renderTrendChart()}
            {renderTopCategories()}
            {renderForecast()}
          </>
        )}
      </ScrollView>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  retryText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  chartContent: {
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: SPACING.md,
    gap: 4,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  chartNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  comparisonContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xl,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  comparisonCardAlt: {
    backgroundColor: COLORS.success + '22',
  },
  comparisonLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  varianceContainer: {
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  varianceText: {
    fontSize: 14,
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  varianceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginTop: 4,
  },
  categoriesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    minWidth: 100,
    textAlign: 'right',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  forecastContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  forecastContent: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  forecastCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  forecastLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  forecastValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  forecastNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  scoreCircle: {
    marginVertical: SPACING.xl,
  },
  scoreCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scoreStatus: {
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  scoreStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
    textAlign: 'center',
  },
  worstDayContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  worstDayCard: {
    backgroundColor: COLORS.warning + '33',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  worstDayInfo: {
    flex: 1,
  },
  worstDayDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  worstDayAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.warning,
  },
  worstDayExpenses: {
    backgroundColor: COLORS.warning + '22',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  expensesLabel: {
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: '600',
  },
});

export default DashboardScreen;
