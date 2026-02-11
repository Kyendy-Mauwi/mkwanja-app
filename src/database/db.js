import * as SQLite from 'expo-sqlite';

export const dbAPI = {
  db: null,

  async getDb() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('mkwanja.db');
    }
    return this.db;
  },

  async initDatabase() {
    const db = await this.getDb();
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL, 
        monthly_income REAL, 
        savings_target REAL
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY NOT NULL,
        category TEXT,
        amount REAL,
        date TEXT,
        note TEXT
      );
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT UNIQUE NOT NULL
      );
      INSERT OR IGNORE INTO categories (name) VALUES ('Food'), ('Transport'), ('Rent'), ('Shopping');
    `);
  },

  async getMonthlyExpenses() {
    const db = await this.getDb();
    if (!db) return [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return await db.getAllAsync(
      'SELECT * FROM expenses WHERE date >= ? ORDER BY date DESC',
      [startOfMonth]
    );
  },

  async getCategories() {
    const db = await this.getDb();
    if (!db) return [];
    return await db.getAllAsync('SELECT * FROM categories ORDER BY name ASC');
  },

  async addCategory(name) {
    const db = await this.getDb();
    if (!name.trim()) return;
    return await db.runAsync('INSERT OR IGNORE INTO categories (name) VALUES (?)', [name.trim()]);
  },

  async deleteCategory(id) {
    const db = await this.getDb();
    return await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  },

  async addExpense(category, amount, note = '') {
    const db = await this.getDb();
    return await db.runAsync(
      'INSERT INTO expenses (category, amount, date, note) VALUES (?, ?, ?, ?)',
      [category, parseFloat(amount), new Date().toISOString(), note]
    );
  },

  async updateExpense(id, category, amount, note) {
    const db = await this.getDb();
    return await db.runAsync(
      'UPDATE expenses SET category = ?, amount = ?, note = ? WHERE id = ?',
      [category, parseFloat(amount), note, id]
    );
  },

  async deleteExpense(id) {
    const db = await this.getDb();
    return await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  },

  async getExpenses() {
    const db = await this.getDb();
    if (!db) return [];
    return await db.getAllAsync('SELECT * FROM expenses ORDER BY date DESC');
  },

  async getSettings() {
    const db = await this.getDb();
    if (!db) return null;
    return await db.getFirstAsync('SELECT * FROM settings WHERE id = 1');
  },

  async updateSettings(income, savings) {
    const db = await this.getDb();
    return await db.runAsync(
      'INSERT OR REPLACE INTO settings (id, monthly_income, savings_target) VALUES (1, ?, ?)',
      [parseFloat(income), parseFloat(savings)]
    );
  }
};