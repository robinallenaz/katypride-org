'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SponsorSectionProps {
  children: React.ReactNode;
  className?: string;
}

const LazySponsorSection: React.FC<SponsorSectionProps> = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect(); // Always disconnect to prevent memory leaks
    };
  }, [hasLoaded]);

  return (
    <div ref={sectionRef} className={className}>
      {isVisible ? (
        <div className="animate-fade-in">
          {children}
        </div>
      ) : (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sponsorship opportunities...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazySponsorSection;
