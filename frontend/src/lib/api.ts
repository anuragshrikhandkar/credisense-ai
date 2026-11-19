import {
  LoanOffer,
  LoanApplication,
  KFSData,
  DocumentItem,
  RepaymentInstallment,
  HumanCallbackRequest,
  ApplicationStatus,
} from '../types';
import { sleep, formatINR } from './utils';

// ============================================================================
// CREDISENSE DATA ACCESS LAYER (MOCK API)
// NOTE FOR BACKEND REPLACEMENT:
// To connect to the real FastAPI backend, replace the mock implementations in
// this file with standard fetch / axios calls pointing to your API routes:
// e.g. POST /api/v1/eligibility, GET /api/v1/applications/:id, etc.
// ============================================================================

function getRandomDelay(min = 600, max = 1200): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ----------------------------------------------------------------------------
// Deterministic Financial Calculations (Strict & Auditable)
// ----------------------------------------------------------------------------

/**
 * Standard EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * @param principal Loan amount in INR
 * @param annualRatePercent Annual interest rate e.g. 13.5
 * @param tenureMonths Loan duration in months
 */
export function calculateEmi(principal: number, annualRatePercent: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePercent <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualRatePercent / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculate Fixed Obligation to Income Ratio (FOIR) percentage
 */
export function calculateFoir(monthlyEmi: number, monthlyIncome: number): number {
  if (!monthlyIncome || monthlyIncome <= 0) return 0;
  return Math.round((monthlyEmi / monthlyIncome) * 100);
}

/**
 * Generate an exact amortization table for repayment
 */
export function generateRepaymentSchedule(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  startDate: Date = new Date()
): RepaymentInstallment[] {
  const emi = calculateEmi(principal, annualRatePercent, tenureMonths);
  const monthlyRate = annualRatePercent / 12 / 100;
  const schedule: RepaymentInstallment[] = [];
  let balance = principal;

  for (let i = 1; i <= tenureMonths; i++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPaid = Math.min(balance, emi - interest);
    balance = Math.max(0, balance - principalPaid);

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString(),
      emi,
      principal: principalPaid,
      interest,
      balance,
    });
  }

  return schedule;
}

// ----------------------------------------------------------------------------
// Deterministic Multi-Lender Eligibility Engine
// ----------------------------------------------------------------------------

export interface EligibilityInput {
  loanType: string;
  amount: number;
  monthlyIncome: number;
  tenureMonths?: number;
  age?: number;
  employmentType?: 'salaried' | 'self_employed';
}

/**
 * Deterministically evaluate loan offers across fictional partner lenders.
 * 
 * --- FASTAPI INTEGRATION POINT ---
 * Replace with:
 * const response = await fetch(`${API_URL}/api/v1/eligibility/evaluate`, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 *   body: JSON.stringify(input),
 * });
 * return await response.json();
 */
