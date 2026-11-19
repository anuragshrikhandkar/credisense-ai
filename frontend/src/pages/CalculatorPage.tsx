import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calculator as CalcIcon,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { calculateEmi, calculateFoir } from '../lib/api';
import { formatINR } from '../lib/utils';
import { EmiSummaryCard } from '../components/chat/EmiSummaryCard';

export const CalculatorPage: React.FC = () => {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  // Sliders state
  const [amount, setAmount] = useState<number>(200000);
  const [tenureMonths, setTenureMonths] = useState<number>(36);
  const [rate, setRate] = useState<number>(12.5);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(40000);

  // Live Calculations
  const emi = calculateEmi(amount, rate, tenureMonths);
  const totalPayable = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPayable - amount);
  const foir = monthlyIncome > 0 ? calculateFoir(emi, monthlyIncome) : undefined;

  const handleApplyWithNumbers = () => {
    navigate('/chat');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-50 dark:bg-crimson-950/60 border border-crimson-200/60 dark:border-crimson-800/50 text-crimson-700 dark:text-crimson-400 text-xs font-bold mb-3">
          <CalcIcon className="w-3.5 h-3.5" />
          <span>Deterministic Financial Planner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 dark:text-ink-50">
          {t.calculatorTitle}
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-1">
          {t.calculatorSub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Sliders Card */}
        <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass space-y-6">
          {/* Slider 1: Loan Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300">
                {t.calcAmount}
              </label>
              <span className="text-base font-extrabold text-crimson-700 dark:text-crimson-400 font-mono">
                {formatINR(amount)}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-crimson-100 dark:bg-ink-800 rounded-lg appearance-none cursor-pointer accent-crimson-600"
            />
            <div className="flex justify-between text-[10px] text-ink-400 mt-1 font-mono">
              <span>₹10,000</span>
              <span>₹10,00,000</span>
            </div>
          </div>

          {/* Slider 2: Tenure */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300">
                {t.calcTenure}
              </label>
              <span className="text-base font-extrabold text-ink-950 dark:text-ink-50 font-mono">
                {tenureMonths} <span className="text-xs font-normal text-ink-500">Months</span>
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={60}
              step={6}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-crimson-100 dark:bg-ink-800 rounded-lg appearance-none cursor-pointer accent-crimson-600"
            />
            <div className="flex justify-between text-[10px] text-ink-400 mt-1 font-mono">
              <span>6 Months</span>
              <span>60 Months</span>
            </div>
          </div>

          {/* Slider 3: Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300">
                {t.calcRate}
              </label>
              <span className="text-base font-extrabold text-ink-950 dark:text-ink-50 font-mono">
                {rate}% <span className="text-xs font-normal text-ink-500">p.a.</span>
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={30}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-crimson-100 dark:bg-ink-800 rounded-lg appearance-none cursor-pointer accent-crimson-600"
            />
            <div className="flex justify-between text-[10px] text-ink-400 mt-1 font-mono">
              <span>8%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Optional Income Input */}
          <div className="pt-2 border-t border-crimson-50 dark:border-ink-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300 mb-2">
              {t.calcIncome}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-ink-400">₹</span>
              <input
                type="number"
                step={5000}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                placeholder="40000"
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-crimson-100 dark:border-ink-700 bg-surface-warm/50 dark:bg-ink-900 text-ink-950 dark:text-ink-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/20 focus:border-crimson-600 transition"
              />
            </div>
            <span className="text-[10px] text-ink-400 mt-1 block">
              Used to calculate live FOIR (Fixed Obligation to Income Ratio)
            </span>
          </div>

          {/* Apply button */}
          <button
            onClick={handleApplyWithNumbers}
            className="w-full py-3.5 px-6 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center justify-center gap-2"
          >
            <span>{t.applyWithTheseNumbers}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Live Donut & FOIR Visualizer */}
        <div className="lg:col-span-6">
          <EmiSummaryCard
            amount={amount}
            tenureMonths={tenureMonths}
            rate={rate}
            emi={emi}
            totalInterest={totalInterest}
            totalPayable={totalPayable}
            monthlyIncome={monthlyIncome}
            foir={foir}
          />
        </div>
      </div>
    </div>
  );
};
