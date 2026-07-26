import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AnimatePresence } from 'framer-motion';

import BudgetPlanner from '@/pages/BudgetPlanner';
import VisualSnapshot from '@/pages/VisualSnapshot';
import AIRealityCheck from '@/pages/AIRealityCheck';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetProvider } from '@/components/BudgetProvider';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { Calculator, BarChart3, Store, ShieldCheck } from 'lucide-react';

const queryClient = new QueryClient();

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center rounded-lg border border-border overflow-hidden flex-shrink-0" dir="ltr">
      <button
        onClick={() => setLang('en')}
        aria-label="Switch to English"
        className={`px-3 py-2 text-xs font-bold tracking-wide transition-colors ${
          lang === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        EN
      </button>
      <div className="w-px h-5 bg-border" />
      <button
        onClick={() => setLang('ar')}
        aria-label="التبديل إلى العربية"
        className={`px-3 py-2 text-xs font-bold tracking-wide transition-colors ${
          lang === 'ar'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        AR
      </button>
    </div>
  );
}

function MainLayout() {
  const [location, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();

  const currentTab =
    location === '/visual' ? 'visual' : location === '/reality' ? 'reality' : 'planner';

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-xl flex-shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-display font-bold tracking-tight">{t('app.title')}</h1>
            </div>
            <p className="text-muted-foreground">{t('app.tagline')}</p>
          </div>

          {/* Tabs + language toggle — keep tab order LTR always */}
          <div className="flex items-center gap-3" dir="ltr">
            <Tabs
              value={currentTab}
              onValueChange={(val) =>
                setLocation(val === 'visual' ? '/visual' : val === 'reality' ? '/reality' : '/')
              }
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="planner" className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 flex-shrink-0" />
                  <span>{t('nav.planner')}</span>
                </TabsTrigger>
                <TabsTrigger value="visual" className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 flex-shrink-0" />
                  <span>{t('nav.snapshot')}</span>
                </TabsTrigger>
                <TabsTrigger value="reality" className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{t('nav.realityCheck')}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <LanguageToggle />
          </div>
        </header>

        {/* Content Area */}
        <main className="relative">
          <AnimatePresence mode="wait">
            <Switch location={location} key={location}>
              <Route path="/" component={BudgetPlanner} />
              <Route path="/visual" component={VisualSnapshot} />
              <Route path="/reality" component={AIRealityCheck} />
              <Route component={NotFound} />
            </Switch>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BudgetProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <MainLayout />
            </WouterRouter>
          </TooltipProvider>
        </BudgetProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
