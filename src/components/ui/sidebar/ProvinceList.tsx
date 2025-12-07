'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MapPin, Star } from 'lucide-react';
import type { ProvinceData } from '@/data/provinces-data';
import type { Dictionary } from '@/i18n/dictionaries';

interface ProvinceListProps {
  dict: Dictionary;
  provinces: ProvinceData[];
  searchQuery: string;
  selectedId?: string | null;
  onSelect: (province: ProvinceData) => void;
  onDoubleClick: (province: ProvinceData) => void;
}

// Remove Vietnamese diacritics for search
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchesSearch(name: string, query: string): boolean {
  if (!query) return true;
  const normalizedName = removeDiacritics(name.toLowerCase());
  const normalizedQuery = removeDiacritics(query.toLowerCase());
  return normalizedName.includes(normalizedQuery);
}

// Type badge styling
function getTypeBadgeStyle(type: string): { bg: string; text: string; icon: React.ReactNode } {
  if (type.includes('Trung ương') || type === 'Thành phố') {
    return {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-100',
      text: 'text-red-700',
      icon: <Star className="size-2.5" />,
    };
  }
  return {
    bg: 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-100',
    text: 'text-slate-600',
    icon: <MapPin className="size-2.5" />,
  };
}

export function ProvinceList({
  dict,
  provinces,
  searchQuery,
  selectedId,
  onSelect,
  onDoubleClick,
}: ProvinceListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Filter and sort provinces
  const filteredProvinces = useMemo(() => {
    return provinces
      .filter((p) => matchesSearch(p.name, searchQuery))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [provinces, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredProvinces.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  // Scroll to selected item when selectedId changes
  useEffect(() => {
    if (selectedId) {
      const index = filteredProvinces.findIndex((p) => p.id === selectedId);
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'center' });
      }
    }
  }, [selectedId, filteredProvinces, virtualizer]);

  if (filteredProvinces.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <MapPin className="size-7 text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm font-medium">
          {dict.sidebar.noResults}
        </p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="flex-1 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const province = filteredProvinces[virtualRow.index];
          const isSelected = province.id === selectedId;
          const badgeStyle = getTypeBadgeStyle(province.type);

          return (
            <div
              key={province.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <button
                onClick={() => onSelect(province)}
                onDoubleClick={() => onDoubleClick(province)}
                className={`w-full h-full px-4 py-2.5 text-left transition-all duration-200 flex items-center gap-3 group ${
                  isSelected
                    ? 'bg-gradient-to-r from-vietnam-ocean/10 via-vietnam-ocean/5 to-transparent'
                    : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent'
                }`}
              >
                {/* Selection indicator */}
                <div
                  className={`w-1 h-9 rounded-full transition-all duration-300 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-b from-vietnam-ocean to-blue-600 shadow-sm shadow-vietnam-ocean/30'
                      : 'bg-slate-200 group-hover:bg-slate-300'
                  }`}
                />

                {/* Province info */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`block font-semibold text-sm truncate transition-colors duration-200 ${
                      isSelected
                        ? 'text-vietnam-ocean'
                        : 'text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {province.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full border font-medium transition-transform duration-200 group-hover:scale-105 ${badgeStyle.bg} ${badgeStyle.text}`}
                  >
                    {badgeStyle.icon}
                    {province.type}
                  </span>
                </div>

                {/* Chevron indicator */}
                <div
                  className={`size-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-vietnam-ocean/10 text-vietnam-ocean'
                      : 'text-slate-300 group-hover:text-slate-400 group-hover:bg-slate-100'
                  }`}
                >
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
