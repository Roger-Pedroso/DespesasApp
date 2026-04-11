import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useBudget } from '../utils/useBudget';
import { useExpensas } from '../context/ExpensasContext';
import { COLORS } from '../utils/theme';

const BudgetsScreen = () => {
  const { categorias } = useExpensas();
  const {
    budgets,
    loading,
    createBudget,
    deleteBudget,
    getSuggestions,
  } = useBudget();

  const [showModal, setShowModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    categoria: '',
    limite: '',
    ano: new Date().getFullYear().toString(),
    mes: String(new Date().getMonth() + 1).padStart(2, '0'),
  });
  const [suggestions, setSuggestions] = useState(null);

  const handleCreateBudget = async () => {
    if (!newBudget.categoria || !newBudget.limite) {
      Alert.alert('Campos obrigatórios', 'Selecione a categoria e o limite.');
      return;
    }

    try {
      await createBudget({
        categoria: newBudget.categoria,
        limite: parseFloat(newBudget.limite),
        ano: parseInt(newBudget.ano),
        mes: parseInt(newBudget.mes),
      });

      Alert.alert('Sucesso', 'Orçamento criado com sucesso!');
      setNewBudget({
        categoria: '',
        limite: '',
        ano: new Date().getFullYear().toString(),
        mes: String(new Date().getMonth() + 1).padStart(2, '0'),
      });
      setShowModal(false);
    } catch (error) {
      const msg = error?.userMessage || 'Não foi possível criar o orçamento.';
      Alert.alert('Erro ao criar orçamento', msg);
    }
  };

  const handleDeleteBudget = (id) => {
    Alert.alert('Deletar Orçamento', 'Tem certeza?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            await deleteBudget(id);
            Alert.alert('Sucesso', 'Orçamento deletado!');
          } catch (error) {
            const msg = error?.userMessage || 'Não foi possível deletar o orçamento.';
            Alert.alert('Erro ao deletar orçamento', msg);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleShowSuggestions = async (budgetId) => {
    try {
      const sugg = await getSuggestions(budgetId);
      setSuggestions(sugg);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar sugestões.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK':
        return COLORS.success;
      case 'AVISO':
        return COLORS.warning;
      case 'EXCEDIDO':
        return COLORS.danger;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'OK':
        return '✅';
      case 'AVISO':
        return '⚠️';
      case 'EXCEDIDO':
        return '🚨';
      default:
        return '❓';
    }
  };

  const renderBudget = ({ item }) => {
    const percentualUsado = item.limite > 0 ? (item.gasto_atual / item.limite) * 100 : 0;

    return (
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetCategory}>{item.categoria}</Text>
            <Text style={styles.budgetPeriod}>
              {item.mes}/{item.ano}
            </Text>
          </View>
          <View style={styles.budgetStatus}>
            <Text
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              {getStatusEmoji(item.status)} {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.budgetValues}>
          <View>
            <Text style={styles.valueLabel}>Limite</Text>
            <Text style={styles.valueLarge}>
              R$ {item.limite.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View>
            <Text style={styles.valueLabel}>Gasto</Text>
            <Text
              style={[
                styles.valueLarge,
                { color: getStatusColor(item.status) },
              ]}
            >
              R$ {item.gasto_atual.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View>
            <Text style={styles.valueLabel}>Restante</Text>
            <Text
              style={[
                styles.valueLarge,
                {
                  color:
                    item.limite - item.gasto_atual > 0 ? COLORS.success : COLORS.danger,
                },
              ]}
            >
              R$ {(item.limite - item.gasto_atual).toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* Barra de Progresso */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percentualUsado, 100)}%`,
                  backgroundColor: getStatusColor(item.status),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {percentualUsado.toFixed(1)}% utilizado
          </Text>
        </View>

        {/* Ações */}
        <View style={styles.budgetActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.suggestionsBtn]}
            onPress={() => handleShowSuggestions(item.id)}
          >
            <Text style={styles.actionBtnText}>💡 Dicas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteBudget(item.id)}
          >
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💰 Meus Orçamentos</Text>
        <Text style={styles.subtitle}>
          Defina limites e acompanhe seus gastos
        </Text>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBudget}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>Nenhum orçamento criado</Text>
              <Text style={styles.emptySubtext}>
                Crie orçamentos para controlar seus gastos por categoria
              </Text>
            </View>
          }
        />
      )}

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.fabText}>+ Novo Orçamento</Text>
      </TouchableOpacity>

      {/* Modal de Criar Orçamento */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Orçamento</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Categoria</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryList}
                >
                  {categorias.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        newBudget.categoria === cat &&
                          styles.categoryOptionActive,
                      ]}
                      onPress={() =>
                        setNewBudget({ ...newBudget, categoria: cat })
                      }
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          newBudget.categoria === cat &&
                            styles.categoryOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Limite (R$)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={newBudget.limite}
                  onChangeText={(text) =>
                    setNewBudget({ ...newBudget, limite: text })
                  }
                  keyboardType="decimal-pad"
                  placeholderTextColor="#B2BEC3"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Período</Text>
                <View style={styles.periodRow}>
                  <View style={styles.periodField}>
                    <Text style={styles.periodLabel}>Mês</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM"
                      value={newBudget.mes}
                      onChangeText={(text) =>
                        setNewBudget({ ...newBudget, mes: text })
                      }
                      maxLength={2}
                      keyboardType="numeric"
                      placeholderTextColor="#B2BEC3"
                    />
                  </View>
                  <View style={styles.periodField}>
                    <Text style={styles.periodLabel}>Ano</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY"
                      value={newBudget.ano}
                      onChangeText={(text) =>
                        setNewBudget({ ...newBudget, ano: text })
                      }
                      maxLength={4}
                      keyboardType="numeric"
                      placeholderTextColor="#B2BEC3"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleCreateBudget}
              >
                <Text style={styles.saveBtnText}>Criar Orçamento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Sugestões */}
      <Modal
        visible={suggestions !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSuggestions(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💡 Sugestões de Economia</Text>
              <TouchableOpacity
                onPress={() => setSuggestions(null)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.suggestionsContainer}>
              {suggestions && (
                <>
                  <View style={styles.suggestionSection}>
                    <Text style={styles.suggestionTitle}>Análise</Text>
                    <Text style={styles.suggestionText}>
                      {suggestions.analise}
                    </Text>
                  </View>

                  <View style={styles.suggestionSection}>
                    <Text style={styles.suggestionTitle}>Recomendação</Text>
                    <Text style={styles.suggestionText}>
                      {suggestions.recomendacao}
                    </Text>
                  </View>

                  {suggestions.dicas && suggestions.dicas.length > 0 && (
                    <View style={styles.suggestionSection}>
                      <Text style={styles.suggestionTitle}>Dicas Práticas</Text>
                      {suggestions.dicas.map((dica, idx) => (
                        <Text
                          key={idx}
                          style={styles.dicaItem}
                        >
                          • {dica}
                        </Text>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalBtn, styles.closeModalBtn]}
              onPress={() => setSuggestions(null)}
            >
              <Text style={styles.saveBtnText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 100,
  },
  budgetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  budgetPeriod: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  budgetStatus: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
  },
  budgetValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  valueLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  valueLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsBtn: {
    backgroundColor: COLORS.warning + '33',
  },
  deleteBtn: {
    backgroundColor: COLORS.danger + '22',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  fabText: {
    color: COLORS.textInverse,
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  formContainer: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  categoryList: {
    marginBottom: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.borderLight,
    marginRight: 8,
  },
  categoryOptionActive: {
    backgroundColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoryOptionTextActive: {
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
    color: COLORS.text,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodField: {
    flex: 1,
  },
  periodLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.borderLight,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  closeModalBtn: {
    backgroundColor: COLORS.primary,
    marginBottom: 20,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionSection: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  dicaItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
});

export default BudgetsScreen;
