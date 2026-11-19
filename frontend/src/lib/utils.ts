import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into Indian currency format (e.g. ₹1,00,000)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return formatter.format(amount);
}

/**
 * Compact Indian Lakhs / Crores formatter
 */
export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
  }
  return formatINR(amount);
}

/**
 * Mask Aadhaar number for compliance: XXXX-XXXX-1234
 */
export function maskAadhaar(raw: string = '1234'): string {
  const digits = raw.replace(/\D/g, '');
  const last4 = digits.slice(-4) || '1234';
  return `XXXX-XXXX-${last4}`;
}

/**
 * Mask PAN card number for compliance: ABCDE****F
 */
export function maskPAN(raw: string = 'ABCDE1234F'): string {
  const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (upper.length >= 10) {
    return `${upper.slice(0, 5)}****${upper.slice(-1)}`;
  }
  return 'ABCDE****F';
}

/**
 * Format relative or localized date
 */
export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Safe sleep for mock delay
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
