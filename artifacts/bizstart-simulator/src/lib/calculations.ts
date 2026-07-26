import { BudgetData } from './schema';

export function calculateMetrics(data: BudgetData) {
  const totalExpenses =
    data.rent + data.utilities + data.stock + data.marketing + data.otherExpenses;
  const monthlyRevenue = data.pricePerUnit * data.unitsSold;
  const monthlyProfit = monthlyRevenue - totalExpenses;

  const burnRate = totalExpenses - monthlyRevenue;
  let runwayMonths = Infinity;
  if (burnRate > 0) {
    runwayMonths = data.startingCash / burnRate;
  }

  const breakEvenUnits =
    data.pricePerUnit > 0 ? Math.ceil(totalExpenses / data.pricePerUnit) : 0;

  const profitMargin =
    monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

  const revenueGoal = totalExpenses > 0 ? totalExpenses * 2 : 0;

  return {
    totalExpenses,
    monthlyRevenue,
    monthlyProfit,
    burnRate,
    runwayMonths,
    breakEvenUnits,
    profitMargin,
    revenueGoal,
  };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount);
}
