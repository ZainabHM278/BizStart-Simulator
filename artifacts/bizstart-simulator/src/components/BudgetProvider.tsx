import React, { createContext, useContext, ReactNode } from 'react';
import { useBudgetData as useBudgetDataHook } from '../hooks/useBudgetData';

type BudgetContextType = ReturnType<typeof useBudgetDataHook>;

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const budgetData = useBudgetDataHook();
  return (
    <BudgetContext.Provider value={budgetData}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
