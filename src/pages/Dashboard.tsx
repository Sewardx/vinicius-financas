import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import InvestmentBanner from '@/components/InvestmentBanner';
import StatCard from '@/components/StatCard';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import SavingsChart from '@/components/SavingsChart';
import ExpenseBreakdown from '@/components/ExpenseBreakdown';
import ImportDialog from '@/components/ImportDialog';
import SavingsGoal from '@/components/SavingsGoal';
import MonthlyClosing from '@/components/MonthlyClosing';
import RecurringProjections from '@/components/RecurringProjections';
import AnnualConsolidator from '@/components/AnnualConsolidator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, LogOut
} from 'lucide-react';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const {
    addTransaction, deleteTransaction, importTransactions,
    savedAmount, updateSavedAmount,
    monthlyData, currentMonthTransactions,
    currentMonthIncome, currentMonthExpenses, expensesByCategory,
    currentMonth, closeMonth, isMonthClosed,
    recurringProjections, annualData,
  } = useTransactions();

  const balance = currentMonthIncome - currentMonthExpenses;
  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="font-bold font-display text-lg text-gradient">FinControl</span>
          </div>
          <div className="flex items-center gap-3">
            <TransactionForm onAdd={addTransaction} />
            <ImportDialog onImport={importTransactions} />
            <Button variant="ghost" size="icon" onClick={logout} title="Sair">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6 max-w-5xl">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold font-display">
            Olá, <span className="text-gradient capitalize">{user?.username}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">{monthName}</p>
        </div>

        {/* Investment Banner */}
        <InvestmentBanner />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Receitas"
            value={formatCurrency(currentMonthIncome)}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Despesas"
            value={formatCurrency(currentMonthExpenses)}
            icon={TrendingDown}
            variant="danger"
          />
          <StatCard
            title="Balanço"
            value={formatCurrency(balance)}
            icon={Wallet}
            variant={balance >= 0 ? 'info' : 'danger'}
            trend={balance >= 0 ? 'Você está economizando!' : 'Gastos acima da receita'}
          />
          <StatCard
            title="Guardado"
            value={formatCurrency(savedAmount)}
            icon={PiggyBank}
            variant="success"
          />
        </div>

        {/* Savings Goal + Monthly Closing */}
        <div className="grid md:grid-cols-2 gap-4">
          <SavingsGoal savedAmount={savedAmount} onUpdate={updateSavedAmount} />
          <MonthlyClosing
            currentMonth={currentMonth}
            currentMonthIncome={currentMonthIncome}
            currentMonthExpenses={currentMonthExpenses}
            isClosed={isMonthClosed(currentMonth)}
            onClose={closeMonth}
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Evolução das Economias</CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsChart data={monthlyData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Maiores Gastos do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseBreakdown data={expensesByCategory} />
            </CardContent>
          </Card>
        </div>

        {/* Recurring Projections */}
        <RecurringProjections projections={recurringProjections} />

        {/* Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              Lançamentos de {monthName}
              <span className="text-muted-foreground font-normal text-sm ml-2">
                ({currentMonthTransactions.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={currentMonthTransactions} onDelete={deleteTransaction} />
          </CardContent>
        </Card>

        {/* Annual Consolidator */}
        <AnnualConsolidator data={annualData} />
      </main>
    </div>
  );
};

export default Dashboard;
