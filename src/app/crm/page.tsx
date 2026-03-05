'use client';

import { useState, useEffect } from 'react';
import CRMDashboard from '@/components/CRMDashboard';
import Link from 'next/link';

export default function CRMPage() {
  // Store token in sessionStorage — never in the URL where it leaks via
  // browser history, referrer headers, and server access logs.
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('crm_token');
    if (stored) {
      setToken(stored);
      setReady(true);
    }
  }, []);

  return (
    <div>
      {/* Navigation */}
      <nav className="bg-purple-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Katy Pride
          </Link>
          <div className="flex space-x-6">
            <Link href="/" className="hover:text-purple-200">Home</Link>
            <Link href="/crm" className="text-purple-200">CRM Dashboard</Link>
            <Link href="/admin-guide" className="hover:text-purple-200">Admin Guide</Link>
          </div>
        </div>
      </nav>

      {/* Prompt for token if not yet authenticated */}
      {!ready ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <form
            className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sessionStorage.setItem('crm_token', input.trim());
                setToken(input.trim());
                setReady(true);
              }
            }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">CRM Access</h2>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Token
            </label>
            <input
              id="token"
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-gray-900 bg-white"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      ) : (
        <CRMDashboard token={token} />
      )}
    </div>
  );
}
