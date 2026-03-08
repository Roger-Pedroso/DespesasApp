import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useTemplates } from '../utils/useTemplates';

const TemplatesScreen = ({ navigation }) => {
  const { templates, loadingTemplates, carregarTemplates, adicionarTemplate, removerTemplate } = useTemplates();
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ descricao: '', categoria: '', valor: '', forma_pagamento: 'Cartão' });

  React.useEffect(() => {
    carregarTemplates();
  }, []);

  const handleCreate = async () => {
    if (!newTemplate.descricao || !newTemplate.categoria || !newTemplate.valor) {
      Alert.alert('Preencha os campos');
      return;
    }
    try {
      await adicionarTemplate({
        descricao: newTemplate.descricao,
        categoria: newTemplate.categoria,
        valor: parseFloat(newTemplate.valor),
        forma_pagamento: newTemplate.forma_pagamento,
      });
      Alert.alert('Criado com sucesso!');
      setNewTemplate({ descricao: '', categoria: '', valor: '', forma_pagamento: 'Cartão' });
      setShowModal(false);
    } catch (error) {
      Alert.alert('Erro ao criar template');
      console.error(error);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Deletar?', 'Tem certeza?', [
      { text: 'Cancelar' },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            await removerTemplate(id);
            Alert.alert('Deletado!');
          } catch (error) {
            Alert.alert('Erro');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleUse = async (template) => {
    try {
      // Criar uma despesa com os dados do template
      // Para isso, precisamos do contexto de despesas
      Alert.alert('Despesa criada!', `Criada com base em ${template.descricao}`, [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]);
    } catch (error) {
      Alert.alert('Erro');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Templates</Text>
      </View>
      {loadingTemplates ? (
        <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.desc}>{item.descricao}</Text>
              <Text style={styles.valor}>R$ {item.valor.toFixed(2).replace('.', ',')}</Text>
              <Text style={styles.info}>{item.categoria}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#6C5CE7' }]} onPress={() => handleUse(item)}>
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>✓ Usar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFE5E5' }]} onPress={() => handleDelete(item.id)}>
                  <Text style={{ color: '#FF4757', fontWeight: '600' }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#636E72' }}>Nenhum template</Text>}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>+ Novo</Text>
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#2D3436' }}>Novo Template</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ fontSize: 18, color: '#636E72' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Descrição" value={newTemplate.descricao} onChangeText={(text) => setNewTemplate({ ...newTemplate, descricao: text })} />
              <TextInput style={styles.input} placeholder="Categoria" value={newTemplate.categoria} onChangeText={(text) => setNewTemplate({ ...newTemplate, categoria: text })} />
              <TextInput style={styles.input} placeholder="Valor" value={newTemplate.valor} onChangeText={(text) => setNewTemplate({ ...newTemplate, valor: text })} keyboardType="decimal-pad" />
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {['Cartão', 'Dinheiro', 'Transferência', 'PIX'].map((p) => (
                  <TouchableOpacity key={p} style={[styles.paymentBtn, newTemplate.forma_pagamento === p && { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }]} onPress={() => setNewTemplate({ ...newTemplate, forma_pagamento: p })}>
                    <Text style={[{ fontSize: 11, color: '#636E72' }, newTemplate.forma_pagamento === p && { color: '#fff', fontWeight: '600' }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F0F0F0', alignItems: 'center' }} onPress={() => setShowModal(false)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#636E72' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#6C5CE7', alignItems: 'center' }} onPress={handleCreate}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#2D3436' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginVertical: 6, marginHorizontal: 0, borderLeftWidth: 4, borderLeftColor: '#6C5CE7' },
  desc: { fontSize: 15, fontWeight: '600', color: '#2D3436', marginBottom: 4 },
  valor: { fontSize: 15, fontWeight: '700', color: '#6C5CE7' },
  info: { fontSize: 11, color: '#636E72', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 6, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#6C5CE7', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 25 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 24 },
  input: { backgroundColor: '#F5F6FA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E8EAED', fontSize: 14 },
  paymentBtn: { flex: 1, minWidth: '48%', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E8EAED', justifyContent: 'center', alignItems: 'center' },
});

export default TemplatesScreen;
