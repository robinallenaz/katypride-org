'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface FormSubmission {
  timestamp: string;
  type?: string;
  name?: string;
  email?: string;
  company?: string;
  vendorType?: string;
  sponsorshipLevel?: string;
  error?: string;
  source?: string;
  phone?: string;
  [key: string]: any;
}

const typeFilters = [
  { value: '', label: 'All Types' },
  { value: 'vendor', label: 'Vendor Applications' },
  { value: 'sponsor', label: 'Sponsor Applications' },
  { value: 'volunteer', label: 'Volunteer Signups' },
  { value: 'donor', label: 'Donor Signups' },
  { value: 'community-member', label: 'Community Members' },
];

export default function SubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadSubmissions();
    }
  }, [authLoading, isAuthenticated, selectedType]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const url = selectedType 
        ? `/api/admin/submissions?type=${selectedType}&limit=100`
        : '/api/admin/submissions?limit=100';
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSubmissions(data.submissions || []);
        setError('');
      } else {
        setError(data.error || 'Failed to load submissions');
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getTypeLabel = (type?: string) => {
    const found = typeFilters.find(f => f.value === type);
    return found?.label || type || 'Unknown';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#760088]">Form Submissions</h1>
        <button
          onClick={() => window.location.href = '/admin'}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Admin
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#760088]"
        >
          {typeFilters.map(filter => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Showing <strong>{submissions.length}</strong> submission{submissions.length !== 1 ? 's' : ''}
          {selectedType && ` of type "${getTypeLabel(selectedType)}"`}
        </p>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No submissions found.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSubmission(submission)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {getTypeLabel(submission.type)}
                    </span>
                    {submission.error && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        CRM Failed
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {submission.name || 'No name provided'}
                  </h3>
                  <p className="text-sm text-gray-600">{submission.email || 'No email'}</p>
                  {submission.company && (
                    <p className="text-sm text-gray-500">{submission.company}</p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {formatDate(submission.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#760088]">Submission Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Type</label>
                  <p className="font-medium">{getTypeLabel(selectedSubmission.type)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Submitted</label>
                  <p className="font-medium">{formatDate(selectedSubmission.timestamp)}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <label className="text-xs text-gray-500 uppercase">Name</label>
                <p className="font-medium">{selectedSubmission.name || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase">Email</label>
                <p className="font-medium">{selectedSubmission.email || 'N/A'}</p>
              </div>

              {selectedSubmission.phone && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">Phone</label>
                  <p className="font-medium">{selectedSubmission.phone}</p>
                </div>
              )}

              {selectedSubmission.company && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">Company</label>
                  <p className="font-medium">{selectedSubmission.company}</p>
                </div>
              )}

              {selectedSubmission.vendorType && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">Vendor Type</label>
                  <p className="font-medium">{selectedSubmission.vendorType}</p>
                </div>
              )}

              {selectedSubmission.sponsorshipLevel && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">Sponsorship Level</label>
                  <p className="font-medium">{selectedSubmission.sponsorshipLevel}</p>
                </div>
              )}

              {selectedSubmission.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <label className="text-xs text-red-600 uppercase">CRM Error</label>
                  <p className="text-sm text-red-700 mt-1">{selectedSubmission.error}</p>
                </div>
              )}

              {/* Raw Data */}
              <div className="border-t pt-3">
                <label className="text-xs text-gray-500 uppercase">All Data</label>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedSubmission, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
