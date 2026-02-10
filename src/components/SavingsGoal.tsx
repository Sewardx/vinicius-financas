import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PiggyBank, Edit2, Check } from 'lucide-react';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface SavingsGoalProps {
  savedAmount: number;
  onUpdate: (amount: number) => void;
}

const SavingsGoal = ({ savedAmount, onUpdate }: SavingsGoalProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(savedAmount.toString());

  const handleSave = () => {
    const num = parseFloat(value.replace(',', '.'));
    if (!isNaN(num) && num >= 0) {
      onUpdate(num);
    }
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <PiggyBank className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Dinheiro Guardado</p>
        </div>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="text-lg font-bold"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <Button size="icon" onClick={handleSave} className="flex-shrink-0">
            <Check className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold font-display text-primary">
            {formatCurrency(savedAmount)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setValue(savedAmount.toString()); setEditing(true); }}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavingsGoal;
