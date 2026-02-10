import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { TransactionType, RecurrenceType, ExpenseCategory } from '@/types/finance';

interface ImportDialogProps {
  onImport: (txs: {
    type: TransactionType;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    recurrence: RecurrenceType;
  }[]) => void;
}

const ImportDialog = ({ onImport }: ImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const handleImport = () => {
    try {
      const lines = text.trim().split('\n').filter(Boolean);
      const txs = lines.map(line => {
        const parts = line.split(';').map(s => s.trim());
        if (parts.length < 4) throw new Error('Formato inválido');
        return {
          description: parts[0],
          amount: parseFloat(parts[1].replace(',', '.')),
          category: (parts[2] || 'outros') as ExpenseCategory,
          date: parts[3] || new Date().toISOString().slice(0, 10),
          type: 'expense' as TransactionType,
          recurrence: 'one-time' as RecurrenceType,
        };
      });
      onImport(txs);
      setText('');
      setOpen(false);
    } catch {
      alert('Formato inválido. Use: descrição;valor;categoria;data (AAAA-MM-DD)');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Importar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Importar Gastos</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Cole seus gastos no formato: <code className="bg-muted px-1 rounded">descrição;valor;categoria;data</code>
          </p>
          <p className="text-xs text-muted-foreground">
            Exemplo: <code className="bg-muted px-1 rounded">Supermercado;250,00;alimentação;2025-02-01</code>
          </p>
          <Textarea
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Cole os lançamentos aqui, um por linha..."
          />
          <Button onClick={handleImport} className="w-full" disabled={!text.trim()}>
            Importar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
