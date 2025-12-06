'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { VIETNAM_BOUNDS } from '@/data/provinces-data';
import type { WardData } from '@/data/wards-data';
import type { MapCenter } from '@/types';

const HOVER_COLOR = 0xffffff;
const OUTLINE_COLOR = 0xffffff;
const SELECTED_OUTLINE_COLOR = 0x00ff00; // Bright green for selected outline
const SELECTED_GLOW_COLOR = 0x00ffff; // Cyan glow

// Color palette for random ward colors (vibrant, distinct colors)
const WARD_COLOR_PALETTE = [
  0xe57373, // Red
  0xf06292, // Pink
  0xba68c8, // Purple
  0x9575cd, // Deep Purple
  0x7986cb, // Indigo
  0x64b5f6, // Blue
  0x4fc3f7, // Light Blue
  0x4dd0e1, // Cyan
  0x4db6ac, // Teal
  0x81c784, // Green
  0xaed581, // Light Green
  0xdce775, // Lime
  0xfff176, // Yellow
  0xffd54f, // Amber
  0xffb74d, // Orange
  0xff8a65, // Deep Orange
  0xa1887f, // Brown
  0x90a4ae, // Blue Grey
  0x7e57c2, // Violet
  0x5c6bc0, // Indigo Alt
  0x42a5f5, // Blue Alt
  0x26c6da, // Cyan Alt
  0x26a69a, // Teal Alt
  0x66bb6a, // Green Alt
  0x9ccc65, // Light Green Alt
  0xd4e157, // Lime Alt
  0xffee58, // Yellow Alt
  0xffca28, // Amber Alt
  0xffa726, // Orange Alt
  0xff7043, // Deep Orange Alt
];

