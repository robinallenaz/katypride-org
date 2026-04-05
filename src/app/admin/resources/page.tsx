'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Resource {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
}

const categories = [
  'Crisis Support',
  'Family Support',
  'Community Services',
  'Advocacy',
  'Legal Support',
  'Healthcare',
  'Youth Services',
  'Education',
];

export default function ResourcesAdmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadResources();
    }
  }, [authLoading, isAuthenticated]);

  const loadResources = async () => {
    try {
      const response = await fetch('/api/admin/resources', {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }
      const data = await response.json();
      setResources(data.resources || []);
      setError('');
    } catch (error) {
      console.error('Failed to load resources:', error);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (resource: Resource) => {
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(resource),
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setMessage(resource.id ? 'Resource updated!' : 'Resource created!');
        setEditingResource(null);
        setIsCreating(false);
        loadResources();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving resource');
      }
    } catch (error) {
      setMessage('Error saving resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/admin/resources?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setMessage('Resource deleted!');
        loadResources();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error deleting resource');
    }
  };

  if (authLoading || loading) {
    return <div className="p-8">Loading resources...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-[#760088]">Resources</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-[#760088] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors"
        >
          + Add Resource
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {(isCreating || editingResource) && (
        <ResourceForm
          resource={editingResource}
          onSave={handleSave}
          onCancel={() => {
            setEditingResource(null);
            setIsCreating(false);
          }}
        />
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">URL</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{resource.title}</div>
                  <div className="text-sm text-gray-500">{resource.description}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {resource.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <a href={resource.url} target="_blank" rel="noopener" className="text-[#760088] hover:underline truncate max-w-xs inline-block">
                    {resource.url}
                  </a>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditingResource(resource)}
                    className="text-[#760088] hover:text-[#5a0666] font-medium text-sm mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {resources.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No resources yet. Click "Add Resource" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceForm({ resource, onSave, onCancel }: { resource: Resource | null; onSave: (r: Resource) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Resource>(
    resource || {
      id: '',
      title: '',
      url: '',
      category: 'Community Services',
      description: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: formData.id || Date.now().toString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="font-heading text-lg font-bold text-gray-900">
        {resource ? 'Edit Resource' : 'Create Resource'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="Organization name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
          <input
            type="url"
            required
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="Brief description of the organization"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="bg-[#760088] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors"
        >
          Save Resource
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
