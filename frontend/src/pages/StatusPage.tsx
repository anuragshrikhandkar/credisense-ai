import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Headphones,
  HelpCircle,
  FileCheck2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { getApplicationById, updateApplicationStatus } from '../lib/api';
import { LoanApplication, ApplicationStatus } from '../types';
import { formatDateTime, formatINR } from '../lib/utils';
import { HumanSupportModal } from '../components/layout/HumanSupportModal';

interface StepItem {
  key: ApplicationStatus;
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  whatNext: string;
  whatNextHi: string;
}

const ALL_STEPS: StepItem[] = [
  {
    key: 'DRAFT',
    title: 'Application Initiated',
    titleHi: 'आवेदन शुरू हुआ',
    desc: 'Customer requested loan options via conversational assistant.',
    descHi: 'ग्राहक ने डिजिटल सहायक से लोन विकल्पों का अनुरोध किया।',
    whatNext: 'Eligibility rules engine evaluates lender policies.',
    whatNextHi: 'नियम इंजन ऋणदाता नीतियों का मूल्यांकन करता है।',
  },
  {
    key: 'OFFER_SHOWN',
    title: 'Pre-Approved Offers Generated',
    titleHi: 'पूर्व-स्वीकृत ऑफर तैयार',
    desc: 'Transparent APR, EMI and repayment tenure presented.',
    descHi: 'पारदर्शी वार्षिक दर (APR) और ईएमआई प्रस्तुत की गई।',
    whatNext: 'Review Key Fact Statement (KFS) and confirm consent.',
    whatNextHi: 'की फैक्ट स्टेटमेंट (KFS) की समीक्षा करें और सहमति दें।',
  },
  {
    key: 'CONSENT_GIVEN',
    title: 'Regulatory Consent Captured',
    titleHi: 'नियामक सहमति दर्ज',
    desc: 'Digital authorization logged under RBI Fair Practices Code.',
    descHi: 'आरबीआई नियमों के तहत डिजिटल सहमति दर्ज की गई।',
    whatNext: 'Complete instant paperless e-KYC and document upload.',
    whatNextHi: 'डिजिटल दस्तावेज़ अपलोड और सत्यापन पूरा करें।',
  },
  {
    key: 'KYC_DONE',
    title: 'Identity Verification (e-KYC)',
    titleHi: 'पहचान सत्यापन (e-KYC)',
    desc: 'PAN & Aadhaar authenticated with central records.',
    descHi: 'पैन व आधार का केंद्रीय रिकॉर्ड से मिलान सत्यापित हुआ।',
    whatNext: 'Income proofs verified for final sanction.',
    whatNextHi: 'आय प्रमाण पत्रों का सत्यापन।',
  },
  {
    key: 'DOCS_VERIFIED',
    title: 'Documents Verified via OCR',
    titleHi: 'दस्तावेज़ ओसीआर द्वारा सत्यापित',
    desc: 'AI tamper check & income verification completed.',
    descHi: 'एआई द्वारा वेतन पर्ची और विवरण का पूर्ण सत्यापन।',
    whatNext: 'Lender issues final sanction letter.',
    whatNextHi: 'ऋणदाता द्वारा अंतिम स्वीकृति पत्र जारी किया जाना।',
  },
  {
    key: 'APPROVED',
    title: 'Loan Sanctioned',
    titleHi: 'लोन स्वीकृत',
    desc: 'Credit committee sanctioned the loan facility.',
    descHi: 'क्रेडिट समिति द्वारा ऋण सुविधा स्वीकृत कर दी गई।',
    whatNext: 'Sign agreement via mobile OTP and register e-mandate.',
    whatNextHi: 'मोबाइल ओटीपी से अनुबंध पर हस्ताक्षर करें और ऑटो-डेबिट सेट करें।',
  },
  {
    key: 'SIGNED',
    title: 'Agreement Digitally Signed',
    titleHi: 'अनुबंध पर डिजिटल हस्ताक्षर पूर्ण',
    desc: 'Digital agreement sealed via Aadhaar OTP e-Sign.',
    descHi: 'ओटीपी द्वारा लोन अनुबंध पर सुरक्षित हस्ताक्षर किए गए।',
    whatNext: 'Automated disbursement to your verified bank account.',
    whatNextHi: 'आपके बैंक खाते में स्वचालित ऋण वितरण।',
  },
  {
    key: 'DISBURSED',
    title: 'Loan Disbursed to Bank',
    titleHi: 'खाते में लोन राशि वितरित',
    desc: 'IMPS/NEFT fund transfer initiated to borrower account.',
    descHi: 'ऋण राशि आपके बैंक खाते में सफलतापूर्वक स्थानांतरित कर दी गई।',
    whatNext: 'Monthly auto-debit on the 5th of every month.',
    whatNextHi: 'प्रत्येक माह की 5 तारीख को स्वतः किस्त भुगतान।',
  },
  {
    key: 'REPAYING',
    title: 'Repayment Active',
    titleHi: 'पुनर्भुगतान सक्रिय',
    desc: 'Account in good standing with on-time EMIs.',
    descHi: 'समय पर ईएमआई भुगतान के साथ खाता सक्रिय।',
    whatNext: 'Track balance & statements anytime on your dashboard.',
    whatNextHi: 'डैशबोर्ड पर कभी भी बकाया राशि और विवरण देखें।',
  },
];

