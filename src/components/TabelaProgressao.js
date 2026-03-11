/**
 * Componente que exibe a progressão mês a mês da simulação
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOW } from '../utils/theme';

export const TabelaProgressao = ({ progressao, titulo = '📊 Progressão Mensal' }) => {
  // Limita a exibição a 24 meses para melhor performance
  const dadosExibicao = useMemo(() => {
    if (!progressao || progressao.length === 0) return [];
    
    const mostrado = [];
    
    // Primeiros 12 meses (todos)
    for (let i = 0; i < Math.min(12, progressao.length); i++) {
      mostrado.push(progressao[i]);
    }
    
    // A cada 3 meses após os primeiros 12
    for (let i = 12; i < progressao.length; i += 3) {
      if (i !== mostrado[mostrado.length - 1]?.mes) {
        mostrado.push(progressao[i]);
      }
    }
    
    // Sempre inclui o último
    if (mostrado[mostrado.length - 1]?.mes !== progressao[progressao.length - 1].mes) {
      mostrado.push(progressao[progressao.length - 1]);
    }
    
    return mostrado;
  }, [progressao]);

  if (!progressao || progressao.length === 0) {
    return null;
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  const formatarNumero = (valor) => {
    return Math.round(valor).toString();
  };

  const RenderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={[styles.cell, styles.cellMes]}>
        <Text style={styles.cellText}>{item.mes}º</Text>
      </View>
      
      <View style={[styles.cell, styles.cellSaldo]}>
        <Text style={[styles.cellText, styles.cellMoeda]}>
          {formatarMoeda(item.saldo)}
        </Text>
      </View>
      
      <View style={[styles.cell, styles.cellJuros]}>
        <Text style={[styles.cellText, styles.cellMoeda, styles.moedaPositiva]}>
          {formatarMoeda(item.juros)}
        </Text>
      </View>
      
      <View style={[styles.cell, styles.cellAcumulado]}>
        <Text style={[styles.cellText, styles.cellMoeda, styles.moedaDestaque]}>
          {formatarMoeda(item.jurosAcumulados)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, SHADOW.md]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.info}>
          Mostrando {dadosExibicao.length} de {progressao.length} meses
        </Text>
      </View>

      {/* Tabela em ScrollView para suportar scroll horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tableContainer}
      >
        <View style={styles.table}>
          {/* Cabeçalho */}
          <View style={[styles.row, styles.headerRow]}>
            <View style={[styles.cell, styles.cellMes, styles.headerCell]}>
              <Text style={[styles.cellText, styles.headerText]}>Mês</Text>
            </View>
            
            <View style={[styles.cell, styles.cellSaldo, styles.headerCell]}>
              <Text style={[styles.cellText, styles.headerText]}>Saldo</Text>
            </View>
            
            <View style={[styles.cell, styles.cellJuros, styles.headerCell]}>
              <Text style={[styles.cellText, styles.headerText]}>Juros</Text>
            </View>
            
            <View style={[styles.cell, styles.cellAcumulado, styles.headerCell]}>
              <Text style={[styles.cellText, styles.headerText]}>Acumulado</Text>
            </View>
          </View>

          {/* Dados */}
          {dadosExibicao.map((item, index) => (
            <RenderItem key={`${item.mes}-${index}`} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* Rodapé com info */}
      {dadosExibicao.length < progressao.length && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            👉 Deslize para ver mais meses. Últimas atualizações a cada 3 meses.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  titulo: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  info: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },

  tableContainer: {
    maxHeight: 400,
  },

  table: {
    minWidth: 400,
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerRow: {
    backgroundColor: COLORS.primary,
  },

  cell: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
  },

  cellMes: {
    width: 50,
    alignItems: 'center',
  },

  cellSaldo: {
    width: 120,
  },

  cellJuros: {
    width: 100,
  },

  cellAcumulado: {
    width: 120,
  },

  cellText: {
    ...TYPOGRAPHY.small,
    color: COLORS.text,
    fontFamily: 'monospace',
  },

  cellMoeda: {
    fontSize: 12,
  },

  moedaPositiva: {
    color: COLORS.success,
  },

  moedaDestaque: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  headerCell: {
    backgroundColor: COLORS.primary,
  },

  headerText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },

  footer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
