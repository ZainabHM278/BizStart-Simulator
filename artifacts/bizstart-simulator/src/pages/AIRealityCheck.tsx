import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  BarChart2,
  ShieldAlert,
  Megaphone,
  FileText,
  Landmark,
  Layers,
  ArrowRight,
  Info,
  Lock,
  Unlock,
  Download,
  Loader2,
  BadgeCheck,
  TrendingUp,
  Zap,
  Target,
} from 'lucide-react';
import { useBudget } from '@/components/BudgetProvider';
import { calculateMetrics, formatCurrency } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'caution' | 'ok';
type PremiumState = 'idle' | 'processing' | 'unlocked';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFn = (key: string, ...args: any[]) => string;

interface InsightCard {
  id: string;
  severity: Severity;
  icon: React.ReactNode;
  title: string;
  body: string;
  metric?: string;
  metricLabel?: string;
}

interface ChecklistItem {
  icon: React.ReactNode;
  step: number;
  title: string;
  description: string;
}

// ─── Severity config ──────────────────────────────────────────────────────────

const severityConfig: Record<
  Severity,
  { border: string; bg: string; badge: string; badgeBg: string; iconColor: string }
> = {
  critical: {
    border: 'border-destructive/40',
    bg: 'bg-destructive/5',
    badge: 'text-destructive',
    badgeBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
  warning: {
    border: 'border-yellow-400/40',
    bg: 'bg-yellow-50/60',
    badge: 'text-yellow-700',
    badgeBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  caution: {
    border: 'border-orange-400/40',
    bg: 'bg-orange-50/60',
    badge: 'text-orange-700',
    badgeBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  ok: {
    border: 'border-green-400/40',
    bg: 'bg-green-50/60',
    badge: 'text-green-700',
    badgeBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
};

// ─── Analysis engine (accepts t for bilingual output) ─────────────────────────

function computeAnalysis(
  data: ReturnType<typeof useBudget>['data'],
  metrics: ReturnType<typeof calculateMetrics>,
  t: TFn,
): { cards: InsightCard[]; checklist: ChecklistItem[] } {
  const cards: InsightCard[] = [];
  const marketingPct =
    metrics.totalExpenses > 0 ? (data.marketing / metrics.totalExpenses) * 100 : 0;
  const runwayMonthsFromExpenses =
    metrics.totalExpenses > 0 ? data.startingCash / metrics.totalExpenses : Infinity;

  // 1. Marketing Blindspot
  if (metrics.totalExpenses > 0 && marketingPct < 8) {
    cards.push({
      id: 'marketing',
      severity: 'warning',
      icon: <Megaphone className="w-5 h-5" />,
      title: t('card.marketing.title'),
      body: t('card.marketing.body'),
      metric: `${marketingPct.toFixed(1)}%`,
      metricLabel: t('card.marketing.metricLabel'),
    });
  }

  // 2. Runway Reality Check
  if (metrics.totalExpenses > 0 && runwayMonthsFromExpenses < 4) {
    cards.push({
      id: 'runway',
      severity: 'critical',
      icon: <ShieldAlert className="w-5 h-5" />,
      title: t('card.runway.title'),
      body: t('card.runway.body'),
      metric: `${runwayMonthsFromExpenses < Infinity ? runwayMonthsFromExpenses.toFixed(1) : '∞'} mo`,
      metricLabel: t('card.runway.metricLabel'),
    });
  }

  // 3. Margin Validation
  if (metrics.monthlyRevenue > 0 && metrics.profitMargin > 60) {
    cards.push({
      id: 'margin',
      severity: 'caution',
      icon: <TrendingDown className="w-5 h-5" />,
      title: t('card.margin.title'),
      body: t('card.margin.body', metrics.profitMargin.toFixed(1)),
      metric: `${metrics.profitMargin.toFixed(1)}%`,
      metricLabel: t('card.margin.metricLabel'),
    });
  }

  // All-clear
  if (cards.length === 0 && metrics.totalExpenses > 0) {
    cards.push({
      id: 'all-clear',
      severity: 'ok',
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: t('card.allclear.title'),
      body: t('card.allclear.body'),
    });
  }

  // ── Checklist ──────────────────────────────────────────────────────────────
  // Step 1 — Legal structure
  const step1: ChecklistItem = {
    icon: <Landmark className="w-5 h-5" />,
    step: 1,
    title: t('checklist.step1.title'),
    description:
      metrics.monthlyRevenue > 0
        ? t('checklist.step1.body.revenue', formatCurrency(metrics.monthlyRevenue))
        : t('checklist.step1.body.norevenue'),
  };

  // Step 2 — Financial context
  let step2: ChecklistItem;
  if (runwayMonthsFromExpenses < 4 && metrics.totalExpenses > 0) {
    step2 = {
      icon: <Layers className="w-5 h-5" />,
      step: 2,
      title: t('checklist.step2.title.lowrunway'),
      description: t(
        'checklist.step2.body.lowrunway',
        runwayMonthsFromExpenses.toFixed(1),
        formatCurrency(metrics.totalExpenses * 6),
      ),
    };
  } else if (metrics.monthlyProfit < 0) {
    step2 = {
      icon: <Layers className="w-5 h-5" />,
      step: 2,
      title: t('checklist.step2.title.loss'),
      description: t(
        'checklist.step2.body.loss',
        formatCurrency(Math.abs(metrics.monthlyProfit) * 0.5),
      ),
    };
  } else {
    step2 = {
      icon: <Layers className="w-5 h-5" />,
      step: 2,
      title: t('checklist.step2.title.ok'),
      description: t('checklist.step2.body.ok', formatCurrency(metrics.totalExpenses)),
    };
  }

  // Step 3 — Marketing / growth
  let step3: ChecklistItem;
  if (marketingPct < 8 && metrics.totalExpenses > 0) {
    step3 = {
      icon: <FileText className="w-5 h-5" />,
      step: 3,
      title: t('checklist.step3.title.lowmarketing'),
      description: t(
        'checklist.step3.body.lowmarketing',
        formatCurrency(data.marketing),
        marketingPct.toFixed(1),
        formatCurrency(metrics.totalExpenses * 0.1),
      ),
    };
  } else if (metrics.breakEvenUnits > 0) {
    step3 = {
      icon: <FileText className="w-5 h-5" />,
      step: 3,
      title: t('checklist.step3.title.breakeven'),
      description: t(
        'checklist.step3.body.breakeven',
        String(metrics.breakEvenUnits),
        String(Math.ceil(metrics.breakEvenUnits * 0.25)),
      ),
    };
  } else {
    step3 = {
      icon: <FileText className="w-5 h-5" />,
      step: 3,
      title: t('checklist.step3.title.default'),
      description: t('checklist.step3.body.default'),
    };
  }

  return { cards, checklist: [step1, step2, step3] };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InsightCardView({ card, index, t }: { card: InsightCard; index: number; t: TFn }) {
  const cfg = severityConfig[card.severity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1 }}
    >
      <Card className={`border ${cfg.border} ${cfg.bg} overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.badgeBg} ${cfg.iconColor}`}>
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badge}`}>
                  {t(`severity.${card.severity}`)}
                </span>
                {card.metric && (
                  <span className="text-xs text-muted-foreground">
                    {card.metric}{' '}
                    <span className="opacity-60">{card.metricLabel}</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChecklistItemView({ item, index }: { item: ChecklistItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 + index * 0.12 }}
      className="flex gap-5 items-start"
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm shadow-sm">
          {item.step}
        </div>
        {index < 2 && <div className="w-px flex-1 bg-border mt-2 min-h-[24px]" />}
      </div>
      <div className="pb-8 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-primary">{item.icon}</span>
          <h4 className="font-display font-semibold text-foreground">{item.title}</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Premium Section ──────────────────────────────────────────────────────────

function generateReport(
  data: ReturnType<typeof useBudget>['data'],
  metrics: ReturnType<typeof calculateMetrics>,
): string {
  const line = (c: string, n = 60) => c.repeat(n);
  const pad = (label: string, value: string, width = 40) =>
    `${label}${' '.repeat(Math.max(1, width - label.length))}${value}`;

  const runway =
    metrics.monthlyProfit >= 0
      ? 'Self-sustaining'
      : metrics.runwayMonths === Infinity
      ? '∞'
      : `${metrics.runwayMonths.toFixed(1)} months`;

  const m1 = Math.max(0, data.startingCash + metrics.monthlyProfit);
  const m2 = Math.max(0, data.startingCash + metrics.monthlyProfit * 2);
  const m3 = Math.max(0, data.startingCash + metrics.monthlyProfit * 3);

  const marginNote =
    metrics.profitMargin > 60
      ? 'High — verify no hidden costs are missing (shipping, payment fees, taxes)'
      : metrics.profitMargin > 30
      ? 'Healthy — strong unit economics'
      : metrics.profitMargin > 0
      ? 'Slim — review pricing and cost structure'
      : 'Negative — expenses exceed revenue';

  const mktPct =
    metrics.totalExpenses > 0
      ? ((data.marketing / metrics.totalExpenses) * 100).toFixed(1)
      : '0';

  return [
    'BIZSTART SIMULATOR — STRATEGIC REPORT',
    `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    '',
    line('═'),
    'BUSINESS FINANCIAL SUMMARY',
    line('─'),
    pad('Monthly Expenses:', formatCurrency(metrics.totalExpenses)),
    pad('Monthly Revenue:', formatCurrency(metrics.monthlyRevenue)),
    pad('Monthly Profit / Loss:', `${metrics.monthlyProfit >= 0 ? '+' : ''}${formatCurrency(metrics.monthlyProfit)}`),
    pad('Starting Capital:', formatCurrency(data.startingCash)),
    pad('Cash Runway:', runway),
    pad('Profit Margin:', `${metrics.profitMargin.toFixed(1)}% — ${marginNote}`),
    pad('Break-even:', `${metrics.breakEvenUnits} sales / month`),
    pad('Marketing Share:', `${mktPct}% of expenses`),
    '',
    line('═'),
    '90-DAY CASH PROJECTION',
    line('─'),
    pad('Month 1:', formatCurrency(m1)),
    pad('Month 2:', formatCurrency(m2)),
    pad('Month 3:', formatCurrency(m3)),
    '',
    line('═'),
    'ADVANCED STRATEGIC INSIGHTS',
    line('─'),
    '1. PRICING POWER',
    `   Margin ${metrics.profitMargin.toFixed(1)}%: ${
      metrics.profitMargin > 40
        ? 'Strong unit economics. Focus on volume before experimenting with discounts.'
        : 'Review whether your price can absorb a 15–20% cost overrun (typical year-one).'
    }`,
    '',
    '2. MARKETING ROI',
    `   You spend ${formatCurrency(data.marketing)}/mo to generate ${formatCurrency(metrics.monthlyRevenue)} in revenue.`,
    '   Track cost-per-acquisition (CPA) from week one — without this metric you are flying blind.',
    '',
    '3. SCALE READINESS',
    `   To double revenue to ${formatCurrency(metrics.monthlyRevenue * 2)}, keep fixed costs flat`,
    '   and automate fulfilment before hitting capacity. Plan your first hire early.',
    '',
    '4. CASH FLOW RISK WINDOW',
    '   Months 1–3 are highest risk before revenue stabilises. During this window:',
    '   • Delay non-essential purchases',
    '   • Negotiate net-30 payment terms with suppliers',
    '   • Invoice clients immediately upon delivery',
    '',
    line('═'),
    'LEGAL & COMPLIANCE CHECKLIST',
    line('─'),
    '☐  Register business structure (LLC, sole proprietorship, or corporation)',
    '☐  Obtain EIN (Employer Identification Number)',
    '☐  Open a dedicated business bank account',
    '☐  Set up accounting software (Wave free / QuickBooks Self-Employed)',
    '☐  Register for applicable sales tax collection',
    '☐  Apply for local business license / permits',
    '☐  Review self-employment tax obligations (15.3% US)',
    '☐  Consider general liability insurance',
    '☐  Set up a merchant / payment processor account',
    '',
    line('═'),
    '90-DAY ACTION ROADMAP',
    line('─'),
    'WEEKS 1–2',
    '  Complete legal registration',
    '  Open business bank account',
    '  Install accounting software',
    '',
    'WEEKS 3–4',
    '  Launch one marketing channel experiment',
    '  Define target customer persona',
    '  Track all revenue and expenses from day one',
    '',
    'MONTH 2',
    '  Review and adjust pricing model',
    '  Follow up with first 10 paying customers',
    '  Revisit financial projections with real data',
    '',
    'MONTH 3',
    `  Evaluate break-even progress (target: ${metrics.breakEvenUnits} sales/mo)`,
    '  Adjust marketing spend based on measured ROI',
    '  Decide on first operational hire if growth is strong',
    '',
    line('═'),
    'Generated by BizStart Simulator',
    line('─'),
  ].join('\n');
}

function PremiumSection({
  data,
  metrics,
  t,
}: {
  data: ReturnType<typeof useBudget>['data'];
  metrics: ReturnType<typeof calculateMetrics>;
  t: TFn;
}) {
  const [state, setState] = useState<PremiumState>('idle');

  const handleUnlock = () => {
    setState('processing');
    // Simulate Stripe checkout → success (mock flow)
    setTimeout(() => setState('unlocked'), 2600);
  };

  const handleDownload = () => {
    const content = generateReport(data, metrics);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bizstart-strategy-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const insights = [
    {
      icon: <Target className="w-5 h-5" />,
      title: t('premium.insight1.title'),
      body: t('premium.insight1.body', metrics.profitMargin.toFixed(1)),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: t('premium.insight2.title'),
      body: t('premium.insight2.body', formatCurrency(data.marketing), formatCurrency(metrics.monthlyRevenue)),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: t('premium.insight3.title'),
      body: t('premium.insight3.body', String(metrics.monthlyProfit), formatCurrency(metrics.monthlyRevenue * 2)),
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: t('premium.insight4.title'),
      body: t('premium.insight4.body', String(metrics.runwayMonths === Infinity ? 6 : metrics.runwayMonths)),
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const m1 = Math.max(0, data.startingCash + metrics.monthlyProfit);
  const m2 = Math.max(0, data.startingCash + metrics.monthlyProfit * 2);
  const m3 = Math.max(0, data.startingCash + metrics.monthlyProfit * 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <AnimatePresence mode="wait">
        {/* ── IDLE — CTA card ─────────────────────────────────────────────── */}
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-px shadow-lg">
              <div className="rounded-[14px] bg-gradient-to-br from-primary/[0.04] to-transparent p-8">
                {/* Decorative sparkle blob */}
                <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                <div className="relative">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('premium.badge')}
                  </div>

                  <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                    ✨ {t('premium.title')}
                  </h3>
                  <p className="text-muted-foreground text-base mb-6 max-w-xl">
                    {t('premium.subtitle')}
                  </p>

                  {/* Feature list */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {(['feature1', 'feature2', 'feature3', 'feature4'] as const).map((k) => (
                      <div key={k} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium text-foreground/80">
                          {t(`premium.${k}`)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleUnlock}
                      className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-7 py-3.5 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      {t('premium.cta')}
                    </button>
                    <p className="text-xs text-muted-foreground">{t('premium.note')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROCESSING ──────────────────────────────────────────────────── */}
        {state === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-12 flex flex-col items-center justify-center text-center"
          >
            {/* Animated ring */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20" />
              <motion.div
                className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-primary/40" />
            </div>
            {/* Fake progress bar */}
            <div className="w-64 h-1.5 bg-primary/10 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.4, ease: 'easeInOut' }}
              />
            </div>
            <p className="text-lg font-semibold text-foreground">{t('premium.processing')}</p>
            <p className="text-sm text-muted-foreground mt-1">Stripe · TLS 1.3 · PCI DSS</p>
          </motion.div>
        )}

        {/* ── UNLOCKED ────────────────────────────────────────────────────── */}
        {state === 'unlocked' && (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6"
          >
            {/* Success header */}
            <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-2xl bg-success/5 border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-success" />
                    <span className="text-xs font-bold uppercase tracking-wider text-success">
                      {t('premium.success.badge')}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground">
                    {t('premium.success.title')}
                  </h3>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-foreground hover:bg-foreground/80 text-background font-semibold px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {t('premium.download')}
              </button>
            </div>

            <p className="text-muted-foreground">{t('premium.success.subtitle')}</p>

            {/* Advanced insight cards */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('premium.advanced.title')}
              </h4>
              {insights.map((ins, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <Card>
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${ins.bg} ${ins.color} flex items-center justify-center flex-shrink-0`}>
                        {ins.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-display font-semibold text-foreground mb-1">{ins.title}</h5>
                        <p className="text-sm text-muted-foreground leading-relaxed">{ins.body}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* 90-day projection table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('premium.proj.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: t('premium.proj.month', '1'), value: m1 },
                    { label: t('premium.proj.month', '2'), value: m2 },
                    { label: t('premium.proj.month', '3'), value: m3 },
                  ].map(({ label, value }, i) => {
                    const pct = data.startingCash > 0 ? Math.min(100, (value / (data.startingCash || 1)) * 100) : 0;
                    const barColor = value > data.startingCash ? 'bg-success' : value > 0 ? 'bg-primary' : 'bg-destructive';
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">{label}</span>
                          <span className={`font-bold ${value >= (data.startingCash || 0) ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(value)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${barColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(2, pct)}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIRealityCheck() {
  const { data } = useBudget();
  const { t } = useLanguage();
  const metrics = calculateMetrics(data);
  const [analyzed, setAnalyzed] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof computeAnalysis> | null>(null);

  const hasData =
    data.rent > 0 ||
    data.utilities > 0 ||
    data.stock > 0 ||
    data.marketing > 0 ||
    data.otherExpenses > 0 ||
    data.pricePerUnit > 0 ||
    data.startingCash > 0;

  const handleAnalyze = useCallback(() => {
    setAnalyzed(false);
    setResult(null);
    requestAnimationFrame(() => {
      setResult(computeAnalysis(data, metrics, t));
      setAnalyzed(true);
    });
  }, [data, metrics, t]);

  // ── Empty state ────────────────────────────────────────────────────────────
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
          {t('reality.empty.title')}
        </h2>
        <p className="text-muted-foreground max-w-md text-lg mb-8">{t('reality.empty.body')}</p>
        <Link href="/">
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2">
            {t('reality.empty.cta')}
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </motion.div>
    );
  }

  const marketingPct =
    metrics.totalExpenses > 0 ? (data.marketing / metrics.totalExpenses) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">{t('reality.title')}</h2>
        <p className="text-muted-foreground text-lg">{t('reality.subtitle')}</p>
      </div>

      {/* ── Snapshot bar ──────────────────────────────────────────────────── */}
      <Card className="border-primary/15 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                  {t('reality.snap.expenses')}
                </p>
                <p className="text-xl font-display font-bold text-foreground">
                  {formatCurrency(metrics.totalExpenses)}
                  <span className="text-sm font-normal text-muted-foreground">{t('reality.snap.perMonth')}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                  {t('reality.snap.revenue')}
                </p>
                <p className="text-xl font-display font-bold text-foreground">
                  {formatCurrency(metrics.monthlyRevenue)}
                  <span className="text-sm font-normal text-muted-foreground">{t('reality.snap.perMonth')}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                  {t('reality.snap.capital')}
                </p>
                <p className="text-xl font-display font-bold text-foreground">
                  {formatCurrency(data.startingCash)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                  {t('reality.snap.marketing')}
                </p>
                <p className="text-xl font-display font-bold text-foreground">
                  {marketingPct.toFixed(1)}%
                </p>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-7 py-3 rounded-xl transition-all duration-150 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <BarChart2 className="w-4 h-4" />
              {t('reality.analyze')}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Pre-analyze prompt / Results ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!analyzed && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-5">
              <BarChart2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg font-medium mb-1">
              {t('reality.prompt.title')}
            </p>
            <p className="text-muted-foreground/70 text-sm max-w-xs">{t('reality.prompt.body')}</p>
          </motion.div>
        )}

        {analyzed && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {/* Insight cards */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('reality.results.label', result.cards.length)}
                </h3>
              </div>
              {result.cards.map((card, i) => (
                <InsightCardView key={card.id} card={card} index={i} t={t} />
              ))}
            </section>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold px-2">
                {t('reality.action.divider')}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Checklist */}
            <section>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('reality.checklist.title')}</CardTitle>
                      <CardDescription>{t('reality.checklist.subtitle')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-2">
                  {result.checklist.map((item, i) => (
                    <ChecklistItemView key={item.step} item={item} index={i} />
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* Re-analyze nudge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3 py-2"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground/70">
                {t('reality.refresh')}{' '}
                <span className="font-semibold text-primary">{t('reality.refreshHighlight')}</span>{' '}
                {t('reality.refreshSuffix')}
              </p>
            </motion.div>

            {/* ── Premium Section ─────────────────────────────────────────── */}
            <div className="pt-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold px-2">
                  {t('premium.badge')}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <PremiumSection data={data} metrics={metrics} t={t} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
