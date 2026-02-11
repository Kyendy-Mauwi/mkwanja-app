import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

export const useDashboardData = () => {
  const [data, setData] = useState({
    income: 0,
    savingsTarget: 0,
    totalExpenses: 0,
    safeToSpend: 0,
  });

  const loadData = async () => {
    const db = await SQLite.openDatabaseAsync('mkwanja.db');
    
    // 1. Get Settings (Income & Savings)
    const settings = await db.getFirstAsync('SELECT * FROM settings LIMIT 1');
    
    // 2. Get Total Expenses
    const expenseResult = await db.getFirstAsync('SELECT SUM(amount) as total FROM expenses');
    
    const income = settings?.monthly_income || 0;
    const savings = settings?.savings_target || 0;
    const spent = expenseResult?.total || 0;

    setData({
      income,
      savingsTarget: savings,
      totalExpenses: spent,
      safeToSpend: income - savings - spent,
    });
  };

  useEffect(() => { loadData(); }, []);

  return { ...data, refresh: loadData };
};