// Generate consistent random color based on ward id
function getWardColor(wardId: string): number {
  // Simple hash function to get consistent color for same ward
  let hash = 0;
  for (let i = 0; i < wardId.length; i++) {
    hash = wardId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % WARD_COLOR_PALETTE.length;
  return WARD_COLOR_PALETTE[index];
}

const center: MapCenter = {
  lat: VIETNAM_BOUNDS.centerLat,
  lon: VIETNAM_BOUNDS.centerLon,
};
const scale = 0.35;

function geoTo3D(lon: number, lat: number) {
  return {
    x: (lon - center.lon) * scale,
    z: -(lat - center.lat) * scale,
  };
}

interface WardGeometry {
  geometry: THREE.BufferGeometry;
  outlineGeometry: THREE.BufferGeometry | null;
  ward: WardData;
  color: number;
}

interface WardsProps {
  wards: WardData[];
  selectedWardId?: string | null;
  onHover?: (ward: WardData | null) => void;
  onClick?: (ward: WardData) => void;
}

export function Wards({ wards, selectedWardId, onHover, onClick }: WardsProps) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);
  const hoveredWardRef = useRef<string | null>(null);
  const onHoverRef = useRef(onHover);
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  // Ward elevation (slightly raised from ocean)
  const elevation = 0.025;

  // Create ward geometries
  const wardGeometries = useMemo(() => {
    if (wards.length === 0) return [];

    const geos: WardGeometry[] = [];

    wards.forEach((ward) => {
      const color = getWardColor(ward.id);
      const geometries: THREE.BufferGeometry[] = [];
      const outlineSegments: number[] = [];

      ward.polygons.forEach((polygon) => {
        if (polygon.length < 3) return;

        try {
          const shape = new THREE.Shape();
          const polygonPoints: { x: number; z: number }[] = [];

          polygon.forEach((coord, i) => {
            const pos = geoTo3D(coord[0], coord[1]);
            if (i === 0) {
              shape.moveTo(pos.x, -pos.z);
            } else {
              shape.lineTo(pos.x, -pos.z);
            }
            polygonPoints.push(pos);
          });

          // Create line segments for outline
          const y = elevation + 0.002;
          for (let i = 0; i < polygonPoints.length; i++) {
            const p1 = polygonPoints[i];
            const p2 = polygonPoints[(i + 1) % polygonPoints.length];
            outlineSegments.push(p1.x, y, p1.z, p2.x, y, p2.z);
          }

          const geo = new THREE.ExtrudeGeometry([shape], {
            depth: elevation,
            bevelEnabled: false,
          });
          geo.rotateX(-Math.PI / 2);
          geometries.push(geo);
        } catch {
          // Skip invalid polygons
        }
      });

      if (geometries.length > 0) {
        const merged = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);

        let outlineGeo: THREE.BufferGeometry | null = null;
        if (outlineSegments.length > 0) {
          outlineGeo = new THREE.BufferGeometry();
          outlineGeo.setAttribute('position', new THREE.Float32BufferAttribute(outlineSegments, 3));
        }

        if (merged) {
          geos.push({
            geometry: merged,
            outlineGeometry: outlineGeo,
            ward,
            color,
          });
        }

        if (geometries.length > 1) {
          geometries.forEach((g) => g.dispose());
        }
      }
    });

    return geos;
  }, [wards]);

  // Outline material
  const outlineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: OUTLINE_COLOR,
      linewidth: 1,
      transparent: true,
      opacity: 0.4,
    });
  }, []);

  // Selected outline material - flickering effect (inner)
  const selectedOutlineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: SELECTED_OUTLINE_COLOR,
      linewidth: 2,
      transparent: true,
      opacity: 1,
    });
  }, []);

  // Glow outline material (outer glow effect)
  const glowOutlineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: SELECTED_GLOW_COLOR,
      linewidth: 3,
      transparent: true,
      opacity: 0.6,
    });
  }, []);

  // Animate flickering outline for selected ward
  useFrame(({ clock }) => {
    if (selectedWardId) {
      // Fast pulsing for main outline (0.5 to 1.0)
      const pulse = Math.sin(clock.elapsedTime * 8) * 0.25 + 0.75;
      selectedOutlineMaterial.opacity = pulse;

      // Slower pulsing for glow (0.3 to 0.8)
      const glowPulse = Math.sin(clock.elapsedTime * 4) * 0.25 + 0.55;
      glowOutlineMaterial.opacity = glowPulse;
    }
  });

  // Handle pointer move for raycasting
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!groupRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current
        .intersectObjects(groupRef.current.children, true)
        .filter((hit) => hit.object.type === 'Mesh');

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const wardId = mesh.userData.wardId as string;

        if (wardId !== hoveredWardRef.current) {
          hoveredWardRef.current = wardId;
          setHoveredWard(wardId);
          const ward = wards.find((w) => w.id === wardId);
          if (ward && onHoverRef.current) {
            onHoverRef.current(ward);
          }
        }
      } else if (hoveredWardRef.current !== null) {
        hoveredWardRef.current = null;
        setHoveredWard(null);
        if (onHoverRef.current) {
          onHoverRef.current(null);
        }
      }
    },
    [camera, gl.domElement, wards],
  );

  // Handle click for ward selection
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!groupRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current
        .intersectObjects(groupRef.current.children, true)
        .filter((hit) => hit.object.type === 'Mesh');

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const wardId = mesh.userData.wardId as string;
        const ward = wards.find((w) => w.id === wardId);
        if (ward && onClickRef.current) {
          onClickRef.current(ward);
        }
      }
    },
    [camera, gl.domElement, wards],
  );

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gl.domElement, handlePointerMove, handleClick]);

  if (wardGeometries.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef} name="province-wards">
      {wardGeometries.map((item, index) => {
        const isHovered = hoveredWard === item.ward.id;
        const isSelected = selectedWardId === item.ward.id;
        const displayColor = isHovered || isSelected ? HOVER_COLOR : item.color;

        return (
          <group key={index}>
            <mesh
              geometry={item.geometry}
              userData={{ wardId: item.ward.id }}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={displayColor}
                emissive={isSelected ? 0x004444 : isHovered ? 0x222222 : 0x000000}
                emissiveIntensity={isSelected ? 1.5 : 1}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
            {item.outlineGeometry && (
              <lineSegments geometry={item.outlineGeometry} material={outlineMaterial} />
            )}
            {/* Flickering outline for selected ward */}
            {isSelected && item.outlineGeometry && (
              <>
                {/* Outer glow layer */}
                <lineSegments
                  geometry={item.outlineGeometry}
                  material={glowOutlineMaterial}
                  position={[0, 0.003, 0]}
                />
                {/* Inner bright outline */}
                <lineSegments
                  geometry={item.outlineGeometry}
                  material={selectedOutlineMaterial}
                  position={[0, 0.005, 0]}
                />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}
