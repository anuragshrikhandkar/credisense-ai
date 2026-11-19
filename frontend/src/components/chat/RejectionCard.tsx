import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Sliders, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { LoanOffer } from '../../types';
import { formatINR } from '../../lib/utils';
import { useI18n } from '../../i18n';
import { PolicySourceChip } from './PolicySourceChip';

interface RejectionCardProps {
  offer: LoanOffer;
  onApplyAlternative: (alternative: {
    label: string;
    amount?: number;
    tenureMonths?: number;
    actionType: 'reduce_amount' | 'extend_tenure' | 'add_coapplicant';
  }) => void;
}

export const RejectionCard: React.FC<RejectionCardProps> = ({ offer, onApplyAlternative }) => {
  const { t, language } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full my-3 p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-200 dark:border-crimson-900/60 shadow-glass"
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 pb-4 border-b border-crimson-100/70 dark:border-ink-800">
        <div className="w-10 h-10 rounded-2xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-crimson-700 dark:text-crimson-400">
              {offer.lenderName}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-crimson-100 dark:bg-crimson-950 text-crimson-800 dark:text-crimson-300 font-semibold">
              {t.offerNotEligible}
            </span>
          </div>
          <h4 className="text-base font-bold text-ink-950 dark:text-ink-50 mt-1">
            {t.whyRejected}
          </h4>
        </div>
      </div>

      {/* Clear Plain Language Reason */}
      <div className="py-4">
        <div className="p-4 rounded-2xl bg-crimson-50/70 dark:bg-crimson-950/30 border border-crimson-100 dark:border-crimson-900/50">
          <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-medium">
            {language === 'hi' && offer.reasonHi ? offer.reasonHi : offer.reason}
          </p>
        </div>

        {/* Policy Citation */}
        {offer.policySource && (
          <PolicySourceChip citation={offer.policySource} />
        )}
      </div>

      {/* What Can I Change? Section */}
      <div className="pt-3 border-t border-crimson-100/70 dark:border-ink-800">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-crimson-600" />
          <h5 className="font-bold text-xs uppercase tracking-wider text-ink-950 dark:text-ink-50">
            {t.whatCanIChange}
          </h5>
        </div>

        {/* Tappable Alternative Action Chips */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() =>
              onApplyAlternative({
                label: 'Reduce amount to ₹1,00,000',
                amount: 100000,
                tenureMonths: 36,
                actionType: 'reduce_amount',
              })
            }
            className="flex-1 p-3 rounded-2xl text-left bg-surface-warm hover:bg-crimson-50 dark:bg-ink-900/60 dark:hover:bg-crimson-950/40 border border-crimson-100 dark:border-ink-700 hover:border-crimson-300 transition text-xs group"
          >
            <div className="flex items-center justify-between font-semibold text-ink-950 dark:text-ink-50 group-hover:text-crimson-700">
              <span>{t.optLowerAmount}</span>
              <ArrowRight className="w-3.5 h-3.5 text-crimson-600 transform group-hover:translate-x-0.5 transition" />
            </div>
            <span className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 block">
              ₹1,00,000 for 36 mos (EMI ≈ ₹3,418)
            </span>
          </button>

          <button
            onClick={() =>
              onApplyAlternative({
                label: 'Extend tenure to 48 months',
                amount: offer.amount,
                tenureMonths: 48,
                actionType: 'extend_tenure',
              })
            }
            className="flex-1 p-3 rounded-2xl text-left bg-surface-warm hover:bg-crimson-50 dark:bg-ink-900/60 dark:hover:bg-crimson-950/40 border border-crimson-100 dark:border-ink-700 hover:border-crimson-300 transition text-xs group"
          >
            <div className="flex items-center justify-between font-semibold text-ink-950 dark:text-ink-50 group-hover:text-crimson-700">
              <span>{t.optLongerTenure}</span>
              <ArrowRight className="w-3.5 h-3.5 text-crimson-600 transform group-hover:translate-x-0.5 transition" />
            </div>
            <span className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 block">
              48 months lowers monthly FOIR
            </span>
          </button>

          <button
            onClick={() =>
              onApplyAlternative({
                label: 'Add a co-applicant',
                actionType: 'add_coapplicant',
              })
            }
            className="flex-1 p-3 rounded-2xl text-left bg-surface-warm hover:bg-crimson-50 dark:bg-ink-900/60 dark:hover:bg-crimson-950/40 border border-crimson-100 dark:border-ink-700 hover:border-crimson-300 transition text-xs group"
          >
            <div className="flex items-center justify-between font-semibold text-ink-950 dark:text-ink-50 group-hover:text-crimson-700">
              <span>{t.optCoApplicant}</span>
              <ArrowRight className="w-3.5 h-3.5 text-crimson-600 transform group-hover:translate-x-0.5 transition" />
            </div>
            <span className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 block">
              Pool family income for eligibility
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
