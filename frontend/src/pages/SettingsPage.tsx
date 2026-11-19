import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Globe,
  Moon,
  Sun,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useI18n } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import { formatINR } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);

  const handleDownloadData = () => {
    const data = {
      profile: user,
      consentRecords: [
        { purpose: 'Credit Bureau Bureau Inquiries (CIBIL/Experian)', date: '2024-11-19T06:00:00Z', status: 'ACTIVE' },
        { purpose: 'DigiLocker OCR Identity Verification', date: '2024-11-19T06:05:00Z', status: 'ACTIVE' },
        { purpose: 'RBI Key Fact Statement Acceptance', date: '2024-11-19T06:10:00Z', status: 'ACTIVE' },
      ],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credisense_user_data_${user?.id || 'demo'}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 dark:text-ink-50">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-1">
          Manage your borrowing profile, communication preferences, and data privacy rights.
        </p>
      </div>

      {/* Notifications */}
      {downloadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t.downloadNotice}</span>
        </motion.div>
      )}

      {/* Card 1: Personal Profile */}
      <div className="p-6 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass">
        <h3 className="font-bold text-sm text-ink-950 dark:text-ink-50 uppercase tracking-wider mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-crimson-600" />
          <span>{t.profileDetails}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-50 dark:border-ink-800">
            <span className="text-ink-400 block mb-0.5">Full Legal Name</span>
            <span className="font-bold text-ink-950 dark:text-ink-50 text-sm">{user?.name || 'Customer'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-50 dark:border-ink-800">
            <span className="text-ink-400 block mb-0.5">Registered Email</span>
            <span className="font-bold text-ink-950 dark:text-ink-50 text-sm">{user?.email || 'user@example.com'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-50 dark:border-ink-800">
            <span className="text-ink-400 block mb-0.5">Verified Mobile</span>
            <span className="font-bold text-ink-950 dark:text-ink-50 text-sm">{user?.phone || '+91 98765 43210'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-50 dark:border-ink-800">
            <span className="text-ink-400 block mb-0.5">Declared Monthly Income</span>
            <span className="font-bold text-crimson-700 dark:text-crimson-400 text-sm tabular-nums">
              {formatINR(user?.monthlyIncome || 40000)}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: App Preferences (Language & Theme) */}
      <div className="p-6 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass space-y-5">
        <h3 className="font-bold text-sm text-ink-950 dark:text-ink-50 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-crimson-600" />
          <span>App Preferences</span>
        </h3>

        {/* Language Selection */}
        <div className="flex items-center justify-between py-2 border-b border-crimson-50 dark:border-ink-800">
          <div>
            <h4 className="font-bold text-sm text-ink-950 dark:text-ink-50">{t.languagePreference}</h4>
            <span className="text-xs text-ink-500">Select interface language for AI assistant and documents</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                language === 'en'
                  ? 'bg-crimson-600 text-white shadow-xs'
                  : 'bg-surface-warm text-ink-700 dark:bg-ink-800 dark:text-ink-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                language === 'hi'
                  ? 'bg-crimson-600 text-white shadow-xs'
                  : 'bg-surface-warm text-ink-700 dark:bg-ink-800 dark:text-ink-300'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="font-bold text-sm text-ink-950 dark:text-ink-50">{t.themePreference}</h4>
            <span className="text-xs text-ink-500">Switch between Pure White and Deep Warm Black</span>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-warm dark:bg-ink-800 text-ink-700 dark:text-ink-200 border border-crimson-100 dark:border-ink-700"
          >
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-crimson-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span className="capitalize">{theme} Mode</span>
          </button>
        </div>
      </div>

      {/* Card 3: Regulatory Consent History */}
      <div className="p-6 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-crimson-600" />
          <h3 className="font-bold text-sm text-ink-950 dark:text-ink-50 uppercase tracking-wider">
            {t.consentHistoryTitle}
          </h3>
        </div>
        <p className="text-xs text-ink-500 mb-4 leading-relaxed">
          {t.consentHistoryDesc}
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-50 dark:border-ink-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-ink-950 dark:text-ink-50 block">Credit Bureau Bureau Pull (CIBIL)</span>
              <span className="text-[11px] text-ink-500">Timestamp: 19 Nov 2024, 11:30 AM · Audit Log #CR-8821</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 text-[10px] font-bold">
              ACTIVE
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-50 dark:border-ink-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-ink-950 dark:text-ink-50 block">Key Fact Statement Digital Terms</span>
              <span className="text-[11px] text-ink-500">Timestamp: 19 Nov 2024, 11:32 AM · Standard KFS Form</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 text-[10px] font-bold">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Data Rights & Account Actions */}
      <div className="p-6 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass space-y-4">
        <h3 className="font-bold text-sm text-ink-950 dark:text-ink-50 uppercase tracking-wider">
          Data Rights & Deletion
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadData}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-surface-warm dark:bg-ink-800 hover:bg-crimson-50 text-xs font-semibold text-ink-800 dark:text-ink-200 border border-crimson-100 dark:border-ink-700 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-crimson-600" />
            <span>{t.downloadDataBtn}</span>
          </button>

          <button
            onClick={() => setDeleteWarning(true)}
            className="py-2.5 px-4 rounded-2xl bg-white dark:bg-ink-900 hover:bg-crimson-50 text-xs font-semibold text-crimson-700 dark:text-crimson-400 border border-crimson-200 dark:border-crimson-900 transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.deleteAccountBtn}</span>
          </button>
        </div>

        {deleteWarning && (
          <div className="p-3.5 rounded-2xl bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 text-xs text-crimson-800 dark:text-crimson-300">
            {t.deleteNotice}
          </div>
        )}
      </div>
    </div>
  );
};
