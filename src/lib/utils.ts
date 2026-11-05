import { OrderStatus } from '../types';

/**
 * Currency formatter for Nigerian Naira.
 * Amounts in data are stored as integer kobo (100 kobo = 1 NGN).
 */
export function formatNaira(kobo: number): string {
  const naira = (kobo || 0) / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naira);
}

/**
 * Mask phone number for privacy on public quote links (e.g. +234 810 *** **60)
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.trim();
  if (cleaned.length < 8) return '***';
  
  // Format as +234 811 *** **65
  const prefix = cleaned.slice(0, Math.min(8, cleaned.length - 4));
  const suffix = cleaned.slice(-2);
  return `${prefix} *** **${suffix}`;
}

/**
 * Generate a 32-character random hex token for private quote links
 */
export function generateToken(length = 32): string {
  const chars = 'abcdef0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Generate a tracking code format SDS-XXXXXX
 */
export function generateOrderCode(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `SDS-${digits}`;
}

/**
 * Format date in Africa/Lagos timezone
 */
export function formatLagosDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format relative time or short date
 */
export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Strictly validate status transitions per PRD Section 10
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (to === 'cancelled' && from !== 'delivered' && from !== 'cancelled') {
    return true; // Any pre-delivery status can be cancelled with reason
  }

  const allowedNext: Record<OrderStatus, OrderStatus[]> = {
    requested: ['quoted', 'cancelled'],
    quoted: ['awaiting_payment', 'paid', 'expired', 'cancelled'],
    awaiting_payment: ['paid', 'expired', 'cancelled'],
    paid: ['assigned', 'cancelled'],
    assigned: ['picked_up', 'cancelled'],
    picked_up: ['in_transit', 'cancelled'],
    in_transit: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
    expired: ['quoted', 'cancelled'], // Can be requoted
  };

  return (allowedNext[from] || []).includes(to);
}

/**
 * Build WhatsApp click-to-chat URL with prefilled encoded message
 */
export function buildWhatsAppLink(phoneNumber: string, text: string): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Calculate remaining time in milliseconds until quote expiry
 */
export function getRemainingTime(validUntilIso: string): {
  totalMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean; // under 6 hours
} {
  const target = new Date(validUntilIso).getTime();
  const now = Date.now();
  const totalMs = target - now;

  if (totalMs <= 0) {
    return { totalMs: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: false };
  }

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
  const isUrgent = hours < 6;

  return { totalMs, hours, minutes, seconds, isExpired: false, isUrgent };
}
