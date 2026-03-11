/**
 * SimulacaoScreen - Tela principal da feature de simulação
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSimulacao, PRESETS_SIMULACAO } from '../utils/useSimulacao';
import { SimulacaoResultado } from '../components/SimulacaoResultado';
import { TabelaProgressao } from '../components/TabelaProgressao';
import { parseMonetario, parseTaxa } from '../utils/parseUtils';
import { COLORS, TYPOGRAPHY, SPACING, SHADOW } from '../utils/theme';

const SimulacaoScreen = () => {
  const {
    mensal,
    alvo,
    taxa,
    tipoJuros,
    atualizarMensal,
    atualizarAlvo,
    atualizarTaxa,
    alternarTipoJuros,
    resetar,
    carregarPreset,
    resultado,
    erro,
    calculando,
  } = useSimulacao();

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titulo}>💰 Simulador de Poupança</Text>
            <Text style={styles.subtitulo}>
              Descubra em quanto tempo você atingirá seu objetivo financeiro
            </Text>
          </View>

          {/* Form de Entrada */}
          <View style={[styles.card, SHADOW.md]}>
            <Text style={styles.secaoTitulo}>📝 Seus Parâmetros</Text>

            {/* Input: Valor Mensal */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quanto você pode guardar por mês?</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.prefixo}>R$</Text>
                <TextInput
                  style={styles.input}
                  value={mensal > 0 ? formatarMoeda(mensal) : ''}
                  onChangeText={(text) => {
                    const valor = parseMonetario(text);
                    if (valor >= 0) {
                      atualizarMensal(valor);
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder="1.000,00"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              <Text style={styles.dica}>Valor mensal de poupança</Text>
            </View>

            {/* Input: Valor Alvo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Qual é seu objetivo?</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.prefixo}>R$</Text>
                <TextInput
                  style={styles.input}
                  value={alvo > 0 ? formatarMoeda(alvo) : ''}
                  onChangeText={(text) => {
                    const valor = parseMonetario(text);
                    if (valor >= 0) {
                      atualizarAlvo(valor);
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder="50.000,00"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              <Text style={styles.dica}>Valor que você quer atingir</Text>
            </View>

            {/* Input: Taxa de Juros */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Taxa de juros mensal?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={taxa > 0 ? taxa.toString() : ''}
                  onChangeText={(text) => {
                    const valor = parseTaxa(text);
                    if (valor >= 0) {
                      atualizarTaxa(valor);
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder="1,00"
                  placeholderTextColor={COLORS.textSecondary}
                  maxLength={8}
                />
                <Text style={styles.sufixo}>%</Text>
              </View>
              <Text style={styles.dica}>Taxa mensal (0-100%)</Text>
            </View>

            {/* Toggle: Tipo de Juros */}
            <View style={styles.toggleGroup}>
              <Text style={styles.label}>Tipo de Juros</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    tipoJuros === 'simples' && styles.toggleBtnAtivo,
                  ]}
                  onPress={alternarTipoJuros}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      tipoJuros === 'simples' && styles.toggleBtnTextAtivo,
                    ]}
                  >
                    Simples
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    tipoJuros === 'composto' && styles.toggleBtnAtivo,
                  ]}
                  onPress={alternarTipoJuros}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      tipoJuros === 'composto' && styles.toggleBtnTextAtivo,
                    ]}
                  >
                    Composto
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.dica}>
                {tipoJuros === 'composto'
                  ? 'Juros incidem sobre juros (recomendado)'
                  : 'Juros incidem apenas sobre o capital inicial'}
              </Text>
            </View>

            {/* Botões */}
            <View style={styles.botoes}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoSecundario]}
                onPress={resetar}
              >
                <Text style={styles.botaoTextoSecundario}>↻ Resetar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Presets Rápidos */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsLabel}>⚡ Presets Rápidos:</Text>
            <View style={styles.presetsList}>
              {Object.values(PRESETS_SIMULACAO).map((preset) => (
                <TouchableOpacity
                  key={preset.nome}
                  style={[styles.presetBtn, SHADOW.sm]}
                  onPress={() => carregarPreset(preset)}
                >
                  <Text style={styles.presetBtnText}>{preset.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Erro */}
          {erro && (
            <View style={[styles.card, styles.erroCard]}>
              <Text style={styles.erroTexto}>❌ {erro}</Text>
            </View>
          )}

          {/* Resultado */}
          {!erro && (
            <>
              <SimulacaoResultado resultado={resultado} calculando={calculando} />
              <TabelaProgressao
                progressao={resultado?.progressao}
                titulo="📊 Sua Progressão"
              />
            </>
          )}

          {/* Info Footer */}
          <View style={styles.infoFooter}>
            <Text style={styles.infoTexto}>
              💡 <Text style={styles.infoTextoDestaque}>Dica:</Text> Juros
              compostos são melhores pois o dinheiro cresce exponencialmente.
            </Text>
          </View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  header: {
    marginBottom: SPACING.lg,
  },

  titulo: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  subtitulo: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  secaoTitulo: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  inputGroup: {
    marginBottom: SPACING.lg,
  },

  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },

  prefixo: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
    fontWeight: 'bold',
  },

  sufixo: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },

  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    paddingHorizontal: 0,
  },

  dica: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },

  toggleGroup: {
    marginBottom: SPACING.lg,
  },

  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  toggleBtnAtivo: {
    backgroundColor: COLORS.primary,
  },

  toggleBtnText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  toggleBtnTextAtivo: {
    color: COLORS.background,
  },

  botoes: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  botao: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },

  botaoSecundario: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  botaoTexto: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: 'bold',
  },

  botaoTextoSecundario: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },

  presetsContainer: {
    marginBottom: SPACING.lg,
  },

  presetsLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },

  presetsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  presetBtn: {
    flex: 0,
    width: '23%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },

  presetBtnText: {
    ...TYPOGRAPHY.small,
    color: COLORS.background,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  erroCard: {
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },

  erroTexto: {
    ...TYPOGRAPHY.body,
    color: COLORS.danger,
  },

  infoFooter: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  infoTexto: {
    ...TYPOGRAPHY.small,
    color: COLORS.text,
  },

  infoTextoDestaque: {
    fontWeight: 'bold',
  },
});

export default SimulacaoScreen;
