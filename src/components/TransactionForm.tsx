import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { TransactionType, RecurrenceType, ExpenseCategory, IncomeCategory } from '@/types/finance';

const expenseCategories: ExpenseCategory[] = [
  'moradia', 'alimentação', 'transporte', 'saúde', 'educação',
  'lazer', 'vestuário', 'assinaturas', 'contas', 'investimentos', 'outros'
];

const incomeCategories: IncomeCategory[] = [
  'salário', 'freelance', 'investimentos', 'bônus', 'outros'
];

const categoryLabels: Record<string, string> = {
  moradia: '🏠 Moradia', alimentação: '🍽️ Alimentação', transporte: '🚗 Transporte',
  saúde: '💊 Saúde', educação: '📚 Educação', lazer: '🎮 Lazer',
  vestuário: '👕 Vestuário', assinaturas: '📱 Assinaturas', contas: '📄 Contas',
  investimentos: '📈 Investimentos', outros: '📦 Outros',
  salário: '💰 Salário', freelance: '💻 Freelance', bônus: '🎁 Bônus',
};

interface TransactionFormProps {
  onAdd: (tx: {
    type: TransactionType;
    description: string;
    amount: number;
    category: ExpenseCategory | IncomeCategory;
    date: string;
    recurrence: RecurrenceType;
    recurrenceEndDate?: string;
  }) => void;
}

const TransactionForm = ({ onAdd }: TransactionFormProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recurrence, setRecurrence] = useState<RecurrenceType>('one-time');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const reset = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().slice(0, 10));
    setRecurrence('one-time');
    setRecurrenceEndDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;
    onAdd({
      type,
      description,
      amount: parseFloat(amount),
      category: category as ExpenseCategory | IncomeCategory,
      date,
      recurrence,
      ...(recurrence === 'recurring' && recurrenceEndDate ? { recurrenceEndDate } : {}),
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-semibold">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Lançamento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Lançamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => { setType('expense'); setCategory(''); }}
            >
              Despesa
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => { setType('income'); setCategory(''); }}
            >
              Receita
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Aluguel, Supermercado..." required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" required />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{categoryLabels[c] || c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={recurrence} onValueChange={v => setRecurrence(v as RecurrenceType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">Pontual</SelectItem>
                <SelectItem value="recurring">Recorrente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrence === 'recurring' && (
            <div className="space-y-2">
              <Label>Até quando? (mês/ano)</Label>
              <Input
                type="month"
                value={recurrenceEndDate}
                onChange={e => setRecurrenceEndDate(e.target.value)}
                placeholder="Opcional"
              />
              <p className="text-xs text-muted-foreground">Deixe vazio para recorrência sem fim</p>
            </div>
          )}

          <Button type="submit" className="w-full font-semibold">
            Adicionar {type === 'expense' ? 'Despesa' : 'Receita'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
