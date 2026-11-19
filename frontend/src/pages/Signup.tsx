import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, Lock, ArrowRight, AlertCircle, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useI18n } from '../i18n';
import { AuthBrandPanel } from '../components/layout/AuthBrandPanel';

export const Signup: React.FC = () => {
  const { signUp, isLoading } = useAuth();
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, text: '', color: 'bg-ink-200' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { score: 1, text: t.pwdStrengthWeak, color: 'bg-crimson-500' };
    } else if (score <= 4) {
      return { score: 2, text: t.pwdStrengthMedium, color: 'bg-amber-500' };
    } else {
      return { score: 3, text: t.pwdStrengthStrong, color: 'bg-emerald-500' };
    }
  }, [password, t]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError(language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name as per PAN.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(language === 'hi' ? 'कृपया एक मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError(language === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError(language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError(language === 'hi' ? 'कृपया सेवा की शर्तों और सहमति बॉक्स पर सही का निशान लगाएँ।' : 'Please accept the terms and credit check consent.');
      return;
    }

    try {
      await signUp({
        name: fullName,
        email,
        phone: `+91 ${cleanPhone.slice(-10)}`,
        password,
      });
      navigate('/chat', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
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

        {/* Right Side: Sign Up Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-surface-dark-card">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-6">
              <span className="text-xs font-bold text-crimson-600 dark:text-crimson-400 tracking-wider uppercase">
                {t.brandName} Onboarding
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 dark:text-ink-50 mt-1">
                {t.createAccount}
              </h2>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
                {t.signUpPrompt}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-5 p-3.5 rounded-2xl bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 dark:border-crimson-800 text-crimson-700 dark:text-crimson-300 text-xs font-medium flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                  {t.fullNameLabel}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-surface-warm/50 dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
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

              {/* Phone (+91) */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                  {t.phoneLabel}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-ink-500 border-r border-crimson-100 dark:border-ink-700 pr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.phonePlaceholder}
                    className="w-full pl-14 pr-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-surface-warm/50 dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
                  />
                </div>
              </div>

              {/* Password with Strength Meter */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                  {t.passwordLabel}
                </label>
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
                {/* Strength Meter Bar */}
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1.5 w-full bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-ink-500 dark:text-ink-400 flex items-center justify-between">
                      <span>{passwordStrength.text}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-surface-warm/50 dark:bg-ink-900 text-ink-950 dark:text-ink-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-crimson-600 border-crimson-200 focus:ring-crimson-500 cursor-pointer accent-crimson-600 shrink-0"
                />
                <label
                  htmlFor="agree-terms"
                  className="ml-2.5 text-xs text-ink-600 dark:text-ink-300 cursor-pointer select-none leading-relaxed"
                >
                  {t.termsAgreement}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-semibold text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t.signUpBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
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

            {/* Already have an account */}
            <div className="mt-5 text-center text-xs text-ink-600 dark:text-ink-400">
              {t.alreadyHaveAccount}{' '}
              <Link
                to="/login"
                className="font-semibold text-crimson-600 dark:text-crimson-400 hover:underline"
              >
                {t.signInBtn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
