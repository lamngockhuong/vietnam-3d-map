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
import type { HandGestureState } from '@/hooks/useHandTracking';
import type { Dictionary } from '@/i18n/dictionaries';
import { CameraController, type CameraControllerRef } from './CameraController';
import { Ocean } from './Ocean';
import { ProvinceLabels } from './ProvinceLabels';
import { Provinces } from './Provinces';
import { SkyDome } from './SkyDome';

interface TooltipData {
  name: string;
  info: string;
}

export interface VietnamMapRef {
  resetCamera: () => void;
}

interface VietnamMapProps {
  dict: Dictionary;
  gestureState?: HandGestureState | null;
  provinces: ProvinceData[];
  showLabels?: boolean;
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
  { dict, gestureState, provinces, showLabels = true },
  ref,
) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [contextLost, setContextLost] = useState(false);
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

  // Expose reset camera function
  useImperativeHandle(
    ref,
    () => ({
      resetCamera: () => {
        cameraControllerRef.current?.resetCamera();
      },
    }),
    [],
  );

  const handleProvinceHover = useCallback(
    (province: ProvinceData | null) => {
      if (province) {
        setTooltip({
          name: province.name,
          info: `${province.type} | ${dict.provinces.population}: ${formatPopulation(province.population)} | ${dict.provinces.area}: ${province.area.toLocaleString('vi-VN')} km²`,
        });
      } else {
        setTooltip(null);
      }
    },
    [dict],
  );

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
            <Provinces provinces={provinces} onHover={handleProvinceHover} />
            <ProvinceLabels provinces={provinces} showLabels={showLabels} />
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

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: mousePos.x,
            top: mousePos.y - 10,
          }}
        >
          <div className="text-white font-semibold text-sm whitespace-nowrap">{tooltip.name}</div>
          <div className="text-white/70 text-xs whitespace-nowrap">{tooltip.info}</div>
        </div>
      )}
    </div>
  );
});
