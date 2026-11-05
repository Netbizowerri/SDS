import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import type {
  AuthUser,
  BusinessSettings,
  DeliveryProof,
  Order,
  OrderStatus,
  PaymentRecord,
  Quote,
  Rider,
  RiderPayout,
  UserRole,
} from '../../types';
import { DEFAULT_BUSINESS_SETTINGS } from '../../config/business';
import { generateOrderCode, generateToken, isValidTransition } from '../../lib/utils';
import { firebaseAuth, firestore } from '../../lib/firebase';

const ORDERS = 'orders';
const RIDERS = 'riders';
const PAYOUTS = 'payouts';
const STAFF = 'staff';
const SETTINGS = 'settings';

function makeTimelineEvent(event: Omit<Order['timeline'][number], 'id' | 'timestamp'> & { timestamp?: string }) {
  return { ...event, id: `tl-${crypto.randomUUID()}`, timestamp: event.timestamp || new Date().toISOString() };
}

async function getOrder(orderId: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(firestore, ORDERS, orderId));
  return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as Order) : null;
}

async function saveOrder(order: Order): Promise<void> {
  const { id, ...data } = order;
  await setDoc(doc(firestore, ORDERS, id), data);
}

async function listDocs<T>(name: string): Promise<T[]> {
  const snapshot = await getDocs(collection(firestore, name));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as T);
}

async function listRiderPayouts(riderId: string): Promise<RiderPayout[]> {
  const snapshot = await getDocs(query(collection(firestore, PAYOUTS), where('riderId', '==', riderId)));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as RiderPayout);
}

async function requireOrder(orderId: string): Promise<Order> {
  const order = await getOrder(orderId);
  if (!order) throw new Error(`Order with ID ${orderId} not found`);
  return order;
}

async function requireRider(riderId: string): Promise<Rider> {
  const snapshot = await getDoc(doc(firestore, RIDERS, riderId));
  if (!snapshot.exists()) throw new Error('Rider not found');
  return { ...snapshot.data(), id: snapshot.id } as Rider;
}

async function writeStaffProfile(user: FirebaseUser): Promise<AuthUser> {
  const snapshot = await getDoc(doc(firestore, STAFF, user.uid));
  if (!snapshot.exists()) throw new Error('This account has not been assigned an SDS staff role. Contact the project owner.');
  const profile = snapshot.data();
  const role = profile.role as UserRole;
  if (!['owner', 'manager', 'rider'].includes(role)) throw new Error('This account has an invalid SDS staff role.');
  if (role === 'rider' && !profile.riderId) throw new Error('This rider account is not linked to a rider profile. Contact the project owner.');
  const staffUser: AuthUser = {
    id: user.uid,
    name: String(profile.name || user.displayName || user.email || 'SDS Staff'),
    email: user.email || String(profile.email || ''),
    role,
    ...(role === 'rider' && profile.riderId ? { riderId: String(profile.riderId) } : {}),
  };
  currentUser = staffUser;
  return staffUser;
}

let currentUser: AuthUser | null = null;
let authInitialization: Promise<void> | undefined;

export const AuthService = {
  initialize(): Promise<void> {
    if (!authInitialization) {
      authInitialization = new Promise((resolve) => {
        let firstState = true;
        onAuthStateChanged(firebaseAuth, async (user) => {
          try {
            if (user) await writeStaffProfile(user);
            else currentUser = null;
          } catch {
            currentUser = null;
            if (user) await signOut(firebaseAuth);
          } finally {
            if (firstState) {
              firstState = false;
              resolve();
            }
          }
        });
      });
    }
    return authInitialization;
  },

  getCurrentUser(): AuthUser | null {
    return currentUser;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    try {
      return await writeStaffProfile(credential.user);
    } catch (error) {
      await signOut(firebaseAuth);
      throw error;
    }
  },

  async logout(): Promise<void> {
    currentUser = null;
    await signOut(firebaseAuth);
  },

};

