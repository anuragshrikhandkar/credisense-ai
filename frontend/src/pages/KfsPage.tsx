import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Languages,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { getApplicationById, submitKfsConsent } from '../lib/api';
import { LoanApplication, KFSData } from '../types';
import { formatINR, formatDateTime } from '../lib/utils';

export const KfsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [explainHindi, setExplainHindi] = useState(language === 'hi');
  const [submitting, setSubmitting] = useState(false);

  // Consent checkboxes state
  const [consentData, setConsentData] = useState(false);
  const [consentBureau, setConsentBureau] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentSavedTimestamp, setConsentSavedTimestamp] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const app = await getApplicationById(id || 'app_demo_01');
        setApplication(app);
        if (app?.kfsData?.consents?.timestamp) {
          setConsentSavedTimestamp(app.kfsData.consents.timestamp);
          setConsentData(true);
          setConsentBureau(true);
          setConsentTerms(true);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const allConsented = consentData && consentBureau && consentTerms;

  const handleContinue = async () => {
    if (!allConsented) return;
    setSubmitting(true);
    try {
      await submitKfsConsent(id || 'app_demo_01', {
        dataUse: consentData,
        creditBureauCheck: consentBureau,
        termsAndConditions: consentTerms,
      });
      setConsentSavedTimestamp(new Date().toISOString());
      navigate(`/application/${id || 'app_demo_01'}/documents`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-crimson-600/20 border-t-crimson-600 rounded-full animate-spin" />
          <span className="text-xs text-ink-500 font-semibold tracking-wider uppercase">Loading Key Fact Statement...</span>
        </div>
      </div>
    );
  }

  // Fallback mock data if none exists
  const kfs: KFSData = application?.kfsData || {
    applicationId: id || 'app_demo_01',
    offerId: 'offer_lender_a',
    lenderName: 'Lender A (Prime Capital)',
    loanAmount: 200000,
    interestRate: 12.5,
    rateType: 'Fixed',
    apr: 13.8,
    tenureMonths: 36,
    monthlyEmi: 6690,
    totalInterest: 40840,
    processingFee: 3000,
    gstOnFee: 540,
    netDisbursalAmount: 196460,
    totalPayable: 240840,
    prepaymentCharges: 'Nil (0%) after 6 completed monthly installments. 2% if prepaid prior to 6 months.',
    prepaymentChargesHi: '6 मासिक किस्तों के बाद शून्य (0%)। 6 महीने से पहले बंद करने पर 2% शुल्क।',
    latePaymentPenalty: '2% per month on overdue EMI amount, calculated on daily overdue basis.',
    latePaymentPenaltyHi: 'देय ईएमआई पर 2% प्रति माह विलंब शुल्क, दैनिक आधार पर गणना।',
    coolingOffPeriod: '3 calendar days from loan agreement signing date (zero penalty exit).',
    coolingOffPeriodHi: 'ऋण अनुबंध पर हस्ताक्षर की तिथि से 3 दिन (शून्य शुल्क रद्दीकरण)।',
    summaryExplanationEn: `You are borrowing ${formatINR(200000)} for 36 months at 12.5% fixed interest. You will pay ${formatINR(240840)} in total, which is ${formatINR(40840)} extra in interest. Net amount credited to your bank account will be ${formatINR(196460)} after one-time processing charges.`,
    summaryExplanationHi: `आप 36 महीनों के लिए 12.5% निश्चित ब्याज पर ${formatINR(200000)} का ऋण ले रहे हैं। आप कुल मिलाकर ${formatINR(240840)} का भुगतान करेंगे, जो कि ब्याज के रूप में ${formatINR(40840)} अतिरिक्त है। प्रोसेसिंग शुल्क काटने के बाद आपके खाते में शुद्ध ${formatINR(196460)} जमा होंगे।`,
    consents: { dataUse: false, creditBureauCheck: false, termsAndConditions: false },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-500 mb-2">
          <span className="text-crimson-600 font-bold uppercase tracking-wider">
            Step 1 of 4 · Regulatory Disclosure
          </span>
          <span>Application ID: {id || 'app_demo_01'}</span>
        </div>
        <div className="h-1.5 w-full bg-ink-200/70 dark:bg-ink-800 rounded-full overflow-hidden">
          <div className="h-full bg-crimson-600 w-1/4 rounded-full transition-all duration-500" />
        </div>
      </div>

      {/* Main Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-50 dark:bg-crimson-950/60 border border-crimson-200/60 dark:border-crimson-800/50 text-crimson-700 dark:text-crimson-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RBI Mandated Transparency Document</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 dark:text-ink-50">
            {t.kfsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-1">
            {t.kfsSub} · Partner: <strong className="text-ink-900 dark:text-ink-100">{kfs.lenderName}</strong>
          </p>
        </div>

        {/* Explain in Hindi / English Toggle */}
        <button
          onClick={() => setExplainHindi(!explainHindi)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-surface-dark-card border border-crimson-200 dark:border-ink-700 text-xs font-bold text-crimson-700 dark:text-crimson-300 hover:bg-crimson-50 shadow-xs transition shrink-0"
        >
          <Languages className="w-4 h-4 text-crimson-600" />
          <span>{explainHindi ? t.explainInEnglish : t.explainInHindi}</span>
        </button>
      </div>

      {/* Plain Language Summary Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-crimson-50/80 via-white to-crimson-50/40 dark:from-crimson-950/40 dark:via-surface-dark-card dark:to-crimson-950/20 border border-crimson-200/80 dark:border-crimson-800/60 shadow-glass"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-crimson-600" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-crimson-700 dark:text-crimson-400">
            {t.kfsSummaryHeading}
          </h3>
        </div>
        <p className="text-sm sm:text-base font-semibold text-ink-950 dark:text-ink-50 leading-relaxed">
          {explainHindi ? kfs.summaryExplanationHi : kfs.summaryExplanationEn}
        </p>
      </motion.div>

      {/* Key Fact Statement Structured Table */}
      <div className="rounded-3xl overflow-hidden border border-crimson-100 dark:border-ink-800 bg-white/90 dark:bg-surface-dark-card shadow-glass mb-8">
        <div className="px-6 py-4 bg-surface-warm dark:bg-ink-900/60 border-b border-crimson-100 dark:border-ink-800 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-ink-950 dark:text-ink-50">
            Standard Loan Parameters
          </span>
          <span className="text-xs text-ink-500 font-mono">Format RBI/2022-23/111</span>
        </div>

        <div className="divide-y divide-crimson-50 dark:divide-ink-800/80 text-xs sm:text-sm">
          {/* Loan Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-center">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400">1. Sanctioned Loan Amount</span>
            <span className="sm:col-span-7 font-extrabold text-ink-950 dark:text-ink-50 tabular-nums text-sm sm:text-base">
              {formatINR(kfs.loanAmount)}
            </span>
          </div>

          {/* Interest Rate & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-center">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400">2. Interest Rate & Nature</span>
            <span className="sm:col-span-7 font-bold text-ink-950 dark:text-ink-50">
              {kfs.interestRate}% p.a. ({kfs.rateType} Rate)
            </span>
          </div>

          {/* APR */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-center bg-crimson-50/40 dark:bg-crimson-950/20">
            <span className="sm:col-span-5 font-medium text-crimson-900 dark:text-crimson-300">
              3. Annual Percentage Rate (APR)
            </span>
            <span className="sm:col-span-7 font-extrabold text-crimson-700 dark:text-crimson-400 tabular-nums text-base">
              {kfs.apr}%
            </span>
          </div>

          {/* Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-center">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400">4. Tenure of Loan</span>
            <span className="sm:col-span-7 font-semibold text-ink-950 dark:text-ink-50 tabular-nums">
              {kfs.tenureMonths} Months ({kfs.tenureMonths / 12} Years)
            </span>
          </div>

          {/* Monthly EMI */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-center">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400">5. Monthly EMI</span>
            <span className="sm:col-span-7 font-extrabold text-crimson-700 dark:text-crimson-400 tabular-nums text-base">
              {formatINR(kfs.monthlyEmi)} / month
            </span>
          </div>

          {/* Processing Fee & GST */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-center">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400">6. Upfront Processing Fee + GST (18%)</span>
            <span className="sm:col-span-7 font-semibold text-ink-950 dark:text-ink-50 tabular-nums">
              {formatINR(kfs.processingFee)} + {formatINR(kfs.gstOnFee)} (Total: {formatINR(kfs.processingFee + kfs.gstOnFee)})
            </span>
          </div>

          {/* Net Disbursal Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-center bg-surface-warm dark:bg-ink-900/60 font-semibold">
            <span className="sm:col-span-5 text-ink-950 dark:text-ink-50">{t.netDisbursal}</span>
            <span className="sm:col-span-7 font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums text-base">
              {formatINR(kfs.netDisbursalAmount)}
            </span>
          </div>

          {/* Total Payable */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-center">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400">7. Total Amount Payable over Tenure</span>
            <span className="sm:col-span-7 font-extrabold text-ink-950 dark:text-ink-50 tabular-nums text-base">
              {formatINR(kfs.totalPayable)}
            </span>
          </div>

          {/* Prepayment Charges */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-start">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400 pt-0.5">{t.prepaymentTitle}</span>
            <span className="sm:col-span-7 text-ink-800 dark:text-ink-200 leading-relaxed">
              {explainHindi ? kfs.prepaymentChargesHi : kfs.prepaymentCharges}
            </span>
          </div>

          {/* Late Payment Penalty */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-start">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400 pt-0.5">{t.penaltyTitle}</span>
            <span className="sm:col-span-7 text-ink-800 dark:text-ink-200 leading-relaxed">
              {explainHindi ? kfs.latePaymentPenaltyHi : kfs.latePaymentPenalty}
            </span>
          </div>

          {/* Cooling Off Period */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:px-6 items-start">
            <span className="sm:col-span-5 font-medium text-ink-600 dark:text-ink-400 pt-0.5">{t.coolingPeriod}</span>
            <span className="sm:col-span-7 font-semibold text-crimson-700 dark:text-crimson-400 leading-relaxed">
              {explainHindi ? kfs.coolingOffPeriodHi : kfs.coolingOffPeriod}
            </span>
          </div>
        </div>
      </div>

      {/* Required Regulatory Consent Checkboxes */}
      <div className="p-6 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-200/80 dark:border-ink-800 shadow-glass mb-8 space-y-4">
        <h4 className="font-bold text-sm uppercase tracking-wider text-ink-950 dark:text-ink-50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-crimson-600" />
          <span>{t.consentHeading}</span>
        </h4>

        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentData}
              onChange={(e) => setConsentData(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-crimson-600 border-crimson-300 focus:ring-crimson-500 accent-crimson-600 shrink-0"
            />
            <span className="text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed">
              {t.consentData}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentBureau}
              onChange={(e) => setConsentBureau(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-crimson-600 border-crimson-300 focus:ring-crimson-500 accent-crimson-600 shrink-0"
            />
            <span className="text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed">
              {t.consentBureau}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentTerms}
              onChange={(e) => setConsentTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-crimson-600 border-crimson-300 focus:ring-crimson-500 accent-crimson-600 shrink-0"
            />
            <span className="text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed">
              {t.consentTerms}
            </span>
          </label>
        </div>

        {/* Timestamp after consent */}
        {consentSavedTimestamp && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {t.consentTimestamp} <strong>{formatDateTime(consentSavedTimestamp)}</strong> (Audit ID: KFS-{id || 'app_demo_01'})
            </span>
          </div>
        )}
      </div>

      {/* Continue CTA */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/chat')}
          className="px-5 py-3 rounded-2xl text-xs font-semibold text-ink-600 dark:text-ink-400 hover:text-crimson-600 transition"
        >
          ← Return to Chat
        </button>

        <button
          onClick={handleContinue}
          disabled={!allConsented || submitting}
          className="py-3.5 px-8 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center gap-2.5"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{t.continueToDocuments}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
