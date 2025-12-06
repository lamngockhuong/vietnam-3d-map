'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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

// Type badge colors
function getTypeBadgeColor(type: string): string {
  if (type.includes('Trung ương') || type === 'Thành phố') {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-gray-100 text-gray-600';
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
    estimateSize: () => 28,
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
      <div className="p-4 text-center text-gray-500 text-sm">
        {dict.sidebar.noResults}
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
                className={`w-full px-3 py-1.5 text-left transition-all duration-200 flex items-center justify-between gap-2 group ${
                  isSelected
                    ? 'bg-gradient-to-r from-vietnam-ocean/20 to-vietnam-ocean/5 border-l-3 border-vietnam-ocean shadow-sm'
                    : 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-transparent hover:border-l-3 hover:border-gray-300 border-l-3 border-transparent'
                }`}
              >
                <span className={`font-medium truncate transition-colors duration-200 ${
                  isSelected
                    ? 'text-vietnam-ocean'
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {province.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 transition-transform duration-200 group-hover:scale-105 ${getTypeBadgeColor(
                    province.type
                  )} ${isSelected ? 'ring-1 ring-vietnam-ocean/30' : ''}`}
                >
                  {province.type}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
