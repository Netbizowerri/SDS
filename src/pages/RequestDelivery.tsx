import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { OrdersService } from '../services/mock';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';
import { ItemType, ItemSize, WhoPays } from '../types';

export const RequestDelivery: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Honeypot field for bot protection
  const [honeypot, setHoneypot] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Sender & Pickup
    senderName: '',
    senderCountryCode: '+234',
    senderPhone: '',
    senderEmail: '',
    pickupCountry: 'Nigeria',
    pickupState: 'Lagos',
    pickupCity: '',
    pickupStreet: '',
    pickupLandmark: '',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTimeSlot: '10:00 - 12:00',

    // Step 2: Receiver & Delivery
    receiverName: '',
    receiverCountryCode: '+234',
    receiverPhone: '',
    receiverEmail: '',
    deliveryCountry: 'Nigeria',
    deliveryState: 'Lagos',
    deliveryCity: '',
    deliveryStreet: '',
    deliveryLandmark: '',
    preferredDeliveryDate: '',

    // Step 3: Item details
    itemDescription: '',
    itemType: 'parcel' as ItemType,
    weightKg: 2.5,
    size: 'medium' as ItemSize,
    quantity: 1,
    photos: [] as string[],
    specialInstructions: '',
    whoPays: 'sender' as WhoPays,
    declarationConfirmed: false,
    isExpress: false,

    // Step 4: Terms consent
    termsAccepted: false,
  });

  // Operating days check
  const isOperatingDay = (dateStr: string) => {
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    return DEFAULT_BUSINESS_SETTINGS.operatingDays.includes(dayName);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formData.photos.length + files.length > 3) {
      alert('Maximum of 3 package photos allowed.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5 MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, event.target!.result as string].slice(0, 3),
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const validateStep1 = () => {
    if (!formData.senderName.trim()) return 'Enter sender full name.';
    if (!formData.senderPhone.trim() || formData.senderPhone.length < 8)
      return 'Enter a valid sender phone number.';
    if (!formData.pickupCity.trim() || !formData.pickupStreet.trim())
      return 'Enter complete pickup address with street and city.';
    if (!isOperatingDay(formData.pickupDate))
      return `SDS is closed on Sundays for fleet maintenance. Please pick Monday through Saturday.`;
    return null;
  };

  const validateStep2 = () => {
    if (!formData.receiverName.trim()) return 'Enter receiver full name.';
    if (!formData.receiverPhone.trim() || formData.receiverPhone.length < 8)
      return 'Enter a valid receiver phone number.';
    if (!formData.deliveryCity.trim() || !formData.deliveryStreet.trim())
      return 'Enter complete delivery address with street and city.';
    return null;
  };

  const validateStep3 = () => {
    if (!formData.itemDescription.trim()) return 'Enter item description.';
    if (!formData.declarationConfirmed)
      return 'Please confirm the item legality declaration to proceed.';
    return null;
  };

  const handleNext = () => {
    setErrorMsg(null);
    let err: string | null = null;
    if (currentStep === 1) err = validateStep1();
    if (currentStep === 2) err = validateStep2();
    if (currentStep === 3) err = validateStep3();

    if (err) {
      setErrorMsg(err);
      return;
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for bot submission
    if (!formData.termsAccepted) {
      setErrorMsg('Please accept the Terms of Carriage.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const fullSenderPhone = `${formData.senderCountryCode} ${formData.senderPhone.replace(/^0+/, '')}`;
      const fullReceiverPhone = `${formData.receiverCountryCode} ${formData.receiverPhone.replace(/^0+/, '')}`;

      const newOrder = await OrdersService.submitRequest({
        whoPays: formData.whoPays,
        sender: {
          fullName: formData.senderName,
          phone: fullSenderPhone,
          email: formData.senderEmail || undefined,
          pickupAddress: {
            country: formData.pickupCountry,
            state: formData.pickupState,
            city: formData.pickupCity,
            streetAddress: formData.pickupStreet,
            landmark: formData.pickupLandmark || undefined,
          },
          pickupDate: formData.pickupDate,
          pickupTimeSlot: formData.pickupTimeSlot,
        },
        receiver: {
          fullName: formData.receiverName,
          phone: fullReceiverPhone,
          email: formData.receiverEmail || undefined,
          deliveryAddress: {
            country: formData.deliveryCountry,
            state: formData.deliveryState,
            city: formData.deliveryCity,
            streetAddress: formData.deliveryStreet,
            landmark: formData.deliveryLandmark || undefined,
          },
          preferredDeliveryDate: formData.preferredDeliveryDate || undefined,
        },
        item: {
          description: formData.itemDescription,
          itemType: formData.itemType,
          weightKg: Number(formData.weightKg),
          size: formData.size,
          quantity: Number(formData.quantity),
          photos: formData.photos,
          specialInstructions: formData.specialInstructions || undefined,
          declarationConfirmed: formData.declarationConfirmed,
          isExpress: formData.isExpress,
        },
      });

      // Redirect to confirmation page
      navigate(`/request/submitted?code=${newOrder.orderCode}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit request. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Book a Courier Delivery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Fill in the details below. Our dispatch desk will prepare your quote and message you on WhatsApp.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { step: 1, label: 'Sender & Pickup' },
              { step: 2, label: 'Receiver' },
              { step: 3, label: 'Package' },
              { step: 4, label: 'Review & Submit' },
            ].map((s) => (
              <div
                key={s.step}
                className={`py-2 px-1 rounded-lg border transition-all ${
                  currentStep === s.step
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                    : currentStep > s.step
                    ? 'border-slate-200 bg-slate-50 text-slate-800'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      currentStep === s.step
                        ? 'bg-emerald-600 text-white'
                        : currentStep > s.step
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {currentStep > s.step ? '✓' : s.step}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Please check the required information</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Honeypot field for anti-bot */}
          <input
            type="text"
            name="company_title_check"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* STEP 1: Sender & Pickup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Step 1: Sender & Pickup Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Where our courier will collect the package.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Sender Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oluwaseun Balogun"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Sender Phone (WhatsApp preferred) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.senderCountryCode}
                      onChange={(e) => setFormData({ ...formData, senderCountryCode: e.target.value })}
                      className="px-2.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono"
                    >
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+233">🇬🇭 +233</option>
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="803 111 2233"
                      value={formData.senderPhone}
                      onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Sender Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="seun@example.com"
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Pickup Location
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    State / Region <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.pickupState}
                    onChange={(e) => setFormData({ ...formData, pickupState: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="FCT Abuja">FCT Abuja</option>
                    <option value="Rivers">Rivers (Port Harcourt)</option>
                    <option value="Oyo">Oyo (Ibadan)</option>
                    <option value="Kano">Kano</option>
                    <option value="Enugu">Enugu</option>
                    <option value="Delta">Delta</option>
                    <option value="Ogun">Ogun</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    City / Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikeja, Yaba, Surulere"
                    value={formData.pickupCity}
                    onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House number, Street name, Estate / Compound"
                    value={formData.pickupStreet}
                    onChange={(e) => setFormData({ ...formData, pickupStreet: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Nearest Landmark (Helps courier locate you)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Alade Market / Behind First Bank"
                    value={formData.pickupLandmark}
                    onChange={(e) => setFormData({ ...formData, pickupLandmark: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Pickup Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {!isOperatingDay(formData.pickupDate) && (
                    <p className="text-[11px] text-amber-600 mt-1">
                      Sunday is reserved for fleet maintenance. Please pick Mon-Sat.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Preferred Time Slot (Africa/Lagos) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.pickupTimeSlot}
                    onChange={(e) => setFormData({ ...formData, pickupTimeSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="08:00 - 10:00">Morning (08:00 - 10:00)</option>
                    <option value="10:00 - 12:00">Mid-Day (10:00 - 12:00)</option>
                    <option value="12:00 - 14:00">Afternoon (12:00 - 14:00)</option>
                    <option value="14:00 - 16:00">Late Afternoon (14:00 - 16:00)</option>
                    <option value="16:00 - 18:00">Evening (16:00 - 18:00)</option>
                    <option value="18:00 - 21:00">Night Shift (18:00 - 21:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Receiver & Delivery */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Step 2: Receiver & Delivery Destination
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Who will receive this package.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Receiver Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Kunle Adewale"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Receiver Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.receiverCountryCode}
                      onChange={(e) => setFormData({ ...formData, receiverCountryCode: e.target.value })}
                      className="px-2.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono"
                    >
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+233">🇬🇭 +233</option>
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="811 234 5678"
                      value={formData.receiverPhone}
                      onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Receiver Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="receiver@example.com"
                    value={formData.receiverEmail}
                    onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Destination Address
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Destination State / Region <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.deliveryState}
                    onChange={(e) => setFormData({ ...formData, deliveryState: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="FCT Abuja">FCT Abuja</option>
                    <option value="Rivers">Rivers (Port Harcourt)</option>
                    <option value="Oyo">Oyo (Ibadan)</option>
                    <option value="Kano">Kano</option>
                    <option value="Enugu">Enugu</option>
                    <option value="Delta">Delta</option>
                    <option value="Ogun">Ogun</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Destination City / Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victoria Island, Lekki Phase 1, Garki"
                    value={formData.deliveryCity}
                    onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House / Office number, Street name, Floor or Suite"
                    value={formData.deliveryStreet}
                    onChange={(e) => setFormData({ ...formData, deliveryStreet: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Delivery Landmark / Security Gate Info
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Beside Zenith Bank Tower / Call from estate gate"
                    value={formData.deliveryLandmark}
                    onChange={(e) => setFormData({ ...formData, deliveryLandmark: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Item Details & Who Pays */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Step 3: Item Details & Payment Designation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Accurate item descriptions ensure correct pricing and vehicle assignment.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Item Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. 2 cartons of clothing samples, or signed tender contract in envelope"
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Item Category
                    </label>
                    <select
                      value={formData.itemType}
                      onChange={(e) => setFormData({ ...formData, itemType: e.target.value as ItemType })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="parcel">Standard Parcel</option>
                      <option value="documents">Documents / Envelopes</option>
                      <option value="fragile">Fragile / Glassware</option>
                      <option value="food">Food & Pastries</option>
                      <option value="clothing">Fashion / Garments</option>
                      <option value="electronics">Electronics / Devices</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Approx. Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="100"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Approx. Package Size
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value as ItemSize })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="small">Small (Fits in motorcycle pouch)</option>
                      <option value="medium">Medium (Shoebox / handbag size)</option>
                      <option value="large">Large (Carton / heavy parcel)</option>
                      <option value="extra_large">Extra Large (Requires van/car)</option>
                    </select>
                  </div>
                </div>

                {/* Who Pays selection */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Who will pay the delivery fee? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, whoPays: 'sender' })}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                        formData.whoPays === 'sender'
                          ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${formData.whoPays === 'sender' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                        {formData.whoPays === 'sender' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      <div>
                        <p className="text-xs font-bold">Sender Pays</p>
                        <p className="text-[11px] text-slate-500">I (the sender) will receive the quote link and pay online.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, whoPays: 'receiver' })}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                        formData.whoPays === 'receiver'
                          ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${formData.whoPays === 'receiver' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                        {formData.whoPays === 'receiver' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      <div>
                        <p className="text-xs font-bold">Receiver Pays</p>
                        <p className="text-[11px] text-slate-500">Quote link will be forwarded to the receiver to pay.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Express toggle */}
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Priority Express Dispatch</p>
                      <p className="text-[11px] text-slate-600">Immediate direct dispatch with top priority vehicle assignment.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isExpress}
                    onChange={(e) => setFormData({ ...formData, isExpress: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </div>

                {/* Photos upload (mock up to 3) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Package Photos (Optional, up to 3, max 5MB each)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {formData.photos.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-300">
                        <img src={src} alt={`Package preview ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {formData.photos.length < 3 && (
                      <label className="w-20 h-20 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-slate-50 text-slate-500 transition-colors">
                        <Upload className="w-4 h-4 mb-1" />
                        <span className="text-[10px]">Add photo</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Special Handling Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fragile glassware, keep upright, call receiver before arriving"
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Legal declaration */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.declarationConfirmed}
                      onChange={(e) => setFormData({ ...formData, declarationConfirmed: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded mt-0.5 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      I confirm this package contains legal items and does not include narcotics, weapons, hazardous chemicals, or items on the{' '}
                      <Link to="/terms" target="_blank" className="text-emerald-700 font-semibold underline">
                        prohibited carriage list
                      </Link>
                      . <span className="text-rose-500">*</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Step 4: Review & Confirm Submission
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Please review your delivery details before final submission.</p>
              </div>

              {/* Review Cards */}
              <div className="space-y-4 text-xs">
                {/* Pickup Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Pickup Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-emerald-700 font-semibold underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Sender</span>
                      <strong className="text-slate-900">{formData.senderName}</strong> ({formData.senderCountryCode} {formData.senderPhone})
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Date & Time</span>
                      <span>{formData.pickupDate} ({formData.pickupTimeSlot})</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Pickup Address</span>
                      <span>{formData.pickupStreet}, {formData.pickupCity}, {formData.pickupState}</span>
                      {formData.pickupLandmark && <span className="block text-slate-500 text-[11px]">Landmark: {formData.pickupLandmark}</span>}
                    </div>
                  </div>
                </div>

                {/* Delivery Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Destination Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-emerald-700 font-semibold underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Recipient</span>
                      <strong className="text-slate-900">{formData.receiverName}</strong> ({formData.receiverCountryCode} {formData.receiverPhone})
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Designated Payer</span>
                      <span className="capitalize font-semibold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                        {formData.whoPays}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Delivery Address</span>
                      <span>{formData.deliveryStreet}, {formData.deliveryCity}, {formData.deliveryState}</span>
                      {formData.deliveryLandmark && <span className="block text-slate-500 text-[11px]">Landmark: {formData.deliveryLandmark}</span>}
                    </div>
                  </div>
                </div>

                {/* Package Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-emerald-600" /> Package Specifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-emerald-700 font-semibold underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Description</span>
                      <span className="font-medium text-slate-900">{formData.itemDescription}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Category & Size</span>
                      <span className="capitalize">{formData.itemType} · {formData.size.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Weight & Priority</span>
                      <span>{formData.weightKg} kg {formData.isExpress ? '· Express Priority' : '· Standard'}</span>
                    </div>
                  </div>
                </div>

                {/* Terms Consent */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded mt-0.5 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-800 leading-relaxed">
                      I agree to the <Link to="/terms" target="_blank" className="text-emerald-700 font-bold underline">SDS Terms of Carriage</Link>. I understand that a private quote link will be generated and messaged to the payer on WhatsApp, and courier dispatch occurs upon verified payment.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !formData.termsAccepted}
                onClick={handleSubmit}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Request...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Delivery Request</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
