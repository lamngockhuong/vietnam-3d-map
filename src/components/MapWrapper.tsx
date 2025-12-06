'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { VietnamMapRef } from '@/components/map/VietnamMap';
import { Controls } from '@/components/ui/Controls';
import { HandTrackingVideo } from '@/components/ui/HandTrackingVideo';
import { loadProvinces, type ProvinceData } from '@/data/provinces-data';
import type { HandGestureState } from '@/hooks/useHandTracking';
import type { Dictionary } from '@/i18n/dictionaries';

const VietnamMap = dynamic(
  () => import('@/components/map/VietnamMap').then((mod) => mod.VietnamMap),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-vietnam-ocean flex flex-col items-center justify-center">
        <div className="loader-container mb-8">
          <div className="loader-ring" />
          <div className="loader-ring" />
          <div className="loader-ring" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-widest mb-4">VIETNAM 3D MAP</h1>
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    ),
  },
);

interface MapWrapperProps {
  dict: Dictionary;
}

export function MapWrapper({ dict }: MapWrapperProps) {
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const [gestureState, setGestureState] = useState<HandGestureState | null>(null);
  const [provinces, setProvinces] = useState<ProvinceData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<VietnamMapRef>(null);

  // Preload provinces data at wrapper level
  useEffect(() => {
    loadProvinces()
      .then((data) => {
        setProvinces(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load provinces:', err);
        setIsLoading(false);
      });
  }, []);

  const handleGestureChange = useCallback((gesture: HandGestureState) => {
    setGestureState(gesture);
  }, []);

  const toggleHandTracking = useCallback(() => {
    setHandTrackingEnabled((prev) => !prev);
    if (handTrackingEnabled) {
      setGestureState(null);
    }
  }, [handTrackingEnabled]);

  const handleResetCamera = useCallback(() => {
    mapRef.current?.resetCamera();
  }, []);

  // Show loading until provinces are ready
  if (isLoading || !provinces) {
    return (
      <div className="fixed inset-0 bg-vietnam-ocean flex flex-col items-center justify-center">
        <div className="loader-container mb-8">
          <div className="loader-ring" />
          <div className="loader-ring" />
          <div className="loader-ring" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-widest mb-4">VIETNAM 3D MAP</h1>
        <div className="text-white/60 text-sm">Loading map data...</div>
      </div>
    );
  }

  return (
    <>
      <VietnamMap ref={mapRef} dict={dict} gestureState={gestureState} provinces={provinces} />

      {/* Hand Tracking Video */}
      <HandTrackingVideo
        dict={dict}
        enabled={handTrackingEnabled}
        onGestureChange={handleGestureChange}
      />

      {/* Controls Panel - increased margins */}
      <div className="fixed bottom-8 left-8 z-10">
        <Controls dict={dict} onResetCamera={handleResetCamera} />
      </div>

      {/* Toggle Hand Tracking Button - positioned next to language switcher */}
      <button
        onClick={toggleHandTracking}
        className={`fixed top-8 right-[88px] z-10 w-11 h-11 rounded-xl shadow-lg border transition-all flex items-center justify-center ${
          handTrackingEnabled
            ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
            : 'bg-white/90 backdrop-blur-md text-gray-600 border-gray-100 hover:bg-white hover:shadow-xl'
        }`}
        title={handTrackingEnabled ? dict.controls.disableCamera : dict.controls.enableCamera}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          {handTrackingEnabled ? (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </>
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          )}
        </svg>
      </button>
    </>
  );
}
