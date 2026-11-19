import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  ChevronRight,
  ArrowRight,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useI18n } from '../i18n';
import { listUserApplications } from '../lib/api';
import { LoanApplication } from '../types';
import { formatINR, formatDate } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      if (!user) return;
      try {
        const apps = await listUserApplications(user.id);
        setApplications(apps);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DISBURSED':
      case 'REPAYING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
            Active · Disbursed
          </span>
        );
      case 'DOCS_VERIFIED':
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-crimson-50 text-crimson-700 dark:bg-crimson-950/60 dark:text-crimson-400 border border-crimson-200">
            Sanctioned · Ready to Sign
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200">
            In Progress · {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-crimson-600 dark:text-crimson-400 uppercase tracking-wider">
            {t.myDashboard}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 dark:text-ink-50 mt-1">
            {t.welcomeBack}, {user?.name || 'Customer'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-1">
            Monitor active credit lines, verify documents, and initiate new loan inquiries.
          </p>
        </div>

        <Link
          to="/chat"
          className="py-3 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs sm:text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.startNewLoanBtn}</span>
        </Link>
      </div>

      {/* Credit Standing Snapshot Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">{t.creditScoreSnapshot}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-ink-950 dark:text-ink-50 font-mono">
            782 <span className="text-xs font-medium text-emerald-600">/ 900</span>
          </div>
          <p className="text-[11px] text-ink-500 mt-1">
            {t.excellentStanding}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Total Borrowing Limit</span>
            <TrendingUp className="w-4 h-4 text-crimson-600" />
          </div>
          <div className="text-2xl font-extrabold text-ink-950 dark:text-ink-50 font-mono">
            ₹10,00,000
          </div>
          <p className="text-[11px] text-ink-500 mt-1">
            Pre-approved across 3 partner lenders
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Average APR Rate</span>
            <CreditCard className="w-4 h-4 text-crimson-600" />
          </div>
          <div className="text-2xl font-extrabold text-crimson-700 dark:text-crimson-400 font-mono">
            12.5%
          </div>
          <p className="text-[11px] text-ink-500 mt-1">
            Zero prepayment penalty after 6 months
          </p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4 mb-8">
        <h2 className="font-bold text-lg text-ink-950 dark:text-ink-50">
          {t.activeApplications}
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-ink-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-crimson-200 dark:border-ink-800 text-center">
            <p className="text-sm text-ink-500">{t.noActiveApplications}</p>
            <Link
              to="/chat"
              className="mt-3 inline-block font-semibold text-xs text-crimson-600 hover:underline"
            >
              Start an application now →
            </Link>
          </div>
        ) : (
          applications.map((app) => (
            <motion.div
              key={app.id}
              whileHover={{ y: -2 }}
              className="p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-white text-sm shadow-xs shrink-0"
                  style={{ backgroundColor: app.selectedOffer.lenderColor || '#C8102E' }}
                >
                  {app.selectedOffer.lenderLogoText || 'L'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-base text-ink-950 dark:text-ink-50">
                      {app.selectedOffer.lenderName}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="text-xs text-ink-500 flex flex-wrap gap-3 font-medium">
                    <span>Amount: <strong className="text-ink-950 dark:text-ink-50 font-bold">{formatINR(app.selectedOffer.amount)}</strong></span>
                    <span>EMI: <strong className="text-crimson-700 dark:text-crimson-400 font-bold">{formatINR(app.selectedOffer.monthlyEmi)}/mo</strong></span>
                    <span>Tenure: <strong>{app.selectedOffer.tenureMonths} mos</strong></span>
                    <span>Created: <strong>{formatDate(app.createdAt)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/application/${app.id}/status`}
                  className="py-2.5 px-4 rounded-2xl bg-surface-warm dark:bg-ink-800 hover:bg-crimson-50 text-xs font-semibold text-ink-700 dark:text-ink-200 transition"
                >
                  Track Pipeline
                </Link>
                <Link
                  to={`/application/${app.id}/finish`}
                  className="py-2.5 px-4 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold transition shadow-crimson-sm flex items-center gap-1.5"
                >
                  <span>{t.continueJourney}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
