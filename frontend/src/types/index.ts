export type Language = 'en' | 'hi';
export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  monthlyIncome?: number;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'OFFER_SHOWN'
  | 'CONSENT_GIVEN'
  | 'KYC_DONE'
  | 'DOCS_VERIFIED'
  | 'APPROVED'
  | 'SIGNED'
  | 'DISBURSED'
  | 'REPAYING';

export interface StatusStep {
  key: ApplicationStatus;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
  nextAction?: string;
  nextActionHi?: string;
}

export interface LoanOffer {
  id: string;
  lenderId: string;
  lenderName: string;
  lenderLogoText: string;
  lenderColor: string;
  status: 'Approved' | 'Not eligible' | 'Needs more info';
  amount: number;
  tenureMonths: number;
  interestRateAnnual: number; // e.g. 13.5%
  processingFeePercent: number; // e.g. 1.5%
  processingFeeAmount: number;
  gstAmount: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  apr: number; // Annual Percentage Rate
  foir: number; // Fixed Obligation to Income Ratio %
  reason?: string;
  reasonHi?: string;
  alternatives?: {
    label: string;
    labelHi: string;
    amount?: number;
    tenureMonths?: number;
    description: string;
  }[];
  policySource?: {
    documentName: string;
    section: string;
    page: number;
    clause: string;
  };
}

export interface MessageSourceCitation {
  documentName: string;
  section: string;
  page?: number;
  clause: string;
  lenderName?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  textHi?: string;
  timestamp: string;
  type?: 'text' | 'offers' | 'rejection' | 'emi_summary' | 'policy_answer';
  offers?: LoanOffer[];
  rejectedOffer?: LoanOffer;
  emiSummary?: {
    amount: number;
    tenureMonths: number;
    rate: number;
    emi: number;
    totalInterest: number;
    totalPayable: number;
    monthlyIncome?: number;
    foir?: number;
  };
  sourceCitation?: MessageSourceCitation;
  quickReplies?: string[];
  alternatives?: {
    label: string;
    labelHi: string;
    actionType: 'reduce_amount' | 'extend_tenure' | 'add_coapplicant';
    amount?: number;
    tenureMonths?: number;
  }[];
}

export interface Conversation {
  id: string;
  title: string;
  titleHi: string;
  updatedAt: string;
  messages: ChatMessage[];
  selectedOfferId?: string;
}

export interface KFSData {
  applicationId: string;
  offerId: string;
  lenderName: string;
  loanAmount: number;
  interestRate: number; // annual %
  rateType: 'Fixed' | 'Floating';
  apr: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  processingFee: number;
  gstOnFee: number;
  netDisbursalAmount: number;
  totalPayable: number;
  prepaymentCharges: string;
  prepaymentChargesHi: string;
  latePaymentPenalty: string;
  latePaymentPenaltyHi: string;
  coolingOffPeriod: string;
  coolingOffPeriodHi: string;
  summaryExplanationEn: string;
  summaryExplanationHi: string;
  consents: {
    dataUse: boolean;
    creditBureauCheck: boolean;
    termsAndConditions: boolean;
    timestamp?: string;
  };
}

export type DocumentType = 'PAN' | 'AADHAAR' | 'SALARY_SLIP' | 'BANK_STATEMENT';

export type DocumentStatus = 'PENDING' | 'UPLOADED' | 'VERIFYING' | 'VERIFIED' | 'NEEDS_REUPLOAD';

export interface DocumentItem {
  id: string;
  type: DocumentType;
  title: string;
  titleHi: string;
  required: boolean;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
  feedbackMessage?: string;
  feedbackMessageHi?: string;
  isBlurry?: boolean;
  extractedData?: {
    label: string;
    value: string;
  }[];
}

export interface RepaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface EMandateDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  maskedAccount: string;
  ifsc: string;
  verified: boolean;
}

export interface LoanApplication {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  loanType: string;
  selectedOffer: LoanOffer;
  applicantIncome: number;
  applicantAge: number;
  kfsData?: KFSData;
  documents?: DocumentItem[];
  eMandate?: EMandateDetails;
  otpVerified?: boolean;
  disbursalDate?: string;
  disbursedAmount?: number;
  repaymentSchedule?: RepaymentInstallment[];
}

export interface HumanCallbackRequest {
  id: string;
  name: string;
  phone: string;
  preferredTime: string;
  conversationSummary: string;
  createdAt: string;
  status: 'PENDING' | 'RESOLVED';
}
