import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  RotateCcw,
  Plus,
  Send,
  Paperclip,
  Mic,
  Calculator,
  ShieldCheck,
  FileCheck2,
  BookOpen,
  Sparkles,
  ArrowUp,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useI18n } from '../i18n';
import {
  ChatMessage,
  LoanOffer,
  Conversation,
} from '../types';
import {
  evaluateEligibility,
  calculateEmi,
  calculateFoir,
  createApplicationFromOffer,
} from '../lib/api';
import { formatINR } from '../lib/utils';
import { OfferCard } from '../components/chat/OfferCard';
import { RejectionCard } from '../components/chat/RejectionCard';
import { EmiSummaryCard } from '../components/chat/EmiSummaryCard';
import { PolicySourceChip } from '../components/chat/PolicySourceChip';
import { ChatHistoryDrawer } from '../components/chat/ChatHistoryDrawer';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const navigate = useNavigate();

  // Conversations history state
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv_today_1',
      title: 'Personal Loan Eligibility · Aman',
      titleHi: 'पर्सनल लोन पात्रता · अमन',
      updatedAt: new Date().toISOString(),
      messages: [],
    },
    {
      id: 'conv_today_2',
      title: 'Car Loan EMI Analysis',
      titleHi: 'कार लोन ईएमआई विश्लेषण',
      updatedAt: new Date().toISOString(),
      messages: [],
    },
    {
      id: 'conv_prev_1',
      title: 'Lender Prepayment Policies',
      titleHi: 'पूर्व-भुगतान नियम व नीतियां',
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      messages: [],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState<string>('conv_active');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Conversational step tracking for guided questions:
  // Step 0: Initial / Empty State
  // Step 1: Asked loan type & amount -> waiting for user input
  // Step 2: Asked monthly income -> waiting for user input
  // Step 3: Asked age / tenure -> computing deterministic offers
  const [chatStep, setChatStep] = useState<number>(0);
  const [loanContext, setLoanContext] = useState<{
    loanType: string;
    amount: number;
    monthlyIncome: number;
    tenureMonths: number;
    userName?: string;
  }>({
    loanType: 'Personal Loan',
    amount: 200000,
    monthlyIncome: user?.monthlyIncome || 35000,
    tenureMonths: 36,
    userName: user?.name || 'Customer',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle starting a fresh conversation
  const handleNewChat = () => {
    setMessages([]);
    setChatStep(0);
    setInputText('');
  };

  // Helper to add assistant response with typing delay
  const pushAssistantMessage = (msg: Omit<ChatMessage, 'id' | 'sender' | 'timestamp'>) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_${Math.random()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...msg,
        },
      ]);
    }, 850);
  };

  // Trigger evaluation for specific persona or parameters
  const triggerEligibilityEngine = async (amount: number, income: number, tenure: number = 36) => {
    setIsTyping(true);

    try {
      const offers = await evaluateEligibility({
        loanType: 'Personal Loan',
        amount,
        monthlyIncome: income,
        tenureMonths: tenure,
      });

      setIsTyping(false);

      // Check if all are declined (like Aman)
      const allDeclined = offers.every((o) => o.status === 'Not eligible');
      const approvedOffers = offers.filter((o) => o.status === 'Approved');

      if (allDeclined) {
        const primaryDecline = offers[0];
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}_1`,
            sender: 'assistant',
            text: `Based on your monthly in-hand income of ${formatINR(income)} and requested loan of ${formatINR(amount)}, our deterministic lending engine evaluated partner criteria. Unfortunately, your debt-to-income ratio exceeds the regulatory ceiling.`,
            textHi: `आपकी मासिक आय ${formatINR(income)} और माँगी गई राशि ${formatINR(amount)} के आधार पर, ऋणदाता नीतियों के अनुसार आपका ईएमआई अनुपात सीमा से अधिक है।`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'rejection',
            rejectedOffer: primaryDecline,
          },
        ]);
      } else {
        // Priya or Ravi or Approved case
        const emiVal = approvedOffers[0]?.monthlyEmi || calculateEmi(amount, 12.5, tenure);
        const foirVal = calculateFoir(emiVal, income);

        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}_1`,
            sender: 'assistant',
            text: `Great news! Based on your income profile (${formatINR(income)}/mo), you are pre-approved by partner lenders. Here are your customized, zero-hidden-charge offers:`,
            textHi: `शुभ समाचार! आपकी मासिक आय (${formatINR(income)}) के आधार पर, आपको पूर्व-स्वीकृत लोन ऑफर प्राप्त हुए हैं:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'offers',
            offers,
            emiSummary: {
              amount,
              tenureMonths: tenure,
              rate: approvedOffers[0]?.interestRateAnnual || 12.5,
              emi: emiVal,
              totalInterest: (approvedOffers[0]?.totalPayable || amount * 1.2) - amount,
              totalPayable: approvedOffers[0]?.totalPayable || amount * 1.2,
              monthlyIncome: income,
              foir: foirVal,
            },
          },
        ]);
      }
    } catch {
      setIsTyping(false);
    }
  };

  // Handle User Input Submission
  const handleSend = async (customText?: string) => {
    const rawText = customText || inputText;
    if (!rawText.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: rawText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInputText('');

    const lower = rawText.toLowerCase();

    // 1. Check for Persona Shortcuts
    if (lower.includes('aman') || lower.includes('10,000') || lower.includes('10k') || (lower.includes('2,00,000') && lower.includes('10000'))) {
      setLoanContext({ loanType: 'Personal Loan', amount: 200000, monthlyIncome: 10000, tenureMonths: 36, userName: 'Aman' });
      await triggerEligibilityEngine(200000, 10000, 36);
      return;
    }

    if (lower.includes('priya') || lower.includes('40,000') || lower.includes('40k')) {
      setLoanContext({ loanType: 'Personal Loan', amount: 200000, monthlyIncome: 40000, tenureMonths: 36, userName: 'Priya' });
      await triggerEligibilityEngine(200000, 40000, 36);
      return;
    }

    if (lower.includes('ravi') || lower.includes('5,00,000') || lower.includes('5 lakh') || lower.includes('25,000') || lower.includes('25k')) {
      setLoanContext({ loanType: 'Personal Loan', amount: 500000, monthlyIncome: 25000, tenureMonths: 48, userName: 'Ravi' });
      await triggerEligibilityEngine(500000, 25000, 48);
      return;
    }

    // 2. Policy Queries
    if (lower.includes('policy') || lower.includes('prepayment') || lower.includes('charge') || lower.includes('foreclosure') || lower.includes('rbi')) {
      pushAssistantMessage({
        text: 'Under RBI Digital Lending Guidelines and partner credit terms, zero prepayment charges apply after 6 completed monthly installments. All fees, APR, and cooling-off terms are standardized upfront in the Key Fact Statement.',
        textHi: 'आरबीआई डिजिटल लेंडिंग नियमों के अनुसार, 6 मासिक किस्तों के बाद कोई पूर्व-भुगतान शुल्क नहीं लगता है। सभी शुल्क और शर्तें की फैक्ट स्टेटमेंट (KFS) में पहले से पारदर्शी रूप से दी जाती हैं।',
        type: 'policy_answer',
        sourceCitation: {
          documentName: 'RBI Digital Lending Directives & Partner Agreement',
          section: 'Section 4.1: Prepayment & Foreclosure Norms',
          page: 12,
          clause: 'No penal charges or foreclosure penalties shall be levied on floating-rate individual credit facilities after 6 months.',
        },
      });
      return;
    }

    // 3. Document Questions
    if (lower.includes('document') || lower.includes('pan') || lower.includes('aadhaar') || lower.includes('salary')) {
      pushAssistantMessage({
        text: 'Only 3 paperless documents are required: PAN Card for identity verification, Aadhaar for instant e-KYC, and your latest salary slip or 3 months bank statement. All processing is 100% digital with zero physical paperwork.',
        textHi: 'केवल 3 डिजिटल दस्तावेज़ आवश्यक हैं: पैन कार्ड, आधार कार्ड (e-KYC), और नवीनतम वेतन पर्ची या 3 महीने का बैंक विवरण।',
      });
      return;
    }

    // 4. Multi-step conversational guided flow
    if (chatStep === 0) {
      setChatStep(1);
      pushAssistantMessage({
        text: `I'll guide you step-by-step. What type of loan are you looking for, and what amount do you need? (e.g. ₹2,00,000 Personal Loan)`,
        textHi: `मैं आपकी चरण-दर-चरण सहायता करूँगा। आपको किस प्रकार का लोन और कितनी राशि चाहिए? (उदा. ₹2,00,000 पर्सनल लोन)`,
      });
    } else if (chatStep === 1) {
      // Extracted amount or use fallback
      const amountMatch = rawText.match(/\d[\d,]*/);
      const extractedAmount = amountMatch ? parseInt(amountMatch[0].replace(/,/g, ''), 10) : 200000;
      setLoanContext((prev) => ({ ...prev, amount: extractedAmount }));
      setChatStep(2);
      pushAssistantMessage({
        text: `Got it! A loan of ${formatINR(extractedAmount)}. What is your current monthly in-hand salary or business income?`,
        textHi: `समझ गया! ${formatINR(extractedAmount)} का लोन। आपकी वर्तमान मासिक आय (वेतन) कितनी है?`,
      });
    } else if (chatStep === 2) {
      const incomeMatch = rawText.match(/\d[\d,]*/);
      const extractedIncome = incomeMatch ? parseInt(incomeMatch[0].replace(/,/g, ''), 10) : 35000;
      setLoanContext((prev) => ({ ...prev, monthlyIncome: extractedIncome }));
      setChatStep(3);
      await triggerEligibilityEngine(loanContext.amount, extractedIncome, loanContext.tenureMonths);
    } else {
      // General follow up
      pushAssistantMessage({
        text: `I understand. You can choose any of the offers shown above, or modify your loan amount and tenure to recalculate live eligibility.`,
        textHi: `आप ऊपर दिए गए किसी भी ऑफ़र को चुन सकते हैं, या नई राशि दर्ज करके दोबारा जाँच सकते हैं।`,
      });
    }
  };

  // Handle Alternative Chip Clicks from Rejection Card
  const handleAlternative = async (alt: {
    label: string;
    amount?: number;
    tenureMonths?: number;
    actionType: 'reduce_amount' | 'extend_tenure' | 'add_coapplicant';
  }) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: alt.label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    const newAmt = alt.amount || loanContext.amount;
    const newTenure = alt.tenureMonths || loanContext.tenureMonths;
    const newInc = alt.actionType === 'add_coapplicant' ? loanContext.monthlyIncome + 25000 : loanContext.monthlyIncome;

    setLoanContext((prev) => ({
      ...prev,
      amount: newAmt,
      tenureMonths: newTenure,
      monthlyIncome: newInc,
    }));

    await triggerEligibilityEngine(newAmt, newInc, newTenure);
  };

  // Handle Offer Selection -> navigate to KFS
  const handleSelectOffer = async (offer: LoanOffer) => {
    try {
      const app = await createApplicationFromOffer(
        user?.id || 'demo_user',
        offer,
        loanContext.monthlyIncome
      );
      navigate(`/application/${app.id}/kfs`);
    } catch {
      navigate('/application/app_demo_01/kfs');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-3 sm:px-6 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 z-50 left-1/2 transform -translate-x-1/2 px-4 py-2.5 rounded-2xl bg-ink-950 text-white text-xs font-medium shadow-xl flex items-center gap-2 border border-white/10"
        >
          <Sparkles className="w-4 h-4 text-crimson-400" />
          <span>{toastMsg}</span>
        </motion.div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between py-3 border-b border-crimson-100/60 dark:border-ink-800/80">
        <button
          onClick={() => setHistoryDrawerOpen(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:text-crimson-600 transition shadow-xs"
          title="Past Chats"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-bold text-sm text-ink-950 dark:text-ink-50">
            {t.newChat}
          </h2>
        </div>

        <button
          onClick={handleNewChat}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:text-crimson-600 transition shadow-xs"
          title="Clear / New Chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {/* EMPTY / START STATE */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center pt-4 sm:pt-8 text-center max-w-2xl mx-auto"
          >
            {/* User Greeting Block */}
            <div className="w-16 h-16 rounded-3xl bg-crimson-50 dark:bg-crimson-950/50 border border-crimson-100 dark:border-crimson-800 flex items-center justify-center text-crimson-600 dark:text-crimson-400 font-extrabold text-2xl mb-4 shadow-crimson-sm">
              {user?.avatar || user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-ink-900 dark:text-ink-100">
              {t.chatGreetingPre} <strong className="font-extrabold text-ink-950 dark:text-white">{user?.name || 'Borrower'}</strong>!
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-crimson-700 dark:text-crimson-400 mt-1">
              {t.chatGreetingSub}
            </p>

            {/* 2x2 Grid of Large Frosted Action Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-8">
              <button
                onClick={() => handleSend('I want to check my eligibility for a ₹2,00,000 personal loan')}
                className="p-5 rounded-3xl text-left bg-white/75 dark:bg-surface-dark-card/85 backdrop-blur-md border border-crimson-100/90 dark:border-ink-800 hover:border-crimson-300 dark:hover:border-crimson-800 shadow-glass hover:shadow-glass-hover transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink-950 dark:text-ink-50">
                  {t.chatTile1Title}
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                  {t.chatTile1Desc}
                </p>
              </button>

              <button
                onClick={() => navigate('/calculator')}
                className="p-5 rounded-3xl text-left bg-white/75 dark:bg-surface-dark-card/85 backdrop-blur-md border border-crimson-100/90 dark:border-ink-800 hover:border-crimson-300 dark:hover:border-crimson-800 shadow-glass hover:shadow-glass-hover transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink-950 dark:text-ink-50">
                  {t.chatTile2Title}
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                  {t.chatTile2Desc}
                </p>
              </button>

              <button
                onClick={() => handleSend('What documents do I need to prepare for approval?')}
                className="p-5 rounded-3xl text-left bg-white/75 dark:bg-surface-dark-card/85 backdrop-blur-md border border-crimson-100/90 dark:border-ink-800 hover:border-crimson-300 dark:hover:border-crimson-800 shadow-glass hover:shadow-glass-hover transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink-950 dark:text-ink-50">
                  {t.chatTile3Title}
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                  {t.chatTile3Desc}
                </p>
              </button>

              <button
                onClick={() => handleSend('What are the prepayment charges and RBI cooling off rules?')}
                className="p-5 rounded-3xl text-left bg-white/75 dark:bg-surface-dark-card/85 backdrop-blur-md border border-crimson-100/90 dark:border-ink-800 hover:border-crimson-300 dark:hover:border-crimson-800 shadow-glass hover:shadow-glass-hover transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink-950 dark:text-ink-50">
                  {t.chatTile4Title}
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                  {t.chatTile4Desc}
                </p>
              </button>
            </div>

            {/* Quick Reply Chips Row */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handleSend(t.quickPrompt1)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-ink-900 border border-crimson-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:border-crimson-400 hover:text-crimson-600 transition shadow-xs"
              >
                🚗 {t.quickPrompt1}
              </button>
              <button
                onClick={() => handleSend(t.quickPrompt2)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-ink-900 border border-crimson-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:border-crimson-400 hover:text-crimson-600 transition shadow-xs"
              >
                👤 {t.quickPrompt2}
              </button>
              <button
                onClick={() => handleSend(t.quickPrompt3)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-ink-900 border border-crimson-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:border-crimson-400 hover:text-crimson-600 transition shadow-xs"
              >
                ⚡ {t.quickPrompt3}
              </button>
              <button
                onClick={() => handleSend('मुझे लोन चाहिए')}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-ink-900 border border-crimson-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:border-crimson-400 hover:text-crimson-600 transition shadow-xs"
              >
                🇮🇳 मुझे लोन चाहिए
              </button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE CONVERSATION MESSAGES */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-2xl bg-crimson-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  CS
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`max-w-2xl rounded-3xl p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-crimson-600 text-white rounded-br-sm shadow-crimson-sm'
                    : 'bg-white/85 dark:bg-surface-dark-card/90 backdrop-blur-md border border-crimson-100/90 dark:border-ink-800 text-ink-900 dark:text-ink-50 rounded-bl-sm shadow-glass'
                }`}
              >
                <p className="whitespace-pre-wrap font-normal">
                  {language === 'hi' && msg.textHi ? msg.textHi : msg.text}
                </p>

                {/* Embedded Policy Source Citation */}
                {msg.sourceCitation && (
                  <PolicySourceChip citation={msg.sourceCitation} />
                )}

                {/* Embedded EMI Summary Card */}
                {msg.emiSummary && (
                  <EmiSummaryCard
                    amount={msg.emiSummary.amount}
                    tenureMonths={msg.emiSummary.tenureMonths}
                    rate={msg.emiSummary.rate}
                    emi={msg.emiSummary.emi}
                    totalInterest={msg.emiSummary.totalInterest}
                    totalPayable={msg.emiSummary.totalPayable}
                    monthlyIncome={msg.emiSummary.monthlyIncome}
                    foir={msg.emiSummary.foir}
                  />
                )}

                {/* Embedded Loan Offers Grid */}
                {msg.offers && msg.offers.length > 0 && (
                  <div className="mt-4 space-y-3.5">
                    {msg.offers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        onSelectOffer={handleSelectOffer}
                      />
                    ))}
                  </div>
                )}

                {/* Embedded Rejection Card */}
                {msg.rejectedOffer && (
                  <RejectionCard
                    offer={msg.rejectedOffer}
                    onApplyAlternative={handleAlternative}
                  />
                )}

                <div
                  className={`text-[10px] mt-2 flex items-center justify-end ${
                    isUser ? 'text-crimson-200' : 'text-ink-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-2xl bg-crimson-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              CS
            </div>
            <div className="px-5 py-3.5 rounded-3xl bg-white/85 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 rounded-bl-sm shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-crimson-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-crimson-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-crimson-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Pill Input Bar */}
      <div className="pb-4 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center p-1.5 rounded-full bg-white/90 dark:bg-surface-dark-card/95 backdrop-blur-md border border-crimson-200 dark:border-ink-700 shadow-glass focus-within:ring-2 focus-within:ring-crimson-500/20 focus-within:border-crimson-600 transition"
        >
          {/* Attachment button (UI only) */}
          <button
            type="button"
            onClick={() => showToast(t.attachmentComingSoon)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-400 hover:text-crimson-600 hover:bg-crimson-50 dark:hover:bg-ink-800 transition"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chatInputPlaceholder}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-ink-950 dark:text-ink-50 placeholder:text-ink-400 focus:outline-none"
          />

          {/* Mic button (UI only) */}
          <button
            type="button"
            onClick={() => showToast(t.voiceComingSoon)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-400 hover:text-crimson-600 hover:bg-crimson-50 dark:hover:bg-ink-800 transition"
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send Round Crimson Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-crimson-600 hover:bg-crimson-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-crimson-sm shrink-0"
            title="Send message"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </button>
        </form>

        {/* AI Disclaimer */}
        <p className="text-[11px] text-center text-ink-400 dark:text-ink-500 mt-2">
          {t.chatDisclaimer}
        </p>
      </div>

      {/* Chat History Slide-Over Drawer */}
      <ChatHistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={(id) => {
          setActiveConvId(id);
          // If selecting today's Aman demo chat:
          if (id === 'conv_today_1') {
            handleSend('Check ₹2,00,000 personal loan for Aman (₹10k income)');
          } else {
            handleSend('I need a ₹1 lakh car loan');
          }
        }}
        onNewChat={handleNewChat}
      />
    </div>
  );
};
