'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getFileValidationError } from '@/lib/validation';

interface Event {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  imageSrc?: string;
  imageAlt: string;
  eventCategory: string;
  externalUrl?: string;
  externalCtaLabel?: string;
  summary?: string;
}

const eventCategories = [
  { value: 'general', label: 'General' },
  { value: 'coffee', label: 'Coffee Meetups' },
  { value: 'social', label: 'Social' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'advocacy', label: 'Advocacy' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'youth', label: 'Youth' },
  { value: 'pride', label: 'Pride' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'community', label: 'Community' },
];

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadEvents();
    }
  }, [authLoading, isAuthenticated]);

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/admin/events', {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }
      const data = await response.json();
      setEvents(data.events || []);
      setError('');
    } catch (error) {
      console.error('Failed to load events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (event: Event) => {
    console.log('[Admin Events] Saving event:', event);
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(event),
      });
      console.log('[Admin Events] Response status:', response.status);

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setMessage(event.id ? 'Event updated!' : 'Event created!');
        setEditingEvent(null);
        setIsCreating(false);
        loadEvents();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Admin Events] Error response:', errorData);
        setMessage(`Error saving event: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('[Admin Events] Network error:', error);
      setMessage('Error saving event: Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setMessage('Event deleted!');
        loadEvents();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error deleting event');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return <div className="p-8">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-[#760088]">Events</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-[#760088] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors"
        >
          + Add Event
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg">
          {message}
        </div>
      )}

      {(isCreating || editingEvent) && (
        <EventForm
          event={editingEvent}
          onSave={handleSave}
          onCancel={() => {
            setEditingEvent(null);
            setIsCreating(false);
            setMessage('');
          }}
          getAuthHeaders={getAuthHeaders}
        />
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-500">{event.location}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(event.start)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {eventCategories.find(c => c.value === event.eventCategory)?.label || event.eventCategory}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="text-[#760088] hover:text-[#5a0666] font-medium text-sm mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No events yet. Click "Add Event" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

function EventForm({ event, onSave, onCancel, getAuthHeaders }: { event: Event | null; onSave: (e: Event) => void; onCancel: () => void; getAuthHeaders: () => Record<string, string> }) {
  const [formData, setFormData] = useState<Event>(
    event || {
      id: '',
      title: '',
      start: new Date().toISOString(),
      end: '',
      location: '',
      imageSrc: '',
      imageAlt: '',
      eventCategory: 'general',
      externalUrl: '',
      externalCtaLabel: '',
      summary: '',
    }
  );

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    const error = getFileValidationError(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading...');
    abortControllerRef.current = new AbortController();

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'katypride/events');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: uploadFormData,
        signal: abortControllerRef.current.signal,
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, imageSrc: data.url }));
        setUploadProgress('Upload complete!');
        setTimeout(() => setUploadProgress(''), 2000);
      } else {
        alert(data.error || 'Upload failed');
        setUploadProgress('');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      console.error('Upload error:', err);
      alert('Failed to upload image. Please try again.');
      setUploadProgress('');
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Convert local datetime string to ISO string preserving local time
  const localDateTimeToISO = (localDateTime: string): string => {
    if (!localDateTime) return '';
    // localDateTime is in format "YYYY-MM-DDTHH:mm" from datetime-local input
    // Calculate timezone offset for the specific date being entered (handles DST)
    const dateForOffset = new Date(localDateTime);
    const offset = dateForOffset.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset <= 0 ? '+' : '-';
    const offsetStr = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
    return `${localDateTime}:00${offsetStr}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      // Leave id empty for new events; the server will assign one via Postgres SERIAL.
      id: formData.id || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="font-heading text-lg font-bold text-gray-900">
        {event ? 'Edit Event' : 'Create Event'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="Event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={formData.eventCategory}
            onChange={(e) => setFormData({ ...formData, eventCategory: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
          >
            {eventCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date/Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.start.slice(0, 16)}
            onChange={(e) => setFormData({ ...formData, start: localDateTimeToISO(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time (optional)</label>
          <input
            type="datetime-local"
            value={formData.end?.slice(0, 16) || ''}
            onChange={(e) => setFormData({ ...formData, end: e.target.value ? localDateTimeToISO(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="Event location"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-[#760088] bg-purple-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="text-gray-600">
              <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M14 30.5V12a2 2 0 012-2h16a2 2 0 012 2v18.5M24 31V18m0 0l-5 5m5-5l5 5M10 36h28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium">
                {uploading ? uploadProgress : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, GIF up to 5MB</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 text-center mb-2">— OR enter URL manually —</p>
            <input
              type="text"
              value={formData.imageSrc || ''}
              onChange={(e) => setFormData({ ...formData, imageSrc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
              placeholder="/path/to/image.jpg or https://..."
            />
          </div>
          {formData.imageSrc && (
            <div className="border rounded-lg p-3 bg-gray-50 mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={formData.imageSrc}
                alt={formData.imageAlt || 'Event image preview'}
                className="max-h-32 rounded"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
          <input
            type="text"
            value={formData.imageAlt || ''}
            onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="Description of image for accessibility"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">External URL (optional)</label>
          <input
            type="text"
            value={formData.externalUrl || ''}
            onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="https://example.com/event"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button Label (optional)</label>
          <input
            type="text"
            value={formData.externalCtaLabel || ''}
            onChange={(e) => setFormData({ ...formData, externalCtaLabel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="Register, Learn More, etc."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description/Summary</label>
          <textarea
            value={formData.summary || ''}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="Brief description of the event"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="bg-[#760088] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors"
        >
          Save Event
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