export const OrdersService = {
  subscribeToNewRequests(onChange: (orders: Order[]) => void, onNewRequest: (order: Order) => void): () => void {
    let initialSnapshot = true;
    return onSnapshot(query(collection(firestore, ORDERS), where('status', '==', 'requested')), (snapshot) => {
      const requests = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as Order);
      onChange(requests);
      if (!initialSnapshot) {
        snapshot.docChanges().filter((change) => change.type === 'added').forEach((change) => {
          onNewRequest({ ...change.doc.data(), id: change.doc.id } as Order);
        });
      }
      initialSnapshot = false;
    });
  },

  async list(filters?: { status?: OrderStatus; search?: string; riderId?: string }): Promise<Order[]> {
    const ordersRef = collection(firestore, ORDERS);
    const filtersForQuery: QueryConstraint[] = [];
    if (filters?.status) filtersForQuery.push(where('status', '==', filters.status));
    if (filters?.riderId) filtersForQuery.push(where('assignedRiderId', '==', filters.riderId));
    const snapshot = await getDocs(filtersForQuery.length ? query(ordersRef, ...filtersForQuery) : ordersRef);
    let orders = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as Order);
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter((o) =>
        [o.orderCode, o.sender.fullName, o.receiver.fullName, o.sender.phone, o.receiver.phone,
          o.sender.pickupAddress.city, o.receiver.deliveryAddress.city]
          .some((value) => String(value || '').toLowerCase().includes(q))
      );
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<Order | null> {
    const direct = await getOrder(id);
    if (direct) return direct;
    const snapshot = await getDocs(query(collection(firestore, ORDERS), where('orderCode', '==', id)));
    const match = snapshot.docs[0];
    return match ? ({ ...match.data(), id: match.id } as Order) : null;
  },

  async getByTrackingLookup(): Promise<Order | null> {
    throw new Error('Shipment status is shared by SDS staff offline. Please contact dispatch with your tracking code.');
  },

  async getByQuoteToken(): Promise<Order | null> {
    throw new Error('Quote and payment details are provided by SDS staff offline. Please contact dispatch.');
  },

  async submitRequest(requestData: Omit<Order, 'id' | 'orderCode' | 'createdAt' | 'status' | 'paymentStatus' | 'timeline'>): Promise<Order> {
    const id = `order-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const order: Order = {
      ...requestData,
      id,
      orderCode: generateOrderCode(),
      createdAt: now,
      status: 'requested',
      paymentStatus: 'unpaid',
      timeline: [makeTimelineEvent({
        status: 'requested',
        title: 'Delivery Request Submitted',
        description: `Guest requested delivery from ${requestData.sender.pickupAddress.city} to ${requestData.receiver.deliveryAddress.city}.`,
        actor: 'customer',
      })],
    };
    // Firestore documents must not contain undefined values or inline file data.
    const cleaned = JSON.parse(JSON.stringify(order)) as Order;
    if (cleaned.item.photos.some((photo) => photo.startsWith('data:'))) {
      throw new Error('Package photos are not available yet. Remove the photos and submit the request again.');
    }
    await setDoc(doc(firestore, ORDERS, id), cleaned);
    return order;
  },

  async updateStatus(orderId: string, newStatus: OrderStatus, reason?: string, actor: 'admin' | 'rider' | 'customer' | 'system' = 'admin'): Promise<Order> {
    const order = await requireOrder(orderId);
    if (!isValidTransition(order.status, newStatus)) throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    order.status = newStatus;
    if (newStatus === 'cancelled' && reason) order.cancellationReason = reason;
    order.timeline.push(makeTimelineEvent({
      status: newStatus,
      title: `Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
      description: reason || `Order moved to ${newStatus.replace('_', ' ')}.`,
      actor,
    }));
    await saveOrder(order);
    return order;
  },

  async addNote(orderId: string, noteText: string, isInternal = true): Promise<Order> {
    const order = await requireOrder(orderId);
    order.adminNotes = [...(order.adminNotes || []), noteText];
    order.timeline.push(makeTimelineEvent({
      title: isInternal ? 'Internal Staff Note Added' : 'Customer Note',
      description: noteText,
      actor: 'admin',
      isInternal,
    }));
    await saveOrder(order);
    return order;
  },
};

