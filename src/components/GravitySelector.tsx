'use client';

interface GravitySelectorProps {
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'north_west' | 'north_east' | 'south_west' | 'south_east';
  onChange: (gravity: 'auto' | 'face' | 'center' | 'north' | 'south' | 'north_west' | 'north_east' | 'south_west' | 'south_east') => void;
}

const GRAVITY_OPTIONS = [
  { value: 'auto' as const, label: 'Auto (Smart)', description: 'Automatically detects faces and important content', icon: '✨' },
  { value: 'face' as const, label: 'Face Detection', description: 'Centers on detected faces', icon: '👤' },
  { value: 'center' as const, label: 'Center', description: 'Simple center crop', icon: '◎' },
  { value: 'north' as const, label: 'Top', description: 'Keeps the top of the image', icon: '↑' },
  { value: 'south' as const, label: 'Bottom', description: 'Keeps the bottom of the image', icon: '↓' },
  { value: 'north_west' as const, label: 'Top Left', description: 'Keeps top-left corner', icon: '↖' },
  { value: 'north_east' as const, label: 'Top Right', description: 'Keeps top-right corner', icon: '↗' },
  { value: 'south_west' as const, label: 'Bottom Left', description: 'Keeps bottom-left corner', icon: '↙' },
  { value: 'south_east' as const, label: 'Bottom Right', description: 'Keeps bottom-right corner', icon: '↘' },
];

export default function GravitySelector({ gravity = 'auto', onChange }: GravitySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-1">Choose how to crop the photo</h4>
        <p className="text-sm text-blue-800">
          Select where to focus when cropping to fit the page layout.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {GRAVITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
              gravity === option.value
                ? 'border-[#760088] bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <span className="text-xl">{option.icon}</span>
            <div>
              <div className={`font-medium ${gravity === option.value ? 'text-[#760088]' : 'text-gray-900'}`}>
                {option.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
