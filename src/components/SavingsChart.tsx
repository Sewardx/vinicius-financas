import { MonthlySummary } from '@/types/finance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatMonth = (m: string) => {
  const [, month] = m.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[parseInt(month) - 1] || m;
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

interface SavingsChartProps {
  data: MonthlySummary[];
}

const SavingsChart = ({ data }: SavingsChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        Adicione lançamentos para ver o gráfico
      </div>
    );
  }

  const chartData = data.map(d => ({
    month: formatMonth(d.month),
    economia: d.savings,
    receita: d.totalIncome,
    despesa: d.totalExpenses,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" opacity={0.3} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
        <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" tickFormatter={formatCurrency} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Area
          type="monotone"
          dataKey="economia"
          stroke="hsl(160, 84%, 39%)"
          fill="url(#savingsGradient)"
          strokeWidth={2}
          name="Economia"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SavingsChart;
