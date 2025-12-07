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
      <div className="px-4 py-6 text-center text-slate-400 text-sm">
        {dict.sidebar.selectProvince}
      </div>
    );
  }

  const infoItems = [
    {
      icon: <Layers className="size-4" />,
      label: dict.provinces.type,
      value: data.type,
      color: 'text-violet-500 bg-violet-50',
    },
    {
      icon: <Users className="size-4" />,
      label: dict.provinces.population,
      value: formatNumber(data.population, locale),
      color: 'text-blue-500 bg-blue-50',
    },
    {
      icon: <Ruler className="size-4" />,
      label: dict.provinces.area,
      value: formatArea(data.area, locale),
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      icon: <MapPin className="size-4" />,
      label: dict.provinces.density,
      value: formatDensity(data.density, locale),
      color: 'text-amber-500 bg-amber-50',
    },
  ];

  return (
    <div className="border-b border-slate-100 pb-4 mb-1">
      <h3 className="font-semibold text-slate-800 text-base mb-3">{data.name}</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100"
          >
            <div className={`size-6 rounded-md flex items-center justify-center shrink-0 ${item.color}`}>
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                {item.label}
              </div>
              <div className="text-sm font-semibold text-slate-700 truncate">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
