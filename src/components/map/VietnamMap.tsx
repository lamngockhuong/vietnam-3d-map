'use client';

import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, BrightnessContrast, EffectComposer } from '@react-three/postprocessing';
import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { WebGLRenderer } from 'three';
import type { ProvinceData } from '@/data/provinces-data';
import { loadWardsForProvince, type WardData } from '@/data/wards-data';
import type { HandGestureState } from '@/hooks/useHandTracking';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { CameraController, type CameraControllerRef } from './CameraController';
import { Ocean } from './Ocean';
import { ProvinceLabels } from './ProvinceLabels';
import { Provinces } from './Provinces';
import { SkyDome } from './SkyDome';
import { WardLabels } from './WardLabels';
import { Wards } from './Wards';

interface TooltipData {
  name: string;
  info: string;
}

export interface VietnamMapRef {
  resetCamera: () => void;
  zoomToLocation: (center: [number, number], distance?: number) => void;
}

interface VietnamMapProps {
  dict: Dictionary;
  locale: Locale;
  gestureState?: HandGestureState | null;
  provinces: ProvinceData[];
  showLabels?: boolean;
  // Controlled selection props
  highlightedProvince?: ProvinceData | null;
  selectedProvince?: ProvinceData | null;
  selectedWard?: WardData | null;
  wards?: WardData[];
  loadingWards?: boolean;
  onProvinceClick?: (province: ProvinceData) => void;
  onProvinceDoubleClick?: (province: ProvinceData) => void;
  onWardClick?: (ward: WardData) => void;
  onBackToProvinces?: () => void;
  onWardModeChange?: (isWardMode: boolean) => void;
}

function Lights() {
  return (
    <>
      {/* Soft ambient for base illumination */}
      <ambientLight intensity={0.4} color={0xffffff} />

      {/* Main sunlight - directional with soft shadows */}
      <directionalLight
        position={[5, 12, 8]}
        intensity={1.8}
        color={0xfff8e7} // Warm sunlight
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* Secondary fill light - cooler from opposite side */}
      <directionalLight
        position={[-4, 8, -5]}
        intensity={0.5}
        color={0xe0f0ff} // Cool sky blue fill
      />

      {/* Hemisphere light matching sky colors */}
      <hemisphereLight
        args={[0x87ceeb, 0x1a5a7a, 0.5]} // Sky blue to ocean teal
      />

      {/* Subtle rim light for depth */}
      <directionalLight position={[0, 5, -10]} intensity={0.3} color={0xffffff} />
    </>
  );
}

function formatPopulation(pop: number): string {
  if (pop >= 1000000) {
    return `${(pop / 1000000).toFixed(1)}M`;
  }
  if (pop >= 1000) {
    return `${(pop / 1000).toFixed(0)}K`;
  }
  return pop.toString();
}

