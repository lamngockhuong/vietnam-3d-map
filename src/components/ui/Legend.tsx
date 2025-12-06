'use client';

import { useEffect, useState } from 'react';
import { Map, X } from 'lucide-react';
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
  // Collapse by default on mobile (< 640px)
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Expand on desktop, stay collapsed on mobile
    const isMobile = window.innerWidth < 640;
    setIsOpen(!isMobile);
  }, []);

  return (
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
        <Card className="bg-white/90 backdrop-blur-md border-gray-100 shadow-lg min-w-[200px] py-0 gap-0">
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
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
