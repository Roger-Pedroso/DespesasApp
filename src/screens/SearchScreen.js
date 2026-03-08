import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useBuscaAvancada } from '../utils/useBuscaAvancada';
import { useExpensas } from '../context/ExpensasContext';

const SearchScreen = () => {
  const { categorias } = useExpensas();
  const { buscar, loadingBusca } = useBuscaAvancada();
  
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    try {
      setSearched(true);
      const filters = {
        descricao: searchText || undefined,
        categoria: selectedCategory || undefined,
        minValor: minValue ? parseFloat(minValue) : undefined,
        maxValor: maxValue ? parseFloat(maxValue) : undefined,
      };

      const data = await buscar(filters);
      setResults(data);

      if (data.length === 0) {
        Alert.alert('Nenhum resultado', 'Nenhuma despesa encontrada com esses filtros.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar a busca.');
      console.error(error);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCategory(null);
    setMinValue('');
    setMaxValue('');
    setResults([]);
    setSearched(false);
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseLeft}>
        <Text style={styles.expenseDescription}>{item.descricao}</Text>
        <Text style={styles.expenseCategory}>{item.categoria}</Text>
        <Text style={styles.expenseDate}>{item.data}</Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseValue}>
          R$ {item.valor.toFixed(2).replace('.', ',')}
        </Text>
        <Text style={styles.expensePayment}>{item.forma_pagamento}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Buscar Despesas</Text>
          <Text style={styles.subtitle}>
            Encontre suas despesas com filtros inteligentes
          </Text>
        </View>

        {/* Campo de Busca por Texto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a descrição..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#B2BEC3"
          />
        </View>

        {/* Filtro por Categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoria</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryBtn,
                selectedCategory === null && styles.categoryBtnActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryBtnText,
                  selectedCategory === null && styles.categoryBtnTextActive,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat && styles.categoryBtnActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryBtnText,
                    selectedCategory === cat && styles.categoryBtnTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filtro por Valor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faixa de Valor</Text>
          <View style={styles.valueRow}>
            <TextInput
              style={[styles.input, styles.valueInput]}
              placeholder="Mínimo"
              value={minValue}
              onChangeText={setMinValue}
              keyboardType="decimal-pad"
              placeholderTextColor="#B2BEC3"
            />
            <Text style={styles.valueSeparator}>até</Text>
            <TextInput
              style={[styles.input, styles.valueInput]}
              placeholder="Máximo"
              value={maxValue}
              onChangeText={setMaxValue}
              keyboardType="decimal-pad"
              placeholderTextColor="#B2BEC3"
            />
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.searchButton]}
            onPress={handleSearch}
            disabled={loadingBusca}
          >
            {loadingBusca ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🔍 Buscar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearButtonText}>✕ Limpar</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {searched && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Resultados ({results.length})
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Lista de Resultados */}
      {searched && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExpenseItem}
          style={styles.list}
          ListEmptyComponent={
            !loadingBusca && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Nenhuma despesa encontrada
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
    fontSize: 14,
    color: '#2D3436',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  categoryBtnText: {
    fontSize: 12,
    color: '#636E72',
  },
  categoryBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueInput: {
    flex: 1,
  },
  valueSeparator: {
    fontSize: 12,
    color: '#636E72',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: '#6C5CE7',
  },
  clearButton: {
    backgroundColor: '#F0F0F0',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636E72',
  },
  list: {
    maxHeight: 300,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
  },
  expenseLeft: {
    flex: 1,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 10,
    color: '#B2BEC3',
    marginTop: 2,
  },
  expenseValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C5CE7',
  },
  expensePayment: {
    fontSize: 10,
    color: '#636E72',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 12,
    color: '#636E72',
  },
});

export default SearchScreen;
