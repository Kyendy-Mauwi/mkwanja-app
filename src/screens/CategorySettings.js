import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

export default function CategorySettings() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');

  const fetchCats = async () => {
    const db = await SQLite.openDatabaseAsync('mkwanja.db');
    const result = await db.getAllAsync('SELECT * FROM categories');
    setCategories(result);
  };

  const addCategory = async () => {
    if (!newCat) return;
    const db = await SQLite.openDatabaseAsync('mkwanja.db');
    await db.runAsync('INSERT INTO categories (name) VALUES (?)', [newCat]);
    setNewCat('');
    fetchCats();
  };

  useEffect(() => { fetchCats(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.input} 
          value={newCat} 
          onChangeText={setNewCat} 
          placeholder="New Category Name" 
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={addCategory} style={styles.addButton}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.catItem}>
            <Text style={styles.catText}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#1E1E1E', color: 'white', padding: 12, borderRadius: 8 },
  addButton: { backgroundColor: '#4CAF50', marginLeft: 10, padding: 8, borderRadius: 8 },
  catItem: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 8, marginBottom: 10 },
  catText: { color: 'white', fontSize: 16 }
});