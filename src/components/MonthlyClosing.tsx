import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyClosing as MonthlyClosingType } from '@/types/finance';
import { CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface MonthlyClosingProps {
  currentMonth: string;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  isClosed: boolean;
  onClose: (month: string) => void;
}

const MonthlyClosingComponent = ({
  currentMonth, currentMonthIncome, currentMonthExpenses, isClosed, onClose,
}: MonthlyClosingProps) => {
  const balance = currentMonthIncome - currentMonthExpenses;
  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          {isClosed ? <Lock className="w-4 h-4 text-muted-foreground" /> : <CheckCircle className="w-4 h-4 text-primary" />}
          Fechamento Mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground capitalize">Resumo de {monthLabel}</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-sm font-semibold text-primary">{formatCurrency(currentMonthIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-sm font-semibold text-destructive">{formatCurrency(currentMonthExpenses)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className={`text-sm font-semibold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
          {isClosed ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
              <Lock className="w-4 h-4" />
              Mês já fechado
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Fechar Mês
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display">Fechar mês?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O saldo de <strong>{formatCurrency(balance)}</strong> será {balance >= 0 ? 'adicionado ao' : 'subtraído do'} seu dinheiro guardado.
                    {balance < 0 && (
                      <span className="flex items-center gap-1 mt-2 text-destructive">
                        <AlertTriangle className="w-4 h-4" /> Você gastou mais do que ganhou este mês.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onClose(currentMonth)}>
                    Confirmar Fechamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyClosingComponent;
