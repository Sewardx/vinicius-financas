import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Infinity } from 'lucide-react';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Projection {
  description: string;
  amount: number;
  category: string;
  endDate?: string;
  monthsRemaining: number;
}

interface RecurringProjectionsProps {
  projections: Projection[];
}

const categoryEmojis: Record<string, string> = {
  moradia: '🏠', alimentação: '🍽️', transporte: '🚗', saúde: '💊',
  educação: '📚', lazer: '🎮', vestuário: '👕', assinaturas: '📱',
  contas: '📄', investimentos: '📈', outros: '📦',
};

const RecurringProjections = ({ projections }: RecurringProjectionsProps) => {
  if (projections.length === 0) {
    return null;
  }

  const totalMonthly = projections.reduce((s, p) => s + p.amount, 0);
  const totalRemaining = projections
    .filter(p => p.monthsRemaining > 0)
    .reduce((s, p) => s + p.amount * p.monthsRemaining, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-primary" />
          Projeção de Gastos Recorrentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {projections.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-lg">{categoryEmojis[p.category] || '📦'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.description}</p>
                <p className="text-xs text-muted-foreground">
                  {p.monthsRemaining === -1 ? (
                    <span className="flex items-center gap-1">
                      <Infinity className="w-3 h-3" /> Sem data fim
                    </span>
                  ) : (
                    `${p.monthsRemaining} meses restantes · até ${p.endDate}`
                  )}
                </p>
              </div>
              <div className="text-sm font-semibold text-destructive">
                {formatCurrency(p.amount)}/mês
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div>
            <p className="text-xs text-muted-foreground">Total Mensal</p>
            <p className="text-sm font-bold text-destructive">{formatCurrency(totalMonthly)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Restante</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurringProjections;
