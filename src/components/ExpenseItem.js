import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getCategoriaInfo, getFormaPagamentoInfo, formatarMoeda } from '../utils/constants';

const ExpenseItem = ({ despesa, onDelete }) => {
  const categoria = getCategoriaInfo(despesa.categoria);
  const pagamento = getFormaPagamentoInfo(despesa.forma_pagamento);
  const data = new Date(despesa.data + 'T00:00:00');
  const dataFormatada = data.toLocaleDateString('pt-BR');

  return (
    <View style={[styles.container, { borderLeftColor: categoria.cor }]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{categoria.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.descricao} numberOfLines={1}>{despesa.descricao}</Text>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: categoria.cor + '22' }]}>
            <Text style={[styles.tagText, { color: categoria.cor }]}>{categoria.label}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: pagamento.cor + '22' }]}>
            <Text style={[styles.tagText, { color: pagamento.cor }]}>{pagamento.label}</Text>
          </View>
          {despesa.recorrencia !== 'unica' && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>🔄 {despesa.recorrencia}</Text>
            </View>
          )}
        </View>
        <Text style={styles.data}>{dataFormatada}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.valor}>{formatarMoeda(despesa.valor)}</Text>
        <TouchableOpacity onPress={() => onDelete(despesa.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  descricao: { fontSize: 15, fontWeight: '600', color: '#2D3436', marginBottom: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  tag: { backgroundColor: '#F5F6FA', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 11, color: '#636E72', fontWeight: '500' },
  data: { fontSize: 12, color: '#B2BEC3' },
  right: { alignItems: 'flex-end', gap: 6 },
  valor: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 14, color: '#DFE6E9', fontWeight: '700' },
});

export default ExpenseItem;
