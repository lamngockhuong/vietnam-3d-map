'use client';

import { useEffect, useState } from 'react';
import {
  Hand,
  Home,
  Mouse,
  MoveVertical,
  Minimize2,
  Settings2,
  X,
} from 'lucide-react';
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

interface ControlsProps {
  dict: Dictionary;
  onResetCamera?: () => void;
}

export function Controls({ dict, onResetCamera }: ControlsProps) {
  // Collapse by default on mobile
  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device and set initial collapsed state
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
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
                <Settings2 className="size-5 text-gray-600" />
              </Button>
            </CollapsibleTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{dict.controls.title}</TooltipContent>
        </Tooltip>
      )}

      <CollapsibleContent>
        <Card className="bg-white/90 backdrop-blur-md border-gray-100 shadow-lg min-w-[240px] py-0 gap-0">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <CardTitle className="text-gray-700 font-semibold text-xs tracking-wide uppercase">
              {dict.controls.title}
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

          <CardContent className="px-4 py-3 space-y-4">
            {/* Touch Controls - shown on mobile */}
            {isTouchDevice && (
              <ControlSection title={dict.controls.touchControls}>
                <ControlItem icon={<DragIcon />} text={dict.controls.touchDrag} />
                <ControlItem icon={<PinchIcon />} text={dict.controls.touchPinch} />
                <ControlItem icon={<TwoFingerIcon />} text={dict.controls.touchTwoFinger} />
              </ControlSection>
            )}

            {/* Movement/Rotation Controls */}
            <ControlSection title={dict.controls.movement}>
              <ControlItem icon={<Mouse className="size-4" />} text={dict.controls.drag} />
              <ControlItem icon={<KeyboardKey label="R" />} text={dict.controls.reset} />
            </ControlSection>

            {/* Zoom Controls */}
            <ControlSection title={dict.controls.zoomLabel}>
              <ControlItem icon={<MoveVertical className="size-4" />} text={dict.controls.scroll} />
              <ControlItem icon={<KeyboardKey label="+/-" />} text={dict.controls.zoom} />
            </ControlSection>

            {/* Hand Tracking Section */}
            <ControlSection title={dict.controls.handTracking} noBorder>
              <ControlItem icon={<Hand className="size-4" />} text={dict.controls.openPalm} />
              <ControlItem icon={<Minimize2 className="size-4" />} text={dict.controls.pinch} />
              <ControlItem icon={<FistIcon />} text={dict.controls.fist} />
            </ControlSection>

            {/* Reset Button */}
            {onResetCamera && (
              <Button
                variant="secondary"
                onClick={onResetCamera}
                className="w-full"
              >
                <Home className="size-4" />
                Reset View
              </Button>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Control section with title
function ControlSection({
  title,
  children,
  noBorder = false,
}: {
  title: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div className={noBorder ? '' : 'pb-4 border-b border-gray-200'}>
      <div className="text-muted-foreground text-[10px] mb-2.5 font-semibold uppercase tracking-wider">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// Reusable control item component
function ControlItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-600 text-sm">
      <div className="size-6 flex items-center justify-center text-gray-500 shrink-0">
        {icon}
      </div>
      <span className="leading-tight">{text}</span>
    </div>
  );
}

// Keyboard key badge
function KeyboardKey({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 bg-muted rounded text-[11px] font-mono text-muted-foreground min-w-[24px] text-center">
      {label}
    </span>
  );
}

// Custom SVG Icons (not available in lucide-react)
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
