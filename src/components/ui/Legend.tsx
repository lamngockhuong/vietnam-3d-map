'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Map as MapIcon,
  X,
  MapPin,
  Users,
  Ruler,
  Layers,
  History,
  Building,
  MapPinned,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useUIState } from '@/hooks/useUIState';
import type { ProvinceData } from '@/data/provinces-data';
import type { WardData } from '@/data/wards-data';
import {
  getProvinceMergerInfo,
  getWardMergerInfo,
  getLocalizedText,
  loadWardMetadata,
  type WardMergerInfo,
} from '@/data/merger-data';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { getProvinceName } from '@/i18n/province-names';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LegendProps {
  dict: Dictionary;
  locale: Locale;
  highlightedProvince?: ProvinceData | null;
  selectedWard?: WardData | null;
}

// Legend items with refined colors
const legendItems = [
  { key: 'lowlands', color: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
  { key: 'mountains', color: '#84cc16', gradient: 'from-lime-400 to-lime-600' },
  { key: 'sovereignty', color: '#f59e0b', gradient: 'from-amber-400 to-amber-600' },
  { key: 'coastalIslands', color: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600' },
  { key: 'capital', color: '#ef4444', gradient: 'from-red-400 to-red-600' },
  { key: 'majorCities', color: '#f97316', gradient: 'from-orange-400 to-orange-600' },
] as const;

function formatNumber(num: number, locale: string): string {
  return num.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US');
}

function formatArea(area: number, locale: string): string {
  return `${formatNumber(Math.round(area * 100) / 100, locale)} km²`;
}

function formatDensity(density: number, locale: string): string {
  return `${formatNumber(Math.round(density), locale)}/km²`;
}

export function Legend({ dict, locale, highlightedProvince, selectedWard }: LegendProps) {
  const [isOpen, setIsOpen] = useUIState('legendOpen');
  const [wardMergerInfo, setWardMergerInfo] = useState<WardMergerInfo | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const containerRef = useClickOutside<HTMLDivElement>(handleClose, isOpen);

  // Load ward metadata when province changes
  useEffect(() => {
    if (highlightedProvince) {
      loadWardMetadata(highlightedProvince.id);
    }
  }, [highlightedProvince]);

  // Update ward merger info when ward changes
  useEffect(() => {
    if (selectedWard && highlightedProvince) {
      const info = getWardMergerInfo(highlightedProvince.id, selectedWard.name);
      setWardMergerInfo(info);
    } else {
      setWardMergerInfo(null);
    }
  }, [selectedWard, highlightedProvince]);

  // Determine which data to display (ward takes priority over province)
  const locationData = selectedWard || highlightedProvince;

  // Get translated name
  const getLocationName = () => {
    if (!locationData) return null;
    if (selectedWard) {
      return selectedWard.name;
    }
    if (highlightedProvince) {
      return getProvinceName(highlightedProvince.name, locale);
    }
    return null;
  };

  // Get province merger info (for province display)
  const provinceMergerInfo = highlightedProvince
    ? getProvinceMergerInfo(highlightedProvince.id)
    : null;

  const infoItems = locationData
    ? [
        {
          icon: <Layers className="size-3.5" />,
          label: dict.provinces.type,
          value: locationData.type,
          color: 'text-violet-600 bg-violet-50',
        },
        {
          icon: <Users className="size-3.5" />,
          label: dict.provinces.population,
          value: formatNumber(locationData.population, locale),
          color: 'text-blue-600 bg-blue-50',
        },
        {
          icon: <Ruler className="size-3.5" />,
          label: dict.provinces.area,
          value: formatArea(locationData.area, locale),
          color: 'text-emerald-600 bg-emerald-50',
        },
        {
          icon: <MapPin className="size-3.5" />,
          label: dict.provinces.density,
          value: formatDensity(locationData.density, locale),
          color: 'text-amber-600 bg-amber-50',
        },
      ]
    : [];

  return (
    <div ref={containerRef}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Collapsed state - floating action button */}
        {!isOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-12 rounded-2xl bg-white/95 backdrop-blur-xl border-white/50 shadow-lg shadow-black/5 hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <MapIcon className="size-5 text-slate-600" />
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {dict.legend.title}
            </TooltipContent>
          </Tooltip>
        )}

        <CollapsibleContent>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-black/10 min-w-[280px] max-w-[320px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-vietnam-ocean to-blue-600 flex items-center justify-center shadow-sm">
                  <MapIcon className="size-4.5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">
                  {dict.legend.title}
                </span>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="size-4" />
                </Button>
              </CollapsibleTrigger>
            </div>

            <div className="p-4 space-y-5">
              {/* Legend items - hidden when ward is selected */}
              {!selectedWard && (
                <div className="space-y-1.5">
                  {legendItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-default group"
                    >
                      <div
                        className="size-5 rounded-lg shadow-sm ring-1 ring-black/5 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 text-sm font-medium group-hover:text-slate-800 transition-colors">
                        {dict.legend[item.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Location Info Section */}
              <div className={selectedWard ? '' : 'pt-4 border-t border-slate-100'}>
                {/* Section Header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="size-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <MapPin className="size-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {dict.legend.locationInfo}
                  </span>
                </div>

                {locationData ? (
                  <div className="space-y-3">
                    {/* Location Name */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-100">
                      <Sparkles className="size-4 text-amber-500 shrink-0" />
                      <span className="font-semibold text-slate-800 text-sm">
                        {getLocationName()}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {infoItems.map((item) => (
                        <div
                          key={item.label}
                          className="px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className={`size-5 rounded-md flex items-center justify-center ${item.color}`}>
                              {item.icon}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                              {item.label}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-700 pl-6.5">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Merger Info Section */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="size-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <History className="size-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {dict.legend.mergerInfo}
                        </span>
                      </div>

                      {selectedWard && wardMergerInfo ? (
                        // Ward merger info
                        <div className="space-y-2.5">
                          <div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600 uppercase tracking-wide mb-1.5">
                              <ChevronRight className="size-3" />
                              {dict.legend.mergedFrom}
                            </div>
                            <p className="text-xs font-medium text-amber-800 leading-relaxed">
                              {wardMergerInfo.beforeMerger}
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="size-6 rounded-md bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                              <Building className="size-3.5 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                                {dict.legend.adminCenter}
                              </div>
                              <div className="text-xs font-medium text-slate-700">
                                {wardMergerInfo.adminCenter}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : provinceMergerInfo ? (
                        // Province merger info
                        <div className="space-y-2.5">
                          <div className={`px-3 py-2.5 rounded-xl border ${provinceMergerInfo.isMerged ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide mb-1.5 ${provinceMergerInfo.isMerged ? 'text-amber-600' : 'text-slate-400'}`}>
                              <ChevronRight className="size-3" />
                              {dict.legend.mergedFrom}
                            </div>
                            <p className={`text-xs font-medium leading-relaxed ${provinceMergerInfo.isMerged ? 'text-amber-800' : 'text-slate-500'}`}>
                              {getLocalizedText(provinceMergerInfo.beforeMerger, locale)}
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="size-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Building className="size-3.5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                                {dict.legend.adminCenter}
                              </div>
                              <div className="text-xs font-medium text-slate-700">
                                {getLocalizedText(provinceMergerInfo.adminCenter, locale)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="size-6 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                              <MapPinned className="size-3.5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                                {dict.legend.adminUnits}
                              </div>
                              <div className="text-xs font-medium text-slate-700">
                                {getLocalizedText(provinceMergerInfo.adminUnits, locale)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 border-dashed">
                          <p className="text-xs text-slate-400 text-center italic">
                            {dict.legend.noMergerInfo}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 border-dashed text-center">
                    <MapPin className="size-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      {dict.legend.selectLocation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
