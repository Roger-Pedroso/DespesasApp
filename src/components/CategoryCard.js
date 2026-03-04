import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoriaInfo, formatarMoeda } from '../utils/constants';

const CategoryCard = ({ item, total }) => {
  const categoria = getCategoriaInfo(item.categoria);
  const percentual = total > 0 ? (item.total / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={[styles.iconBox, { backgroundColor: categoria.cor + '22' }]}>
            <Text style={styles.icon}>{categoria.icon}</Text>
          </View>
          <View>
            <Text style={styles.label}>{categoria.label}</Text>
            <Text style={styles.qtd}>{item.quantidade} {item.quantidade === 1 ? 'despesa' : 'despesas'}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.valor}>{formatarMoeda(item.total)}</Text>
          <Text style={[styles.percent, { color: categoria.cor }]}>{percentual.toFixed(1)}%</Text>
        </View>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.bar, { width: `${percentual}%`, backgroundColor: categoria.cor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#2D3436' },
  qtd: { fontSize: 12, color: '#B2BEC3', marginTop: 2 },
  right: { alignItems: 'flex-end' },
  valor: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  percent: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  barBg: { height: 6, backgroundColor: '#F5F6FA', borderRadius: 3, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
});

export default CategoryCard;
