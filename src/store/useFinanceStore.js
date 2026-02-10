import { create } from 'zustand';
import { dbAPI } from '../database/db';

export const useFinanceStore = create((set, get) => ({
  income: 0,
  savingsTarget: 0,
  expenses: [],
  loading: false,

  // Fetches data from SQLite and updates the store
  refreshData: async () => {
    set({ loading: true });
    try {
      // Fetch settings
      const settings = await dbAPI.getSettings();
      
      // Fetch expenses for the current month
      const currentMonth = new Date().toISOString().substring(0, 7); 
      const monthlyExpenses = await dbAPI.getMonthlyExpenses(currentMonth);
      
      set({
        income: settings?.monthly_income || 0,
        savingsTarget: settings?.savings_target || 0,
        expenses: monthlyExpenses || [],
        loading: false
      });
    } catch (error) {
      console.error("Store Refresh Error:", error);
      set({ loading: false });
    }
  },

  // Logic: Safe to Spend = Income - Savings Target - Total Monthly Expenses
  getSafeToSpend: () => {
    const { income, savingsTarget, expenses } = get();
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const safe = income - savingsTarget - totalSpent;
    return safe > 0 ? safe : 0;
  },

  getTotalSpent: () => {
    return get().expenses.reduce((sum, e) => sum + e.amount, 0);
  }
}));