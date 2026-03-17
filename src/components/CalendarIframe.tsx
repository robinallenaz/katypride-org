'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CalendarIframeProps {
  src: string;
  title: string;
}

const CalendarIframe: React.FC<CalendarIframeProps> = ({ src, title }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setHasTimedOut(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setHasTimedOut(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleTimeout = () => {
    setIsLoading(false);
    setHasTimedOut(true);
    setHasError(false);
  };

  useEffect(() => {
    // Set timeout for iframe loading (15 seconds)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleTimeout, 15000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Don't set state after unmount to prevent React warnings
    };
  }, [src]);

  const shouldShowError = hasError || hasTimedOut;
  const errorMessage = hasTimedOut 
    ? 'Calendar is taking too long to load' 
    : 'Calendar failed to load';

  return (
    <div className="relative w-full" style={{ paddingTop: '75%' }}>
      {!shouldShowError ? (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          style={{ 
            border: 0, 
            opacity: isLoading ? 0 : 1, 
            transition: 'opacity 0.3s ease-in-out' 
          }}
          scrolling="no"
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center p-4">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-700 font-medium">{errorMessage}</p>
            <p className="text-red-600 text-sm mt-1">Please try refreshing the page</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      
      {/* Loading placeholder */}
      {isLoading && !shouldShowError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarIframe;
