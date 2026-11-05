import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bike,
  Shield,
  ArrowRight,
  Mail,
  Lock,
  Building,
  UserCheck,
  Package,
  Phone,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { AuthService } from '../services/mock';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';
import { buildWhatsAppLink } from '../lib/utils';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'rider' | 'admin' | 'register'>('rider');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Corporate Registration state
  const [regForm, setRegForm] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
    monthlyVolume: '10 - 50 deliveries',
  });
  const [regSubmitted, setRegSubmitted] = useState(false);

  const handleTabChange = (tab: 'rider' | 'admin' | 'register') => {
    setActiveTab(tab);
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await AuthService.login(email, password);
      if (activeTab === 'rider' && user.role === 'rider') {
        navigate('/rider');
      } else if (activeTab === 'admin' && user.role !== 'rider') {
        navigate('/admin');
      } else {
        await AuthService.logout();
        setErrorMsg(activeTab === 'rider'
          ? 'This account is set up for the operations console.'
          : 'This account is set up for the rider portal.');
      }
    } catch {
      setErrorMsg('Invalid login credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitted(true);
  };

  const whatsappInquiry = buildWhatsAppLink(
    DEFAULT_BUSINESS_SETTINGS.phone,
    `Hello SDS, I would like to register a corporate delivery account for ${regForm.businessName || 'my business'}.`
  );

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow">
              SDS
            </span>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Delivery<span className="text-emerald-600">.</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account & Dispatch Portal
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Sign in to your rider app, access operations console, or register your business for corporate dispatch.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => handleTabChange('rider')}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'rider'
                ? 'bg-white text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-4 h-4 text-emerald-600" />
            <span>Rider Sign In</span>
          </button>

          <button
            onClick={() => handleTabChange('admin')}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Staff Console</span>
          </button>

          <button
            onClick={() => handleTabChange('register')}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-blue-600" />
            <span>Register Business</span>
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {activeTab !== 'register' ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {activeTab === 'rider' ? 'Courier Dispatch Sign In' : 'Operations Management Sign In'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTab === 'rider'
                    ? 'Enter your rider credentials to view today’s jobs and submit signatures.'
                    : 'Access quote management, driver assignment, and logistics dispatch.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Account Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeTab === 'rider' ? 'rider.tunde@sdsdelivery.com' : 'admin@sdsdelivery.com'}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <a
                      href={whatsappInquiry}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline font-medium"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    activeTab === 'rider'
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                      : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to {activeTab === 'rider' ? 'Rider App' : 'Admin Console'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Fast switch accounts for testing */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                  Quick Access Profiles
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activeTab === 'rider' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('rider.tunde@sdsdelivery.com');
                          setPassword('password123');
                        }}
                        className="p-2 rounded-lg border border-slate-200 hover:border-emerald-500 text-left bg-slate-50 transition-colors"
                      >
                        <span className="font-bold text-slate-800 block">Tunde Bakare</span>
                        <span className="text-[10px] text-slate-500">Motorcycle Rider</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('chidi.rider@sdsdelivery.com');
                          setPassword('password123');
                        }}
                        className="p-2 rounded-lg border border-slate-200 hover:border-emerald-500 text-left bg-slate-50 transition-colors"
                      >
                        <span className="font-bold text-slate-800 block">Chidi Okonkwo</span>
                        <span className="text-[10px] text-slate-500">Van Logistics Rider</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin@sdsdelivery.com');
                          setPassword('adminpass');
                        }}
                        className="p-2 rounded-lg border border-slate-200 hover:border-amber-500 text-left bg-slate-50 transition-colors"
                      >
                        <span className="font-bold text-slate-800 block">Owner / Lead</span>
                        <span className="text-[10px] text-slate-500">Full Access Role</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('manager@sdsdelivery.com');
                          setPassword('managerpass');
                        }}
                        className="p-2 rounded-lg border border-slate-200 hover:border-amber-500 text-left bg-slate-50 transition-colors"
                      >
                        <span className="font-bold text-slate-800 block">Dispatch Manager</span>
                        <span className="text-[10px] text-slate-500">Quotes & Assign Only</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Corporate Registration Form */
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Corporate & Partner Registration</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register your business for regular freight dispatches, priority courier routing, and bulk invoicing.
                </p>
              </div>

              {regSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950">Registration Request Received</h3>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="text-emerald-950">{regForm.contactName}</strong>. Our business dispatch team will review your account details and connect with you on WhatsApp within 2 hours.
                  </p>
                  <div className="pt-2">
                    <a
                      href={whatsappInquiry}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors"
                    >
                      <span>Connect Instantly on WhatsApp</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Business or Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.businessName}
                      onChange={(e) => setRegForm({ ...regForm, businessName: e.target.value })}
                      placeholder="e.g. Apex Traders Ltd."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Contact Person <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regForm.contactName}
                        onChange={(e) => setRegForm({ ...regForm, contactName: e.target.value })}
                        placeholder="e.g. Bola Adeleke"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Phone / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="080... or +234..."
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Work Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="operations@company.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Estimated Monthly Volume
                    </label>
                    <select
                      value={regForm.monthlyVolume}
                      onChange={(e) => setRegForm({ ...regForm, monthlyVolume: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="1 - 10 deliveries">1 - 10 deliveries / month</option>
                      <option value="10 - 50 deliveries">10 - 50 deliveries / month</option>
                      <option value="50 - 200 deliveries">50 - 200 deliveries / month</option>
                      <option value="200+ deliveries">200+ deliveries / month (Dedicated fleet)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Submit Partner Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Guest Booking Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sending a one-off parcel?</h3>
              <p className="text-xs text-slate-500">No account required. Submit a request and receive a instant quote.</p>
            </div>
          </div>
          <Link
            to="/request"
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors text-center whitespace-nowrap"
          >
            Request Delivery Now
          </Link>
        </div>
      </div>
    </div>
  );
};
