import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { LoanOffer } from '../../types';
import { formatINR } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface OfferCardProps {
  offer: LoanOffer;
  onSelectOffer: (offer: LoanOffer) => void;
  selected?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onSelectOffer, selected }) => {
  const { t, language } = useI18n();

  const isApproved = offer.status === 'Approved';
  const isInfo = offer.status === 'Needs more info';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`relative w-full rounded-3xl p-5 sm:p-6 transition border ${
        selected
          ? 'bg-white dark:bg-surface-dark-card border-crimson-600 ring-2 ring-crimson-600/20 shadow-crimson-md'
          : 'bg-white/85 dark:bg-surface-dark-card/90 border-crimson-100/90 dark:border-ink-800 hover:border-crimson-300 dark:hover:border-crimson-800 shadow-glass'
      }`}
    >
      {/* Top Banner / Badge */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-crimson-50 dark:border-ink-800/80">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0"
            style={{ backgroundColor: offer.lenderColor || '#C8102E' }}
          >
            {offer.lenderLogoText || 'L'}
          </div>
          <div>
            <h4 className="font-bold text-base text-ink-950 dark:text-ink-50 leading-snug">
              {offer.lenderName}
            </h4>
            <span className="text-xs text-ink-500 dark:text-ink-400">
              Personal Credit · Auditable Decision
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isApproved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.offerApproved}
            </span>
          )}
          {isInfo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <HelpCircle className="w-3.5 h-3.5" />
              {t.offerNeedsInfo}
            </span>
          )}
          {!isApproved && !isInfo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-crimson-50 dark:bg-crimson-950/50 text-crimson-700 dark:text-crimson-400 border border-crimson-200 dark:border-crimson-800">
              <AlertCircle className="w-3.5 h-3.5" />
              {t.offerNotEligible}
            </span>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
        <div className="p-3 rounded-2xl bg-surface-warm/80 dark:bg-ink-900/60 border border-crimson-50/50 dark:border-ink-800">
          <span className="text-[11px] text-ink-500 dark:text-ink-400 block mb-0.5">{t.loanAmount}</span>
          <span className="text-base font-extrabold text-ink-950 dark:text-ink-50 tabular-nums">
            {formatINR(offer.amount)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-surface-warm/80 dark:bg-ink-900/60 border border-crimson-50/50 dark:border-ink-800">
          <span className="text-[11px] text-ink-500 dark:text-ink-400 block mb-0.5">{t.monthlyEmi}</span>
          <span className="text-base font-extrabold text-crimson-700 dark:text-crimson-400 tabular-nums">
            {formatINR(offer.monthlyEmi)}
            <span className="text-[10px] font-normal text-ink-500 ml-0.5">/mo</span>
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-surface-warm/80 dark:bg-ink-900/60 border border-crimson-50/50 dark:border-ink-800">
          <span className="text-[11px] text-ink-500 dark:text-ink-400 block mb-0.5">{t.interestRate}</span>
          <span className="text-base font-bold text-ink-950 dark:text-ink-50 tabular-nums">
            {offer.interestRateAnnual}%
            <span className="text-[10px] font-normal text-ink-500 ml-0.5">p.a.</span>
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-surface-warm/80 dark:bg-ink-900/60 border border-crimson-50/50 dark:border-ink-800">
          <span className="text-[11px] text-ink-500 dark:text-ink-400 block mb-0.5">{t.tenure}</span>
          <span className="text-base font-bold text-ink-950 dark:text-ink-50 tabular-nums">
            {offer.tenureMonths} <span className="text-xs font-normal text-ink-500">{language === 'hi' ? 'माह' : 'mos'}</span>
          </span>
        </div>
      </div>

      {/* Secondary details row */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-2xl bg-crimson-50/50 dark:bg-crimson-950/20 text-[11px] text-ink-600 dark:text-ink-300">
        <div>
          <span>{t.totalPayable}: </span>
          <span className="font-bold text-ink-950 dark:text-ink-50 tabular-nums">{formatINR(offer.totalPayable)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{t.processingFee}: <strong className="text-ink-950 dark:text-ink-50">{formatINR(offer.processingFeeAmount)}</strong></span>
          <span>APR: <strong className="text-crimson-700 dark:text-crimson-400">{offer.apr}%</strong></span>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-crimson-50 dark:border-ink-800/80 flex items-center justify-between">
        <div className="text-[11px] text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-crimson-600" />
          <span>RBI Fair Lending · Direct Disbursement</span>
        </div>

        <button
          onClick={() => onSelectOffer(offer)}
          className="py-2.5 px-5 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold text-xs transition shadow-crimson-sm hover:shadow-crimson-md flex items-center gap-2"
        >
          <span>{t.chooseOfferBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
