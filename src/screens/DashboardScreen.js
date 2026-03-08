import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useInsights } from '../utils/useInsights';

const DashboardScreen = () => {
  const {
    trends,
    comparison,
    topCategories,
    forecast,
    economyScore,
    worstDay,
    loading,
  } = useInsights();

  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  const renderTrendChart = () => {
    if (!trends || trends.length === 0) return null;

    const maxValue = Math.max(...trends.map((t) => t.total));
    const screenWidth = Dimensions.get('window').width - 32;
    const barWidth = screenWidth / 12 - 8;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📈 Últimos 12 Meses</Text>
        <View style={styles.chartContent}>
          <View style={styles.chartBars}>
            {trends.map((trend, idx) => (
              <View key={idx} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (trend.total / maxValue) * 150,
                      backgroundColor: '#6C5CE7',
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{trend.mes_ano.slice(-2)}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartNote}>
            Máximo: R$ {maxValue.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>
    );
  };

  const renderComparison = () => {
    if (!comparison) return null;

    const variance = comparison.mes_atual - comparison.mes_anterior;
    const percentageChange = (
      (variance / comparison.mes_anterior) * 100
    ).toFixed(1);
    const trend = variance > 0 ? '📈 Aumento' : '📉 Redução';
    const trendColor = variance > 0 ? '#FF4757' : '#2ED573';

    return (
      <View style={styles.comparisonContainer}>
        <Text style={styles.chartTitle}>📊 Comparação com Mês Anterior</Text>

        <View style={styles.comparisonRow}>
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonLabel}>Mês Atual</Text>
            <Text style={styles.comparisonValue}>
              R$ {comparison.mes_atual.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={[styles.comparisonCard, styles.comparisonCardAlt]}>
            <Text style={styles.comparisonLabel}>Mês Anterior</Text>
            <Text style={styles.comparisonValue}>
              R$ {comparison.mes_anterior.toFixed(2).replace('.', ',')}
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
  };

  const renderTopCategories = () => {
    if (!topCategories || topCategories.length === 0) return null;

    const total = topCategories.reduce((sum, cat) => sum + cat.total, 0);

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.chartTitle}>🏷️ Top 5 Categorias</Text>

        {topCategories.map((category, idx) => {
          const percentage = ((category.total / total) * 100).toFixed(1);
          return (
            <View key={idx} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.categoria}</Text>
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
                R$ {category.total.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          );
        })}

        <Text style={styles.totalText}>
          Total: R$ {total.toFixed(2).replace('.', ',')}
        </Text>
      </View>
    );
  };

  const renderForecast = () => {
    if (!forecast) return null;

    const daysRemaining = 30 - new Date().getDate();
    const dailyAverage = (forecast.total_mes_atual / new Date().getDate()).toFixed(2);
    const projected = (dailyAverage * 30).toFixed(2);

    return (
      <View style={styles.forecastContainer}>
        <Text style={styles.chartTitle}>🔮 Previsão até Fim do Mês</Text>

        <View style={styles.forecastContent}>
          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>Gasto Atual</Text>
            <Text style={styles.forecastValue}>
              R$ {forecast.total_mes_atual.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>Projeção Final</Text>
            <Text style={styles.forecastValue}>
              R$ {projected.replace('.', ',')}
            </Text>
          </View>

          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>Dias Restantes</Text>
            <Text style={styles.forecastValue}>{daysRemaining}</Text>
          </View>
        </View>

        <Text style={styles.forecastNote}>
          Média diária: R$ {dailyAverage.replace('.', ',')}
        </Text>
      </View>
    );
  };

  const renderEconomyScore = () => {
    if (economyScore === null || economyScore === undefined) return null;

    const scoreColor =
      economyScore >= 80 ? '#2ED573' : economyScore >= 50 ? '#FFB84D' : '#FF4757';

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
  };

  const renderWorstDay = () => {
    if (!worstDay || !worstDay.data) return null;

    return (
      <View style={styles.worstDayContainer}>
        <Text style={styles.chartTitle}>⚠️ Dia com Maior Gasto</Text>

        <View style={styles.worstDayCard}>
          <View style={styles.worstDayInfo}>
            <Text style={styles.worstDayDate}>{worstDay.data}</Text>
            <Text style={styles.worstDayAmount}>
              R$ {worstDay.total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={styles.worstDayExpenses}>
            <Text style={styles.expensesLabel}>
              {worstDay.quantidade_despesas} despesa{worstDay.quantidade_despesas !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6C5CE7',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636E72',
  },
  tabTextActive: {
    color: '#6C5CE7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  chartContent: {
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 12,
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
    color: '#636E72',
    marginTop: 4,
  },
  chartNote: {
    fontSize: 14,
    color: '#636E72',
  },
  comparisonContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  comparisonCardAlt: {
    backgroundColor: '#E8F5E9',
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  varianceContainer: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  varianceText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  varianceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8EAED',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 4,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C5CE7',
    minWidth: 100,
    textAlign: 'right',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  forecastContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  forecastContent: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  forecastCard: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  forecastLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  },
  forecastValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  forecastNote: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreCircle: {
    marginVertical: 20,
  },
  scoreCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#636E72',
  },
  scoreStatus: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  scoreStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  worstDayContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  worstDayCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  worstDayInfo: {
    flex: 1,
  },
  worstDayDate: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  worstDayAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
  },
  worstDayExpenses: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  expensesLabel: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});

export default DashboardScreen;
