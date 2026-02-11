import { useState, useEffect } from 'react';

interface DollarRate {
  rate: number | null;
  loading: boolean;
  error: string | null;
}

const useDollarRate = (): DollarRate => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled && data.rates?.BRL) {
          setRate(data.rates.BRL);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Indisponível');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { rate, loading, error };
};

export default useDollarRate;
