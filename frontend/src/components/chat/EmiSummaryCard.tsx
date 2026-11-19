import React from 'react';
import { PieChart, TrendingUp, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface EmiSummaryCardProps {
  amount: number;
  tenureMonths: number;
  rate: number;
  emi: number;
  totalInterest: number;
  totalPayable: number;
  monthlyIncome?: number;
  foir?: number;
}

export const EmiSummaryCard: React.FC<EmiSummaryCardProps> = ({
  amount,
  tenureMonths,
  rate,
  emi,
  totalInterest,
  totalPayable,
  monthlyIncome,
  foir,
}) => {
  const { t, language } = useI18n();

  // Donut chart calculations
  const total = amount + totalInterest;
  const principalPercent = total > 0 ? (amount / total) * 100 : 50;
  const interestPercent = 100 - principalPercent;

  // SVG Donut params
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const principalStroke = (principalPercent / 100) * circumference;
  const interestStroke = circumference - principalStroke;

  // FOIR meter styling
  const calculatedFoir = foir !== undefined ? foir : monthlyIncome ? Math.round((emi / monthlyIncome) * 100) : null;

  let foirColor = 'bg-emerald-500';
  let foirTextColor = 'text-emerald-700 dark:text-emerald-400';
  let foirBgColor = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
  let foirIcon = CheckCircle;
  let foirDesc = t.foirSafe;

  if (calculatedFoir !== null) {
    if (calculatedFoir > 50) {
      foirColor = 'bg-crimson-600';
      foirTextColor = 'text-crimson-700 dark:text-crimson-400';
      foirBgColor = 'bg-crimson-50 dark:bg-crimson-950/40 border-crimson-200 dark:border-crimson-800';
      foirIcon = ShieldAlert;
      foirDesc = t.foirHigh;
    } else if (calculatedFoir >= 40) {
      foirColor = 'bg-amber-500';
      foirTextColor = 'text-amber-700 dark:text-amber-400';
      foirBgColor = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      foirIcon = AlertTriangle;
      foirDesc = t.foirModerate;
    }
  }

  const FoirIconComp = foirIcon;

  return (
    <div className="w-full my-3 p-5 rounded-3xl bg-white/90 dark:bg-surface-dark-card/90 border border-crimson-100 dark:border-ink-800 shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-crimson-50 dark:border-ink-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs uppercase tracking-wider text-ink-950 dark:text-ink-50">
            {language === 'hi' ? 'ईएमआई व सामर्थ्य विश्लेषण' : 'EMI & Affordability Breakdown'}
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-warm dark:bg-ink-800 text-ink-600 dark:text-ink-300">
          {tenureMonths} {language === 'hi' ? 'महीने' : 'Months'} @ {rate}%
        </span>
      </div>

      {/* Grid: Donut Chart + Money Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 py-4 items-center">
        {/* SVG Donut */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 88 88">
              {/* Background track */}
              <circle
                cx="44"
                cy="44"
                r={radius}
                className="text-crimson-100 dark:text-crimson-950/70"
                strokeWidth="9"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Principal ring (crimson-600) */}
              <circle
                cx="44"
                cy="44"
                r={radius}
                className="text-crimson-600 dark:text-crimson-500 transition-all duration-700 ease-out"
                strokeWidth="9"
                strokeDasharray={`${principalStroke} ${circumference}`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-ink-400 uppercase font-semibold">Monthly</span>
              <span className="text-sm font-extrabold text-ink-950 dark:text-ink-50 tabular-nums">
                {formatINR(emi)}
              </span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-crimson-600" />
              <span className="text-ink-600 dark:text-ink-300">Principal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-crimson-200 dark:bg-crimson-900" />
              <span className="text-ink-600 dark:text-ink-300">Interest</span>
            </div>
          </div>
        </div>

        {/* Breakdown Values */}
        <div className="sm:col-span-7 space-y-2.5 text-xs">
          <div className="flex justify-between items-center p-2 rounded-xl bg-surface-warm dark:bg-ink-900/60">
            <span className="text-ink-500 dark:text-ink-400">{t.calcPrincipal}:</span>
            <span className="font-bold text-ink-950 dark:text-ink-50 tabular-nums">{formatINR(amount)}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-xl bg-surface-warm dark:bg-ink-900/60">
            <span className="text-ink-500 dark:text-ink-400">{t.calcTotalInterest}:</span>
            <span className="font-bold text-crimson-700 dark:text-crimson-400 tabular-nums">{formatINR(totalInterest)}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 rounded-xl bg-crimson-50/70 dark:bg-crimson-950/40 border border-crimson-100 dark:border-crimson-900/60 font-semibold">
            <span className="text-ink-950 dark:text-ink-50">{t.totalPayable}:</span>
            <span className="font-extrabold text-crimson-700 dark:text-crimson-300 text-sm tabular-nums">
              {formatINR(totalPayable)}
            </span>
          </div>
        </div>
      </div>

      {/* FOIR Gauge / Meter */}
      {calculatedFoir !== null && (
        <div className={`mt-2 p-3.5 rounded-2xl border ${foirBgColor} transition`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <FoirIconComp className={`w-4 h-4 ${foirTextColor}`} />
              <span className="text-xs font-bold text-ink-950 dark:text-ink-50">
                {t.foirLabel}: <span className={foirTextColor}>{calculatedFoir}%</span>
              </span>
            </div>
            {monthlyIncome && (
              <span className="text-[11px] text-ink-500 dark:text-ink-400">
                on {formatINR(monthlyIncome)} {language === 'hi' ? 'मासिक आय' : 'income'}
              </span>
            )}
          </div>

          {/* Bar track */}
          <div className="h-2 w-full bg-ink-200/60 dark:bg-ink-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full ${foirColor} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min(100, (calculatedFoir / 70) * 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-ink-600 dark:text-ink-300 mt-2 leading-relaxed">
            {foirDesc}
          </p>
        </div>
      )}
    </div>
  );
};
