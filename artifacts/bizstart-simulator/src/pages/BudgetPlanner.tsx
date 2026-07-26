import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Store, TrendingUp, DollarSign } from 'lucide-react';
import { budgetSchema, BudgetData } from '@/lib/schema';
import { useBudget } from '@/components/BudgetProvider';
import { calculateMetrics, formatCurrency } from '@/lib/calculations';
import { NumberInput } from '@/components/ui/NumberInput';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BudgetPlanner() {
  const { data, setData } = useBudget();
  const { t } = useLanguage();

  const { control, watch } = useForm<BudgetData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: data,
    mode: 'onChange',
  });

  const formValues = watch();
  const formValuesStr = JSON.stringify(formValues);

  useEffect(() => {
    try {
      const parsed = JSON.parse(formValuesStr);
      const result = budgetSchema.safeParse(parsed);
      if (result.success) setData(result.data);
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValuesStr, setData]);

  const metrics = calculateMetrics(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="pb-32 space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">{t('planner.title')}</h2>
        <p className="text-muted-foreground text-lg">{t('planner.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Expenses ───────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold">{t('planner.expenses.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('planner.expenses.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-5">
            <Controller
              name="rent"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t('field.rent')}
                  prefixSymbol="$"
                  placeholder="0"
                  tooltip={t('tooltip.rent')}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
            <Controller
              name="utilities"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t('field.utilities')}
                  prefixSymbol="$"
                  placeholder="0"
                  tooltip={t('tooltip.utilities')}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t('field.stock')}
                  prefixSymbol="$"
                  placeholder="0"
                  tooltip={t('tooltip.stock')}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
            <Controller
              name="marketing"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t('field.marketing')}
                  prefixSymbol="$"
                  placeholder="0"
                  tooltip={t('tooltip.marketing')}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
            <Controller
              name="otherExpenses"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t('field.otherExpenses')}
                  prefixSymbol="$"
                  placeholder="0"
                  tooltip={t('tooltip.otherExpenses')}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
          </div>
        </div>

        {/* ── Revenue & Starting Cash ────────────────────────────────────── */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold">{t('planner.revenue.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('planner.revenue.subtitle')}</p>
              </div>
            </div>

            <div className="space-y-5">
              <Controller
                name="pricePerUnit"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label={t('field.pricePerUnit')}
                    prefixSymbol="$"
                    placeholder="0"
                    tooltip={t('tooltip.pricePerUnit')}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              <Controller
                name="unitsSold"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label={t('field.unitsSold')}
                    placeholder="0"
                    tooltip={t('tooltip.unitsSold')}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold">{t('planner.capital.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('planner.capital.subtitle')}</p>
              </div>
            </div>

            <Controller
              name="startingCash"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t('field.startingCash')}
                  prefixSymbol="$"
                  placeholder="0"
                  tooltip={t('tooltip.startingCash')}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Sticky Summary Bar ─────────────────────────────────────────────── */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-none z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <Card className="shadow-2xl border-primary/10 bg-card/95 backdrop-blur-md">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{t('summary.cost')}</p>
                  <p className="text-xl font-display font-bold text-foreground">
                    {formatCurrency(metrics.totalExpenses)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{t('summary.revenue')}</p>
                  <p className="text-xl font-display font-bold text-foreground">
                    {formatCurrency(metrics.monthlyRevenue)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{t('summary.profit')}</p>
                  <p className={`text-xl font-display font-bold ${metrics.monthlyProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {metrics.monthlyProfit >= 0 ? '+' : ''}{formatCurrency(metrics.monthlyProfit)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{t('summary.runway')}</p>
                  <p className="text-xl font-display font-bold text-primary">
                    {metrics.monthlyProfit >= 0 ? (
                      <span className="text-success text-sm">{t('summary.selfSustaining')}</span>
                    ) : metrics.runwayMonths === Infinity ? (
                      <span>{t('summary.infinity')}</span>
                    ) : (
                      <span>{t('summary.months', metrics.runwayMonths.toFixed(1))}</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
