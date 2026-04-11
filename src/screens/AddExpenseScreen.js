import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useExpensas } from '../context/ExpensasContext';
import { CATEGORIAS, RECORRENCIAS, FORMAS_PAGAMENTO, getTipoGastoFromCategoria } from '../utils/constants';
import { isValidDate, isValidBRL, isValidDescricao } from '../utils/validators';
import { handleError } from '../utils/errorHandler';
import { COLORS } from '../utils/theme';

const AddExpenseScreen = ({ navigation }) => {
  const { adicionarDespesa } = useExpensas();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('alimentacao');
  const [tipoGasto, setTipoGasto] = useState(getTipoGastoFromCategoria('alimentacao'));
  const [recorrencia, setRecorrencia] = useState('unica');
  const [formaPagamento, setFormaPagamento] = useState('debito');
  const [data, setData] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  });
  const [salvando, setSalvando] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);

  const formatarData = (text) => {
    const nums = text.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4, 8)}`;
  };

  const dataDisplayToISO = (display) => {
    const parts = display.split('/');
    if (parts.length === 3) {
      const dia = parts[0].padStart(2, '0');
      const mes = parts[1].padStart(2, '0');
      const ano = parts[2];
      return `${ano}-${mes}-${dia}`;
    }
    return data;
  };

  const [dataDisplay, setDataDisplay] = useState(() => {
    const hoje = new Date();
    const d = String(hoje.getDate()).padStart(2, '0');
    const m = String(hoje.getMonth() + 1).padStart(2, '0');
    const y = hoje.getFullYear();
    return `${d}/${m}/${y}`;
  });

  const handleChangeCategoria = (novaCategoria) => {
    setCategoria(novaCategoria);
    setTipoGasto(getTipoGastoFromCategoria(novaCategoria));
  };

  const salvar = useCallback(async () => {
    // Prevenir double-tap (ignorar cliques dentro de 1 segundo)
    const now = Date.now();
    if (lastSaveTime && now - lastSaveTime < 1000) {
      return;
    }

    // Validar descrição
    if (!isValidDescricao(descricao)) {
      return Alert.alert('Descrição inválida', 'A descrição deve ter entre 1 e 255 caracteres.');
    }

    // Validar valor
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (!isValidBRL(valorNum)) {
      return Alert.alert('Valor inválido', 'Informe um valor válido (até R$ 999.999,99).');
    }

    // Validar data
    const isoData = dataDisplayToISO(dataDisplay);
    if (!isValidDate(isoData)) {
      return Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA com uma data válida.');
    }

    setLastSaveTime(now);
    setSalvando(true);

    try {
      const despesa = {
        descricao: descricao.trim(),
        valor: valorNum,
        categoria,
        tipo_gasto: tipoGasto,
        recorrencia,
        forma_pagamento: formaPagamento,
        data: isoData,
      };

      await adicionarDespesa(despesa);

      // Limpar formulário e voltar
      Alert.alert('Sucesso', 'Despesa adicionada!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const handled = handleError(error, 'AddExpenseScreen.salvar');
      Alert.alert(
        'Erro ao salvar',
        handled.userMessage || 'Não foi possível salvar a despesa. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }, [descricao, valor, categoria, recorrencia, formaPagamento, dataDisplay, lastSaveTime, navigation, adicionarDespesa, data]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Almoço, Academia..."
          value={descricao}
          onChangeText={setDescricao}
          maxLength={255}
          editable={!salvando}
        />

        <Text style={styles.sectionTitle}>Valor (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
          editable={!salvando}
        />

        <Text style={styles.sectionTitle}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={dataDisplay}
          onChangeText={(t) => setDataDisplay(formatarData(t))}
          keyboardType="numeric"
          maxLength={10}
          editable={!salvando}
        />

        <Text style={styles.sectionTitle}>Categoria</Text>
        <View style={styles.grid}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.chip, categoria === cat.value && { backgroundColor: cat.cor, borderColor: cat.cor }]}
              onPress={() => handleChangeCategoria(cat.value)}
              disabled={salvando}
            >
              <Text style={styles.chipIcon}>{cat.icon}</Text>
              <Text style={[styles.chipLabel, categoria === cat.value && { color: COLORS.textInverse }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tipo de Gasto (50/30/20)</Text>
        <View style={styles.typeGastoContainer}>
          {['essencial', 'desejo', 'poupar'].map((tipo) => {
            const labels = {
              essencial: '💰 Essencial (50%)',
              desejo: '🎉 Desejo (30%)',
              poupar: '🏦 Poupar (20%)',
            };
            return (
              <TouchableOpacity
                key={tipo}
                style={[
                  styles.typeGastoBtn,
                  tipoGasto === tipo && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                ]}
                onPress={() => setTipoGasto(tipo)}
                disabled={salvando}
              >
                <Text
                  style={[
                    styles.typeGastoLabel,
                    tipoGasto === tipo && { color: COLORS.textInverse, fontWeight: '700' }
                  ]}
                >
                  {labels[tipo]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
        <View style={styles.row}>
          {FORMAS_PAGAMENTO.map((fp) => (
            <TouchableOpacity
              key={fp.value}
              style={[styles.payBtn, formaPagamento === fp.value && { backgroundColor: fp.cor, borderColor: fp.cor }]}
              onPress={() => setFormaPagamento(fp.value)}
              disabled={salvando}
            >
              <Text style={styles.payIcon}>{fp.icon}</Text>
              <Text style={[styles.payLabel, formaPagamento === fp.value && { color: COLORS.textInverse }]}>{fp.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recorrência</Text>
        <View style={styles.row}>
          {RECORRENCIAS.map((rec) => (
            <TouchableOpacity
              key={rec.value}
              style={[styles.recBtn, recorrencia === rec.value && styles.recBtnActive]}
              onPress={() => setRecorrencia(rec.value)}
              disabled={salvando}
            >
              <Text style={[styles.recLabel, recorrencia === rec.value && styles.recLabelActive]}>{rec.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.saveBtn, salvando && { opacity: 0.7 }]} onPress={salvar} disabled={salvando}>
          <Text style={styles.saveBtnText}>{salvando ? 'Salvando...' : 'Salvar Despesa'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', marginTop: 18, marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    fontSize: 16, color: COLORS.text,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  chipIcon: { fontSize: 16 },
  chipLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  payBtn: {
    flex: 1, minWidth: 90, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: COLORS.border,
  },
  payIcon: { fontSize: 18 },
  payLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  recBtn: {
    flex: 1, minWidth: 70, alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 10, padding: 10, borderWidth: 1.5, borderColor: COLORS.border,
  },
  recBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  recLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  recLabelActive: { color: COLORS.textInverse },
  typeGastoContainer: { flexDirection: 'column', gap: 10 },
  typeGastoBtn: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  typeGastoLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 16,
    alignItems: 'center', marginTop: 28,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: COLORS.textInverse, fontSize: 17, fontWeight: '800' },
});

export default AddExpenseScreen;
