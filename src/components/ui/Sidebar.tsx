'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { ProvinceData } from '@/data/provinces-data';
import type { WardData } from '@/data/wards-data';
import type { Dictionary } from '@/i18n/dictionaries';
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
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Expand on desktop, collapse on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    setIsOpen(!isMobile);
  }, []);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {/* Collapsed state - toggle button */}
      {!isOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 bg-white/90 backdrop-blur-md border-gray-100 shadow-lg hover:bg-white hover:shadow-xl"
              >
                <Menu className="size-5 text-gray-600" />
              </Button>
            </CollapsibleTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">{dict.sidebar.title}</TooltipContent>
        </Tooltip>
      )}

      <CollapsibleContent>
        <Card className="bg-white/90 backdrop-blur-md border-gray-100 shadow-lg w-80 h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] flex flex-col py-0 gap-0">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <CardTitle className="text-gray-700 font-semibold text-xs tracking-wide uppercase">
              {dict.sidebar.title}
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

          <CardContent className="flex flex-col flex-1 min-h-0 p-0">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
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
                  <div className="px-3 pt-3">
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
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
