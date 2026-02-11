import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-svg-charts';
import { dbAPI } from '../database/db';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  const loadData = async () => {
    try {
      const data = await dbAPI.getExpenses();
      setExpenses(data);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleUpdate = async () => {
    if (!editAmount || isNaN(parseFloat(editAmount))) return;
    await dbAPI.updateExpense(editingItem.id, editingItem.category, parseFloat(editAmount), editingItem.note);
    setEditingItem(null);
    loadData();
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Expense", "This action cannot be undone.", [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => { await dbAPI.deleteExpense(id); loadData(); } }
    ]);
  };

  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categoryTotals).map((key, index) => ({
    key,
    value: categoryTotals[key],
    svg: { fill: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'][index % 5] },
    arc: { outerRadius: '100%', padAngle: 0.05 },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending Summary</Text>
        {chartData.length > 0 ? (
          <PieChart style={{ height: 160 }} data={chartData} innerRadius="70%" />
        ) : (
          <Text style={styles.emptyText}>No expenses logged yet</Text>
        )}
      </View>
      
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>History</Text>
        <Text style={styles.hintText}>Tap to edit.</Text>
        {/* <View style={styles.hintBadge}>
            <Text style={styles.hintText}>Tap to edit.</Text>
        </View> */}
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => { setEditingItem(item); setEditAmount(item.amount.toString()); }}
            >
              <Text style={styles.catText}>{item.category}</Text>
              <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
            </TouchableOpacity>
            <View style={styles.itemRight}>
              <Text style={styles.amtText}>KES {item.amount.toLocaleString()}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#d9534f" style={{ marginLeft: 15 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={!!editingItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Transaction Amount</Text>
            <TextInput 
              style={styles.modalInput} 
              value={editAmount} 
              onChangeText={setEditAmount} 
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>Update Amount</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingItem(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#888', marginVertical: 20 },
  
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  hintBadge: { 
    backgroundColor: '#e7f1ff', 
    paddingHorizontal: 20, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  hintText: { fontSize: 12, color: '#007bff', fontStyle: 'italic' },

  itemCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, elevation: 1 },
  catText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  dateText: { fontSize: 12, color: '#888' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  amtText: { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
  
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20, textAlign: 'center' },
  saveBtn: { backgroundColor: '#007bff', padding: 15, borderRadius: 10 },
  saveBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  cancelBtnText: { textAlign: 'center', color: '#d9534f', marginTop: 15 }
});

