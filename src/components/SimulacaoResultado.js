/**
 * Componente que exibe o resultado principal da simulação
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOW } from '../utils/theme';

/**
 * Converte meses em formato "X anos e Y meses" quando >= 12 meses
 */
const formatarTempoDecorrido = (meses) => {
  if (meses < 12) {
    return {
      principal: meses.toString(),
      label: meses === 1 ? 'mês' : 'meses',
      secundario: null,
    };
  }
  
  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  
  const anoPrincipal = `${anos}`;
  const mesePrincipal = `${mesesRestantes}`;
  
  if (mesesRestantes === 0) {
    return {
      principal: `${anos}`,
      label: anos === 1 ? 'ano' : 'anos',
      secundario: null,
    };
  }
  
  return {
    principal: `${anos}a ${mesesRestantes}m`,
    label: 'tempo',
    secundario: `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`,
  };
};

export const SimulacaoResultado = ({ resultado, calculando }) => {
  if (!resultado) {
    return null;
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const tempoFormatado = formatarTempoDecorrido(resultado.meses);

  return (
    <View style={[styles.container, SHADOW.lg]}>
      {/* Header com destaque */}
      <View style={styles.header}>
        <Text style={styles.titulo}>🎯 Resultado</Text>
        <Text style={styles.subtitulo}>
          {resultado.tipo === 'simples' ? 'Juros Simples' : 'Juros Compostos'}
        </Text>
      </View>

      {/* Resultado Principal - Meses/Anos */}
      <View style={styles.destaque}>
        <Text style={styles.numeroDestaque}>
          {tempoFormatado.principal}
        </Text>
        <Text style={styles.labelDestaque}>
          {tempoFormatado.label}
        </Text>
        {tempoFormatado.secundario && (
          <Text style={styles.labelSecundario}>
            {tempoFormatado.secundario}
          </Text>
        )}
      </View>

      {/* Grid de Informações */}
      <View style={styles.grid}>
        {/* Saldo Final */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>💰</Text>
            <Text style={styles.infoLabel}>Saldo Final</Text>
          </View>
          <Text style={styles.infoValor}>{formatarMoeda(resultado.saldoFinal)}</Text>
        </View>

        {/* Total de Juros */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>📈</Text>
            <Text style={styles.infoLabel}>Juros Ganhos</Text>
          </View>
          <Text style={[styles.infoValor, styles.valorPositivo]}>
            {formatarMoeda(resultado.jurosGanhos)}
          </Text>
        </View>

        {/* Total Contribuído */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>💵</Text>
            <Text style={styles.infoLabel}>Total Contribuído</Text>
          </View>
          <Text style={styles.infoValor}>
            {formatarMoeda(resultado.meses * (resultado.saldoFinal - resultado.jurosGanhos) / resultado.meses)}
          </Text>
        </View>

        {/* Percentual de Juros */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>📊</Text>
            <Text style={styles.infoLabel}>% de Juros</Text>
          </View>
          <Text style={[styles.infoValor, styles.valorDestaque]}>
            {((resultado.jurosGanhos / resultado.saldoFinal) * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Estado de Carregamento */}
      {calculando && (
        <View style={styles.calculando}>
          <Text style={styles.textCalculando}>Calculando...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  header: {
    marginBottom: SPACING.lg,
  },

  titulo: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  subtitulo: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },

  destaque: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  numeroDestaque: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },

  labelDestaque: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
  },

  labelSecundario: {
    ...TYPOGRAPHY.small,
    color: COLORS.background,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
    opacity: 0.9,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },

  infoCard: {
    flex: 0,
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },

  infoLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },

  infoValor: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },

  valorPositivo: {
    color: COLORS.success,
  },

  valorDestaque: {
    color: COLORS.primary,
  },

  calculando: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },

  textCalculando: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
});
