'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(event),
      });

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
        setMessage('Error saving event');
      }
    } catch (error) {
      setMessage('Error saving event');
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

      {(isCreating || editingEvent) && (
        <EventForm
          event={editingEvent}
          onSave={handleSave}
          onCancel={() => {
            setEditingEvent(null);
            setIsCreating(false);
          }}
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

function EventForm({ event, onSave, onCancel }: { event: Event | null; onSave: (e: Event) => void; onCancel: () => void }) {
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

  // Convert local datetime string to ISO string preserving local time
  const localDateTimeToISO = (localDateTime: string): string => {
    if (!localDateTime) return '';
    // localDateTime is in format "YYYY-MM-DDTHH:mm" from datetime-local input
    // Append seconds and timezone offset to preserve local time
    const offset = new Date().getTimezoneOffset();
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
      id: formData.id || Date.now().toString(),
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="Event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={formData.eventCategory}
            onChange={(e) => setFormData({ ...formData, eventCategory: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time (optional)</label>
          <input
            type="datetime-local"
            value={formData.end?.slice(0, 16) || ''}
            onChange={(e) => setFormData({ ...formData, end: e.target.value ? localDateTimeToISO(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="Event location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            value={formData.imageSrc || ''}
            onChange={(e) => setFormData({ ...formData, imageSrc: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="/path/to/image.jpg or https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
          <input
            type="text"
            value={formData.imageAlt || ''}
            onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="Description of image for accessibility"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">External URL (optional)</label>
          <input
            type="text"
            value={formData.externalUrl || ''}
            onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="https://example.com/event"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button Label (optional)</label>
          <input
            type="text"
            value={formData.externalCtaLabel || ''}
            onChange={(e) => setFormData({ ...formData, externalCtaLabel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="Register, Learn More, etc."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description/Summary</label>
          <textarea
            value={formData.summary || ''}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
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
