'use client';

import { useCallback, useEffect, useState } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useUIState } from '@/hooks/useUIState';
import {
  Hand,
  Home,
  Mouse,
  MoveVertical,
  Minimize2,
  Gamepad2,
  X,
  Smartphone,
  Camera,
  Pointer,
} from 'lucide-react';
import type { Dictionary } from '@/i18n/dictionaries';
import { Button } from '@/components/ui/button';
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

interface ControlsProps {
  dict: Dictionary;
  onResetCamera?: () => void;
}

export function Controls({ dict, onResetCamera }: ControlsProps) {
  const [isOpen, setIsOpen] = useUIState('controlsOpen');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const containerRef = useClickOutside<HTMLDivElement>(handleClose, isOpen);

  return (
    <div ref={containerRef}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Collapsed state - floating action button */}
        {!isOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-12 rounded-2xl bg-white/95 backdrop-blur-xl border-white/50 shadow-lg shadow-black/5 hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Gamepad2 className="size-5 text-slate-600" />
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {dict.controls.title}
            </TooltipContent>
          </Tooltip>
        )}

        <CollapsibleContent>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-black/10 min-w-[280px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Gamepad2 className="size-4.5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">
                  {dict.controls.title}
                </span>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="size-4" />
                </Button>
              </CollapsibleTrigger>
            </div>

            <div className="p-4 space-y-5">
              {/* Touch Controls - shown on mobile */}
              {isTouchDevice && (
                <ControlSection
                  title={dict.controls.touchControls}
                  icon={<Smartphone className="size-4 text-white" />}
                  gradient="from-pink-500 to-rose-600"
                >
                  <ControlItem icon={<DragIcon />} text={dict.controls.touchDrag} />
                  <ControlItem icon={<PinchIcon />} text={dict.controls.touchPinch} />
                  <ControlItem icon={<TwoFingerIcon />} text={dict.controls.touchTwoFinger} />
                </ControlSection>
              )}

              {/* Movement/Rotation Controls */}
              <ControlSection
                title={dict.controls.movement}
                icon={<Mouse className="size-4 text-white" />}
                gradient="from-blue-500 to-cyan-600"
              >
                <ControlItem icon={<Mouse className="size-4" />} text={dict.controls.drag} />
                <ControlItem icon={<KeyboardKey label="R" />} text={dict.controls.reset} />
              </ControlSection>

              {/* Zoom Controls */}
              <ControlSection
                title={dict.controls.zoomLabel}
                icon={<MoveVertical className="size-4 text-white" />}
                gradient="from-emerald-500 to-teal-600"
              >
                <ControlItem icon={<MoveVertical className="size-4" />} text={dict.controls.scroll} />
                <ControlItem icon={<KeyboardKey label="+/-" />} text={dict.controls.zoom} />
              </ControlSection>

              {/* Hand Tracking Section */}
              <ControlSection
                title={dict.controls.handTracking}
                icon={<Hand className="size-4 text-white" />}
                gradient="from-amber-500 to-orange-600"
                noBorder
              >
                <ControlItem icon={<Hand className="size-4" />} text={dict.controls.openPalm} />
                <ControlItem icon={<Minimize2 className="size-4" />} text={dict.controls.pinch} />
                <ControlItem icon={<FistIcon />} text={dict.controls.fist} />
                <ControlItem icon={<PeaceIcon />} text={dict.controls.peace} />
                <ControlItem icon={<Pointer className="size-4" />} text={dict.controls.pointing} />
                <ControlItem icon={<Camera className="size-4" />} text={dict.controls.twoHandPeace} />
              </ControlSection>

              {/* Reset Button */}
              {onResetCamera && (
                <Button
                  variant="outline"
                  onClick={onResetCamera}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-slate-50 to-white border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                  <Home className="size-4 mr-2 text-slate-500 group-hover:text-vietnam-ocean transition-colors" />
                  <span className="font-medium text-slate-600 group-hover:text-slate-800">
                    Reset View
                  </span>
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Control section with title and icon
function ControlSection({
  title,
  icon,
  gradient,
  children,
  noBorder = false,
}: {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div className={noBorder ? '' : 'pb-4 border-b border-slate-100'}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`size-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="space-y-1.5 pl-0.5">{children}</div>
    </div>
  );
}

// Reusable control item component
function ControlItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
      <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-slate-200 group-hover:text-slate-600 transition-colors">
        {icon}
      </div>
      <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors leading-tight">
        {text}
      </span>
    </div>
  );
}

// Keyboard key badge
function KeyboardKey({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 bg-slate-200 rounded-md text-[11px] font-mono font-semibold text-slate-600 min-w-[28px] text-center shadow-sm border border-slate-300">
      {label}
    </span>
  );
}

// Custom SVG Icons
function DragIcon() {
  return (
    <svg
      className="size-4"
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
      className="size-4"
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
      className="size-4"
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

function FistIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M12 8c0-2.21 1.79-4 4-4s4 1.79 4 4v4c0 4.418-3.582 8-8 8s-8-3.582-8-8V9a3 3 0 016 0" />
    </svg>
  );
}

function PeaceIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M9 4v12M15 4v12" />
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="15" cy="3" r="1.5" />
      <path d="M6 20c0-2 1.5-4 6-4s6 2 6 4" />
    </svg>
  );
}
