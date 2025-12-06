'use client';

import { useEffect } from 'react';
import { type HandGestureState, useHandTracking } from '@/hooks/useHandTracking';
import type { Dictionary } from '@/i18n/dictionaries';

interface HandTrackingVideoProps {
  dict: Dictionary;
  enabled: boolean;
  onGestureChange?: (gesture: HandGestureState) => void;
}

export function HandTrackingVideo({ dict, enabled, onGestureChange }: HandTrackingVideoProps) {
  const { videoRef, canvasRef, isLoading, error, gestureState } = useHandTracking(enabled);

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

  return (
    <div className="video-container glass-panel">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto"
        style={{ transform: 'scaleX(-1)' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
      />
      <div
        className={`absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded bg-black/50 ${getStatusColor()}`}
      >
        {dict.camera.status}: {getStatusText()}
      </div>
      {gestureState.gesture !== 'none' && (
        <div className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded bg-black/50 text-vietnam-yellow">
          {gestureState.gesture}
        </div>
      )}
    </div>
  );
}
