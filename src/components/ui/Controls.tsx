'use client';

import { useEffect, useState } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';

interface ControlsProps {
  dict: Dictionary;
  onResetCamera?: () => void;
}

export function Controls({ dict, onResetCamera }: ControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <div className="relative">
      {/* Collapsed state - compact icon button */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-xl transition-all"
          title={dict.controls.title}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>
      ) : (
        <div className="bg-white/90 backdrop-blur-md rounded-xl px-5 py-4 shadow-lg border border-gray-100 min-w-[240px]">
          {/* Header with close button */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
            <h3 className="text-gray-700 font-semibold text-xs tracking-wide uppercase">
              {dict.controls.title}
            </h3>
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-7 h-7 -mr-1 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title="Hide controls"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Touch Controls - shown on mobile */}
          {isTouchDevice && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="text-gray-500 text-[10px] mb-3 font-semibold uppercase tracking-wider">
                {dict.controls.touchControls}
              </div>
              <div className="space-y-2.5">
                <ControlItem icon={<DragIcon />} text={dict.controls.touchDrag} />
                <ControlItem icon={<PinchIcon />} text={dict.controls.touchPinch} />
                <ControlItem icon={<TwoFingerIcon />} text={dict.controls.touchTwoFinger} />
              </div>
            </div>
          )}

          {/* Movement/Rotation Controls */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-gray-500 text-[10px] mb-3 font-semibold uppercase tracking-wider">
              {dict.controls.movement}
            </div>
            <div className="space-y-2.5">
              <ControlItem icon={<MouseIcon />} text={dict.controls.drag} />
              <ControlItem icon={<KeyboardKey label="R" />} text={dict.controls.reset} />
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-gray-500 text-[10px] mb-3 font-semibold uppercase tracking-wider">
              {dict.controls.zoomLabel}
            </div>
            <div className="space-y-2.5">
              <ControlItem icon={<ScrollIcon />} text={dict.controls.scroll} />
              <ControlItem icon={<KeyboardKey label="+/-" />} text={dict.controls.zoom} />
            </div>
          </div>

          {/* Hand Tracking Section */}
          <div className="mb-4">
            <div className="text-gray-500 text-[10px] mb-3 font-semibold uppercase tracking-wider">
              {dict.controls.handTracking}
            </div>
            <div className="space-y-2.5">
              <ControlItem icon={<HandIcon />} text={dict.controls.openPalm} />
              <ControlItem icon={<PinchIcon />} text={dict.controls.pinch} />
              <ControlItem icon={<FistIcon />} text={dict.controls.fist} />
            </div>
          </div>

          {/* Reset Button - standalone at bottom */}
          {onResetCamera && (
            <button
              onClick={onResetCamera}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-gray-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Reset View
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable control item component
function ControlItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-600 text-sm">
      <div className="w-6 h-6 flex items-center justify-center text-gray-500 flex-shrink-0">
        {icon}
      </div>
      <span className="leading-tight">{text}</span>
    </div>
  );
}

// Keyboard key badge
function KeyboardKey({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 bg-gray-200 rounded text-[11px] font-mono text-gray-600 min-w-[24px] text-center">
      {label}
    </span>
  );
}

// SVG Icons - cleaner, more recognizable icons
function MouseIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="6" y="3" width="12" height="18" rx="6" />
      <line x1="12" y1="7" x2="12" y2="11" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M12 5v14M8 9l4-4 4 4M8 15l4 4 4-4" />
    </svg>
  );
}

function DragIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PinchIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M6 6l4 4M18 6l-4 4M6 18l4-4M18 18l-4-4" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TwoFingerIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M8 7v10M16 7v10" />
      <circle cx="8" cy="5" r="2" />
      <circle cx="16" cy="5" r="2" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M18 11V6a2 2 0 00-4 0v5M14 10V4a2 2 0 00-4 0v6M10 10V6a2 2 0 00-4 0v8c0 4.418 3.582 8 8 8s6-2 6-6v-3a2 2 0 00-4 0" />
    </svg>
  );
}

function FistIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M12 8c0-2.21 1.79-4 4-4s4 1.79 4 4v4c0 4.418-3.582 8-8 8s-8-3.582-8-8V9a3 3 0 016 0" />
    </svg>
  );
}
