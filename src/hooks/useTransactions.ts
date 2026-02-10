import { useState, useCallback, useMemo } from 'react';
import { Transaction, MonthlySummary, MonthlyClosing } from '@/types/finance';

const STORAGE_KEY = 'finapp_transactions';
const SAVINGS_KEY = 'finapp_savings';
const CLOSINGS_KEY = 'finapp_closings';

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
  const [closings, setClosings] = useState<MonthlyClosing[]>(() => {
    try {
      const data = localStorage.getItem(CLOSINGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  });

  const saveClosings = useCallback((c: MonthlyClosing[]) => {
    localStorage.setItem(CLOSINGS_KEY, JSON.stringify(c));
  }, []);

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

  const closeMonth = useCallback((month: string) => {
    const monthTxs = transactions.filter(t => t.date.startsWith(month));
    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expenses;

    const closing: MonthlyClosing = {
      month,
      income,
      expenses,
      balance,
      closedAt: new Date().toISOString(),
    };

    setClosings(prev => {
      const updated = [...prev.filter(c => c.month !== month), closing].sort((a, b) => a.month.localeCompare(b.month));
      saveClosings(updated);
      return updated;
    });

    // Update saved amount
    const newSaved = savedAmount + balance;
    updateSavedAmount(newSaved);

    return closing;
  }, [transactions, savedAmount, updateSavedAmount, saveClosings]);

  const isMonthClosed = useCallback((month: string) => {
    return closings.some(c => c.month === month);
  }, [closings]);

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

  // Recurring projections: future months where recurring expenses still apply
  const recurringProjections = useMemo(() => {
    const recurring = transactions.filter(t => t.recurrence === 'recurring' && t.type === 'expense');
    const projections: { description: string; amount: number; category: string; endDate?: string; monthsRemaining: number }[] = [];

    recurring.forEach(tx => {
      if (tx.recurrenceEndDate) {
        const now = new Date();
        const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (tx.recurrenceEndDate >= currentYM) {
          const [endY, endM] = tx.recurrenceEndDate.split('-').map(Number);
          const monthsRemaining = (endY - now.getFullYear()) * 12 + (endM - now.getMonth() - 1);
          projections.push({
            description: tx.description,
            amount: tx.amount,
            category: tx.category,
            endDate: tx.recurrenceEndDate,
            monthsRemaining: Math.max(0, monthsRemaining),
          });
        }
      } else {
        projections.push({
          description: tx.description,
          amount: tx.amount,
          category: tx.category,
          monthsRemaining: -1, // indefinite
        });
      }
    });
    return projections;
  }, [transactions]);

  // Annual consolidation
  const annualData = useMemo(() => {
    const year = new Date().getFullYear().toString();
    const yearTxs = transactions.filter(t => t.date.startsWith(year));
    const totalIncome = yearTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = yearTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const monthlyBreakdown: { month: string; income: number; expenses: number; balance: number; closed: boolean }[] = [];
    for (let m = 0; m < 12; m++) {
      const monthStr = `${year}-${String(m + 1).padStart(2, '0')}`;
      const mTxs = yearTxs.filter(t => t.date.startsWith(monthStr));
      const inc = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      monthlyBreakdown.push({
        month: monthStr,
        income: inc,
        expenses: exp,
        balance: inc - exp,
        closed: closings.some(c => c.month === monthStr),
      });
    }

    return {
      year,
      totalIncome,
      totalExpenses,
      totalBalance: totalIncome - totalExpenses,
      monthlyBreakdown,
      closedMonths: closings.filter(c => c.month.startsWith(year)),
    };
  }, [transactions, closings]);

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
    closings,
    closeMonth,
    isMonthClosed,
    recurringProjections,
    annualData,
  };
}