export const StatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const app = await getApplicationById(id || 'app_demo_01');
        setApplication(app);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Determine current active step index
  const currentStatus: ApplicationStatus = application?.status || 'DOCS_VERIFIED';
  const currentIndex = ALL_STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex !== -1 ? currentIndex : 4; // default DOCS_VERIFIED

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-500 mb-2">
          <span className="text-crimson-600 font-bold uppercase tracking-wider">
            Step 3 of 4 · Real-time Application Pipeline
          </span>
          <span>Status: {currentStatus}</span>
        </div>
        <div className="h-1.5 w-full bg-ink-200/70 dark:bg-ink-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-crimson-600 rounded-full transition-all duration-500"
            style={{ width: `${((activeIndex + 1) / ALL_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 dark:text-ink-50">
            {t.statusTitle}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-1">
            {t.statusSub} · Ref: <span className="font-mono">{id || 'app_demo_01'}</span>
          </p>
        </div>

        {/* Action button to proceed to disbursal wizard */}
        <button
          onClick={() => navigate(`/application/${id || 'app_demo_01'}/finish`)}
          className="py-3 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs sm:text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center justify-center gap-2 shrink-0"
        >
          <span>{t.proceedToDisbursal}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Vertical Stepper Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass mb-8">
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-crimson-100 dark:before:bg-ink-800">
          {ALL_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isFuture = idx > activeIndex;

            return (
              <div key={step.key} className="relative group">
                {/* Step Circle Marker */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-crimson-600 text-white shadow-crimson-sm'
                      : isCurrent
                      ? 'bg-white dark:bg-surface-dark-card border-2 border-crimson-600 text-crimson-600 ring-4 ring-crimson-100 dark:ring-crimson-950/60'
                      : 'bg-surface-warm dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
                  ) : (
                    <span className="text-[11px] sm:text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div
                  className={`pl-2 sm:pl-3 transition ${
                    isCurrent
                      ? 'p-4 rounded-2xl bg-crimson-50/70 dark:bg-crimson-950/30 border border-crimson-100 dark:border-crimson-900/60'
                      : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`font-bold text-sm sm:text-base ${
                        isCurrent
                          ? 'text-crimson-800 dark:text-crimson-300'
                          : isCompleted
                          ? 'text-ink-950 dark:text-ink-50'
                          : 'text-ink-400 dark:text-ink-600'
                      }`}
                    >
                      {language === 'hi' ? step.titleHi : step.title}
                    </h3>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-crimson-600 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        {t.currentStage}
                      </span>
                    )}

                    {isCompleted && (
                      <span className="text-[11px] text-ink-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-crimson-600" />
                        Completed
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isCurrent
                        ? 'text-ink-800 dark:text-ink-200 font-medium'
                        : isCompleted
                        ? 'text-ink-600 dark:text-ink-300'
                        : 'text-ink-400 dark:text-ink-600'
                    }`}
                  >
                    {language === 'hi' ? step.descHi : step.desc}
                  </p>

                  {/* "What happens next?" highlight */}
                  {(isCurrent || isCompleted) && (
                    <div className="mt-2 text-[11px] text-ink-500 dark:text-ink-400 flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3 h-3 text-crimson-600 shrink-0" />
                      <span>{t.whatHappensNext}</span>
                      <strong className="text-ink-900 dark:text-ink-100">
                        {language === 'hi' ? step.whatNextHi : step.whatNext}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Need Help Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-crimson-50/70 to-surface-warm dark:from-crimson-950/40 dark:to-surface-dark-card border border-crimson-100 dark:border-ink-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-crimson-600 text-white flex items-center justify-center shrink-0 shadow-crimson-sm">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-ink-950 dark:text-ink-50">
              {t.needHelpTitle}
            </h4>
            <p className="text-xs text-ink-600 dark:text-ink-300 mt-0.5">
              {t.needHelpDesc}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSupportModalOpen(true)}
          className="py-2.5 px-4 rounded-2xl bg-white dark:bg-ink-800 border border-crimson-200 dark:border-ink-700 hover:border-crimson-400 text-xs font-semibold text-crimson-700 dark:text-crimson-300 transition shadow-xs shrink-0"
        >
          {t.talkToHuman}
        </button>
      </div>

      {/* Support modal */}
      <HumanSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        conversationSummary={`Application ${id || 'app_demo_01'} currently at stage ${currentStatus}.`}
      />
    </div>
  );
};
