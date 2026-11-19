import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  KeyRound,
  Building2,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  ArrowDownToLine,
  CreditCard,
  Check,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import {
  getApplicationById,
  signAgreementWithOtp,
  setupEMandate,
  disburseLoan,
} from '../lib/api';
import { LoanApplication, RepaymentInstallment } from '../types';
import { formatINR, formatDate } from '../lib/utils';

export const FinishWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useI18n();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 1: OTP signing state
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [signingLoading, setSigningLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(45);

  // Step 2: e-Mandate auto-debit state
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('50100234891023');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [mandateLoading, setMandateLoading] = useState(false);

  // Step 3: Disbursal state
  const [disbursedApp, setDisbursedApp] = useState<LoanApplication | null>(null);

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

  // Resend OTP timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Step 1: Submit OTP e-sign
  const handleVerifyOtp = async () => {
    setSigningLoading(true);
    try {
      await signAgreementWithOtp(id || 'app_demo_01', otp.join(''));
      setCurrentStep(2);
    } finally {
      setSigningLoading(false);
    }
  };

  // Step 2: Submit e-Mandate
  const handleSetupMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMandateLoading(true);
    try {
      await setupEMandate(id || 'app_demo_01', {
        accountHolder: user?.name || 'Customer',
        bankName,
        accountNumber,
        ifsc,
      });

      // Disburse directly and trigger celebration
      const finalApp = await disburseLoan(id || 'app_demo_01');
      setDisbursedApp(finalApp);
      setCurrentStep(3);

      // Trigger Crimson / Gold celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C8102E', '#FBE4E8', '#8A0B20', '#F59E0B', '#10B981'],
      });
    } finally {
      setMandateLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
  };

  const sanctionedAmount = application?.selectedOffer?.amount || 200000;
  const netAmount = application?.kfsData?.netDisbursalAmount || sanctionedAmount - 3540;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Demo Mode Simulated Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 rounded-full bg-crimson-50 dark:bg-crimson-950/60 border border-crimson-200/60 dark:border-crimson-800/50 text-[11px] font-bold text-crimson-700 dark:text-crimson-400">
          {t.demoMode}
        </span>
        <span className="text-xs font-mono text-ink-500">Loan Ref: {id || 'app_demo_01'}</span>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-surface-warm dark:bg-ink-900 border border-crimson-100 dark:border-ink-800 mb-8">
        <div
          className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition ${
            currentStep === 1
              ? 'bg-crimson-600 text-white shadow-xs'
              : currentStep > 1
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-ink-400'
          }`}
        >
          {t.step1Tab}
        </div>
        <div
          className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition ${
            currentStep === 2
              ? 'bg-crimson-600 text-white shadow-xs'
              : currentStep > 2
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-ink-400'
          }`}
        >
          {t.step2Tab}
        </div>
        <div
          className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition ${
            currentStep === 3
              ? 'bg-crimson-600 text-white shadow-xs'
              : 'text-ink-400'
          }`}
        >
          {t.step3Tab}
        </div>
      </div>

      {/* STEP 1: REVIEW & SIGN WITH OTP */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950 dark:text-ink-50">
                {t.signAgreementTitle}
              </h2>
              <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-0.5">
                {t.signAgreementDesc}
              </p>
            </div>
          </div>

          {/* Agreement summary box */}
          <div className="p-4 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-100 dark:border-ink-800 text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-ink-500">Borrower:</span>
              <span className="font-bold text-ink-950 dark:text-ink-50">{user?.name || 'Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Lender Entity:</span>
              <span className="font-bold text-ink-950 dark:text-ink-50">
                {application?.selectedOffer?.lenderName || 'Lender A (Prime Capital)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Net Disbursal:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {formatINR(netAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Monthly EMI:</span>
              <span className="font-bold text-crimson-700 dark:text-crimson-400 tabular-nums">
                {formatINR(application?.selectedOffer?.monthlyEmi || 6690)}
              </span>
            </div>
          </div>

          {/* 6-Digit OTP Box */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300">
              {t.otpPlaceholder}
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-11 sm:w-12 h-14 text-center font-mono font-extrabold text-xl sm:text-2xl rounded-2xl border border-crimson-200 dark:border-ink-700 bg-surface-warm/60 dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
                />
              ))}
            </div>

            <p className="text-[11px] text-center text-ink-400 dark:text-ink-500">
              {t.otpDemoHint}
            </p>

            <div className="text-center text-xs">
              {resendCountdown > 0 ? (
                <span className="text-ink-400">
                  {t.resendOtpIn} <strong>{resendCountdown}s</strong>
                </span>
              ) : (
                <button
                  onClick={() => setResendCountdown(45)}
                  className="font-semibold text-crimson-600 hover:underline"
                >
                  {t.resendOtp}
                </button>
              )}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={signingLoading}
              className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center justify-center gap-2"
            >
              {signingLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.verifyAndSignBtn}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: SETUP AUTO-DEBIT E-MANDATE */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950 dark:text-ink-50">
                {t.mandateTitle}
              </h2>
              <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-0.5">
                {t.mandateDesc}
              </p>
            </div>
          </div>

          <form onSubmit={handleSetupMandate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                Account Holder Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || 'Customer'}
                className="w-full px-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-surface-warm/50 dark:bg-ink-900/50 text-ink-600 dark:text-ink-300 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                {t.bankNameLabel}
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                {t.accNumberLabel}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="50100XXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                {t.ifscLabel}
              </label>
              <input
                type="text"
                required
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="HDFC0001234"
                className="w-full px-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition font-mono uppercase"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-crimson-50/70 dark:bg-crimson-950/30 border border-crimson-100 dark:border-crimson-900/50 flex items-center gap-2.5 text-xs text-ink-700 dark:text-ink-300">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Penny drop test will verify bank account legitimacy via IMPS.</span>
            </div>

            <button
              type="submit"
              disabled={mandateLoading}
              className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center justify-center gap-2"
            >
              {mandateLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.verifyBankBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* STEP 3: DISBURSAL CELEBRATION & REPAYMENT SCHEDULE */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Success Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-crimson-600 via-crimson-700 to-crimson-950 text-white shadow-crimson-lg text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30">
              <CheckCircle2 className="w-10 h-10 text-white stroke-[2.2]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">
              {t.disbursalTitle}
            </h2>
            <p className="text-crimson-100 text-xs sm:text-sm max-w-md mx-auto">
              {t.disbursalSub}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mt-6 pt-6 border-t border-white/15 text-left text-xs">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <span className="text-crimson-200 block text-[10px] uppercase font-semibold">Net Disbursed</span>
                <span className="text-base font-extrabold text-white tabular-nums">
                  {formatINR(netAmount)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <span className="text-crimson-200 block text-[10px] uppercase font-semibold">{t.disbursedTo}</span>
                <span className="text-xs font-bold text-white truncate block">
                  {bankName}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm col-span-2 sm:col-span-1">
                <span className="text-crimson-200 block text-[10px] uppercase font-semibold">{t.expectedTime}</span>
                <span className="text-xs font-bold text-emerald-300">
                  {t.within2Hours}
                </span>
              </div>
            </div>
          </div>

          {/* Repayment Schedule Table */}
          <div className="rounded-3xl border border-crimson-100 dark:border-ink-800 bg-white/95 dark:bg-surface-dark-card shadow-glass overflow-hidden">
            <div className="p-5 border-b border-crimson-50 dark:border-ink-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-crimson-600" />
                <h3 className="font-bold text-sm text-ink-950 dark:text-ink-50">
                  {t.repaymentScheduleTitle} (Amortization)
                </h3>
              </div>
              <span className="text-xs text-ink-500 font-mono">
                {application?.selectedOffer?.tenureMonths || 36} Installments
              </span>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-warm dark:bg-ink-900 text-ink-500 border-b border-crimson-100 dark:border-ink-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">{t.installmentCol}</th>
                    <th className="py-2.5 px-4 font-semibold">{t.dateCol}</th>
                    <th className="py-2.5 px-4 font-semibold">{t.emiCol}</th>
                    <th className="py-2.5 px-4 font-semibold">{t.principalCol}</th>
                    <th className="py-2.5 px-4 font-semibold">{t.interestCol}</th>
                    <th className="py-2.5 px-4 font-semibold">{t.balanceCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crimson-50 dark:divide-ink-800 font-mono">
                  {(disbursedApp?.repaymentSchedule || []).slice(0, 12).map((row) => (
                    <tr key={row.installmentNumber} className="hover:bg-crimson-50/40 dark:hover:bg-ink-800/40">
                      <td className="py-2.5 px-4 font-bold text-ink-950 dark:text-ink-50">
                        #{row.installmentNumber}
                      </td>
                      <td className="py-2.5 px-4 text-ink-700 dark:text-ink-300">
                        {formatDate(row.dueDate)}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-crimson-700 dark:text-crimson-400">
                        {formatINR(row.emi)}
                      </td>
                      <td className="py-2.5 px-4 text-ink-700 dark:text-ink-300">{formatINR(row.principal)}</td>
                      <td className="py-2.5 px-4 text-ink-700 dark:text-ink-300">{formatINR(row.interest)}</td>
                      <td className="py-2.5 px-4 text-ink-700 dark:text-ink-300">{formatINR(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-surface-warm dark:bg-ink-900 border-t border-crimson-50 dark:border-ink-800 flex items-center justify-between">
              <span className="text-[11px] text-ink-500">Showing first 12 months preview</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="py-2 px-5 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs transition shadow-crimson-sm"
              >
                {t.viewDashboardBtn}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
