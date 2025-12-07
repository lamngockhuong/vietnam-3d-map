'use client';

import { useCallback } from 'react';
import { Menu, X, MapPin } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useUIState } from '@/hooks/useUIState';
import type { ProvinceData } from '@/data/provinces-data';
import type { WardData } from '@/data/wards-data';
import type { Dictionary } from '@/i18n/dictionaries';
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
import { SearchInput } from '@/components/ui/sidebar/SearchInput';
import { InfoPanel } from '@/components/ui/sidebar/InfoPanel';
import { ProvinceList } from '@/components/ui/sidebar/ProvinceList';
import { WardList } from '@/components/ui/sidebar/WardList';

interface SidebarProps {
  dict: Dictionary;
  provinces: ProvinceData[];
  highlightedProvince: ProvinceData | null;
  selectedProvince: ProvinceData | null;
  selectedWard: WardData | null;
  wards: WardData[];
  loadingWards: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProvinceSelect: (province: ProvinceData) => void;
  onProvinceDoubleClick: (province: ProvinceData) => void;
  onWardSelect: (ward: WardData) => void;
  onBackToProvinces: () => void;
  // Optional controlled props
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({
  dict,
  provinces,
  highlightedProvince,
  selectedProvince,
  selectedWard,
  wards,
  loadingWards,
  searchQuery,
  onSearchChange,
  onProvinceSelect,
  onProvinceDoubleClick,
  onWardSelect,
  onBackToProvinces,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: SidebarProps) {
  const [internalIsOpen, internalSetIsOpen] = useUIState('sidebarOpen');

  // Use controlled props if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : internalSetIsOpen;

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const containerRef = useClickOutside<HTMLDivElement>(handleClose, isOpen);

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
                  <Menu className="size-5 text-slate-600" />
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-medium">
              {dict.sidebar.title}
            </TooltipContent>
          </Tooltip>
        )}

        <CollapsibleContent>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-black/10 w-80 h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-vietnam-ocean to-blue-600 flex items-center justify-center shadow-sm">
                  <MapPin className="size-4.5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">
                  {dict.sidebar.title}
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

            {/* Search input */}
            <div className="px-4 py-3 border-b border-slate-100 shrink-0">
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={dict.sidebar.searchPlaceholder}
              />
            </div>

            {/* Content area */}
            <div className="flex-1 min-h-0 flex flex-col">
              {selectedProvince ? (
                <>
                  {/* Province info panel */}
                  <div className="px-4 py-3 shrink-0">
                    <InfoPanel
                      dict={dict}
                      province={selectedProvince}
                      ward={selectedWard}
                    />
                  </div>

                  {/* Ward list */}
                  <WardList
                    dict={dict}
                    wards={wards}
                    searchQuery={searchQuery}
                    selectedId={selectedWard?.id}
                    provinceName={selectedProvince.name}
                    loading={loadingWards}
                    onSelect={onWardSelect}
                    onBack={onBackToProvinces}
                  />
                </>
              ) : (
                /* Province list */
                <ProvinceList
                  dict={dict}
                  provinces={provinces}
                  searchQuery={searchQuery}
                  selectedId={highlightedProvince?.id}
                  onSelect={onProvinceSelect}
                  onDoubleClick={onProvinceDoubleClick}
                />
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
