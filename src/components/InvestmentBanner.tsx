import { TrendingUp, Info, DollarSign } from 'lucide-react';
import { useMemo } from 'react';
import useDollarRate from '@/hooks/useDollarRate';

const tips = [
  { title: 'CDB 100% CDI', desc: 'Rendimento atual ~13,25% a.a. com liquidez diária', rate: '~13,25% a.a.' },
  { title: 'Tesouro Selic', desc: 'Segurança do governo federal, ideal para reserva de emergência', rate: '~13,25% a.a.' },
  { title: 'LCI/LCA', desc: 'Isento de IR para pessoa física, boa rentabilidade', rate: '~11% a.a.' },
  { title: 'Tesouro IPCA+', desc: 'Protege contra inflação + juros reais', rate: 'IPCA + 6,5%' },
  { title: 'CDB 120% CDI', desc: 'Rentabilidade acima do CDI com prazo de 2 anos', rate: '~15,9% a.a.' },
  { title: 'Fundo DI', desc: 'Diversificação em renda fixa com gestão profissional', rate: '~12,8% a.a.' },
];

const InvestmentBanner = () => {
  const tip = useMemo(() => {
    const dayIndex = new Date().getDate() % tips.length;
    return tips[dayIndex];
  }, []);

  const { rate, loading, error } = useDollarRate();

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
      {/* Dica do dia */}
      <div className="flex-1 rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">Dica do dia</span>
            <Info className="w-3 h-3 text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm text-foreground">{tip.title} — {tip.rate}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
        </div>
      </div>

      {/* Cotação do Dólar */}
      <div className="sm:w-48 rounded-xl bg-accent/50 border border-border p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-foreground" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">USD/BRL</span>
          {loading ? (
            <p className="text-sm font-semibold text-foreground animate-pulse">...</p>
          ) : error ? (
            <p className="text-xs text-muted-foreground">{error}</p>
          ) : (
            <p className="text-sm font-bold text-foreground">{formatBRL(rate!)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentBanner;