export async function evaluateEligibility(input: EligibilityInput): Promise<LoanOffer[]> {
  await sleep(getRandomDelay());

  const { amount, monthlyIncome } = input;
  const tenure = input.tenureMonths || 36;
  const offers: LoanOffer[] = [];

  // LENDER A: "Lender A (Prime Capital)" - Low interest, strict criteria (Min inc 25k, Max FOIR 45%)
  const rateA = 12.5;
  const emiA = calculateEmi(amount, rateA, tenure);
  const foirA = calculateFoir(emiA, monthlyIncome);
  const totalPayableA = emiA * tenure;
  const procFeeA = Math.round(amount * 0.015);
  const gstA = Math.round(procFeeA * 0.18);

  if (monthlyIncome < 25000 || foirA > 45) {
    offers.push({
      id: 'offer_lender_a_declined',
      lenderId: 'lender_a',
      lenderName: 'Lender A (Prime Capital)',
      lenderLogoText: 'LA',
      lenderColor: '#8A0B20',
      status: 'Not eligible',
      amount,
      tenureMonths: tenure,
      interestRateAnnual: rateA,
      processingFeePercent: 1.5,
      processingFeeAmount: procFeeA,
      gstAmount: gstA,
      monthlyEmi: emiA,
      totalInterest: totalPayableA - amount,
      totalPayable: totalPayableA,
      apr: 13.8,
      foir: foirA,
      reason: `EMI of ${formatINR(emiA)} requires ${foirA}% of your income. Lender A limits personal debt to 45% FOIR for risk compliance.`,
      reasonHi: `मासिक ईएमआई ${formatINR(emiA)} आपकी आय का ${foirA}% है। ऋणदाता ए की नीति के अनुसार अधिकतम सीमा 45% है।`,
      alternatives: [
        {
          label: 'Reduce loan to ₹1,00,000',
          labelHi: 'लोन घटाकर ₹1,00,000 करें',
          amount: 100000,
          tenureMonths: 36,
          description: `At ₹1 Lakh for 36 months, EMI is only ${formatINR(calculateEmi(100000, rateA, 36))} (${calculateFoir(calculateEmi(100000, rateA, 36), monthlyIncome)}% FOIR), which is fully eligible.`,
        },
        {
          label: 'Extend tenure to 48 months',
          labelHi: 'अवधि बढ़ाकर 48 महीने करें',
          amount,
          tenureMonths: 48,
          description: `Extending to 48 months lowers monthly EMI to ${formatINR(calculateEmi(amount, rateA, 48))}.`,
        },
        {
          label: 'Add a co-applicant',
          labelHi: 'सह-आवेदक जोड़ें',
          description: 'Adding a family member’s income will bring combined FOIR within the 45% approval threshold.',
        },
      ],
      policySource: {
        documentName: 'Lender A Credit Risk Policy 2024',
        section: 'Section 4: Debt-to-Income Caps',
        page: 12,
        clause: 'Paragraph 4.2.1: FOIR shall not exceed 45% for unsecured retail personal loans.',
      },
    });
  } else {
    offers.push({
      id: 'offer_lender_a_approved',
      lenderId: 'lender_a',
      lenderName: 'Lender A (Prime Capital)',
      lenderLogoText: 'LA',
      lenderColor: '#8A0B20',
      status: 'Approved',
      amount,
      tenureMonths: tenure,
      interestRateAnnual: rateA,
      processingFeePercent: 1.5,
      processingFeeAmount: procFeeA,
      gstAmount: gstA,
      monthlyEmi: emiA,
      totalInterest: totalPayableA - amount,
      totalPayable: totalPayableA,
      apr: 13.8,
      foir: foirA,
      policySource: {
        documentName: 'Lender A Retail Lending Policy',
        section: 'Section 2.1: Tier-1 Prime Eligibility',
        page: 8,
        clause: 'Customer meets prime underwriting with FOIR below 45%.',
      },
    });
  }

  // LENDER B: "Lender B (Bharat Credit)" - Flexible tenure, moderate criteria (Min inc 20k, Max FOIR 50%)
  const rateB = 14.0;
  const emiB = calculateEmi(amount, rateB, tenure);
  const foirB = calculateFoir(emiB, monthlyIncome);
  const totalPayableB = emiB * tenure;
  const procFeeB = Math.round(amount * 0.02);
  const gstB = Math.round(procFeeB * 0.18);

  if (monthlyIncome < 20000 || foirB > 52) {
    offers.push({
      id: 'offer_lender_b_declined',
      lenderId: 'lender_b',
      lenderName: 'Lender B (Bharat Credit)',
      lenderLogoText: 'LB',
      lenderColor: '#C8102E',
      status: 'Not eligible',
      amount,
      tenureMonths: tenure,
      interestRateAnnual: rateB,
      processingFeePercent: 2.0,
      processingFeeAmount: procFeeB,
      gstAmount: gstB,
      monthlyEmi: emiB,
      totalInterest: totalPayableB - amount,
      totalPayable: totalPayableB,
      apr: 15.6,
      foir: foirB,
      reason: `Calculated EMI of ${formatINR(emiB)} exceeds the maximum 50% debt-burden ceiling.`,
      reasonHi: `मासिक ईएमआई ${formatINR(emiB)} अधिकतम 50% सीमा से अधिक है।`,
      alternatives: [
        {
          label: 'Extend tenure to 60 months',
          labelHi: 'अवधि 60 महीने तक बढ़ाएँ',
          amount,
          tenureMonths: 60,
          description: `Longer 60-month duration lowers EMI to ${formatINR(calculateEmi(amount, rateB, 60))}.`,
        },
      ],
      policySource: {
        documentName: 'Lender B Underwriting Standards',
        section: 'Section 6: Retail Lending Norms',
        page: 19,
        clause: 'FOIR cutoff strict at 50% for applicants earning below ₹30,000.',
      },
    });
  } else {
    offers.push({
      id: 'offer_lender_b_approved',
      lenderId: 'lender_b',
      lenderName: 'Lender B (Bharat Credit)',
      lenderLogoText: 'LB',
      lenderColor: '#C8102E',
      status: 'Approved',
      amount,
      tenureMonths: tenure,
      interestRateAnnual: rateB,
      processingFeePercent: 2.0,
      processingFeeAmount: procFeeB,
      gstAmount: gstB,
      monthlyEmi: emiB,
      totalInterest: totalPayableB - amount,
      totalPayable: totalPayableB,
      apr: 15.6,
      foir: foirB,
      policySource: {
        documentName: 'Lender B Retail Lending Norms',
        section: 'Section 3: Instant Digital Approvals',
        page: 11,
        clause: 'Direct pre-approval granted under auto-decision rule 3.4.',
      },
    });
  }

  // LENDER C: "Lender C (Sahayata Finance)" - Micro-lending, up to ₹1.5 Lakhs
  const maxCapC = 150000;
  const rateC = 16.0;
  const effectiveAmountC = Math.min(amount, maxCapC);
  const emiC = calculateEmi(effectiveAmountC, rateC, tenure);
  const foirC = calculateFoir(emiC, monthlyIncome);
  const totalPayableC = emiC * tenure;

  if (amount > maxCapC) {
    offers.push({
      id: 'offer_lender_c_info',
      lenderId: 'lender_c',
      lenderName: 'Lender C (Sahayata Finance)',
      lenderLogoText: 'LC',
      lenderColor: '#A60D26',
      status: 'Needs more info',
      amount: maxCapC,
      tenureMonths: tenure,
      interestRateAnnual: rateC,
      processingFeePercent: 2.5,
      processingFeeAmount: Math.round(maxCapC * 0.025),
      gstAmount: Math.round(maxCapC * 0.025 * 0.18),
      monthlyEmi: emiC,
      totalInterest: totalPayableC - effectiveAmountC,
      totalPayable: totalPayableC,
      apr: 18.2,
      foir: foirC,
      reason: `Lender C offers instant loans up to ${formatINR(maxCapC)}. You can avail ${formatINR(maxCapC)} right now.`,
      reasonHi: `ऋणदाता सी अधिकतम ${formatINR(maxCapC)} तक तुरंत लोन प्रदान करता है।`,
      policySource: {
        documentName: 'Sahayata Small Credit Policy',
        section: 'Schedule A: Ticket Size Limits',
        page: 4,
        clause: 'Single borrower exposure capped at ₹1,50,000 for standard KYC.',
      },
    });
  } else {
    offers.push({
      id: 'offer_lender_c_approved',
      lenderId: 'lender_c',
      lenderName: 'Lender C (Sahayata Finance)',
      lenderLogoText: 'LC',
      lenderColor: '#A60D26',
      status: foirC <= 50 ? 'Approved' : 'Not eligible',
      amount: effectiveAmountC,
      tenureMonths: tenure,
      interestRateAnnual: rateC,
      processingFeePercent: 2.5,
      processingFeeAmount: Math.round(effectiveAmountC * 0.025),
      gstAmount: Math.round(effectiveAmountC * 0.025 * 0.18),
      monthlyEmi: emiC,
      totalInterest: totalPayableC - effectiveAmountC,
      totalPayable: totalPayableC,
      apr: 18.2,
      foir: foirC,
      policySource: {
        documentName: 'Sahayata Small Credit Policy',
        section: 'Schedule A',
        page: 4,
        clause: 'Standard approval under simplified credit evaluation.',
      },
    });
  }

  return offers;
}

