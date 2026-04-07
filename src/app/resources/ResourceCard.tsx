'use client';

import { useState } from 'react';

type Accent = {
  cardBg: string;
  cardHoverBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  stripe: string;
  ring: string;
  pillBorder: string;
  pillBg: string;
  pillHoverBg: string;
  pillText: string;
};

function getHostname(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}

interface ResourceCardProps {
  title: string;
  href: string;
  description?: string;
  accent: Accent;
}

export function ResourceCard({ title, href, description, accent }: ResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_DESCRIPTION_LENGTH = 120;
  const hasLongDescription = description && description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = hasLongDescription && !isExpanded
    ? description.slice(0, MAX_DESCRIPTION_LENGTH).trim() + '...'
    : description;

  return (
    <li className="h-full">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} — Visit website (opens in a new tab)`}
        className={`group flex h-full flex-col justify-between gap-3 rounded-2xl border-2 border-l-4 px-5 py-5 shadow-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${accent.cardBg} ${accent.cardHoverBg} ${accent.cardBorder} ${accent.cardHoverBorder} ${accent.stripe} ${accent.ring} motion-reduce:transition-none`}
      >
        <div className="min-w-0 flex-1">
          <div className="font-heading text-lg font-semibold text-gray-900 group-hover:text-purple-950 group-hover:underline decoration-2 underline-offset-4 transition-colors duration-200 motion-reduce:transition-none">
            {title}
          </div>
          <div className="mt-1.5 block text-sm text-gray-600 font-medium break-words" title={href}>
            {getHostname(href)}
          </div>
          {description && (
            <div className="mt-3 text-sm text-gray-700 leading-relaxed">
              {displayDescription}
              {hasLongDescription && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className={`ml-1 inline font-medium underline underline-offset-2 transition-colors ${accent.pillText.replace('font-semibold', '')} hover:opacity-80`}
                >
                  {isExpanded ? 'Less' : 'More info'}
                </button>
              )}
            </div>
          )}
        </div>

        <span
          aria-hidden="true"
          className={`font-heading antialiased mt-2 shrink-0 self-end rounded-full border-2 px-3.5 py-2 text-[11px] font-bold leading-none tracking-wide transition-colors duration-200 ${accent.pillBorder} ${accent.pillBg} ${accent.pillText} ${accent.pillHoverBg} motion-reduce:transition-none`}
        >
          Visit <span aria-hidden="true">→</span>
        </span>
      </a>
    </li>
  );
}
