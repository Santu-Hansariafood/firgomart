import { useState, useEffect } from 'react';
import { CartItem } from '@/types/checkout';

export const useCartSummary = (items: CartItem[]) => {
  const [orderSummary, setOrderSummary] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (items.length === 0) {
        setOrderSummary(null);
        return;
      }

      let country = 'India';
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('deliveryAddress') : '';
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.country) country = parsed.country;
        }
      } catch {}

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(ci => ({ id: ci.id, quantity: ci.quantity ?? 1 })),
            dryRun: true,
            country
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setOrderSummary(data);
        }
      } catch {}
    };
    
    const timer = setTimeout(fetchSummary, 300);
    return () => clearTimeout(timer);
  }, [items]);

  return { orderSummary };
};