// ----------------------------------------------------------------------------
// Local Storage Persistence for Applications & Journey State
// ----------------------------------------------------------------------------

const STORAGE_KEY_APPLICATIONS = 'credisense_applications';

function getStoredApplications(): LoanApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredApplications(apps: LoanApplication[]) {
  localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
}

// Default documents checklist for an application
export function createDefaultDocuments(): DocumentItem[] {
  return [
    {
      id: 'doc_pan',
      type: 'PAN',
      title: 'PAN Card',
      titleHi: 'पैन कार्ड',
      required: true,
      status: 'PENDING',
    },
    {
      id: 'doc_aadhaar',
      type: 'AADHAAR',
      title: 'Aadhaar Card (Front & Back)',
      titleHi: 'आधार कार्ड (आगे और पीछे)',
      required: true,
      status: 'PENDING',
    },
    {
      id: 'doc_salary',
      type: 'SALARY_SLIP',
      title: 'Latest Salary Slip (or ITR)',
      titleHi: 'नवीनतम वेतन पर्ची (या आईटीआर)',
      required: true,
      status: 'PENDING',
    },
    {
      id: 'doc_bank',
      type: 'BANK_STATEMENT',
      title: 'Bank Statement (Last 3 Months)',
      titleHi: 'बैंक विवरण (पिछले 3 महीने)',
      required: true,
      status: 'PENDING',
    },
  ];
}

