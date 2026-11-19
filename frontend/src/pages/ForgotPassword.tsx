import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useI18n } from '../i18n';
import { AuthBrandPanel } from '../components/layout/AuthBrandPanel';

export const ForgotPassword: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send reset link.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-glass border border-crimson-100/80 dark:border-ink-800 bg-white/70 dark:bg-surface-dark-card/90 backdrop-blur-md">
        {/* Left Side: Brand Panel */}
        <div className="lg:col-span-5 hidden lg:flex">
          <AuthBrandPanel />
        </div>

        {/* Right Side: Reset Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-surface-dark-card">
          <div className="max-w-md w-full mx-auto">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-ink-950 dark:text-ink-50 mb-2">
                  Instructions Sent
                </h2>
                <p className="text-sm text-ink-600 dark:text-ink-300 mb-6 leading-relaxed">
                  {t.resetLinkSent}
                </p>
                <div className="p-3.5 rounded-2xl bg-crimson-50/70 dark:bg-crimson-950/30 border border-crimson-100 dark:border-crimson-900/40 text-xs font-mono text-crimson-700 dark:text-crimson-300 mb-6">
                  {email}
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold text-sm transition shadow-crimson-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.backToSignIn}</span>
                </Link>
              </motion.div>
            ) : (
              <div>
                <div className="mb-8">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-crimson-600 dark:text-crimson-400 hover:underline mb-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.backToSignIn}</span>
                  </Link>
                  <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 dark:text-ink-50">
                    {t.resetPasswordTitle}
                  </h2>
                  <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
                    {t.resetPasswordSub}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-3.5 rounded-2xl bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 dark:border-crimson-800 text-crimson-700 dark:text-crimson-300 text-xs font-medium flex items-center gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-surface-warm/50 dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-semibold text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{t.sendResetLink}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
