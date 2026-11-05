import { BusinessSettings } from '../types';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'SDS Delivery',
  phone: '0810 649 6160',
  whatsappNumber: '+2348106496160',
  email: 'dispatch@sds.com.ng',
  address: 'Abuja, Nigeria',
  cacNumber: 'RC-1940294 (PLACEHOLDER)', // PLACEHOLDER
  operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  operatingHoursStart: '06:00',
  operatingHoursEnd: '02:00', // 20 hours a day
  closedDayExplanation: 'SDS operates 20 hours daily, Monday through Saturday. Sunday is our scheduled fleet servicing and maintenance day.',
  defaultQuoteValidityHours: 72,
  baseExpressChargeKobo: 350000, // 3,500 NGN
  baseHandlingChargeKobo: 150000, // 1,500 NGN
  quoteWhatsappTemplate:
    'Hello {customerName},\nYour SDS delivery quote for order {orderCode} is ready: {total}.\n\n{link}\n(Quote valid until {validUntil})\n\nPlease reply when your transfer is complete. SDS will confirm receipt and then assign a rider.',
  riderWhatsappTemplate:
    'Hi {riderName},\nYou have been assigned delivery {orderCode}.\nRoute: {pickupCity} to {deliveryCity}.\nScheduled pickup: {pickupTime}.\nTrip Pay: {tripPay}.\n\nOpen job in SDS Rider app:\n{link}',
};

export const APP_CONFIG = {
  showPrototypeRibbon: false,
  currencyCode: 'NGN',
  timeZone: 'Africa/Lagos',
  storageKeyPrefix: 'sds_delivery_v1_',
};
