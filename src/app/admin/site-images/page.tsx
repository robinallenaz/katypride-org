'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { type SiteImage } from '@/lib/data-service';
import GravitySelector from '@/components/GravitySelector';
import { cloudinaryUrl } from '@/lib/cloudinary';
import { isValidImageUrl, getFileValidationError } from '@/lib/validation';

interface PredefinedKey {
  key: string;
  label: string;
  description: string;
}

export default function SiteImagesAdmin() {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [predefinedKeys, setPredefinedKeys] = useState<PredefinedKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingImage, setEditingImage] = useState<SiteImage | null>(null);
  const [message, setMessage] = useState('');
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadImages();
    }
  }, [authLoading, isAuthenticated]);

  const loadImages = async () => {
    try {
      const response = await fetch('/api/admin/site-images', {
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
      setPredefinedKeys(data.predefinedKeys || []);
      setError('');
    } catch (error) {
      console.error('Failed to load site images:', error);
      setError('Failed to load site images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (image: SiteImage) => {
    try {
      const response = await fetch('/api/admin/site-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(image),
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setMessage('Image updated!');
        setEditingImage(null);
        loadImages();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        setMessage(`Error: ${data.error || 'Failed to save image'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Network error. Please check your connection.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleClear = async (key: string) => {
    if (!confirm('Are you sure you want to clear this image?')) return;

    try {
      const response = await fetch(`/api/admin/site-images?key=${key}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      if (response.ok) {
        setMessage('Image cleared!');
        loadImages();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        setMessage(`Error: ${data.error || 'Failed to clear image'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (authLoading || loading) {
    return <div className="p-8">Loading site images...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#760088]">Site Images</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage images used throughout the website
          </p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => {
          const predefined = predefinedKeys.find(p => p.key === image.key);
          const hasImage = image.url && image.url.trim().length > 0;

          return (
            <div key={image.key} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {hasImage ? (
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">No image set</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{predefined?.label || image.key}</h3>
                <p className="text-sm text-gray-500 mt-1">{predefined?.description || image.caption}</p>
                {hasImage && image.updatedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(image.updatedAt).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingImage(image)}
                    className="bg-[#760088] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#5a0666] transition-colors"
                  >
                    {hasImage ? 'Update' : 'Add Image'}
                  </button>
                  {hasImage && (
                    <button
                      onClick={() => handleClear(image.key)}
                      className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingImage && (
        <ImageForm
          image={editingImage}
          predefined={predefinedKeys.find(p => p.key === editingImage.key)}
          onSave={handleSave}
          onCancel={() => setEditingImage(null)}
          getAuthHeaders={getAuthHeaders}
        />
      )}
    </div>
  );
}

function ImageForm({
  image,
  predefined,
  onSave,
  onCancel,
  getAuthHeaders
}: {
  image: SiteImage;
  predefined?: PredefinedKey;
  onSave: (i: SiteImage) => void;
  onCancel: () => void;
  getAuthHeaders: () => Record<string, string>;
}) {
  const [formData, setFormData] = useState<SiteImage>(image);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset form data when image prop changes (prevents stale state)
  useEffect(() => {
    setFormData(image);
  }, [image.id, image.key]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Use shared validation utility

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
      uploadFormData.append('folder', 'katypride/site-images');

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

    onSave({
      ...formData,
      id: formData.key,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-xl font-bold text-gray-900">
              {predefined?.label || 'Edit Image'}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 text-sm">{predefined?.description}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>

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

              <div className="mt-3">
                <p className="text-xs text-gray-500 text-center mb-2">— OR enter URL manually —</p>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  placeholder="/images/photo.jpg or https://..."
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <input
                type="text"
                value={formData.caption || ''}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                placeholder="Optional caption"
              />
            </div>

            {formData.url && isValidImageUrl(formData.url) && (
              <div className="space-y-4">
                <GravitySelector
                  gravity={formData.gravity || 'auto'}
                  onChange={(gravity) => setFormData({ ...formData, gravity })}
                />

                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Live Preview (16:9 crop):</p>
                  <div className="rounded-lg overflow-hidden max-w-2xl mx-auto">
                    <img
                      src={cloudinaryUrl(formData.url, 800, {
                        height: 450,
                        crop: 'fill',
                        gravity: formData.gravity || 'auto',
                      })}
                      alt="Crop preview"
                      className="w-full h-auto"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This is exactly how the image will appear on the About page (800 × 450 pixels)
                  </p>
                </div>
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
      </div>
    </div>
  );
}
