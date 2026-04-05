'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface CarouselImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export default function CarouselAdmin() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadImages();
    }
  }, [authLoading, isAuthenticated]);

  const loadImages = async () => {
    try {
      const response = await fetch('/api/admin/carousel', {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }
      const data = await response.json();
      setImages(data.images || []);
      setError('');
    } catch (error) {
      console.error('Failed to load carousel:', error);
      setError('Failed to load carousel images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (image: CarouselImage) => {
    try {
      const response = await fetch('/api/admin/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(image),
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setMessage(image.id ? 'Image updated!' : 'Image added!');
        setEditingImage(null);
        setIsCreating(false);
        loadImages();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving image');
      }
    } catch (error) {
      setMessage('Error saving image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/admin/carousel?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setMessage('Image deleted!');
        loadImages();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error deleting image');
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    try {
      const response = await fetch('/api/admin/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ images: newImages }),
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setImages(newImages);
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
    }
  };

  if (authLoading || loading) {
    return <div className="p-8">Loading carousel...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-[#760088]">Carousel Images</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-[#760088] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors"
        >
          + Add Image
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {(isCreating || editingImage) && (
        <ImageForm
          image={editingImage}
          onSave={handleSave}
          onCancel={() => {
            setEditingImage(null);
            setIsCreating(false);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={image.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {image.url && (image.url.startsWith('/') || image.url.startsWith('http://') || image.url.startsWith('https://')) ? (
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Invalid image URL
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="font-medium text-gray-900 truncate">{image.alt}</p>
              {image.caption && (
                <p className="text-sm text-gray-500 mt-1 truncate">{image.caption}</p>
              )}
              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-[#760088] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1 text-gray-600 hover:text-[#760088] disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingImage(image)}
                    className="text-[#760088] hover:text-[#5a0666] font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl">
          No images yet. Click "Add Image" to add carousel images.
        </div>
      )}
    </div>
  );
}

function ImageForm({ image, onSave, onCancel }: { image: CarouselImage | null; onSave: (i: CarouselImage) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<CarouselImage>(
    image || {
      id: '',
      url: '',
      alt: '',
      caption: '',
    }
  );

  // Validate URL to prevent XSS (javascript: protocol, etc.)
  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    // Allow relative paths starting with /
    if (url.startsWith('/')) return true;
    // Allow http/https URLs only
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
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
        {image ? 'Edit Image' : 'Add Image'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
          <input
            type="text"
            required
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="/carousel/image.jpg or https://..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Use relative path (e.g., /carousel/photo.jpg) for local images or full URL for external images
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text *</label>
          <input
            type="text"
            required
            value={formData.alt}
            onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="Description for accessibility"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
          <input
            type="text"
            value={formData.caption || ''}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent"
            placeholder="Caption to display below image"
          />
        </div>

        {formData.url && isValidImageUrl(formData.url) && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img
              src={formData.url}
              alt={formData.alt}
              className="max-h-40 rounded-lg"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
        {formData.url && !isValidImageUrl(formData.url) && (
          <div className="border rounded-lg p-4 bg-red-50">
            <p className="text-sm font-medium text-red-700">
              Invalid URL. Please use a relative path (starting with /) or a valid http/https URL.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="bg-[#760088] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#5a0666] transition-colors"
        >
          Save Image
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
