'use client';

import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { VIETNAM_BOUNDS } from '@/data/provinces-data';
import type { WardData } from '@/data/wards-data';
import type { MapCenter } from '@/types';

// Ward color categories
type WardColorCategory = 'ward' | 'commune' | 'town';

const WARD_COLORS: Record<WardColorCategory, number> = {
  ward: 0x66bb6a, // Green for Phường
  commune: 0x4caf50, // Darker green for Xã
  town: 0xffc107, // Gold for Thị trấn
};

const HOVER_COLOR = 0xffffff;
const OUTLINE_COLOR = 0xffffff;

function getWardCategory(ward: WardData): WardColorCategory {
  if (ward.type === 'Phường') return 'ward';
  if (ward.type === 'Thị trấn') return 'town';
  return 'commune';
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
  category: WardColorCategory;
}

interface WardsProps {
  wards: WardData[];
  onHover?: (ward: WardData | null) => void;
}

export function Wards({ wards, onHover }: WardsProps) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);
  const hoveredWardRef = useRef<string | null>(null);
  const onHoverRef = useRef(onHover);

  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  // Ward elevation (slightly raised from ocean)
  const elevation = 0.025;

  // Create ward geometries
  const wardGeometries = useMemo(() => {
    if (wards.length === 0) return [];

    const geos: WardGeometry[] = [];

    wards.forEach((ward) => {
      const category = getWardCategory(ward);
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
            category,
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

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, [gl.domElement, handlePointerMove]);

  if (wardGeometries.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef} name="province-wards">
      {wardGeometries.map((item, index) => {
        const isHovered = hoveredWard === item.ward.id;
        const color = isHovered ? HOVER_COLOR : WARD_COLORS[item.category];

        return (
          <group key={index}>
            <mesh
              geometry={item.geometry}
              userData={{ wardId: item.ward.id }}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={color}
                emissive={isHovered ? 0x222222 : 0x000000}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
            {item.outlineGeometry && (
              <lineSegments geometry={item.outlineGeometry} material={outlineMaterial} />
            )}
          </group>
        );
      })}
    </group>
  );
}
