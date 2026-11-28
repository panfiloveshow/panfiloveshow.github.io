import { useEffect, useState } from 'react';

export function useBillingPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public/billing-plans', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Prices unavailable'); return response.json(); })
      .then((catalog: Record<string, { monthly_price: number }>) => {
        const next: Record<string, number> = {};
        for (const key of ['start', 'pro', 'business', 'enterprise']) {
          const price = catalog[key]?.monthly_price;
          if (!Number.isFinite(price) || price < 0) throw new Error('Invalid price');
          next[key] = price;
        }
        setPrices(next);
      }).catch(() => { /* Published base prices remain visible; checkout confirms current prices. */ });
    return () => controller.abort();
  }, []);
  return (name: string, fallback: string) => {
    const id = ({ 'Старт': 'start', 'Про': 'pro', 'Бизнес': 'business', 'Enterprise': 'enterprise' } as Record<string, string>)[name];
    return prices[id] === undefined ? fallback : `${id === 'enterprise' ? 'от ' : ''}${new Intl.NumberFormat('ru-RU').format(prices[id])} ₽`;
  };
}
