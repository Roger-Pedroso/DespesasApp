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
} from 'react-native';
import { useBuscaAvancada } from '../utils/useBuscaAvancada';
import { useExpensas } from '../context/ExpensasContext';
import { COLORS } from '../utils/theme';

const SearchScreen = () => {
  const { categorias } = useExpensas();
  const { buscar, loadingBusca } = useBuscaAvancada();
  
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async () => {
    setSearchError(null);
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
    } catch (error) {
      setSearchError('Não foi possível realizar a busca. Tente novamente.');
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCategory(null);
    setMinValue('');
    setMaxValue('');
    setResults([]);
    setSearched(false);
    setSearchError(null);
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

        {/* Banner de erro */}
        {searchError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{searchError}</Text>
          </View>
        )}

        {/* Resultados */}
        {searched && !searchError && (
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
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
    color: COLORS.text,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryBtnText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  categoryBtnTextActive: {
    color: COLORS.textInverse,
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
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.primary,
  },
  clearButton: {
    backgroundColor: COLORS.borderLight,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  list: {
    maxHeight: 300,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
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
    color: COLORS.text,
  },
  expenseCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  expenseValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  expensePayment: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  errorBanner: {
    backgroundColor: COLORS.danger + '22',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default SearchScreen;
