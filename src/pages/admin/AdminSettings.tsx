import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, AlertCircle, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { SettingsService, AuthService } from '../../services/mock';
import { BusinessSettings } from '../../types';
import { DEFAULT_BUSINESS_SETTINGS } from '../../config/business';
import { formatNaira } from '../../lib/utils';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const currentUser = AuthService.getCurrentUser();
  const isOwner = currentUser?.role === 'owner';

  useEffect(() => {
    SettingsService.get().then((data) => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await SettingsService.update(settings);
      setSettings(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOwner) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600">Settings can only be configured by the Owner account.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Business & Fleet Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure default operational hours, surcharge presets, and WhatsApp dispatch templates.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings successfully updated across the platform!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Credentials Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Corporate Identity & Contact (PLACEHOLDER)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">CAC Registration No.</label>
              <input
                type="text"
                value={settings.cacNumber}
                onChange={(e) => setSettings({ ...settings, cacNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Call Hotline</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Dispatch Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Physical Hub Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Quote Defaults */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Operating Schedule & Validity Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Quote Validity Window (Hours)
              </label>
              <input
                type="number"
                min="24"
                max="72"
                value={settings.defaultQuoteValidityHours}
                onChange={(e) =>
                  setSettings({ ...settings, defaultQuoteValidityHours: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400">Must be between 24 and 72 hours</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preset Express Fee (NGN)
              </label>
              <input
                type="number"
                step="500"
                value={settings.baseExpressChargeKobo / 100}
                onChange={(e) =>
                  setSettings({ ...settings, baseExpressChargeKobo: Number(e.target.value) * 100 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preset Handling Fee (NGN)
              </label>
              <input
                type="number"
                step="250"
                value={settings.baseHandlingChargeKobo / 100}
                onChange={(e) =>
                  setSettings({ ...settings, baseHandlingChargeKobo: Number(e.target.value) * 100 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Sunday Fleet Maintenance Notice
              </label>
              <input
                type="text"
                value={settings.closedDayExplanation}
                onChange={(e) => setSettings({ ...settings, closedDayExplanation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Message Templates */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            WhatsApp Message Templates
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Customer Quote Message Template</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {'{customerName}'}, {'{orderCode}'}, {'{total}'}, {'{link}'}, {'{validUntil}'}
                </span>
              </div>
              <textarea
                rows={4}
                value={settings.quoteWhatsappTemplate}
                onChange={(e) => setSettings({ ...settings, quoteWhatsappTemplate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Courier Job Assignment Template</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {'{riderName}'}, {'{orderCode}'}, {'{pickupCity}'}, {'{deliveryCity}'}, {'{tripPay}'}, {'{link}'}
                </span>
              </div>
              <textarea
                rows={4}
                value={settings.riderWhatsappTemplate}
                onChange={(e) => setSettings({ ...settings, riderWhatsappTemplate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>
      </form>
    </div>
  );
};