/**
 * Create or select an application from a chosen loan offer
 * 
 * --- FASTAPI INTEGRATION POINT ---
 * POST /api/v1/applications
 */
export async function createApplicationFromOffer(
  userId: string,
  offer: LoanOffer,
  income: number
): Promise<LoanApplication> {
  await sleep(getRandomDelay());

  const apps = getStoredApplications();
  const appId = `app_${Date.now()}`;

  const kfsData: KFSData = {
    applicationId: appId,
    offerId: offer.id,
    lenderName: offer.lenderName,
    loanAmount: offer.amount,
    interestRate: offer.interestRateAnnual,
    rateType: 'Fixed',
    apr: offer.apr,
    tenureMonths: offer.tenureMonths,
    monthlyEmi: offer.monthlyEmi,
    totalInterest: offer.totalInterest,
    processingFee: offer.processingFeeAmount,
    gstOnFee: offer.gstAmount,
    netDisbursalAmount: offer.amount - (offer.processingFeeAmount + offer.gstAmount),
    totalPayable: offer.totalPayable,
    prepaymentCharges: 'Nil (0%) after 6 completed monthly installments. 2% if prepaid prior to 6 months.',
    prepaymentChargesHi: '6 मासिक किस्तों के बाद शून्य (0%)। 6 महीने से पहले बंद करने पर 2% शुल्क।',
    latePaymentPenalty: '2% per month on overdue EMI amount, calculated on daily overdue basis.',
    latePaymentPenaltyHi: 'देय ईएमआई पर 2% प्रति माह विलंब शुल्क, दैनिक आधार पर गणना।',
    coolingOffPeriod: '3 calendar days from loan agreement signing date (zero penalty exit).',
    coolingOffPeriodHi: 'ऋण अनुबंध पर हस्ताक्षर की तिथि से 3 दिन (शून्य शुल्क रद्दीकरण)।',
    summaryExplanationEn: `You are borrowing ${formatINR(offer.amount)} for ${offer.tenureMonths} months at ${offer.interestRateAnnual}% interest. Total interest over the tenure is ${formatINR(offer.totalInterest)}. Your net amount disbursed in bank will be ${formatINR(offer.amount - (offer.processingFeeAmount + offer.gstAmount))} after deducting one-time upfront processing fees and GST.`,
    summaryExplanationHi: `आप ${offer.tenureMonths} महीनों के लिए ${offer.interestRateAnnual}% ब्याज दर पर ${formatINR(offer.amount)} ले रहे हैं। पूरी अवधि में कुल ब्याज ${formatINR(offer.totalInterest)} होगा। प्रोसेसिंग शुल्क और जीएसटी काटने के बाद आपके बैंक में ${formatINR(offer.amount - (offer.processingFeeAmount + offer.gstAmount))} जमा होंगे।`,
    consents: {
      dataUse: false,
      creditBureauCheck: false,
      termsAndConditions: false,
    },
  };

  const newApp: LoanApplication = {
    id: appId,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'OFFER_SHOWN',
    loanType: 'Personal Loan',
    selectedOffer: offer,
    applicantIncome: income,
    applicantAge: 29,
    kfsData,
    documents: createDefaultDocuments(),
  };

  apps.unshift(newApp);
  saveStoredApplications(apps);
  return newApp;
}

/**
 * Fetch application by ID
 * 
 * --- FASTAPI INTEGRATION POINT ---
 * GET /api/v1/applications/:id
 */
export async function getApplicationById(id: string): Promise<LoanApplication | null> {
  await sleep(400);
  const apps = getStoredApplications();
  return apps.find((a) => a.id === id) || null;
}

/**
 * List all applications for a customer
 * 
 * --- FASTAPI INTEGRATION POINT ---
 * GET /api/v1/applications
 */
