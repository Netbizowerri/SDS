export type OrderStatus =
  | 'requested'
  | 'quoted'
  | 'awaiting_payment'
  | 'paid'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'expired';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'expired' | 'accepted' | 'revoked';

export type ItemType =
  | 'documents'
  | 'parcel'
  | 'fragile'
  | 'food'
  | 'electronics'
  | 'clothing'
  | 'other';

export type ItemSize = 'small' | 'medium' | 'large' | 'extra_large';

export type WhoPays = 'sender' | 'receiver';

export interface Address {
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  landmark?: string;
}

export interface CustomerContact {
  fullName: string;
  phone: string;
  email?: string;
}

export interface OrderItem {
  description: string;
  itemType: ItemType;
  weightKg: number;
  size: ItemSize;
  quantity: number;
  photos: string[];
  specialInstructions?: string;
  declarationConfirmed: boolean;
  isExpress: boolean;
}

export interface Quote {
  token: string; // 32-char unguessable token
  basePriceKobo: number;
  expressChargeKobo: number;
  heavyItemChargeKobo: number;
  handlingChargeKobo: number;
  totalKobo: number;
  validUntil: string; // ISO date string
  validityHours: number;
  notes?: string;
  status: QuoteStatus;
  viewedAt?: string;
  createdAt: string;
}

export interface PaymentRecord {
  reference: string;
  amountKobo: number;
  paidAt: string;
  status: PaymentStatus;
  payer: WhoPays;
  method: 'paystack' | 'manual_bank_transfer';
  manualReason?: string;
}

export interface DeliveryProof {
  receiverName: string;
  signatureDataUrl: string;
  deliveredAt: string;
  note?: string;
}

export interface TimelineEvent {
  id: string;
  status?: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: 'customer' | 'admin' | 'rider' | 'system';
  isInternal?: boolean; // visible to staff only
}

export interface Order {
  id: string;
  orderCode: string; // e.g. SDS-829415
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  whoPays: WhoPays;
  sender: CustomerContact & {
    pickupAddress: Address;
    pickupDate: string;
    pickupTimeSlot: string;
  };
  receiver: CustomerContact & {
    deliveryAddress: Address;
    preferredDeliveryDate?: string;
  };
  item: OrderItem;
  quote?: Quote;
  payment?: PaymentRecord;
  assignedRiderId?: string;
  tripPayKobo?: number;
  deliveryProof?: DeliveryProof;
  timeline: TimelineEvent[];
  adminNotes?: string[];
  cancellationReason?: string;
  delayReason?: string;
}

export interface Rider {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  vehicleType: 'motorcycle' | 'van' | 'bicycle' | 'car';
  status: 'active' | 'inactive';
  completedJobsCount: number;
  unpaidEarningsKobo: number;
  totalEarnedKobo: number;
}

export interface RiderPayout {
  id: string;
  riderId: string;
  amountKobo: number;
  reference: string;
  paidAt: string;
  tripsCount: number;
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  cacNumber: string; // PLACEHOLDER
  operatingDays: string[];
  operatingHoursStart: string;
  operatingHoursEnd: string;
  closedDayExplanation: string;
  defaultQuoteValidityHours: number;
  baseExpressChargeKobo: number;
  baseHandlingChargeKobo: number;
  quoteWhatsappTemplate: string;
  riderWhatsappTemplate: string;
}

export type UserRole = 'owner' | 'manager' | 'rider';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  riderId?: string;
}
