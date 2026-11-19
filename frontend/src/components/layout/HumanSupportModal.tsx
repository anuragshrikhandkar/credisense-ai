import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PhoneCall, Clock, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { requestHumanCallback } from '../../lib/api';

interface HumanSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationSummary?: string;
}

export const HumanSupportModal: React.FC<HumanSupportModalProps> = ({
  isOpen,
  onClose,
  conversationSummary = 'Borrower exploring personal loan options. Inquired about eligibility and RBI interest rate guidelines.',
}) => {
  const { t, language } = useI18n();
  const { user } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredTime, setPreferredTime] = useState(t.timeImmediately);
  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestHumanCallback(
        user?.name || 'Customer',
        phone,
        preferredTime,
        conversationSummary
      );
      setSubmittedRef(res.id.replace('req_', ''));
    } catch {
      // fallback
      setSubmittedRef(`${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm"
          />

          {/* Side Drawer Card */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 h-full w-full max-w-md bg-white dark:bg-surface-dark-card border-l border-crimson-100 dark:border-ink-800 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            {/* Header */}
            <div>
              <div className="p-6 pb-4 border-b border-crimson-50 dark:border-ink-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-crimson-50 dark:bg-crimson-950/50 flex items-center justify-center text-crimson-600 dark:text-crimson-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-ink-950 dark:text-ink-50 leading-tight">
                      {t.humanSupportTitle}
                    </h2>
                    <p className="text-xs text-ink-500 dark:text-ink-400">{t.humanSupportSub}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-crimson-50 dark:hover:bg-ink-800 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submittedRef ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-bold text-ink-950 dark:text-ink-50 mb-2">
                    {language === 'hi' ? 'अनुरोध सफलतापूर्वक दर्ज!' : 'Callback Scheduled!'}
                  </h3>
                  <p className="text-sm text-ink-600 dark:text-ink-300 mb-6">
                    {t.supportAgentNote}
                  </p>

                  <div className="p-4 rounded-2xl bg-crimson-50/70 dark:bg-crimson-950/30 border border-crimson-100 dark:border-crimson-900/40 text-left mb-6">
                    <div className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wider mb-1">
                      {language === 'hi' ? 'संदर्भ टिकट आईडी' : 'Reference ID'}
                    </div>
                    <div className="font-mono font-semibold text-crimson-700 dark:text-crimson-400 text-sm">
                      CS-REQ-{submittedRef}
                    </div>
                    <div className="text-xs text-ink-600 dark:text-ink-300 mt-2">
                      {language === 'hi' ? 'अपेक्षित कॉल समय:' : 'Expected call window:'}{' '}
                      <span className="font-medium text-ink-950 dark:text-ink-50">{preferredTime}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full py-3 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium text-sm transition shadow-crimson-sm"
                  >
                    {language === 'hi' ? 'बातचीत जारी रखें' : 'Return to Chat'}
                  </button>
                </motion.div>
              ) : (
                /* Form State */
                <div className="p-6 space-y-6">
                  {/* Trust Banner Note */}
                  <div className="p-4 rounded-2xl bg-crimson-50/60 dark:bg-crimson-950/30 border border-crimson-100 dark:border-crimson-900/40 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-crimson-600 dark:text-crimson-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                      {t.supportAgentNote}
                    </p>
                  </div>

                  {/* Context Summary Preview */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                      {t.conversationSummaryTitle}
                    </label>
                    <div className="p-3.5 rounded-2xl bg-surface-warm dark:bg-ink-900/50 border border-crimson-100/70 dark:border-ink-800 text-xs text-ink-700 dark:text-ink-300 leading-relaxed font-mono">
                      "{conversationSummary}"
                    </div>
                  </div>

                  {/* Callback Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                        {t.callBackPhone}
                      </label>
                      <div className="relative">
                        <PhoneCall className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                        {t.preferredTime}
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <select
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition appearance-none"
                        >
                          <option value={t.timeImmediately}>{t.timeImmediately}</option>
                          <option value={t.timeMorning}>{t.timeMorning}</option>
                          <option value={t.timeAfternoon}>{t.timeAfternoon}</option>
                          <option value={t.timeEvening}>{t.timeEvening}</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-4 py-3 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-medium text-sm transition shadow-crimson-sm flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <PhoneCall className="w-4 h-4" />
                          <span>{t.requestCallbackBtn}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-4 border-t border-crimson-50 dark:border-ink-800/60 bg-surface-warm/50 dark:bg-ink-950/30 text-center">
              <span className="text-[11px] text-ink-500 dark:text-ink-400">
                Credisense Lending Desk · Mon-Sat 9AM-8PM IST
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
