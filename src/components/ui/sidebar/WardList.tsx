'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowLeft, Loader2, MapPin, Building2, Home, Store } from 'lucide-react';
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

// Type badge styling for wards
function getTypeBadgeStyle(type: string): { bg: string; text: string; icon: React.ReactNode } {
  if (type === 'Phường') {
    return {
      bg: 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-100',
      text: 'text-blue-700',
      icon: <Building2 className="size-2.5" />,
    };
  }
  if (type === 'Thị trấn') {
    return {
      bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100',
      text: 'text-amber-700',
      icon: <Store className="size-2.5" />,
    };
  }
  // Xã
  return {
    bg: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100',
    text: 'text-emerald-700',
    icon: <Home className="size-2.5" />,
  };
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
    estimateSize: () => 56,
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
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="size-8 rounded-lg shrink-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {dict.sidebar.wards}
          </div>
          <div className="font-semibold text-slate-800 text-sm truncate">
            {provinceName}
          </div>
        </div>
        <div className="size-8 rounded-lg bg-gradient-to-br from-vietnam-ocean/10 to-blue-100 flex items-center justify-center shrink-0">
          <MapPin className="size-4 text-vietnam-ocean" />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-vietnam-ocean/10 to-blue-50 flex items-center justify-center mb-4">
            <Loader2 className="size-7 text-vietnam-ocean animate-spin" />
          </div>
          <span className="text-slate-500 text-sm font-medium">{dict.sidebar.loading}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredWards.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <MapPin className="size-7 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm font-medium">
            {dict.sidebar.noResults}
          </p>
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
              const badgeStyle = getTypeBadgeStyle(ward.type);

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

                    {/* Ward info */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`block font-semibold text-sm truncate transition-colors duration-200 ${
                          isSelected
                            ? 'text-vietnam-ocean'
                            : 'text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {ward.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full border font-medium transition-transform duration-200 group-hover:scale-105 ${badgeStyle.bg} ${badgeStyle.text}`}
                      >
                        {badgeStyle.icon}
                        {ward.type}
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
      )}
    </div>
  );
}
