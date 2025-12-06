'use client';

import type { Dictionary } from '@/i18n/dictionaries';

interface LoadingScreenProps {
  dict: Dictionary;
  status: string;
  isReady: boolean;
}

export function LoadingScreen({ dict, status, isReady }: LoadingScreenProps) {
  if (isReady) return null;

  return (
    <div className="fixed inset-0 bg-vietnam-ocean flex flex-col items-center justify-center z-50 transition-opacity duration-500">
      <div className="loader-container mb-8">
        <div className="loader-ring" />
        <div className="loader-ring" />
        <div className="loader-ring" />
      </div>
      <h1 className="text-4xl font-bold text-white tracking-widest mb-4">VIETNAM 3D MAP</h1>
      <div className="text-white/60 text-sm">{status}</div>
    </div>
  );
}
