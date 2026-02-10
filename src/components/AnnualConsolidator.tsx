import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface AnnualData {
  year: string;
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  monthlyBreakdown: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
    closed: boolean;
  }[];
}

interface AnnualConsolidatorProps {
  data: AnnualData;
}

const AnnualConsolidator = ({ data }: AnnualConsolidatorProps) => {
  const currentMonthIndex = new Date().getMonth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Consolidado Anual {data.year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Receitas</p>
            <p className="text-sm font-bold text-primary">{formatCurrency(data.totalIncome)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Despesas</p>
            <p className="text-sm font-bold text-destructive">{formatCurrency(data.totalExpenses)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Balanço</p>
            <p className={cn('text-sm font-bold', data.totalBalance >= 0 ? 'text-primary' : 'text-destructive')}>
              {formatCurrency(data.totalBalance)}
            </p>
          </div>
        </div>

        {/* Monthly grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {data.monthlyBreakdown.map((m, i) => {
            const hasData = m.income > 0 || m.expenses > 0;
            const isFuture = i > currentMonthIndex;
            return (
              <div
                key={m.month}
                className={cn(
                  'rounded-lg border p-2.5 text-center transition-colors',
                  isFuture && 'opacity-40',
                  m.closed && 'border-primary/30 bg-primary/5',
                  !m.closed && hasData && 'border-border bg-card',
                  !hasData && !isFuture && 'border-border/50 bg-muted/30',
                )}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {m.closed ? (
                    <CheckCircle className="w-3 h-3 text-primary" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className="text-xs font-semibold">{monthNames[i]}</span>
                </div>
                {hasData ? (
                  <p className={cn(
                    'text-xs font-bold',
                    m.balance >= 0 ? 'text-primary' : 'text-destructive'
                  )}>
                    {m.balance >= 0 ? '+' : ''}{formatCurrency(m.balance)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">—</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnualConsolidator;