export async function listUserApplications(userId: string): Promise<LoanApplication[]> {
  await sleep(500);
  const apps = getStoredApplications();
  const userApps = apps.filter((a) => a.userId === userId);

  // If user has none, seed a demo active application for immediate demo preview
  if (userApps.length === 0) {
    const demoOffer: LoanOffer = {
      id: 'offer_demo_seed',
      lenderId: 'lender_a',
      lenderName: 'Lender A (Prime Capital)',
      lenderLogoText: 'LA',
      lenderColor: '#8A0B20',
      status: 'Approved',
      amount: 150000,
      tenureMonths: 24,
      interestRateAnnual: 12.0,
      processingFeePercent: 1.5,
      processingFeeAmount: 2250,
      gstAmount: 405,
      monthlyEmi: 7061,
      totalInterest: 19464,
      totalPayable: 169464,
      apr: 13.4,
      foir: 24,
    };

    const initialApp: LoanApplication = {
      id: `app_demo_01`,
      userId,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'CONSENT_GIVEN',
      loanType: 'Personal Loan',
      selectedOffer: demoOffer,
      applicantIncome: 45000,
      applicantAge: 28,
      documents: createDefaultDocuments(),
    };
    apps.push(initialApp);
    saveStoredApplications(apps);
    return [initialApp];
  }

  return userApps;
}

/**
 * Save KFS consents and advance to CONSENT_GIVEN / KYC_DONE
 * 
 * --- FASTAPI INTEGRATION POINT ---
 * POST /api/v1/applications/:id/consent
 */
export async function submitKfsConsent(
  applicationId: string,
  consents: { dataUse: boolean; creditBureauCheck: boolean; termsAndConditions: boolean }
): Promise<LoanApplication> {
  await sleep(getRandomDelay());

  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === applicationId);
  if (!app) throw new Error('Application not found');

  if (app.kfsData) {
    app.kfsData.consents = {
      ...consents,
      timestamp: new Date().toISOString(),
    };
  }

  app.status = 'CONSENT_GIVEN';
  app.updatedAt = new Date().toISOString();
  saveStoredApplications(apps);
  return app;
}

/**
 * Upload and mock AI verification for documents
 * 
 * --- FASTAPI / VISION OCR INTEGRATION POINT ---
 * POST /api/v1/applications/:id/documents/:docId
 */
export async function uploadAndVerifyDocument(
  applicationId: string,
  docId: string,
  file: { name: string; size: string; simulatedBlurry?: boolean }
): Promise<DocumentItem> {
  await sleep(getRandomDelay(800, 1400));

  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === applicationId);
  if (!app || !app.documents) throw new Error('Application or documents not found');

  const doc = app.documents.find((d) => d.id === docId);
  if (!doc) throw new Error('Document item not found');

  doc.fileName = file.name;
  doc.fileSize = file.size;
  doc.uploadedAt = new Date().toISOString();

  // If flagged as blurry or random test trigger:
  if (file.simulatedBlurry) {
    doc.status = 'NEEDS_REUPLOAD';
    doc.isBlurry = true;
    doc.feedbackMessage = 'This photo appears blurry or has heavy glare. Please retake in good lighting.';
    doc.feedbackMessageHi = 'यह तस्वीर धुंधली दिख रही है। कृपया बेहतर रोशनी में दोबारा फोटो लें।';
  } else {
    doc.status = 'VERIFIED';
    doc.isBlurry = false;
    doc.feedbackMessage = 'Document verified successfully. OCR signatures match records.';
    doc.feedbackMessageHi = 'दस्तावेज़ सफलतापूर्वक सत्यापित हो गया। सभी विवरण सही पाए गए।';

    // Extracted mock fields
    if (doc.type === 'PAN') {
      doc.extractedData = [
        { label: 'PAN Number', value: 'ABCDE****F' },
        { label: 'Name on Card', value: 'VERIFIED MATCH' },
        { label: 'Date of Birth', value: '14/08/1995' },
      ];
    } else if (doc.type === 'AADHAAR') {
      doc.extractedData = [
        { label: 'Aadhaar Number', value: 'XXXX-XXXX-1234' },
        { label: 'Address Match', value: 'CONFIRMED' },
        { label: 'UIDAI QR Valid', value: 'YES' },
      ];
    } else if (doc.type === 'SALARY_SLIP') {
      doc.extractedData = [
        { label: 'Monthly Net Pay', value: '₹42,500' },
        { label: 'Employer', value: 'Private Enterprise' },
        { label: 'EPF Deduction', value: 'Verified' },
      ];
    } else if (doc.type === 'BANK_STATEMENT') {
      doc.extractedData = [
        { label: 'Average Balance', value: '₹38,200' },
        { label: 'No Bounced Cheques', value: 'Clean' },
      ];
    }
  }

  // Check if all verified
  const allVerified = app.documents.every((d) => d.status === 'VERIFIED');
  if (allVerified) {
    app.status = 'DOCS_VERIFIED';
  }

  app.updatedAt = new Date().toISOString();
  saveStoredApplications(apps);
  return doc;
}

