'use client';

import { useEffect, useState } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';

interface ScreenshotCountdownProps {
  dict: Dictionary;
  countdown: number | null;
  onCancel: () => void;
}

export function ScreenshotCountdown({ dict, countdown, onCancel }: ScreenshotCountdownProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Handle exit animation when countdown finishes
  useEffect(() => {
    if (countdown === 0) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsExiting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (countdown === null && !isExiting) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        countdown === null ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Countdown content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Countdown number with animation */}
        <div className="relative">
          {/* Animated ring */}
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={339.292}
              strokeDashoffset={countdown !== null ? (339.292 * (3 - countdown)) / 3 : 339.292}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              key={countdown}
              className="text-7xl font-bold text-white drop-shadow-lg animate-pulse"
            >
              {countdown === 0 ? '!' : countdown}
            </span>
          </div>
        </div>

        {/* Label */}
        <div className="text-white text-xl font-medium drop-shadow-md">
          {countdown === 0 ? dict.screenshot.captured : dict.screenshot.countdown}
        </div>

        {/* Cancel button */}
        {countdown !== null && countdown > 0 && (
          <button
            onClick={onCancel}
            className="pointer-events-auto px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors border border-white/30"
          >
            {dict.screenshot.cancelled}
          </button>
        )}
      </div>
    </div>
  );
}