export const VietnamMap = forwardRef<VietnamMapRef, VietnamMapProps>(function VietnamMap(
  {
    dict,
    locale,
    gestureState,
    provinces,
    showLabels = true,
    highlightedProvince,
    selectedProvince: controlledSelectedProvince,
    selectedWard,
    wards: controlledWards = [],
    loadingWards: controlledLoadingWards = false,
    onProvinceClick,
    onProvinceDoubleClick,
    onWardClick,
    onBackToProvinces,
    onWardModeChange,
  },
  ref,
) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [contextLost, setContextLost] = useState(false);

  // Support both controlled and uncontrolled modes
  const [internalSelectedProvince, setInternalSelectedProvince] =
    useState<ProvinceData | null>(null);
  const [internalWards, setInternalWards] = useState<WardData[]>([]);
  const [internalLoadingWards, setInternalLoadingWards] = useState(false);

  // Use controlled props if provided, otherwise use internal state
  const isControlled = controlledSelectedProvince !== undefined;
  const selectedProvince = isControlled
    ? controlledSelectedProvince
    : internalSelectedProvince;
  const wards = isControlled ? controlledWards : internalWards;
  const loadingWards = isControlled ? controlledLoadingWards : internalLoadingWards;

  const rendererRef = useRef<WebGLRenderer | null>(null);
  const cameraControllerRef = useRef<CameraControllerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Notify parent when ward mode changes
  useEffect(() => {
    onWardModeChange?.(selectedProvince !== null);
  }, [selectedProvince, onWardModeChange]);

  // Expose camera control functions
  useImperativeHandle(
    ref,
    () => ({
      resetCamera: () => {
        cameraControllerRef.current?.resetCamera();
      },
      zoomToLocation: (center: [number, number], distance?: number) => {
        cameraControllerRef.current?.zoomToLocation(center, distance);
      },
    }),
    [],
  );

  const handleProvinceHover = useCallback(
    (province: ProvinceData | null) => {
      if (province) {
        setTooltip({
          name: province.name,
          info: `${province.type}  •  ${dict.provinces.population}: ${formatPopulation(province.population)}  •  ${dict.provinces.area}: ${province.area.toLocaleString('vi-VN')} km²`,
        });
      } else {
        setTooltip(null);
      }
    },
    [dict],
  );

  // Single click - highlight province only
  const handleProvinceClick = useCallback(
    (province: ProvinceData) => {
      if (isControlled && onProvinceClick) {
        // Controlled mode - let parent handle state
        onProvinceClick(province);
      }
      // In uncontrolled mode, single click does nothing (double click triggers ward mode)
    },
    [isControlled, onProvinceClick],
  );

  // Double click - trigger ward mode
  const handleProvinceDoubleClick = useCallback(
    async (province: ProvinceData) => {
      if (isControlled && onProvinceDoubleClick) {
        // Controlled mode - let parent handle state
        onProvinceDoubleClick(province);
      } else {
        // Uncontrolled mode - manage state internally
        setInternalSelectedProvince(province);
        setInternalLoadingWards(true);
        setInternalWards([]);

        const data = await loadWardsForProvince(province.id);
        if (data) {
          setInternalWards(data.wards);
        }
        setInternalLoadingWards(false);
      }
    },
    [isControlled, onProvinceDoubleClick],
  );

  const handleWardHover = useCallback(
    (ward: WardData | null) => {
      if (ward) {
        setTooltip({
          name: ward.name,
          info: `${ward.type}  •  ${dict.provinces.population}: ${formatPopulation(ward.population)}  •  ${dict.provinces.area}: ${ward.area.toLocaleString('vi-VN')} km²`,
        });
      } else {
        setTooltip(null);
      }
    },
    [dict],
  );

  const handleWardClick = useCallback(
    (ward: WardData) => {
      if (onWardClick) {
        onWardClick(ward);
      }
    },
    [onWardClick],
  );

  const handleBackToProvinces = useCallback(() => {
    if (isControlled && onBackToProvinces) {
      // Controlled mode
      onBackToProvinces();
    } else {
      // Uncontrolled mode
      setInternalSelectedProvince(null);
      setInternalWards([]);
    }
  }, [isControlled, onBackToProvinces]);

  const handleCreated = useCallback(({ gl }: { gl: WebGLRenderer }) => {
    rendererRef.current = gl;
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log('WebGL context lost, will restore...');
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setContextLost(false);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
  }, []);

  // Force remount when context is lost
  if (contextLost) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-[#0d3a52]">
        <div className="text-white text-lg">Restoring map...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Canvas
        className="map-canvas"
        shadows="soft"
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        onCreated={handleCreated}
      >
        <PerspectiveCamera makeDefault position={[0, 3, 4]} fov={50} />
        <CameraController ref={cameraControllerRef} gestureState={gestureState ?? null} />
        <Lights />

        {/* SkyDome provides seamless gradient background - rendered first */}
        <SkyDome />

        <Suspense fallback={null}>
          <group>
            <Ocean />
            {selectedProvince && wards.length > 0 ? (
              <>
                <Wards wards={wards} selectedWardId={selectedWard?.id} onHover={handleWardHover} onClick={handleWardClick} />
                <WardLabels wards={wards} showLabels={showLabels} />
              </>
            ) : (
              <>
                <Provinces
                  provinces={provinces}
                  selectedProvinceId={highlightedProvince?.id}
                  onHover={handleProvinceHover}
                  onClick={handleProvinceClick}
                  onDoubleClick={handleProvinceDoubleClick}
                />
                <ProvinceLabels provinces={provinces} showLabels={showLabels} locale={locale} />
              </>
            )}
          </group>
        </Suspense>

        {/* No Environment - using custom SkyDome instead */}

        {/* Post-processing effects - subtle settings */}
        <EffectComposer>
          {/* Very subtle bloom */}
          <Bloom intensity={0.1} luminanceThreshold={0.9} luminanceSmoothing={0.95} mipmapBlur />
          {/* Slight contrast boost */}
          <BrightnessContrast brightness={0} contrast={0.05} />
        </EffectComposer>
      </Canvas>

      {/* Back button when viewing wards - positioned below camera toggle */}
      {selectedProvince && (
        <button
          onClick={handleBackToProvinces}
          className="absolute top-20 sm:top-20 left-3 sm:left-8 z-50 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-black/90 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="text-sm font-medium" style={{ marginRight: '4px' }}>{selectedProvince.name}</span>
        </button>
      )}

      {/* Loading indicator */}
      {loadingWards && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 text-white">
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">{dict.camera.loading}</span>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-black/85 backdrop-blur-sm rounded-xl border border-white/20 pointer-events-none transform -translate-x-1/2 -translate-y-full shadow-xl"
          style={{
            left: mousePos.x,
            top: mousePos.y - 12,
            padding: '5px 10px',
          }}
        >
          <div className="text-vietnam-yellow font-semibold text-sm whitespace-nowrap mb-1.5">
            {tooltip.name}
          </div>
          <div className="text-white/80 text-xs whitespace-nowrap tracking-wide">
            {tooltip.info}
          </div>
        </div>
      )}
    </div>
  );
});
