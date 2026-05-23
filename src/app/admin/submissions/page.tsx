'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface FormSubmission {
  timestamp: string;
  type?: string;
  name?: string;
  email?: string;
  company?: string;
  vendorType?: string;
  sponsorshipLevel?: string;
  organizationType?: string;
  wantInvoice?: boolean;
  event?: string;
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
  { value: 'newsletter', label: 'Newsletter Signups' },
  { value: 'community-member', label: 'Community Members' },
];

export default function SubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const controller = new AbortController();
      loadSubmissions(controller.signal);
      return () => controller.abort();
    }
  }, [authLoading, isAuthenticated, selectedType]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const loadSubmissions = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const url = selectedType 
        ? `/api/admin/submissions?type=${selectedType}&limit=100`
        : '/api/admin/submissions?limit=100';
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        signal,
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
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
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

  const handleDelete = async () => {
    if (!selectedSubmission) return;
    
    // Validate timestamp is present (required for lookup)
    if (!selectedSubmission.timestamp) {
      setError('Timestamp is required for deletion');
      return;
    }
    
    setDeleting(true);
    setError('');
    
    try {
      const dbId = selectedSubmission._dbId;
      if (!dbId) {
        setError('Cannot delete: submission is missing a database ID. It may be from a legacy backup.');
        setDeleting(false);
        setDeleteConfirm(false);
        return;
      }
      const response = await fetch(
        `/api/admin/submissions?id=${encodeURIComponent(dbId)}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        setDeleting(false);
        setDeleteConfirm(false);
        window.location.href = '/admin';
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSelectedSubmission(null);
        setDeleteConfirm(false);
        
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        setSuccessMessage('Submission deleted successfully');
        successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 3000);
        
        await loadSubmissions();
      } else {
        setError(data.error || 'Failed to delete submission');
      }
    } catch (error) {
      console.error('Failed to delete submission:', error);
      setError('Failed to delete submission. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeLabel = (type?: string) => {
    const found = typeFilters.find(f => f.value === type);
    return found?.label || type || 'Unknown';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') window.location.href = '/admin';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading submissions...</div>
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

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

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
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#760088] text-gray-900 bg-white"
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
              key={`${submission.timestamp}-${submission.email || 'no-email'}-${index}`}
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
                  <p className="font-medium text-gray-900">{getTypeLabel(selectedSubmission.type)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Submitted</label>
                  <p className="font-medium text-gray-900">{formatDate(selectedSubmission.timestamp)}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                {Object.entries(selectedSubmission)
                  .filter(([key]) => !['timestamp', 'type', 'error', 'source', 'crmSuccess'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="mb-3">
                      <label className="text-xs text-gray-500 uppercase">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="font-medium text-gray-900">
                        {typeof value === 'boolean' 
                          ? (value ? 'Yes' : 'No')
                          : (value === null || value === undefined || value === '' 
                            ? 'N/A' 
                            : String(value))}
                      </p>
                    </div>
                  ))}
              </div>

              {selectedSubmission.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                  <label className="text-xs text-red-600 uppercase">CRM Error</label>
                  <p className="text-sm text-red-700 mt-1">{selectedSubmission.error}</p>
                </div>
              )}

              {/* Raw Data */}
              <div className="border-t pt-3">
                <label className="text-xs text-gray-500 uppercase">All Data</label>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60 text-gray-900">
                  {JSON.stringify(selectedSubmission, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Delete
              </button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-red-600 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this submission from{' '}
              <strong>{selectedSubmission.name || selectedSubmission.email || 'Unknown'}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. The submission will be permanently removed from the database.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
