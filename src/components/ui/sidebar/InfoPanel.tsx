'use client';

import { MapPin, Users, Ruler, Layers } from 'lucide-react';
import type { ProvinceData } from '@/data/provinces-data';
import type { WardData } from '@/data/wards-data';
import type { Dictionary } from '@/i18n/dictionaries';

interface InfoPanelProps {
  dict: Dictionary;
  province?: ProvinceData | null;
  ward?: WardData | null;
}

function formatNumber(num: number, locale: string): string {
  return num.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US');
}

function formatArea(area: number, locale: string): string {
  return `${formatNumber(Math.round(area * 100) / 100, locale)} km²`;
}

function formatDensity(density: number, locale: string): string {
  return `${formatNumber(Math.round(density), locale)}/km²`;
}

export function InfoPanel({ dict, province, ward }: InfoPanelProps) {
  const data = ward || province;
  const locale = dict.meta.title.includes('Việt Nam') ? 'vi' : 'en';

  if (!data) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        {dict.sidebar.selectProvince}
      </div>
    );
  }

  const infoItems = [
    {
      icon: <Layers className="size-4" />,
      label: dict.provinces.type,
      value: data.type,
    },
    {
      icon: <Users className="size-4" />,
      label: dict.provinces.population,
      value: formatNumber(data.population, locale),
    },
    {
      icon: <Ruler className="size-4" />,
      label: dict.provinces.area,
      value: formatArea(data.area, locale),
    },
    {
      icon: <MapPin className="size-4" />,
      label: dict.provinces.density,
      value: formatDensity(data.density, locale),
    },
  ];

  return (
    <div className="border-b border-gray-200 pb-3 mb-3">
      <h3 className="font-semibold text-gray-800 text-base mb-3">{data.name}</h3>
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
              <div className="text-sm font-medium text-gray-700 truncate">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
