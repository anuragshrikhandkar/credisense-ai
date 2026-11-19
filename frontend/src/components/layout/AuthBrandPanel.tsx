import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Headphones, Percent } from 'lucide-react';
import { useI18n } from '../../i18n';

export const AuthBrandPanel: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-crimson-600 via-crimson-700 to-crimson-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white rounded-3xl lg:rounded-r-none shadow-2xl">
      {/* Background Decorative Rings */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-crimson-500/20 blur-2xl pointer-events-none" />

      {/* Top Wordmark & Tagline */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-6 text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-crimson-200" />
          <span>{t.aiBadge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          {t.brandName}
        </h1>
        <p className="text-crimson-100/90 text-lg font-medium">
          {t.tagline}
        </p>
        <p className="text-crimson-200/80 text-xs sm:text-sm mt-1 max-w-sm">
          {t.taglineSub}
        </p>
      </div>

      {/* 3 Short Trust Points */}
      <div className="relative z-10 my-10 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-crimson-200" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-white">
              {t.trustPoint1Title}
            </h3>
            <p className="text-xs sm:text-sm text-crimson-100/80 mt-0.5 leading-relaxed">
              {t.trustPoint1Desc}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 text-crimson-200" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-white">
              {t.trustPoint2Title}
            </h3>
            <p className="text-xs sm:text-sm text-crimson-100/80 mt-0.5 leading-relaxed">
              {t.trustPoint2Desc}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 text-crimson-200" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-white">
              {t.trustPoint3Title}
            </h3>
            <p className="text-xs sm:text-sm text-crimson-100/80 mt-0.5 leading-relaxed">
              {t.trustPoint3Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory Compliance Badge */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-crimson-200" />
        <span className="text-[11px] text-crimson-200/90 font-medium">
          RBI Fair Practices Code Compliant · 256-bit Bank Grade Security
        </span>
      </div>
    </div>
  );
};
