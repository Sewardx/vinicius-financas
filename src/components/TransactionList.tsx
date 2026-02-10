import { Transaction } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryEmojis: Record<string, string> = {
  moradia: '🏠', alimentação: '🍽️', transporte: '🚗', saúde: '💊',
  educação: '📚', lazer: '🎮', vestuário: '👕', assinaturas: '📱',
  contas: '📄', investimentos: '📈', outros: '📦',
  salário: '💰', freelance: '💻', bônus: '🎁',
};

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Nenhum lançamento este mês</p>
        <p className="text-xs mt-1">Adicione suas receitas e despesas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors group animate-fade-in"
        >
          <div className="text-xl flex-shrink-0">{categoryEmojis[tx.category] || '📦'}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              {tx.recurrence === 'recurring' && (
                <RefreshCw className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {tx.category} · {new Date(tx.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center gap-1 font-semibold text-sm',
              tx.type === 'income' ? 'text-primary' : 'text-destructive'
            )}>
              {tx.type === 'income' ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {formatCurrency(tx.amount)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(tx.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
