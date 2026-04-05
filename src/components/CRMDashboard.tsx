'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface RecentContact {
  id: string;
  name: string;
  email: string;
  tags: string[];
  dateAdded: string;
  company?: string;
}

interface CRMStats {
  totalContacts: number;
  totalVolunteers: number;
  totalDonors: number;
  totalVendors: number;
  totalCommunityMembers: number;
  recentContacts: RecentContact[];
}

interface CRMDashboardProps {
  token?: string;
}

const CRMDashboard: React.FC<CRMDashboardProps> = ({ token }) => {
  const [stats, setStats] = useState<CRMStats>({
    totalContacts: 0,
    totalVolunteers: 0,
    totalDonors: 0,
    totalVendors: 0,
    totalCommunityMembers: 0,
    recentContacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Re-fetch when token changes (e.g. after sessionStorage hydration)
  const fetchCRMData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/crm', { headers });
      if (!response.ok) throw new Error('Failed to fetch CRM data');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCRMData();
  }, [fetchCRMData]);

  const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({
    title, value, icon, color,
  }) => (
    <div className={`${color} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  const getTagBadge = (tag: string) => {
    const colors: Record<string, string> = {
      volunteer: 'bg-green-100 text-green-800',
      donor: 'bg-purple-100 text-purple-800',
      vendor: 'bg-purple-100 text-purple-800',
      'community-member': 'bg-pink-100 text-pink-800',
    };
    const match = Object.keys(colors).find((key) => tag.includes(key));
    return match ? colors[match] : 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    setDeletingId(contactId);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`/api/crm?id=${contactId}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) throw new Error('Failed to delete contact');
      
      // Refresh the data
      await fetchCRMData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium text-lg">Error loading CRM data</p>
          <p className="text-gray-600 mt-2 text-sm">{error}</p>
          <button
            onClick={fetchCRMData}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600 mt-1">GrowthSphere360 contacts overview for Katy Pride</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Contacts" value={stats.totalContacts} icon="👥" color="bg-blue-600" />
          <StatCard title="Volunteers" value={stats.totalVolunteers} icon="🤝" color="bg-green-600" />
          <StatCard title="Donors" value={stats.totalDonors} icon="💝" color="bg-purple-600" />
          <StatCard title="Vendors" value={stats.totalVendors} icon="📋" color="bg-purple-600" />
          <StatCard title="Community" value={stats.totalCommunityMembers} icon="🏳️‍🌈" color="bg-pink-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Contacts */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Contacts</h2>
            {stats.recentContacts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-gray-600 font-medium">Name</th>
                      <th className="text-left py-3 px-2 text-gray-600 font-medium hidden md:table-cell">Email</th>
                      <th className="text-left py-3 px-2 text-gray-600 font-medium">Tags</th>
                      <th className="text-left py-3 px-2 text-gray-600 font-medium hidden md:table-cell">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentContacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <p className="font-medium text-gray-900">{contact.name || 'Unknown'}</p>
                          {contact.company && (
                            <p className="text-xs text-gray-500">{contact.company}</p>
                          )}
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden md:table-cell">{contact.email}</td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${getTagBadge(tag)}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-500 text-xs hidden md:table-cell">
                          {formatDate(contact.dateAdded)}
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => handleDelete(contact.id)}
                            disabled={deletingId === contact.id}
                            className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                          >
                            {deletingId === contact.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No contacts yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="https://app.growthsphere360.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <span className="text-xl">�</span>
                  <div>
                    <p className="font-medium">Open GrowthSphere360</p>
                    <p className="text-xs text-purple-600">Full CRM dashboard</p>
                  </div>
                </a>

                <a
                  href="/vendor-signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <span className="text-xl">�</span>
                  <div>
                    <p className="font-medium">Vendor Signup Form</p>
                    <p className="text-xs text-orange-600">Chase the Rainbow 5K</p>
                  </div>
                </a>

                <a
                  href="/volunteer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-xl">🤝</span>
                  <div>
                    <p className="font-medium">Volunteer Form</p>
                    <p className="text-xs text-green-600">Share with potential volunteers</p>
                  </div>
                </a>

                <a
                  href="/donate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-xl">�</span>
                  <div>
                    <p className="font-medium">Donor Form</p>
                    <p className="text-xs text-blue-600">Share with potential donors</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchCRMData}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
