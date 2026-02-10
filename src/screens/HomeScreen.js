import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { dbAPI } from '../database/db';

export default function HomeScreen() {
  const [stats, setStats] = useState({ safe: 0, income: 0, spent: 0, savings: 0 });
  const [topCategory, setTopCategory] = useState({ name: 'None', amount: 0 });
  const [recentExpenses, setRecentExpenses] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          const settings = await dbAPI.getSettings();
          const expenses = await dbAPI.getExpenses();
          
          const income = settings?.monthly_income || 0;
          const savings = settings?.savings_target || 0;
          const spent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

          const categoryMap = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
          }, {});

          const topCatName = Object.keys(categoryMap).reduce((a, b) => 
            categoryMap[a] > categoryMap[b] ? a : b, 'None'
          );

          if (isActive) {
            setStats({ income, savings, spent, safe: income - savings - spent });
            setTopCategory({ name: topCatName, amount: categoryMap[topCatName] || 0 });
            setRecentExpenses(expenses.slice(0, 3)); // Get last 3 expenses
          }
        } catch (error) {
          console.error("Home Sync Error:", error);
        }
      };

      loadData();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Main Balance Card */}
      <View style={styles.mainCard}>
        <Text style={styles.label}>Safe to Spend</Text>
        <Text style={[styles.balance, { color: stats.safe < 0 ? '#d9534f' : '#007bff' }]}>
          KES {stats.safe.toLocaleString()}
        </Text>
      </View>

      {/* Insights Summary Section */}
      <Text style={styles.sectionHeader}>Quick Summary</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Top Category</Text>
          <Text style={styles.summaryValue}>{topCategory.name}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Budget Used</Text>
          <Text style={styles.summaryValue}>
            {stats.income > 0 ? ((stats.spent / stats.income) * 100).toFixed(1) : 0}%
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>Income</Text>
          <Text style={styles.miniValue}>KES {stats.income.toLocaleString()}</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>Savings</Text>
          <Text style={styles.miniValue}>KES {stats.savings.toLocaleString()}</Text>
        </View>
      </View>

      {/* Recent Activity List */}
      <Text style={[styles.sectionHeader, { marginTop: 25 }]}>Recent Activity</Text>
      {recentExpenses.length > 0 ? (
        recentExpenses.map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <Text style={styles.activityCat}>{item.category}</Text>
            <Text style={styles.activityAmt}>KES {item.amount.toLocaleString()}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noData}>No recent expenses</Text>
      )}

      {/* Bottom Watermark Logo */}
      <View style={styles.footerContainer}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.watermarkLogo} 
        />
        <Text style={styles.footerText}>Mkwanja Personal Finance</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  mainCard: { backgroundColor: '#fff', padding: 35, borderRadius: 20, alignItems: 'center', elevation: 3, marginBottom: 25 },
  label: { color: '#888', fontSize: 14, fontWeight: '600' },
  balance: { fontSize: 38, fontWeight: 'bold', marginTop: 10 },
  
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 2, marginBottom: 25 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#666', fontSize: 14 },
  summaryValue: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },

  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  miniCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, width: '47%', elevation: 1 },
  miniLabel: { color: '#999', fontSize: 11, marginBottom: 5 },
  miniValue: { color: '#333', fontSize: 14, fontWeight: 'bold' },

  activityItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  activityCat: { color: '#555', fontSize: 14 },
  activityAmt: { color: '#333', fontWeight: 'bold', fontSize: 14 },
  noData: { color: '#bbb', textAlign: 'center', fontStyle: 'italic' },

  footerContainer: { marginTop: 50, alignItems: 'center', opacity: 0.15 },
  watermarkLogo: { width: 80, height: 80, borderRadius: 15, marginBottom: 10, tintColor: '#888' },
  footerText: { fontSize: 12, fontWeight: '600', color: '#888' }
});