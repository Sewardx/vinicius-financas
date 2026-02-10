export type TransactionType = 'expense' | 'income';
export type ExpenseCategory = 
  | 'moradia' | 'alimentação' | 'transporte' | 'saúde' 
  | 'educação' | 'lazer' | 'vestuário' | 'assinaturas'
  | 'contas' | 'investimentos' | 'outros';
export type IncomeCategory = 'salário' | 'freelance' | 'investimentos' | 'bônus' | 'outros';
export type RecurrenceType = 'recurring' | 'one-time';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  date: string; // ISO string
  recurrence: RecurrenceType;
  createdAt: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  savings: number;
}

export interface InvestmentTip {
  title: string;
  description: string;
  rate: string;
}
