'use client';

import { useEffect, useRef } from 'react';

interface GivebutterCampaignProps {
  campaignId: string;
}

export default function GivebutterCampaign({ campaignId }: GivebutterCampaignProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || injectedRef.current) return;
    injectedRef.current = true;

    const widget = document.createElement('givebutter-widget');
    widget.setAttribute('id', campaignId);
    widget.style.width = '100%';
    widget.style.display = 'block';
    containerRef.current.appendChild(widget);

    return () => {
      widget.remove();
      injectedRef.current = false;
    };
  }, [campaignId]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      suppressHydrationWarning
    />
  );
}
