'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { CarouselImage } from '@/lib/data-service';
import { isValidImageUrl, getFileValidationError, generateUniqueId } from '@/lib/validation';

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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
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
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        setMessage(`Error: ${data.error || 'Failed to save image'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
      setTimeout(() => setMessage(''), 5000);
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
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        setMessage(`Error: ${data.error || 'Failed to delete image'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const originalImages = [...images];
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];

    // Optimistic update
    setImages(newImages);

    try {
      const response = await fetch('/api/admin/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ images: newImages }),
      });

      if (response.status === 401) {
        // Rollback on auth error
        setImages(originalImages);
        window.location.href = '/admin';
        return;
      }

      if (!response.ok) {
        // Rollback on server error
        setImages(originalImages);
        setMessage('Failed to reorder images. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      // Rollback on network error
      setImages(originalImages);
      setMessage('Network error. Changes reverted.');
      setTimeout(() => setMessage(''), 3000);
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
          getAuthHeaders={getAuthHeaders}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={image.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {image.url && (image.url.startsWith('/') || image.url.startsWith('https://')) ? (
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

function ImageForm({ image, onSave, onCancel, getAuthHeaders }: { image: CarouselImage | null; onSave: (i: CarouselImage) => void; onCancel: () => void; getAuthHeaders: () => Record<string, string> }) {
  const [formData, setFormData] = useState<CarouselImage>(
    image || {
      id: '',
      url: '',
      alt: '',
      caption: '',
    }
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset form data when image prop changes (prevents stale state)
  useEffect(() => {
    setFormData(image || {
      id: '',
      url: '',
      alt: '',
      caption: '',
    });
  }, [image?.id]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Use shared validation utility

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL before submission
    if (!formData.url || !isValidImageUrl(formData.url)) {
      alert('Please provide a valid image URL or upload an image.');
      return;
    }

    // Validate alt text
    if (!formData.alt || formData.alt.trim().length === 0) {
      alert('Please provide alt text for accessibility.');
      return;
    }

    // Generate unique ID to avoid collisions
    const newId = formData.id || generateUniqueId();

    onSave({
      ...formData,
      id: newId,
    });
  };

  const handleFileUpload = async (file: File) => {
    // Validate file using shared utility
    const error = getFileValidationError(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading...');

    // Create new abort controller for this upload
    abortControllerRef.current = new AbortController();

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'katypride/carousel');

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
        setFormData(prev => ({ ...prev, url: data.url, cloudinaryPublicId: data.publicId }));
        setUploadProgress('Upload complete!');
        setTimeout(() => setUploadProgress(''), 2000);
      } else {
        alert(data.error || 'Upload failed');
        setUploadProgress('');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Upload aborted');
        return;
      }
      console.error('Upload error:', error);
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="font-heading text-lg font-bold text-gray-900">
        {image ? 'Edit Image' : 'Add Image'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-[#760088] bg-purple-50'
                : 'border-gray-300 hover:border-gray-400'
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
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M14 30.5V12a2 2 0 012-2h16a2 2 0 012 2v18.5M24 31V18m0 0l-5 5m5-5l5 5M10 36h28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium">
                {uploading ? uploadProgress : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, WebP, GIF up to 5MB
              </p>
            </div>
          </div>

          {/* Or enter URL manually */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 text-center mb-2">— OR enter URL manually —</p>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
              placeholder="/carousel/image.jpg or https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text *</label>
          <input
            type="text"
            required
            value={formData.alt}
            onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="Description for accessibility"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
          <input
            type="text"
            value={formData.caption || ''}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
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
              Invalid URL. Please use a relative path (starting with /) or a valid HTTPS URL.
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
