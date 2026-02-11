import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, MonthlySummary, MonthlyClosing } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedAmount, setSavedAmount] = useState<number>(0);
  const [closings, setClosings] = useState<MonthlyClosing[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);

      // Load transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (txData) {
        setTransactions(txData.map(t => ({
          id: t.id,
          type: t.type as Transaction['type'],
          description: t.description,
          amount: Number(t.amount),
          category: t.category as Transaction['category'],
          date: t.date,
          recurrence: t.recurrence as Transaction['recurrence'],
          recurrenceEndDate: t.recurrence_end_date || undefined,
          createdAt: t.created_at,
        })));
      }

      // Load closings
      const { data: closingData } = await supabase
        .from('monthly_closings')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true });

      if (closingData) {
        setClosings(closingData.map(c => ({
          month: c.month,
          income: Number(c.income),
          expenses: Number(c.expenses),
          balance: Number(c.balance),
          closedAt: c.closed_at,
        })));
      }

      // Load savings
      const { data: savingsData } = await supabase
        .from('user_savings')
        .select('saved_amount')
        .eq('user_id', user.id)
        .maybeSingle();

      if (savingsData) {
        setSavedAmount(Number(savingsData.saved_amount));
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        date: tx.date,
        recurrence: tx.recurrence,
        recurrence_end_date: tx.recurrenceEndDate || null,
      })
      .select()
      .single();

    if (data && !error) {
      const newTx: Transaction = {
        id: data.id,
        type: data.type as Transaction['type'],
        description: data.description,
        amount: Number(data.amount),
        category: data.category as Transaction['category'],
        date: data.date,
        recurrence: data.recurrence as Transaction['recurrence'],
        recurrenceEndDate: data.recurrence_end_date || undefined,
        createdAt: data.created_at,
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [user]);

  const importTransactions = useCallback(async (txs: Omit<Transaction, 'id' | 'createdAt'>[]) => {
    if (!user) return;

    const rows = txs.map(tx => ({
      user_id: user.id,
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      category: tx.category,
      date: tx.date,
      recurrence: tx.recurrence,
      recurrence_end_date: tx.recurrenceEndDate || null,
    }));

    const { data } = await supabase.from('transactions').insert(rows).select();

    if (data) {
      const newTxs: Transaction[] = data.map(d => ({
        id: d.id,
        type: d.type as Transaction['type'],
        description: d.description,
        amount: Number(d.amount),
        category: d.category as Transaction['category'],
        date: d.date,
        recurrence: d.recurrence as Transaction['recurrence'],
        recurrenceEndDate: d.recurrence_end_date || undefined,
        createdAt: d.created_at,
      }));
      setTransactions(prev => [...newTxs, ...prev]);
    }
  }, [user]);

  const updateSavedAmount = useCallback(async (amount: number) => {
    if (!user) return;
    setSavedAmount(amount);

    await supabase
      .from('user_savings')
      .upsert({
        user_id: user.id,
        saved_amount: amount,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }, [user]);

  const closeMonth = useCallback(async (month: string) => {
    if (!user) return;

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

    await supabase
      .from('monthly_closings')
      .upsert({
        user_id: user.id,
        month,
        income,
        expenses,
        balance,
        closed_at: closing.closedAt,
      }, { onConflict: 'user_id,month' });

    setClosings(prev => {
      return [...prev.filter(c => c.month !== month), closing].sort((a, b) => a.month.localeCompare(b.month));
    });

    const newSaved = savedAmount + balance;
    await updateSavedAmount(newSaved);

    return closing;
  }, [user, transactions, savedAmount, updateSavedAmount]);

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
          monthsRemaining: -1,
        });
      }
    });
    return projections;
  }, [transactions]);

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
    loading,
  };
}
