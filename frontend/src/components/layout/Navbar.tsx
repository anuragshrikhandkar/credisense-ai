import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  LayoutDashboard,
  Calculator,
  Settings,
  Headphones,
  Moon,
  Sun,
  LogOut,
  Globe,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useI18n } from '../../i18n';
import { useTheme } from '../../hooks/useTheme';
import { HumanSupportModal } from './HumanSupportModal';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { to: '/chat', label: t.newChat, icon: MessageSquare },
    { to: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { to: '/calculator', label: t.calculator, icon: Calculator },
    { to: '/settings', label: t.settings, icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/chat' && location.pathname === '/chat') return true;
    if (path !== '/chat' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 dark:bg-surface-dark-card/80 border-b border-crimson-100/70 dark:border-ink-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo & Wordmark */}
            <div className="flex items-center gap-6">
              <Link to="/chat" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-2xl bg-crimson-600 flex items-center justify-center text-white shadow-crimson-sm group-hover:scale-105 transition transform">
                  <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-ink-950 dark:text-white flex items-center gap-1.5">
                    Credisense
                    <span className="w-1.5 h-1.5 rounded-full bg-crimson-600 inline-block animate-pulse" />
                  </span>
                  <span className="hidden sm:block text-[10px] font-medium text-ink-500 dark:text-ink-400 tracking-wide uppercase">
                    AI Lending Assistant
                  </span>
                </div>
              </Link>

              {/* Main Desktop Navigation */}
              {user && (
                <nav className="hidden md:flex items-center gap-1 ml-4">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition ${
                          active
                            ? 'bg-crimson-50 dark:bg-crimson-950/60 text-crimson-700 dark:text-crimson-400 border border-crimson-200/60 dark:border-crimson-800/40 shadow-xs'
                            : 'text-ink-600 dark:text-ink-300 hover:text-crimson-600 hover:bg-crimson-50/50 dark:hover:bg-ink-800/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right: Actions, Language, Theme, Human Support, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-xs font-semibold text-ink-700 dark:text-ink-300 border border-crimson-100 dark:border-ink-700 hover:border-crimson-300 dark:hover:border-crimson-800 bg-white/60 dark:bg-ink-900/60 transition shadow-xs"
                title="Toggle Language / भाषा बदलें"
              >
                <Globe className="w-3.5 h-3.5 text-crimson-600" />
                <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {/* Dark Mode Switcher */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-2xl flex items-center justify-center text-ink-600 dark:text-ink-300 border border-crimson-100 dark:border-ink-700 bg-white/60 dark:bg-ink-900/60 hover:text-crimson-600 transition shadow-xs"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Persistent "Talk to a human" button */}
              <button
                onClick={() => setSupportModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-medium bg-crimson-50 dark:bg-crimson-950/40 text-crimson-700 dark:text-crimson-300 border border-crimson-200 dark:border-crimson-800/60 hover:bg-crimson-100/70 transition shadow-xs"
              >
                <Headphones className="w-3.5 h-3.5 text-crimson-600" />
                <span>{t.talkToHuman}</span>
              </button>

              {/* User Profile / Sign Out */}
              {user ? (
                <div className="flex items-center gap-2 pl-1 border-l border-crimson-100 dark:border-ink-800">
                  <div
                    title={user.name}
                    className="w-8 h-8 rounded-full bg-crimson-600 text-white font-bold text-xs flex items-center justify-center shadow-xs"
                  >
                    {user.avatar || user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-xl text-ink-400 hover:text-crimson-600 hover:bg-crimson-50 dark:hover:bg-ink-800 transition"
                    title={t.signOut}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold text-xs transition shadow-crimson-sm"
                >
                  {t.signIn}
                </Link>
              )}

              {/* Mobile Menu Button */}
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden w-8 h-8 rounded-2xl flex items-center justify-center text-ink-700 dark:text-ink-300 border border-crimson-100 dark:border-ink-700"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-crimson-100 dark:border-ink-800 bg-white/95 dark:bg-surface-dark px-4 py-3 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition ${
                    active
                      ? 'bg-crimson-50 dark:bg-crimson-950 text-crimson-700 dark:text-crimson-400'
                      : 'text-ink-700 dark:text-ink-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSupportModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-crimson-700 dark:text-crimson-300 bg-crimson-50/60 dark:bg-crimson-950/40"
            >
              <Headphones className="w-4 h-4" />
              <span>{t.talkToHuman}</span>
            </button>
          </div>
        )}
      </header>

      {/* Human Support Slide-over */}
      <HumanSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </>
  );
};
