'use client';

import { useCallback, useEffect, useState } from 'react';
import { Map, X, MapPin, Users, Ruler, Layers, History, Building, MapPinned } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Legend items with vibrant colors matching the map
const legendItems = [
  { key: 'lowlands', color: '#22c55e' }, // Bright green
  { key: 'mountains', color: '#84cc16' }, // Lime green (highland)
  { key: 'sovereignty', color: '#eab308' }, // Yellow/gold
  { key: 'coastalIslands', color: '#06b6d4' }, // Cyan
  { key: 'capital', color: '#ef4444' }, // Red
  { key: 'majorCities', color: '#f59e0b' }, // Amber
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
      // Ward names stay as-is (Vietnamese)
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
          icon: <Layers className="size-4" />,
          label: dict.provinces.type,
          value: locationData.type,
        },
        {
          icon: <Users className="size-4" />,
          label: dict.provinces.population,
          value: formatNumber(locationData.population, locale),
        },
        {
          icon: <Ruler className="size-4" />,
          label: dict.provinces.area,
          value: formatArea(locationData.area, locale),
        },
        {
          icon: <MapPin className="size-4" />,
          label: dict.provinces.density,
          value: formatDensity(locationData.density, locale),
        },
      ]
    : [];

  return (
    <div ref={containerRef}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Collapsed state - compact icon button */}
        {!isOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 bg-white/90 backdrop-blur-md border-gray-100 shadow-lg hover:bg-white hover:shadow-xl"
                >
                  <Map className="size-5 text-gray-600" />
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">{dict.legend.title}</TooltipContent>
          </Tooltip>
        )}

        <CollapsibleContent>
          <Card className="bg-white/90 backdrop-blur-md border-gray-100 shadow-lg min-w-[260px] max-w-[300px] py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <CardTitle className="text-gray-700 font-semibold text-xs tracking-wide uppercase">
                {dict.legend.title}
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 -mr-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="size-4" />
                </Button>
              </CollapsibleTrigger>
            </CardHeader>

            <CardContent className="px-4 py-3">
              {/* Legend items - hidden when ward is selected */}
              {!selectedWard && (
                <div className="space-y-2.5">
                  {legendItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-3 group">
                      <div
                        className="size-4 rounded shadow-sm shrink-0 border border-black/10"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700 text-sm leading-tight group-hover:text-gray-900 transition-colors">
                        {dict.legend[item.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Location Info Section */}
              <div className={selectedWard ? '' : 'mt-4 pt-4 border-t border-gray-200'}>
                <h4 className="text-gray-700 font-semibold text-xs tracking-wide uppercase mb-3">
                  {dict.legend.locationInfo}
                </h4>

                {locationData ? (
                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm mb-2">
                      {getLocationName()}
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {infoItems.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-start gap-2 p-2 rounded-lg bg-gray-50"
                        >
                          <div className="text-gray-400 mt-0.5">{item.icon}</div>
                          <div className="min-w-0">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                              {item.label}
                            </div>
                            <div className="text-xs font-medium text-gray-700 truncate">
                              {item.value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Merger Info Section */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="size-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                          {dict.legend.mergerInfo}
                        </span>
                      </div>

                      {selectedWard && wardMergerInfo ? (
                        // Ward merger info
                        <div className="space-y-2">
                          {/* Before Merger */}
                          <div className="text-xs">
                            <span className="text-gray-500">{dict.legend.mergedFrom}:</span>
                            <p className="mt-0.5 font-medium text-amber-700 leading-relaxed">
                              {wardMergerInfo.beforeMerger}
                            </p>
                          </div>

                          {/* Admin Center */}
                          <div className="flex items-start gap-2 text-xs">
                            <Building className="size-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-gray-500">{dict.legend.adminCenter}:</span>
                              <span className="ml-1 font-medium text-gray-700">
                                {wardMergerInfo.adminCenter}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : provinceMergerInfo ? (
                        // Province merger info
                        <div className="space-y-2">
                          {/* Before Merger */}
                          <div className="text-xs">
                            <span className="text-gray-500">{dict.legend.mergedFrom}:</span>
                            <p className={`mt-0.5 font-medium ${provinceMergerInfo.isMerged ? 'text-amber-700' : 'text-gray-500'}`}>
                              {getLocalizedText(provinceMergerInfo.beforeMerger, locale)}
                            </p>
                          </div>

                          {/* Admin Center */}
                          <div className="flex items-start gap-2 text-xs">
                            <Building className="size-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-gray-500">{dict.legend.adminCenter}:</span>
                              <span className="ml-1 font-medium text-gray-700">
                                {getLocalizedText(provinceMergerInfo.adminCenter, locale)}
                              </span>
                            </div>
                          </div>

                          {/* Admin Units */}
                          <div className="flex items-start gap-2 text-xs">
                            <MapPinned className="size-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-gray-500">{dict.legend.adminUnits}:</span>
                              <span className="ml-1 font-medium text-gray-700">
                                {getLocalizedText(provinceMergerInfo.adminUnits, locale)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          {dict.legend.noMergerInfo}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {dict.legend.selectLocation}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
