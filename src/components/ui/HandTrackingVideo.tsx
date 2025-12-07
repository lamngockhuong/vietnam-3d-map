'use client';

import { useEffect } from 'react';
import { type GestureType, type HandGestureState, useHandTracking } from '@/hooks/useHandTracking';
import { useDraggable } from '@/hooks/useDraggable';
import type { Dictionary } from '@/i18n/dictionaries';
import { Hand, ZoomIn, RotateCcw, Pointer, Move, MoveHorizontal, ArrowUpDown, PanelLeft, Camera, GripHorizontal } from 'lucide-react';

interface HandTrackingVideoProps {
  dict: Dictionary;
  enabled: boolean;
  onGestureChange?: (gesture: HandGestureState) => void;
}

// Gesture display configuration
const GESTURE_CONFIG: Record<GestureType, { icon: typeof Hand; label: string; color: string }> = {
  'none': { icon: Hand, label: 'Ready', color: 'bg-slate-500' },
  'palm-rotate': { icon: Move, label: 'Rotating', color: 'bg-blue-500' },
  'pinch-zoom': { icon: ZoomIn, label: 'Zooming', color: 'bg-emerald-500' },
  'fist-reset': { icon: RotateCcw, label: 'Reset', color: 'bg-amber-500' },
  'pointing': { icon: Pointer, label: 'Fine Control', color: 'bg-purple-500' },
  'peace-toggle': { icon: PanelLeft, label: 'Toggle Sidebar', color: 'bg-pink-500' },
  'two-hand-zoom': { icon: ZoomIn, label: 'Two-Hand Zoom', color: 'bg-emerald-600' },
  'two-hand-pan': { icon: MoveHorizontal, label: 'Two-Point Pan', color: 'bg-cyan-600' },
  'two-hand-tilt': { icon: ArrowUpDown, label: 'Tilting', color: 'bg-indigo-600' },
  'two-hand-screenshot': { icon: Camera, label: 'Screenshot', color: 'bg-rose-600' },
  'two-hand-reset': { icon: RotateCcw, label: 'Two-Hand Reset', color: 'bg-amber-600' },
};

export function HandTrackingVideo({ dict, enabled, onGestureChange }: HandTrackingVideoProps) {
  const { videoRef, canvasRef, isLoading, error, gestureState } = useHandTracking(enabled);
  const { position, isDragging, elementRef, handleMouseDown, handleTouchStart } = useDraggable({
    storageKey: 'hand-tracking-video-position',
    initialPosition: { x: 16, y: 400 },
  });

  // Notify parent of gesture changes via useEffect to avoid setState during render
  useEffect(() => {
    if (onGestureChange && enabled) {
      onGestureChange(gestureState);
    }
  }, [onGestureChange, enabled, gestureState]);

  if (!enabled) return null;

  const getStatusText = () => {
    if (isLoading) return dict.camera.loading;
    if (error) return `${dict.camera.error}: ${error}`;
    return `${dict.camera.active} (${gestureState.handsDetected} ${gestureState.handsDetected === 1 ? 'hand' : 'hands'})`;
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-yellow-400';
    if (error) return 'text-red-400';
    return 'text-green-400';
  };

  const gestureConfig = GESTURE_CONFIG[gestureState.gesture];
  const GestureIcon = gestureConfig.icon;
  const confidencePercent = Math.round(gestureState.confidence * 100);

  return (
    <div
      ref={elementRef}
      className={`fixed w-48 overflow-hidden rounded-xl shadow-xl border border-white/20 bg-black/80 backdrop-blur-sm z-30 ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Drag handle */}
      <div
        data-drag-handle
        className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-800/90 cursor-grab active:cursor-grabbing select-none"
      >
        <GripHorizontal className="size-4 text-slate-400" />
        <span className="text-xs text-slate-400 font-medium">Camera</span>
      </div>

      {/* Video area */}
      <div className="relative aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Gesture indicator with icon */}
        {gestureState.gesture !== 'none' && (
          <div className={`absolute top-2 left-2 right-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${gestureConfig.color} text-white shadow-lg`}>
            <GestureIcon className="size-4" />
            <span className="text-sm font-medium">{gestureConfig.label}</span>

            {/* Confidence bar */}
            <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden ml-2">
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Visual guide when no gesture detected */}
        {gestureState.gesture === 'none' && gestureState.handsDetected > 0 && (
          <div className="absolute top-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 text-white/80 text-xs text-center">
            {dict.controls.openPalm}
          </div>
        )}
      </div>

      {/* Status bar at bottom */}
      <div
        className={`text-xs px-2 py-1.5 bg-black/60 ${getStatusColor()}`}
      >
        <div className="flex items-center justify-between">
          <span>{dict.camera.status}: {getStatusText()}</span>
          {gestureState.gesture !== 'none' && (
            <span className="text-white/70">
              {confidencePercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
