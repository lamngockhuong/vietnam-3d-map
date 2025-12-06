'use client';

import { useState } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';

interface LegendProps {
  dict: Dictionary;
}

// Legend items with vibrant colors matching the map
const legendItems = [
  { key: 'lowlands', color: '#22c55e' }, // Bright green
  { key: 'mountains', color: '#84cc16' }, // Lime green (highland)
  { key: 'sovereignty', color: '#eab308' }, // Yellow/gold
  { key: 'coastalIslands', color: '#06b6d4' }, // Cyan
  { key: 'capital', color: '#ef4444' }, // Red
  { key: 'majorCities', color: '#f59e0b' }, // Amber
] as const;

export function Legend({ dict }: LegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative">
      {/* Collapsed state - compact icon button */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-xl transition-all"
          title={dict.legend.title}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </button>
      ) : (
        <div className="bg-white/90 backdrop-blur-md rounded-xl px-5 py-4 shadow-lg border border-gray-100 min-w-[200px]">
          {/* Header with close button */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
            <h3 className="text-gray-700 font-semibold text-xs tracking-wide uppercase">
              {dict.legend.title}
            </h3>
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-7 h-7 -mr-1 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title="Hide legend"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Legend items - increased spacing */}
          <div className="space-y-3">
            {legendItems.map((item) => (
              <div key={item.key} className="flex items-center gap-3 group">
                <div
                  className="w-5 h-5 rounded shadow-sm flex-shrink-0 border border-black/10"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 text-sm leading-tight group-hover:text-gray-900 transition-colors">
                  {dict.legend[item.key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
