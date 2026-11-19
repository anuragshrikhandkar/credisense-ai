import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useI18n } from '../i18n';
import { AuthBrandPanel } from '../components/layout/AuthBrandPanel';

export const Login: React.FC = () => {
  const { signIn, isLoading } = useAuth();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redirect after sign-in: check state or default to /chat
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/chat';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(language === 'hi' ? 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।' : 'Please enter both email and password.');
      return;
    }

    try {
      await signIn({ email, password, rememberMe });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to sign in. Please try again.');
      }
    }
  };

  // Quick fill demo accounts
  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 z-50 px-4 py-2.5 rounded-2xl bg-ink-950 text-white text-xs font-medium shadow-xl flex items-center gap-2 border border-white/10"
        >
          <Sparkles className="w-4 h-4 text-crimson-400" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-glass border border-crimson-100/80 dark:border-ink-800 bg-white/70 dark:bg-surface-dark-card/90 backdrop-blur-md">
        {/* Left Side: Brand Panel */}
        <div className="lg:col-span-5 hidden lg:flex">
          <AuthBrandPanel />
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-surface-dark-card">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
              <span className="text-xs font-bold text-crimson-600 dark:text-crimson-400 tracking-wider uppercase">
                {t.brandName} Secure Access
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 dark:text-ink-50 mt-1">
                {t.welcomeBack}
              </h2>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
                {t.signInPrompt}
              </p>
            </div>

            {/* Error Banner */}
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

            {/* Quick Demo Fill Buttons */}
            <div className="mb-6 p-3.5 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-100/60 dark:border-ink-800">
              <div className="text-[11px] font-semibold text-ink-500 dark:text-ink-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-crimson-600" />
                <span>{t.demoAccounts}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('aman@example.com')}
                  className="px-2.5 py-1.5 rounded-xl text-left bg-white dark:bg-ink-800 border border-crimson-100 dark:border-ink-700 hover:border-crimson-300 transition text-[11px]"
                >
                  <span className="font-semibold text-ink-950 dark:text-ink-50 block">Aman Sharma</span>
                  <span className="text-ink-500 text-[10px]">₹10k/mo · Decline demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('priya@example.com')}
                  className="px-2.5 py-1.5 rounded-xl text-left bg-white dark:bg-ink-800 border border-crimson-100 dark:border-ink-700 hover:border-crimson-300 transition text-[11px]"
                >
                  <span className="font-semibold text-ink-950 dark:text-ink-50 block">Priya Patel</span>
                  <span className="text-ink-500 text-[10px]">₹40k/mo · Approval demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('ravi@example.com')}
                  className="px-2.5 py-1.5 rounded-xl text-left bg-white dark:bg-ink-800 border border-crimson-100 dark:border-ink-700 hover:border-crimson-300 transition text-[11px]"
                >
                  <span className="font-semibold text-ink-950 dark:text-ink-50 block">Ravi Verma</span>
                  <span className="text-ink-500 text-[10px]">₹25k/mo · Borderline demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('demo@credisense.ai')}
                  className="px-2.5 py-1.5 rounded-xl text-left bg-white dark:bg-ink-800 border border-crimson-100 dark:border-ink-700 hover:border-crimson-300 transition text-[11px]"
                >
                  <span className="font-semibold text-ink-950 dark:text-ink-50 block">Ananya Rao</span>
                  <span className="text-ink-500 text-[10px]">₹50k/mo · Instant Offer</span>
                </button>
              </div>
            </div>

            {/* Sign In Form */}
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                    {t.passwordLabel}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-crimson-600 dark:text-crimson-400 hover:underline"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-surface-warm/50 dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-crimson-600 border-crimson-200 focus:ring-crimson-500 cursor-pointer accent-crimson-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2.5 text-xs text-ink-600 dark:text-ink-300 cursor-pointer select-none"
                >
                  {t.rememberMe}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-semibold text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t.signInBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-crimson-100 dark:border-ink-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-surface-dark-card px-3 text-ink-400">
                  {t.orContinueWith}
                </span>
              </div>
            </div>

            {/* Google Sign In (UI Only) */}
            <button
              type="button"
              onClick={() => showToast('Google OAuth is enabled in production with Supabase.')}
              className="w-full py-2.5 px-4 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-white dark:bg-ink-900 hover:bg-crimson-50/50 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 11.3 0 14s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>{t.googleSignIn}</span>
            </button>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-xs text-ink-600 dark:text-ink-400">
              {t.dontHaveAccount}{' '}
              <Link
                to="/signup"
                className="font-semibold text-crimson-600 dark:text-crimson-400 hover:underline"
              >
                {t.signUpNow}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
