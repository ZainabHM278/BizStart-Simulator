import React from 'react';
import { motion } from 'framer-motion';
import { useBudget } from '@/components/BudgetProvider';
import { calculateMetrics, formatCurrency, formatNumber } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Legend, AreaChart, Area,
} from 'recharts';
import { Sparkles, Target, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

const EXPENSE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function VisualSnapshot() {
  const { data } = useBudget();
  const { t } = useLanguage();
  const metrics = calculateMetrics(data);

  const hasData =
    data.rent > 0 || data.utilities > 0 || data.stock > 0 ||
    data.marketing > 0 || data.pricePerUnit > 0 || data.startingCash > 0;

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center px-4"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-4">
          {t('snapshot.empty.title')}
        </h2>
        <p className="text-muted-foreground max-w-md text-lg mb-8">{t('snapshot.empty.body')}</p>
        <Link href="/">
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-all cursor-pointer">
            {t('snapshot.empty.cta')}
          </div>
        </Link>
      </motion.div>
    );
  }

  // Pie chart data with translated labels
  const expensesData = [
    { name: t('field.rent'), value: data.rent },
    { name: t('field.utilities'), value: data.utilities },
    { name: t('field.stock'), value: data.stock },
    { name: t('field.marketing'), value: data.marketing },
    { name: t('field.otherExpenses'), value: data.otherExpenses },
  ].filter((item) => item.value > 0);

  // Bar chart data — use translated labels as dataKey-friendly names
  const revLabel = t('snapshot.chart.revenue');
  const expLabel = t('snapshot.chart.expenses');
  const profitLossData = [
    {
      name: '—',
      [expLabel]: metrics.totalExpenses,
      [revLabel]: metrics.monthlyRevenue,
    },
  ];

  // Runway area chart
  const runwayData: { month: string; cash: number }[] = [];
  let currentCash = data.startingCash;
  for (let i = 0; i <= 12; i++) {
    runwayData.push({
      month: t('premium.proj.month', String(i)),
      cash: Math.max(0, currentCash),
    });
    currentCash += metrics.monthlyProfit;
    if (currentCash < 0 && metrics.monthlyProfit < 0) {
      if (i < 12) runwayData.push({ month: t('premium.proj.month', String(i + 1)), cash: 0 });
      break;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">{t('snapshot.title')}</h2>
        <p className="text-muted-foreground text-lg">{t('snapshot.subtitle')}</p>
      </div>

      {/* ── Key Metrics ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-semibold">{t('snapshot.metric.breakeven')}</span>
              <Target className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-display font-bold">{formatNumber(metrics.breakEvenUnits)}</p>
            <p className="text-sm text-muted-foreground">{t('snapshot.metric.breakevenLabel')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-semibold">{t('snapshot.metric.margin')}</span>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-display font-bold">{metrics.profitMargin.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">{t('snapshot.metric.marginLabel')}</p>
          </CardContent>
        </Card>

        <Card className={metrics.monthlyProfit >= 0 ? 'border-success bg-success/5' : ''}>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-semibold">{t('snapshot.metric.runway')}</span>
              {metrics.monthlyProfit >= 0 ? (
                <ShieldCheck className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
            </div>
            <p className={`text-3xl font-display font-bold ${metrics.monthlyProfit >= 0 ? 'text-success' : 'text-foreground'}`}>
              {metrics.monthlyProfit >= 0 ? '∞' : metrics.runwayMonths.toFixed(1)}
            </p>
            <p className={`text-sm ${metrics.monthlyProfit >= 0 ? 'text-success/80' : 'text-muted-foreground'}`}>
              {metrics.monthlyProfit >= 0
                ? t('snapshot.metric.runwayLabel.sustaining')
                : t('snapshot.metric.runwayLabel.months')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-semibold">{t('snapshot.metric.growth')}</span>
              <Sparkles className="w-5 h-5 text-chart-3" />
            </div>
            <p className="text-3xl font-display font-bold text-chart-3">
              {formatCurrency(metrics.revenueGoal)}
            </p>
            <p className="text-sm text-muted-foreground">{t('snapshot.metric.growthLabel')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Expenses Pie ─────────────────────────────────────────────── */}
        <Card className="min-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>{t('snapshot.chart.expenses.title')}</CardTitle>
            <CardDescription>{t('snapshot.chart.expenses.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {expensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t('snapshot.chart.expenses.empty')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Revenue vs Expenses Bar ───────────────────────────────────── */}
        <Card className="min-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>{t('snapshot.chart.revexp.title')}</CardTitle>
            <CardDescription>{t('snapshot.chart.revexp.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={profitLossData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey={expLabel} name={expLabel} fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} maxBarSize={80} />
                <Bar dataKey={revLabel} name={revLabel} fill="hsl(var(--success))" radius={[6, 6, 0, 0]} maxBarSize={80} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Runway Area Chart ─────────────────────────────────────────── */}
        <Card className="lg:col-span-2 min-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>{t('snapshot.chart.runway.title')}</CardTitle>
            <CardDescription>{t('snapshot.chart.runway.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {metrics.monthlyProfit >= 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-success/5 rounded-2xl border border-success/20">
                <ShieldCheck className="w-16 h-16 text-success mb-4" />
                <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
                  {t('snapshot.chart.runway.sustaining.title')}
                </h3>
                <p className="text-muted-foreground text-lg max-w-lg">
                  {t('snapshot.chart.runway.sustaining.body', formatCurrency(data.startingCash))}
                </p>
              </div>
            ) : data.startingCash <= 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
                  {t('snapshot.chart.runway.noCapital.title')}
                </h3>
                <p className="text-muted-foreground text-lg max-w-lg">
                  {t('snapshot.chart.runway.noCapital.body')}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={runwayData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="cash" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