export const QuotesService = {
  async generateLink(orderId: string, quoteData: Pick<Quote, 'basePriceKobo' | 'expressChargeKobo' | 'heavyItemChargeKobo' | 'handlingChargeKobo' | 'validityHours' | 'notes'>): Promise<{ token: string; quote: Quote; order: Order }> {
    const order = await requireOrder(orderId);
    if (!['requested', 'quoted', 'awaiting_payment', 'expired'].includes(order.status)) {
      throw new Error(`A quote cannot be prepared for an order in ${order.status} status.`);
    }
    const token = generateToken(32);
    const totalKobo = quoteData.basePriceKobo + quoteData.expressChargeKobo + quoteData.heavyItemChargeKobo + quoteData.handlingChargeKobo;
    const quote: Quote = {
      token,
      ...quoteData,
      totalKobo,
      validUntil: new Date(Date.now() + quoteData.validityHours * 3600 * 1000).toISOString(),
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    order.quote = quote;
    order.status = 'quoted';
    order.timeline.push(makeTimelineEvent({
      status: 'quoted',
      title: 'Quote Prepared',
      description: `Quote prepared for ${totalKobo} kobo. SDS staff will share payment details offline.`,
      actor: 'admin',
    }));
    await saveOrder(order);
    return { token, quote, order };
  },

  async reviseQuote(orderId: string, quoteData: Pick<Quote, 'basePriceKobo' | 'expressChargeKobo' | 'heavyItemChargeKobo' | 'handlingChargeKobo' | 'validityHours' | 'notes'>) {
    return this.generateLink(orderId, quoteData);
  },

  async revokeLink(orderId: string): Promise<Order> {
    const order = await requireOrder(orderId);
    if (order.quote) order.quote.status = 'revoked';
    order.timeline.push(makeTimelineEvent({ title: 'Quote Link Revoked', description: 'Quote link revoked; payment details remain offline.', actor: 'admin' }));
    await saveOrder(order);
    return order;
  },
};

export const PaymentsService = {
  async confirmPayment(): Promise<Order> {
    throw new Error('Customers cannot confirm payment. Contact SDS staff; an administrator will confirm receipt.');
  },

  async markPaidManually(orderId: string, amountKobo: number, reason: string): Promise<Order> {
    const order = await requireOrder(orderId);
    if (!Number.isSafeInteger(amountKobo) || amountKobo < 0) throw new Error('Enter a valid payment amount.');
    if (!isValidTransition(order.status, 'paid')) throw new Error(`Payment cannot be confirmed for an order in ${order.status} status.`);
    const reference = `MANUAL-${Date.now().toString().slice(-6)}`;
    const payment: PaymentRecord = {
      reference,
      amountKobo,
      paidAt: new Date().toISOString(),
      status: 'paid',
      payer: order.whoPays,
      method: 'manual_bank_transfer',
      manualReason: reason,
    };
    order.payment = payment;
    order.paymentStatus = 'paid';
    order.status = 'paid';
    if (order.quote) order.quote.status = 'accepted';
    order.timeline.push(makeTimelineEvent({ status: 'paid', title: 'Payment Confirmed by SDS', description: `SDS staff confirmed payment. Reference: ${reference}. ${reason}`, actor: 'admin' }));
    await saveOrder(order);
    return order;
  },

  async list(): Promise<Array<{ order: Order; payment: PaymentRecord }>> {
    const orders = await listDocs<Order>(ORDERS);
    return orders.filter((order): order is Order & { payment: PaymentRecord } => Boolean(order.payment))
      .map((order) => ({ order, payment: order.payment }))
      .sort((a, b) => new Date(b.payment.paidAt).getTime() - new Date(a.payment.paidAt).getTime());
  },
};

export const RidersService = {
  async list(): Promise<Rider[]> {
    const [riders, orders, payouts] = await Promise.all([
      listDocs<Rider>(RIDERS), listDocs<Order>(ORDERS), listDocs<RiderPayout>(PAYOUTS),
    ]);
    return riders.map((rider) => {
      const completed = orders.filter((order) => order.assignedRiderId === rider.id && order.status === 'delivered');
      const earned = completed.reduce((sum, order) => sum + (order.tripPayKobo || 0), 0);
      const paid = payouts.filter((payout) => payout.riderId === rider.id).reduce((sum, payout) => sum + payout.amountKobo, 0);
      return { ...rider, completedJobsCount: completed.length, totalEarnedKobo: earned, unpaidEarningsKobo: Math.max(0, earned - paid) };
    });
  },
  async getById(id: string): Promise<Rider | null> {
    const snapshot = await getDoc(doc(firestore, RIDERS, id));
    return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as Rider) : null;
  },
  async create(data: Omit<Rider, 'id' | 'completedJobsCount' | 'unpaidEarningsKobo' | 'totalEarnedKobo'>): Promise<Rider> {
    const id = `rider-${crypto.randomUUID()}`;
    const rider: Rider = { ...data, id, completedJobsCount: 0, unpaidEarningsKobo: 0, totalEarnedKobo: 0 };
    const { id: _id, ...record } = rider;
    await setDoc(doc(firestore, RIDERS, id), record);
    return rider;
  },
  async assign(orderId: string, riderId: string, tripPayKobo: number): Promise<Order> {
    const [order, rider] = await Promise.all([requireOrder(orderId), requireRider(riderId)]);
    if (!isValidTransition(order.status, 'assigned')) throw new Error(`Cannot assign an order in ${order.status} status.`);
    order.assignedRiderId = riderId;
    order.tripPayKobo = tripPayKobo;
    order.status = 'assigned';
    order.timeline.push(makeTimelineEvent({ status: 'assigned', title: 'Rider Assigned', description: `Assigned to ${rider.fullName}.`, actor: 'admin' }));
    await saveOrder(order);
    return order;
  },
  async listJobsForRider(riderId: string): Promise<Order[]> {
    const snapshot = await getDocs(query(collection(firestore, ORDERS), where('assignedRiderId', '==', riderId)));
    return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as Order);
  },
  async updateJobStatus(orderId: string, newStatus: 'picked_up' | 'in_transit', riderId: string): Promise<Order> {
    const order = await requireOrder(orderId);
    const signedInRider = AuthService.getCurrentUser();
    if (order.assignedRiderId !== riderId || signedInRider?.riderId !== riderId) throw new Error('Unauthorized: Job is not assigned to this rider');
    if (!isValidTransition(order.status, newStatus)) throw new Error(`Cannot transition job from ${order.status} to ${newStatus}`);
    order.status = newStatus;
    order.timeline.push(makeTimelineEvent({
      status: newStatus,
      title: newStatus === 'picked_up' ? 'Package Picked Up' : 'In Transit to Destination',
      description: newStatus === 'picked_up' ? 'Rider confirmed parcel custody from sender.' : 'Rider is en route with shipment.',
      actor: 'rider',
    }));
    await saveOrder(order);
    return order;
  },
  async submitSignature(orderId: string, proof: DeliveryProof, riderId: string): Promise<Order> {
    const orderRef = doc(firestore, ORDERS, orderId);
    await runTransaction(firestore, async (transaction) => {
      const orderSnapshot = await transaction.get(orderRef);
      if (!orderSnapshot.exists()) throw new Error('Order not found');
      const order = { ...orderSnapshot.data(), id: orderSnapshot.id } as Order;
      const signedIn = AuthService.getCurrentUser();
      if (order.assignedRiderId !== riderId || signedIn?.riderId !== riderId) throw new Error('Unauthorized: Job is not assigned to this rider');
      if (!isValidTransition(order.status, 'delivered')) throw new Error(`Cannot complete order from ${order.status}`);
      if (proof.signatureDataUrl.startsWith('data:') && proof.signatureDataUrl.length > 100_000) throw new Error('Signature is too large.');
      order.status = 'delivered';
      order.deliveryProof = proof;
      order.timeline.push(makeTimelineEvent({ status: 'delivered', title: 'Delivered & Signature Captured', description: `Package delivered to ${proof.receiverName}. Digital signature recorded.`, actor: 'rider', timestamp: proof.deliveredAt }));
      const { id: _orderId, ...orderData } = order;
      transaction.set(orderRef, orderData);
    });
    return requireOrder(orderId);
  },
};

