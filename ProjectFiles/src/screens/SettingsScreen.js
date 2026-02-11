import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { dbAPI } from '../database/db';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ onLogout }) {
  const [income, setIncome] = useState('');
  const [savings, setSavings] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const s = await dbAPI.getSettings();
      if (s) {
        setIncome(s.monthly_income.toString());
        setSavings(s.savings_target.toString());
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  };

  const handleSaveBudget = async () => {
    const incVal = parseFloat(income);
    const savVal = parseFloat(savings);

    if (isNaN(incVal) || isNaN(savVal)) {
      Alert.alert("Invalid Input", "Please enter numeric values for income and savings.");
      return;
    }

    try {
      await dbAPI.updateSettings(incVal, savVal);
      Alert.alert("Success", "Your budget has been saved!");
    } catch (e) {
      Alert.alert("Error", "Failed to save budget settings.");
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Settings Header with Logo */}
      <View style={styles.headerSection}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo} 
        />
        <Text style={styles.versionText}>Mkwanja v1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Budget Setup</Text>
        
        <Text style={styles.label}>Monthly Income (KES)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 50000"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
        />
        
        <Text style={styles.label}>Savings Target (KES)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10000"
          keyboardType="numeric"
          value={savings}
          onChangeText={setSavings}
        />
        
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBudget}>
          <Text style={styles.saveBtnText}>Save Budget</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#d9534f" />
          <Text style={styles.logoutButtonText}>Log Out & Lock</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerSection: { alignItems: 'center', marginVertical: 30 },
  logo: { width: 70, height: 70, borderRadius: 15, marginBottom: 10 },
  versionText: { color: '#888', fontSize: 12, fontWeight: '500' },
  
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 2, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 13, color: '#666', marginBottom: 8, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa', padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  
  saveBtn: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  footer: { alignItems: 'center', marginBottom: 50 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  logoutButtonText: { color: '#d9534f', fontWeight: 'bold', fontSize: 14, marginLeft: 8 }
});