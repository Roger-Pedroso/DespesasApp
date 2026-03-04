import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MESES, formatarMoeda } from '../utils/constants';

const MonthSelector = ({ mes, ano, onAnterior, onProximo }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onAnterior} style={styles.btn}>
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.mes}>{MESES[mes - 1]}</Text>
        <Text style={styles.ano}>{ano}</Text>
      </View>
      <TouchableOpacity onPress={onProximo} style={styles.btn}>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  btn: { padding: 8 },
  arrow: { fontSize: 28, color: '#6C5CE7', fontWeight: '300' },
  center: { alignItems: 'center' },
  mes: { fontSize: 18, fontWeight: '700', color: '#2D3436' },
  ano: { fontSize: 13, color: '#B2BEC3', marginTop: 2 },
});

export default MonthSelector;