/**
 * Remove an uploaded document
 */
export async function removeDocument(applicationId: string, docId: string): Promise<void> {
  await sleep(300);
  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === applicationId);
  if (!app || !app.documents) return;

  const doc = app.documents.find((d) => d.id === docId);
  if (doc) {
    doc.status = 'PENDING';
    doc.fileName = undefined;
    doc.fileSize = undefined;
    doc.fileUrl = undefined;
    doc.uploadedAt = undefined;
    doc.feedbackMessage = undefined;
    doc.extractedData = undefined;
    doc.isBlurry = false;
  }
  saveStoredApplications(apps);
}

/**
 * Advance application status manually or via wizard
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<LoanApplication> {
  await sleep(400);
  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === applicationId);
  if (!app) throw new Error('Application not found');

  app.status = status;
  app.updatedAt = new Date().toISOString();
  saveStoredApplications(apps);
  return app;
}

/**
 * Sign agreement with OTP (Simulated)
 * 
 * --- FASTAPI / DIGILOCKER INTEGRATION POINT ---
 * POST /api/v1/applications/:id/sign-otp
 */
export async function signAgreementWithOtp(applicationId: string, otp: string): Promise<boolean> {
  await sleep(getRandomDelay());
  if (otp.length < 4) {
    throw new Error('Please enter a valid 6-digit OTP received on your mobile.');
  }

  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === applicationId);
  if (app) {
    app.otpVerified = true;
    app.status = 'SIGNED';
    app.updatedAt = new Date().toISOString();
    saveStoredApplications(apps);
  }
  return true;
}

/**
 * Setup e-mandate auto-debit (Simulated NPCI / Razorpay Mandate)
 * 
 * --- FASTAPI / NPCI INTEGRATION POINT ---
 * POST /api/v1/applications/:id/e-mandate
 */
export async function setupEMandate(
  applicationId: string,
  bankDetails: { bankName: string; accountNumber: string; ifsc: string; accountHolder: string }
): Promise<boolean> {
  await sleep(getRandomDelay(900, 1500));

  if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 8) {
    throw new Error('Please provide a valid Indian bank account number.');
  }

  if (!bankDetails.ifsc || bankDetails.ifsc.length < 8) {
    throw new Error('Please provide a valid 11-character IFSC code.');
  }

  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === applicationId);
  if (app) {
    app.eMandate = {
      accountHolder: bankDetails.accountHolder,
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      maskedAccount: `XXXXXX${bankDetails.accountNumber.slice(-4)}`,
      ifsc: bankDetails.ifsc.toUpperCase(),
      verified: true,
    };
    app.updatedAt = new Date().toISOString();
    saveStoredApplications(apps);
  }
  return true;
}

/**
 * Disburse loan to customer account (Simulated Instant IMPS/NEFT)
 * 
 * --- FASTAPI / CORE BANKING INTEGRATION POINT ---
 * POST /api/v1/applications/:id/disburse
 */
export async function disburseLoan(applicationId: string): Promise<LoanApplication> {
  await sleep(getRandomDelay(800, 1400));

  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === applicationId);
  if (!app) throw new Error('Application not found');

  app.status = 'DISBURSED';
  app.disbursalDate = new Date().toISOString();
  app.disbursedAmount = app.kfsData?.netDisbursalAmount || app.selectedOffer.amount;
  app.repaymentSchedule = generateRepaymentSchedule(
    app.selectedOffer.amount,
    app.selectedOffer.interestRateAnnual,
    app.selectedOffer.tenureMonths
  );
  app.updatedAt = new Date().toISOString();
  saveStoredApplications(apps);
  return app;
}

/**
 * Submit human callback assistance request
 * 
 * --- FASTAPI / CRM INTEGRATION POINT ---
 * POST /api/v1/support/callback-request
 */
export async function requestHumanCallback(
  name: string,
  phone: string,
  preferredTime: string,
  summary: string
): Promise<HumanCallbackRequest> {
  await sleep(getRandomDelay());

  const request: HumanCallbackRequest = {
    id: `req_${Date.now()}`,
    name,
    phone,
    preferredTime,
    conversationSummary: summary,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };

  return request;
}
