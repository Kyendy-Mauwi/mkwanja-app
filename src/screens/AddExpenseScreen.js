import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { dbAPI } from '../database/db';
import { Ionicons } from '@expo/vector-icons';

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [newCat, setNewCat] = useState('');

  const load = async () => {
    try {
      const rawData = await dbAPI.getCategories();
      
      // FIX: Use a Map to filter out duplicate names (case-insensitive)
      const uniqueMap = new Map();
      rawData.forEach(item => {
        const normalized = item.name.trim().toLowerCase();
        if (!uniqueMap.has(normalized)) {
          uniqueMap.set(normalized, item);
        }
      });
      
      const uniqueData = Array.from(uniqueMap.values());
      setCategories(uniqueData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    load();
    return unsubscribe;
  }, [navigation]);

  const handleSaveExpense = async () => {
    if (!amount || !selectedCat) {
      Alert.alert("Error", "Please enter an amount and select a category.");
      return;
    }
    await dbAPI.addExpense(selectedCat, parseFloat(amount));
    setAmount('');
    setSelectedCat(null);
    navigation.navigate('Home');
  };

  const handleAddCategory = async () => {
    const name = newCat.trim();
    if (!name) return;

    // UI-level check to prevent adding a duplicate
    const exists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      Alert.alert("Duplicate", "This category already exists.");
      return;
    }

    await dbAPI.addCategory(name);
    setNewCat('');
    await load();
  };

  const handleDeleteCategory = async (id) => {
    Alert.alert("Delete Category", "Remove this category?", [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
        await dbAPI.deleteCategory(id);
        await load();
      }}
    ]);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.section}>
        <Text style={styles.header}>Log New Expense</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Amount (KES)" 
          keyboardType="numeric" 
          value={amount} 
          onChangeText={setAmount} 
        />
        
        <Text style={styles.subLabel}>Select Category:</Text>
        <View style={styles.chipGrid}>
          {categories.map(c => (
            <TouchableOpacity 
              key={c.id} 
              onPress={() => setSelectedCat(c.name)} 
              style={[styles.chip, selectedCat === c.name && styles.chipActive]}
            >
              <Text style={{color: selectedCat === c.name ? '#fff' : '#333'}}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveExpense}>
          <Text style={styles.btnText}>Save Expense</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Manage Categories</Text>
        <View style={styles.addCategoryRow}>
          <TextInput 
            style={[styles.input, {flex: 1, marginBottom: 0}]} 
            placeholder="New Category Name" 
            value={newCat} 
            onChangeText={setNewCat} 
          />
          <TouchableOpacity onPress={handleAddCategory} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryList}>
          {categories.map(c => (
            <View key={c.id} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{c.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteCategory(c.id)}>
                <Ionicons name="trash-outline" size={20} color="#d9534f" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 20, paddingBottom: 80 },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
  header: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 15, backgroundColor: '#fafafa' },
  subLabel: { fontSize: 14, color: '#666', marginBottom: 10 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#eee', borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  primaryBtn: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  addCategoryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  addBtn: { backgroundColor: '#28a745', padding: 12, borderRadius: 10, justifyContent: 'center' },
  categoryList: { marginTop: 10 },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  categoryName: { fontSize: 16, color: '#444' }
});