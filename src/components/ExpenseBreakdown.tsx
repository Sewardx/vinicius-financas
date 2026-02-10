import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(160, 84%, 39%)', 'hsl(200, 70%, 50%)', 'hsl(280, 60%, 55%)',
  'hsl(40, 90%, 55%)', 'hsl(0, 72%, 51%)', 'hsl(320, 60%, 50%)',
  'hsl(180, 60%, 45%)', 'hsl(30, 80%, 55%)', 'hsl(260, 50%, 60%)',
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface ExpenseBreakdownProps {
  data: { category: string; amount: number }[];
}

const ExpenseBreakdown = ({ data }: ExpenseBreakdownProps) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        Sem despesas este mês
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="w-[180px] h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2 w-full">
        {data.slice(0, 5).map((item, i) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-sm capitalize flex-1 truncate">{item.category}</span>
            <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
            <span className="text-xs text-muted-foreground w-10 text-right">
              {((item.amount / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;
