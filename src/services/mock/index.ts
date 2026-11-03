import {
  Order,
  OrderStatus,
  Quote,
  QuoteStatus,
  PaymentRecord,
  Rider,
  RiderPayout,
  BusinessSettings,
  AuthUser,
  DeliveryProof,
} from '../../types';
import {
  INITIAL_ORDERS,
  INITIAL_RIDERS,
  INITIAL_PAYOUTS,
  DEMO_USERS,
} from '../../data/mock/seed';
import { DEFAULT_BUSINESS_SETTINGS, APP_CONFIG } from '../../config/business';
import { generateOrderCode, generateToken, isValidTransition } from '../../lib/utils';

const STORAGE_KEYS = {
  ORDERS: `${APP_CONFIG.storageKeyPrefix}orders`,
  RIDERS: `${APP_CONFIG.storageKeyPrefix}riders`,
  PAYOUTS: `${APP_CONFIG.storageKeyPrefix}payouts`,
  SETTINGS: `${APP_CONFIG.storageKeyPrefix}settings`,
  AUTH_USER: `${APP_CONFIG.storageKeyPrefix}auth_user`,
};

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded or SSR
  }
}

// -------------------------------------------------------------
// Orders Service
// -------------------------------------------------------------
export const OrdersService = {
  async list(filters?: {
    status?: OrderStatus;
    search?: string;
    riderId?: string;
  }): Promise<Order[]> {
    await delay(350);
    let orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    if (filters?.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }
    if (filters?.riderId) {
      orders = orders.filter((o) => o.assignedRiderId === filters.riderId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.sender.fullName.toLowerCase().includes(q) ||
          o.receiver.fullName.toLowerCase().includes(q) ||
          o.sender.phone.includes(q) ||
          o.receiver.phone.includes(q) ||
          o.sender.pickupAddress.city.toLowerCase().includes(q) ||
          o.receiver.deliveryAddress.city.toLowerCase().includes(q)
      );
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<Order | null> {
    await delay(300);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.find((o) => o.id === id || o.orderCode === id) || null;
  },

  async getByTrackingLookup(code: string, phoneOrEmail: string): Promise<Order | null> {
    await delay(500);
    const cleanCode = code.trim().toUpperCase();
    const cleanContact = phoneOrEmail.trim().toLowerCase().replace(/[^a-z0-9@.]/g, '');

    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    const match = orders.find((o) => {
      if (o.orderCode.toUpperCase() !== cleanCode) return false;

      const senderPhoneClean = o.sender.phone.replace(/[^0-9]/g, '');
      const receiverPhoneClean = o.receiver.phone.replace(/[^0-9]/g, '');
      const senderEmail = (o.sender.email || '').toLowerCase();
      const receiverEmail = (o.receiver.email || '').toLowerCase();

      return (
        (cleanContact.length >= 6 && senderPhoneClean.includes(cleanContact)) ||
        (cleanContact.length >= 6 && receiverPhoneClean.includes(cleanContact)) ||
        (senderEmail && senderEmail === cleanContact) ||
        (receiverEmail && receiverEmail === cleanContact)
      );
    });

    return match || null;
  },

  async getByQuoteToken(token: string): Promise<Order | null> {
    await delay(350);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const order = orders.find((o) => o.quote && o.quote.token === token);
    if (!order) return null;

    // Check expiry
    if (order.quote && order.quote.status === 'sent') {
      const isPast = new Date(order.quote.validUntil).getTime() < Date.now();
      if (isPast && order.status !== 'paid' && order.status !== 'delivered') {
        order.quote.status = 'expired';
        order.status = 'expired';
        saveToStorage(STORAGE_KEYS.ORDERS, orders);
      }
    }

    return order;
  },

  async submitRequest(requestData: Omit<Order, 'id' | 'orderCode' | 'createdAt' | 'status' | 'paymentStatus' | 'timeline'>): Promise<Order> {
    await delay(600);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const newOrder: Order = {
      ...requestData,
      id: `order-${Date.now()}`,
      orderCode: generateOrderCode(),
      createdAt: new Date().toISOString(),
      status: 'requested',
      paymentStatus: 'unpaid',
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'requested',
          title: 'Delivery Request Submitted',
          description: `Guest requested delivery from ${requestData.sender.pickupAddress.city} to ${requestData.receiver.deliveryAddress.city}.`,
          timestamp: new Date().toISOString(),
          actor: 'customer',
        },
      ],
    };

    orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    reason?: string,
    actor: 'admin' | 'rider' | 'customer' | 'system' = 'admin'
  ): Promise<Order> {
    await delay(350);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.id === orderId);

    if (orderIndex === -1) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const order = orders[orderIndex];

    // Enforce transition rules
    if (!isValidTransition(order.status, newStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    }

    order.status = newStatus;
    if (newStatus === 'cancelled' && reason) {
      order.cancellationReason = reason;
    }

    order.timeline.push({
      id: `tl-${Date.now()}`,
      status: newStatus,
      title: `Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
      description: reason || `Order moved to ${newStatus.replace('_', ' ')}.`,
      timestamp: new Date().toISOString(),
      actor,
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  async addNote(orderId: string, noteText: string, isInternal = true): Promise<Order> {
    await delay(300);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = orders[orderIndex];
    if (!order.adminNotes) order.adminNotes = [];
    order.adminNotes.push(noteText);

    order.timeline.push({
      id: `tl-${Date.now()}`,
      title: isInternal ? 'Internal Staff Note Added' : 'Customer Note',
      description: noteText,
      timestamp: new Date().toISOString(),
      actor: 'admin',
      isInternal,
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },
};

// -------------------------------------------------------------
// Quotes Service
// -------------------------------------------------------------
export const QuotesService = {
  async generateLink(
    orderId: string,
    quoteData: {
      basePriceKobo: number;
      expressChargeKobo: number;
      heavyItemChargeKobo: number;
      handlingChargeKobo: number;
      validityHours: number;
      notes?: string;
    }
  ): Promise<{ token: string; quote: Quote; order: Order }> {
    await delay(450);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = orders[orderIndex];
    const token = generateToken(32);
    const totalKobo =
      quoteData.basePriceKobo +
      quoteData.expressChargeKobo +
      quoteData.heavyItemChargeKobo +
      quoteData.handlingChargeKobo;

    const validUntil = new Date(Date.now() + quoteData.validityHours * 3600 * 1000).toISOString();

    const quote: Quote = {
      token,
      ...quoteData,
      totalKobo,
      validUntil,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    order.quote = quote;
    order.status = 'awaiting_payment';

    order.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'quoted',
      title: 'Private Quote Link Issued',
      description: `Quote generated for total ₦${(totalKobo / 100).toLocaleString()}. Valid for ${quoteData.validityHours} hours.`,
      timestamp: new Date().toISOString(),
      actor: 'admin',
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return { token, quote, order };
  },

  async reviseQuote(
    orderId: string,
    quoteData: {
      basePriceKobo: number;
      expressChargeKobo: number;
      heavyItemChargeKobo: number;
      handlingChargeKobo: number;
      validityHours: number;
      notes?: string;
    }
  ): Promise<{ token: string; quote: Quote; order: Order }> {
    return this.generateLink(orderId, quoteData); // replaces token and invalidates old
  },

  async revokeLink(orderId: string): Promise<Order> {
    await delay(350);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = orders[orderIndex];
    if (order.quote) {
      order.quote.status = 'revoked';
    }

    order.timeline.push({
      id: `tl-${Date.now()}`,
      title: 'Quote Link Revoked',
      description: 'Admin revoked previous quote link.',
      timestamp: new Date().toISOString(),
      actor: 'admin',
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },
};

// -------------------------------------------------------------
// Payments Service
// -------------------------------------------------------------
export const PaymentsService = {
  async confirmPayment(
    quoteToken: string,
    reference: string,
    method: 'paystack' | 'manual_bank_transfer' = 'paystack',
    manualReason?: string
  ): Promise<Order> {
    await delay(600);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.quote && o.quote.token === quoteToken);
    if (orderIndex === -1) throw new Error('Quote not found');

    const order = orders[orderIndex];
    const amountKobo = order.quote?.totalKobo || 0;

    order.payment = {
      reference,
      amountKobo,
      paidAt: new Date().toISOString(),
      status: 'paid',
      payer: order.whoPays,
      method,
      manualReason,
    };

    order.paymentStatus = 'paid';
    order.status = 'paid';
    if (order.quote) {
      order.quote.status = 'accepted';
    }

    order.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'paid',
      title: method === 'manual_bank_transfer' ? 'Manual Payment Recorded (Bank Transfer)' : 'Payment Verified via Paystack',
      description: `Payment of ₦${(amountKobo / 100).toLocaleString()} confirmed. Ref: ${reference}${manualReason ? ` | Reason: ${manualReason}` : ''}`,
      timestamp: new Date().toISOString(),
      actor: method === 'manual_bank_transfer' ? 'admin' : 'customer',
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  async markPaidManually(orderId: string, amountKobo: number, reason: string): Promise<Order> {
    await delay(400);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = orders[orderIndex];
    const ref = `MANUAL-${Date.now().toString().slice(-6)}`;

    order.payment = {
      reference: ref,
      amountKobo,
      paidAt: new Date().toISOString(),
      status: 'paid',
      payer: order.whoPays,
      method: 'manual_bank_transfer',
      manualReason: reason,
    };

    order.paymentStatus = 'paid';
    order.status = 'paid';
    if (order.quote) {
      order.quote.status = 'accepted';
    }

    order.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'paid',
      title: 'Marked as Paid Manually (Bank Transfer)',
      description: `Admin recorded manual payment of ₦${(amountKobo / 100).toLocaleString()}. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
      actor: 'admin',
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  async list(): Promise<Array<{ order: Order; payment: PaymentRecord }>> {
    await delay(350);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const payments: Array<{ order: Order; payment: PaymentRecord }> = [];

    orders.forEach((o) => {
      if (o.payment) {
        payments.push({ order: o, payment: o.payment });
      }
    });

    return payments.sort((a, b) => new Date(b.payment.paidAt).getTime() - new Date(a.payment.paidAt).getTime());
  },
};

// -------------------------------------------------------------
// Riders Service
// -------------------------------------------------------------
export const RidersService = {
  async list(): Promise<Rider[]> {
    await delay(300);
    return loadFromStorage<Rider[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
  },

  async getById(id: string): Promise<Rider | null> {
    await delay(250);
    const riders = loadFromStorage<Rider[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    return riders.find((r) => r.id === id) || null;
  },

  async create(riderData: Omit<Rider, 'id' | 'completedJobsCount' | 'unpaidEarningsKobo' | 'totalEarnedKobo'>): Promise<Rider> {
    await delay(400);
    const riders = loadFromStorage<Rider[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    const newRider: Rider = {
      ...riderData,
      id: `rider-${Date.now()}`,
      completedJobsCount: 0,
      unpaidEarningsKobo: 0,
      totalEarnedKobo: 0,
    };
    riders.push(newRider);
    saveToStorage(STORAGE_KEYS.RIDERS, riders);
    return newRider;
  },

  async assign(orderId: string, riderId: string, tripPayKobo: number): Promise<Order> {
    await delay(450);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const riders = loadFromStorage<Rider[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);

    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) throw new Error('Rider not found');

    const order = orders[orderIndex];
    order.assignedRiderId = riderId;
    order.tripPayKobo = tripPayKobo;
    order.status = 'assigned';

    order.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'assigned',
      title: 'Rider Assigned',
      description: `Assigned to ${rider.fullName} (${rider.phone}). Trip pay set to ₦${(tripPayKobo / 100).toLocaleString()}.`,
      timestamp: new Date().toISOString(),
      actor: 'admin',
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  async listJobsForRider(riderId: string): Promise<Order[]> {
    await delay(350);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.filter((o) => o.assignedRiderId === riderId);
  },

  async updateJobStatus(orderId: string, newStatus: 'picked_up' | 'in_transit', riderId: string): Promise<Order> {
    await delay(400);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = orders[orderIndex];
    if (order.assignedRiderId !== riderId) {
      throw new Error('Unauthorized: Job is not assigned to this rider');
    }

    if (!isValidTransition(order.status, newStatus)) {
      throw new Error(`Cannot transition job from ${order.status} to ${newStatus}`);
    }

    order.status = newStatus;
    const title = newStatus === 'picked_up' ? 'Package Picked Up' : 'In Transit to Destination';
    const desc = newStatus === 'picked_up' ? 'Rider confirmed parcel custody from sender.' : 'Rider is en route with shipment.';

    order.timeline.push({
      id: `tl-${Date.now()}`,
      status: newStatus,
      title,
      description: desc,
      timestamp: new Date().toISOString(),
      actor: 'rider',
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  async submitSignature(orderId: string, proof: DeliveryProof, riderId: string): Promise<Order> {
    await delay(600);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const riders = loadFromStorage<Rider[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);

    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = orders[orderIndex];
    order.status = 'delivered';
    order.deliveryProof = proof;

    // Credit rider earnings
    const rider = riders.find((r) => r.id === riderId);
    if (rider && order.tripPayKobo) {
      rider.completedJobsCount += 1;
      rider.unpaidEarningsKobo += order.tripPayKobo;
      rider.totalEarnedKobo += order.tripPayKobo;
      saveToStorage(STORAGE_KEYS.RIDERS, riders);
    }

    order.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'delivered',
      title: 'Delivered & Signature Captured',
      description: `Package delivered to ${proof.receiverName}. Digital signature recorded.`,
      timestamp: proof.deliveredAt,
      actor: 'rider',
    });

    orders[orderIndex] = order;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },
};

// -------------------------------------------------------------
// Earnings & Payout Service
// -------------------------------------------------------------
export const EarningsService = {
  async getForRider(riderId: string): Promise<{
    rider: Rider | null;
    thisWeekKobo: number;
    thisMonthKobo: number;
    unpaidBalanceKobo: number;
    trips: Array<{ order: Order; amountKobo: number; isPaid: boolean }>;
  }> {
    await delay(300);
    const riders = loadFromStorage<Rider[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const rider = riders.find((r) => r.id === riderId) || null;

    const riderJobs = orders.filter((o) => o.assignedRiderId === riderId && o.status === 'delivered');
    const trips = riderJobs.map((j) => ({
      order: j,
      amountKobo: j.tripPayKobo || 350000,
      isPaid: false, // by default unpaid until marked
    }));

    const totalUnpaid = rider?.unpaidEarningsKobo || 0;

    return {
      rider,
      thisWeekKobo: Math.round(totalUnpaid * 0.6),
      thisMonthKobo: rider?.totalEarnedKobo || 0,
      unpaidBalanceKobo: totalUnpaid,
      trips,
    };
  },

  async recordPayout(riderId: string, amountKobo: number, reference: string): Promise<RiderPayout> {
    await delay(500);
    const riders = loadFromStorage<Rider[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    const payouts = loadFromStorage<RiderPayout[]>(STORAGE_KEYS.PAYOUTS, INITIAL_PAYOUTS);

    const rider = riders.find((r) => r.id === riderId);
    if (!rider) throw new Error('Rider not found');

    const newPayout: RiderPayout = {
      id: `payout-${Date.now()}`,
      riderId,
      amountKobo,
      reference,
      paidAt: new Date().toISOString(),
      tripsCount: Math.ceil(amountKobo / 350000),
    };

    rider.unpaidEarningsKobo = Math.max(0, rider.unpaidEarningsKobo - amountKobo);
    payouts.unshift(newPayout);

    saveToStorage(STORAGE_KEYS.RIDERS, riders);
    saveToStorage(STORAGE_KEYS.PAYOUTS, payouts);
    return newPayout;
  },

  async listPayouts(): Promise<RiderPayout[]> {
    await delay(300);
    return loadFromStorage<RiderPayout[]>(STORAGE_KEYS.PAYOUTS, INITIAL_PAYOUTS);
  },
};

// -------------------------------------------------------------
// Settings Service
// -------------------------------------------------------------
export const SettingsService = {
  async get(): Promise<BusinessSettings> {
    await delay(200);
    return loadFromStorage<BusinessSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BUSINESS_SETTINGS);
  },

  async update(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    await delay(400);
    const current = loadFromStorage<BusinessSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BUSINESS_SETTINGS);
    const updated = { ...current, ...settings };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
};

// -------------------------------------------------------------
// Auth Service (Mock)
// -------------------------------------------------------------
export const AuthService = {
  getCurrentUser(): AuthUser | null {
    return loadFromStorage<AuthUser | null>(STORAGE_KEYS.AUTH_USER, DEMO_USERS.owner);
  },

  async login(role: 'owner' | 'manager' | 'rider', email?: string): Promise<AuthUser> {
    await delay(300);
    let user = DEMO_USERS[role];
    if (email) {
      user = { ...user, email };
    }
    saveToStorage(STORAGE_KEYS.AUTH_USER, user);
    return user;
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.RIDERS);
    localStorage.removeItem(STORAGE_KEYS.PAYOUTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },
};
