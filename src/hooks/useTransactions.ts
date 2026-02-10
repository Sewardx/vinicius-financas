import { useState, useCallback, useMemo } from 'react';
import { Transaction, MonthlySummary } from '@/types/finance';

const STORAGE_KEY = 'finapp_transactions';
const SAVINGS_KEY = 'finapp_savings';

function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveTransactions(txs: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [savedAmount, setSavedAmount] = useState<number>(() => {
    const s = localStorage.getItem(SAVINGS_KEY);
    return s ? parseFloat(s) : 0;
  });

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const importTransactions = useCallback((txs: Omit<Transaction, 'id' | 'createdAt'>[]) => {
    const newTxs = txs.map(tx => ({
      ...tx,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }));
    setTransactions(prev => {
      const updated = [...newTxs, ...prev];
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const updateSavedAmount = useCallback((amount: number) => {
    setSavedAmount(amount);
    localStorage.setItem(SAVINGS_KEY, amount.toString());
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach(tx => {
      const month = tx.date.slice(0, 7);
      if (!map[month]) map[month] = { income: 0, expenses: 0 };
      if (tx.type === 'income') map[month].income += tx.amount;
      else map[month].expenses += tx.amount;
    });
    return Object.entries(map)
      .map(([month, data]) => ({
        month,
        totalIncome: data.income,
        totalExpenses: data.expenses,
        savings: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const currentMonthTransactions = useMemo(
    () => transactions.filter(t => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const currentMonthIncome = useMemo(
    () => currentMonthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [currentMonthTransactions]
  );

  const currentMonthExpenses = useMemo(
    () => currentMonthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [currentMonthTransactions]
  );

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    importTransactions,
    savedAmount,
    updateSavedAmount,
    monthlyData,
    currentMonthTransactions,
    currentMonthIncome,
    currentMonthExpenses,
    expensesByCategory,
    currentMonth,
  };
}
