import { TrendingUp, Info } from 'lucide-react';
import { useMemo } from 'react';

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

  return (
    <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-start gap-3 animate-fade-in">
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
  );
};

export default InvestmentBanner;
