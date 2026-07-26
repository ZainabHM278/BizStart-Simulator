import { z } from 'zod';

export const budgetSchema = z.object({
  rent: z.number().min(0).default(0),
  utilities: z.number().min(0).default(0),
  stock: z.number().min(0).default(0),
  marketing: z.number().min(0).default(0),
  otherExpenses: z.number().min(0).default(0),
  pricePerUnit: z.number().min(0).default(0),
  unitsSold: z.number().min(0).default(0),
  startingCash: z.number().min(0).default(0),
});

export type BudgetData = z.infer<typeof budgetSchema>;

export const defaultData: BudgetData = {
  rent: 0,
  utilities: 0,
  stock: 0,
  marketing: 0,
  otherExpenses: 0,
  pricePerUnit: 0,
  unitsSold: 0,
  startingCash: 0,
};