export const EarningsService = {
  async getForRider(riderId: string): Promise<{
    rider: Rider | null; thisWeekKobo: number; thisMonthKobo: number; unpaidBalanceKobo: number;
    trips: Array<{ order: Order; amountKobo: number; isPaid: boolean }>;
  }> {
    const [rider, jobs, payouts] = await Promise.all([
      RidersService.getById(riderId), RidersService.listJobsForRider(riderId), listRiderPayouts(riderId),
    ]);
    const delivered = jobs.filter((job) => job.status === 'delivered');
    const earned = delivered.reduce((sum, job) => sum + (job.tripPayKobo || 0), 0);
    const paid = payouts.filter((payout) => payout.riderId === riderId).reduce((sum, payout) => sum + payout.amountKobo, 0);
    const unpaid = Math.max(0, earned - paid);
    const trips = delivered.map((job) => ({ order: job, amountKobo: job.tripPayKobo || 350000, isPaid: false }));
    return {
      rider: rider ? { ...rider, completedJobsCount: delivered.length, totalEarnedKobo: earned, unpaidEarningsKobo: unpaid } : null,
      thisWeekKobo: unpaid,
      thisMonthKobo: earned,
      unpaidBalanceKobo: unpaid,
      trips,
    };
  },
  async recordPayout(riderId: string, amountKobo: number, reference: string): Promise<RiderPayout> {
    const payoutRef = doc(collection(firestore, PAYOUTS));
    const payout: RiderPayout = { id: payoutRef.id, riderId, amountKobo, reference, paidAt: new Date().toISOString(), tripsCount: Math.ceil(amountKobo / 350000) };
    const earnings = await this.getForRider(riderId);
    if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0 || amountKobo > earnings.unpaidBalanceKobo) {
      throw new Error('Payout amount must be positive and cannot exceed the rider’s unpaid balance.');
    }
    const batch = writeBatch(firestore);
    const { id: _payoutId, ...payoutData } = payout;
    batch.set(payoutRef, payoutData);
    await batch.commit();
    return payout;
  },
  async listPayouts(): Promise<RiderPayout[]> { return listDocs<RiderPayout>(PAYOUTS); },
};

export const SettingsService = {
  async get(): Promise<BusinessSettings> {
    const snapshot = await getDoc(doc(firestore, SETTINGS, 'business'));
    return snapshot.exists() ? ({ ...DEFAULT_BUSINESS_SETTINGS, ...snapshot.data() } as BusinessSettings) : DEFAULT_BUSINESS_SETTINGS;
  },
  async update(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await this.get();
    const updated = { ...current, ...settings };
    await setDoc(doc(firestore, SETTINGS, 'business'), updated);
    return updated;
  },
};
