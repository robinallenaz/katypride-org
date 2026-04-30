'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, login, isLoading } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate email domain
    if (!email.endsWith('@katypride.org')) {
      setError('Please use a @katypride.org email address');
      setIsSubmitting(false);
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      window.location.reload();
    } else {
      setError('Invalid email or password');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/events"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">📅</div>
          <h2 className="font-heading text-xl font-bold text-[#760088] mb-2">Events</h2>
          <p className="text-gray-600 text-sm">Manage upcoming events and community gatherings</p>
        </a>

        <a
          href="/admin/coffee-meetup"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">☕</div>
          <h2 className="font-heading text-xl font-bold text-[#760088] mb-2">Coffee Meetup</h2>
          <p className="text-gray-600 text-sm">Configure recurring coffee meetup dates, locations, and schedule</p>
        </a>

        <a
          href="/admin/resources"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">🔗</div>
          <h2 className="font-heading text-xl font-bold text-[#760088] mb-2">Resources</h2>
          <p className="text-gray-600 text-sm">Update resource links and community organizations</p>
        </a>

        <a
          href="/admin/carousel"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">🖼️</div>
          <h2 className="font-heading text-xl font-bold text-[#760088] mb-2">Carousel</h2>
          <p className="text-gray-600 text-sm">Manage homepage carousel images</p>
        </a>

        <a
          href="/admin/submissions"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">📋</div>
          <h2 className="font-heading text-xl font-bold text-[#760088] mb-2">Form Submissions</h2>
          <p className="text-gray-600 text-sm">View vendor, sponsor, and volunteer form submissions</p>
        </a>

        <a
          href="/admin/site-images"
          className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">🖼️</div>
          <h2 className="font-heading text-xl font-bold text-[#760088] mb-2">Site Images</h2>
          <p className="text-gray-600 text-sm">Manage images used across the website (About page, hero images, etc.)</p>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🌈</div>
          <h1 className="font-heading text-2xl font-bold text-[#760088]">Katy Pride Admin</h1>
          <p className="text-gray-600 mt-2">Enter your @katypride.org email and password to log in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent placeholder:text-gray-500 text-gray-900"
              placeholder="yourname@katypride.org"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent placeholder:text-gray-500 text-gray-900"
              placeholder="Enter admin password"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#760088] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
