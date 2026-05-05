'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type {
  CoffeeMeetupConfig,
  CoffeeMeetupSpecificDate,
} from '@/lib/coffee-meetup-config';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const EMPTY_DATE: CoffeeMeetupSpecificDate = {
  date: '',
  title: '',
  location: '',
  timeOverride: null,
  notes: '',
};

export default function CoffeeMeetupAdmin() {
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders, token } = useAdminAuth();
  const [config, setConfig] = useState<CoffeeMeetupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/admin/coffee-meetup', { headers });
      if (res.status === 401) {
        window.location.href = '/admin';
        return;
      }
      const data = await res.json();
      if (data?.success && data.config) {
        setConfig(data.config);
      } else {
        setMessage({ type: 'error', text: data?.error || 'Failed to load config' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load config' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      window.location.href = '/admin';
      return;
    }
    void loadConfig();
  }, [authLoading, isAuthenticated, loadConfig]);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/coffee-meetup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setMessage({ type: 'success', text: 'Coffee meetup settings saved!' });
        if (data.config) setConfig(data.config);
      } else {
        setMessage({ type: 'error', text: data?.error || 'Failed to save' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error while saving' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }

  function update<K extends keyof CoffeeMeetupConfig>(key: K, value: CoffeeMeetupConfig[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function toggleSkipMonth(month: number) {
    if (!config) return;
    const next = config.skipMonths.includes(month)
      ? config.skipMonths.filter((m) => m !== month)
      : [...config.skipMonths, month].sort((a, b) => a - b);
    update('skipMonths', next);
  }

  function updateSpecificDate(index: number, patch: Partial<CoffeeMeetupSpecificDate>) {
    if (!config) return;
    const next = config.specificDates.map((d, i) => (i === index ? { ...d, ...patch } : d));
    update('specificDates', next);
  }

  function addSpecificDate() {
    if (!config) return;
    update('specificDates', [...config.specificDates, { ...EMPTY_DATE }]);
  }

  function removeSpecificDate(index: number) {
    if (!config) return;
    update('specificDates', config.specificDates.filter((_, i) => i !== index));
  }

  function sortSpecificDates() {
    if (!config) return;
    const sorted = [...config.specificDates].sort((a, b) => a.date.localeCompare(b.date));
    update('specificDates', sorted);
  }

  if (authLoading || loading) {
    return <div className="p-8">Loading coffee meetup settings...</div>;
  }

  if (!config) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-red-700">Could not load coffee meetup configuration.</p>
        <button
          onClick={loadConfig}
          className="bg-[#760088] text-white px-4 py-2 rounded-lg font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-[#760088]">Coffee Meetup Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#760088] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h3 className="font-heading text-lg font-bold text-gray-900">General</h3>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => update('enabled', e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-800">
            <strong>Enabled</strong> — show the recurring coffee meetup on the events page
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={config.manualOverride}
            onChange={(e) => update('manualOverride', e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-800">
            <strong>Manual override</strong> — prefer the specific dates list below over the
            auto-calculated 2nd Friday. If no upcoming specific date is configured, the schedule
            falls back to the next 2nd Friday automatically.
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              value={config.image}
              onChange={(e) => update('image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="/espresso-yourself-new-graphic.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Time (HH:MM, 24h)</label>
            <input
              type="time"
              value={config.defaultTime}
              onChange={(e) => update('defaultTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Duration (hours)</label>
            <input
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={config.defaultDuration}
              onChange={(e) => update('defaultDuration', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Location</label>
            <input
              type="text"
              value={config.defaultLocation}
              onChange={(e) => update('defaultLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="Coffee shop name and full address"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fallback location when no odd/even rule or specific date override applies.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Odd-Month Location</label>
            <input
              type="text"
              value={config.oddMonthLocation || ''}
              onChange={(e) => update('oddMonthLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="e.g. Coffee Fellows, 3329 W Grand Pkwy N #700, Katy, TX 77449"
            />
            <p className="text-xs text-gray-500 mt-1">Jan, Mar, May, Jul, Sep, Nov</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Even-Month Location</label>
            <input
              type="text"
              value={config.evenMonthLocation || ''}
              onChange={(e) => update('evenMonthLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="e.g. Buzz and Bites, 123 Main St, Katy, TX"
            />
            <p className="text-xs text-gray-500 mt-1">Feb, Apr, Jun, Aug, Oct, Dec</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h3 className="font-heading text-lg font-bold text-gray-900">Skip Months (auto mode only)</h3>
        <p className="text-sm text-gray-600">
          When manual override is off, the meetup falls on the 2nd Friday of each month.
          Check any months you want to skip.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {MONTHS.map((m) => {
            const checked = config.skipMonths.includes(m.value);
            return (
              <label
                key={m.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                  checked ? 'bg-purple-50 border-[#760088]' : 'bg-white border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSkipMonth(m.value)}
                  className="h-4 w-4"
                />
                {m.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading text-lg font-bold text-gray-900">Specific Dates</h3>
          <div className="flex gap-2">
            <button
              onClick={sortSpecificDates}
              type="button"
              className="text-sm text-[#760088] hover:text-[#5a0666] font-medium"
            >
              Sort by date
            </button>
            <button
              onClick={addSpecificDate}
              type="button"
              className="bg-[#760088] text-white px-3 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#5a0666]"
            >
              + Add Date
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Override the automatic 2nd-Friday schedule with specific dates. These take effect when
          <strong> Manual override</strong> is checked above. Each date can override the title,
          location, and time for that single meetup.
        </p>

        {config.specificDates.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No specific dates configured yet.</div>
        ) : (
          <div className="space-y-4">
            {config.specificDates.map((entry, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateSpecificDate(idx, { date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Time Override (optional)
                  </label>
                  <input
                    type="time"
                    value={entry.timeOverride || ''}
                    onChange={(e) =>
                      updateSpecificDate(idx, {
                        timeOverride: e.target.value ? e.target.value : null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title (optional — uses default if blank)
                  </label>
                  <input
                    type="text"
                    value={entry.title || ''}
                    onChange={(e) => updateSpecificDate(idx, { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder={config.title}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Location (optional — uses default if blank)
                  </label>
                  <input
                    type="text"
                    value={entry.location || ''}
                    onChange={(e) => updateSpecificDate(idx, { location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder={config.defaultLocation}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes (admin-only, not shown publicly)
                  </label>
                  <input
                    type="text"
                    value={entry.notes || ''}
                    onChange={(e) => updateSpecificDate(idx, { notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="e.g. Pride month special location"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeSpecificDate(idx)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#760088] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
