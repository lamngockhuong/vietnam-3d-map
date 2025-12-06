'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { WardData } from '@/data/wards-data';
import type { Dictionary } from '@/i18n/dictionaries';
import { Button } from '@/components/ui/button';

interface WardListProps {
  dict: Dictionary;
  wards: WardData[];
  searchQuery: string;
  selectedId?: string | null;
  provinceName: string;
  loading?: boolean;
  onSelect: (ward: WardData) => void;
  onBack: () => void;
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

// Type badge colors for wards
function getTypeBadgeColor(type: string): string {
  if (type === 'Phường') {
    return 'bg-blue-100 text-blue-700';
  }
  if (type === 'Thị trấn') {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-green-100 text-green-700'; // Xã
}

export function WardList({
  dict,
  wards,
  searchQuery,
  selectedId,
  provinceName,
  loading,
  onSelect,
  onBack,
}: WardListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Filter and sort wards
  const filteredWards = useMemo(() => {
    return wards
      .filter((w) => matchesSearch(w.name, searchQuery))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [wards, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredWards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 5,
  });

  // Scroll to selected item when selectedId changes
  useEffect(() => {
    if (selectedId) {
      const index = filteredWards.findIndex((w) => w.id === selectedId);
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'center' });
      }
    }
  }, [selectedId, filteredWards, virtualizer]);

  return (
    <div className="flex flex-col h-full">
      {/* Back button header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="size-8 shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">
            {dict.sidebar.wards}
          </div>
          <div className="font-medium text-gray-800 text-sm truncate">
            {provinceName}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="size-6 text-vietnam-ocean animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">{dict.sidebar.loading}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredWards.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          {dict.sidebar.noResults}
        </div>
      )}

      {/* Ward list */}
      {!loading && filteredWards.length > 0 && (
        <div ref={parentRef} className="flex-1 overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const ward = filteredWards[virtualRow.index];
              const isSelected = ward.id === selectedId;

              return (
                <div
                  key={ward.id}
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
                    onClick={() => onSelect(ward)}
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
                      {ward.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 transition-transform duration-200 group-hover:scale-105 ${getTypeBadgeColor(
                        ward.type
                      )} ${isSelected ? 'ring-1 ring-vietnam-ocean/30' : ''}`}
                    >
                      {ward.type}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
