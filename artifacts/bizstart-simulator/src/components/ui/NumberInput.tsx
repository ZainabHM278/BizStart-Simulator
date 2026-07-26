import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

export interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefixSymbol?: string;
  suffixSymbol?: string;
  tooltip?: string;
  error?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, prefixSymbol, suffixSymbol, tooltip, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2 w-full">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
            {label}
            {tooltip && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-colors outline-none cursor-help">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border text-sm max-w-[220px] z-50">
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </label>
        </div>

        {/* Force LTR so $ prefix and number input always render left-to-right */}
        <div className="relative flex items-center group" dir="ltr">
          {prefixSymbol && (
            <span className="absolute left-4 text-muted-foreground font-medium z-10 pointer-events-none">
              {prefixSymbol}
            </span>
          )}
          <input
            type="number"
            dir="ltr"
            ref={ref}
            className={cn(
              "w-full h-12 bg-card border-2 border-border/60 rounded-xl px-4 py-2 font-medium text-lg transition-all",
              "hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none",
              "hide-arrows",
              prefixSymbol && "pl-8",
              suffixSymbol && "pr-12",
              error && "border-destructive/50 focus:border-destructive focus:ring-destructive/10",
              className
            )}
            {...props}
          />
          {suffixSymbol && (
            <span className="absolute right-4 text-muted-foreground font-medium z-10 pointer-events-none">
              {suffixSymbol}
            </span>
          )}
        </div>
        {error && <span className="text-sm text-destructive font-medium mt-1">{error}</span>}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
