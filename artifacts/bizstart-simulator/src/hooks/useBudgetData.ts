import { useState, useEffect, useCallback } from 'react';
import { BudgetData, budgetSchema, defaultData } from '../lib/schema';

export function useBudgetData() {
  const [data, setDataState] = useState<BudgetData>(() => {
    try {
      const stored = localStorage.getItem('bizstart-simulator-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        const result = budgetSchema.safeParse(parsed);
        if (result.success) {
          return result.data;
        }
      }
    } catch (e) {
      console.error('Failed to parse budget data from local storage', e);
    }
    return defaultData;
  });

  const setData = useCallback((newData: BudgetData | ((prev: BudgetData) => BudgetData)) => {
    setDataState((prev) => {
      const updated = typeof newData === 'function' ? newData(prev) : newData;
      localStorage.setItem('bizstart-simulator-data', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { data, setData };
}
