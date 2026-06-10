'use client';

import { useEffect, useRef } from 'react';

interface GivebutterCampaignProps {
  widgetId: string;
}

export default function GivebutterCampaign({ widgetId }: GivebutterCampaignProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || injectedRef.current) return;
    injectedRef.current = true;

    const widget = document.createElement('givebutter-widget');
    widget.setAttribute('id', widgetId);
    widget.style.width = '100%';
    widget.style.display = 'block';
    containerRef.current.appendChild(widget);

    return () => {
      widget.remove();
      injectedRef.current = false;
    };
  }, [widgetId]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      suppressHydrationWarning
    />
  );
}
