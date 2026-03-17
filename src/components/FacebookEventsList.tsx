'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ExternalLink, Users } from 'lucide-react';
import { FacebookEvent, formatFacebookEvent, getFacebookEventUrl } from '@/lib/facebook-calendar';

interface FacebookEventsListProps {
  events: FacebookEvent[];
  pageId?: string;
  pageName?: string;
  isLoading?: boolean;
  error?: string | null;
}

const FacebookEventsList: React.FC<FacebookEventsListProps> = ({
  events,
  pageId,
  pageName = 'Katy Pride',
  isLoading = false,
  error = null
}) => {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">
          <Calendar className="w-8 h-8 mx-auto" />
        </div>
        <h3 className="text-red-800 font-medium mb-2">Unable to load events</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <a
          href={`https://www.facebook.com/${pageId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          View on Facebook
        </a>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-600 mb-2">
          <Calendar className="w-8 h-8 mx-auto" />
        </div>
        <h3 className="text-gray-800 font-medium mb-2">No upcoming events</h3>
        <p className="text-gray-600 text-sm mb-4">
          Check back soon for new events from {pageName}
        </p>
        <a
          href={`https://www.facebook.com/${pageId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
        >
          Visit Facebook Page
        </a>
      </div>
    );
  }

  const sortedEvents = events
    .map(formatFacebookEvent)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
        <a
          href={`https://www.facebook.com/${pageId}/events`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          View all events
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>

      {sortedEvents.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Event Header with Image */}
          <div className="relative">
            {event.cover?.source ? (
              <div className="h-48 bg-gray-100">
                <img
                  src={event.cover.source}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-purple-600" />
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">
                {event.name}
              </h3>
              {event.is_online && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  <Users className="w-3 h-3 mr-1" />
                  Online Event
                </span>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6">
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-3 text-purple-600" />
                <div>
                  <div className="font-medium">{event.formattedDate}</div>
                  <div className="text-sm text-gray-600">{event.formattedTime}</div>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3 text-purple-600" />
                <div>
                  <div className="font-medium">{event.place?.name || 'Online Event'}</div>
                  {event.place?.address && (
                    <div className="text-sm text-gray-600">{event.place.address}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-4">
                {expandedEvent === event.id ? (
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {event.description}
                  </div>
                ) : (
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {event.description.length > 200 
                      ? `${event.description.substring(0, 200)}...` 
                      : event.description
                    }
                  </div>
                )}
                
                {event.description && event.description.length > 200 && (
                  <button
                    onClick={() => toggleEventExpansion(event.id)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2"
                  >
                    {expandedEvent === event.id ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={getFacebookEventUrl(event.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center rounded-full bg-[#760088] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#5a0666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2"
              >
                View on Facebook
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>

              {pageId && (
                <a
                  href={`https://www.facebook.com/${pageId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center rounded-full border border-purple-600 text-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
                >
                  Follow {pageName}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-gray-600 text-sm mb-3">
          Events are pulled from our Facebook Page
        </p>
        <a
          href={`https://www.facebook.com/${pageId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Follow {pageName} on Facebook for more events
        </a>
      </div>
    </div>
  );
};

export default FacebookEventsList;
