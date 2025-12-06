'use client';

import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { type ProvinceData, VIETNAM_BOUNDS } from '@/data/provinces-data';
import type { MapCenter } from '@/types';

// Province color categories - More saturated colors
type ColorCategory = 'default' | 'city' | 'capital' | 'highland' | 'coastal';

const PROVINCE_COLORS: Record<ColorCategory, number> = {
  default: 0x4caf50, // Saturated green (was 66bb6a)
  city: 0xffc107, // Saturated amber/gold (was ffd54f)
  capital: 0xf44336, // Saturated red (was ef5350)
  highland: 0x66bb6a, // Medium green (was 81c784)
  coastal: 0x00bcd4, // Saturated cyan (was 4fc3f7)
};

const HOVER_COLOR = 0xffffff; // White highlight on hover
const OUTLINE_COLOR = 0xffffff; // White outline for coastlines

const HIGHLAND_PROVINCES = new Set([
  'Lai Châu',
  'Điện Biên',
  'Sơn La',
  'Lào Cai',
  'Tuyên Quang',
  'Cao Bằng',
  'Lạng Sơn',
  'Đắk Lắk',
  'Gia Lai',
  'Lâm Đồng',
]);

const COASTAL_PROVINCES = new Set([
  'Quảng Ninh',
  'Hải Phòng',
  'Hưng Yên',
  'Ninh Bình',
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Trị',
  'Huế',
  'Đà Nẵng',
  'Quảng Ngãi',
  'Khánh Hòa',
  'TP. Hồ Chí Minh',
  'Đồng Tháp',
  'Vĩnh Long',
  'Cà Mau',
]);

function getProvinceCategory(province: ProvinceData): ColorCategory {
  if (province.name === 'Hà Nội') return 'capital';
  if (province.type === 'Thành phố') return 'city';
  if (HIGHLAND_PROVINCES.has(province.name)) return 'highland';
  if (COASTAL_PROVINCES.has(province.name)) return 'coastal';
  return 'default';
}

function getProvinceElevation(category: ColorCategory): number {
  switch (category) {
    case 'capital':
      return 0.06;
    case 'city':
      return 0.04;
    case 'highland':
      return 0.08;
    default:
      return 0.03;
  }
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

interface ProvinceGeometry {
  geometry: THREE.BufferGeometry;
  outlineGeometry: THREE.BufferGeometry | null;
  province: ProvinceData;
  category: ColorCategory;
}

interface ProvincesProps {
  provinces: ProvinceData[];
  onHover?: (province: ProvinceData | null) => void;
  onClick?: (province: ProvinceData) => void;
}

export function Provinces({ provinces, onHover, onClick }: ProvincesProps) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const hoveredProvinceRef = useRef<string | null>(null);
  const onHoverRef = useRef(onHover);
  const onClickRef = useRef(onClick);

  // Keep refs up to date
  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  // Create individual province geometries for raycasting
  const provinceGeometries = useMemo(() => {
    if (provinces.length === 0) return [];

    const geos: ProvinceGeometry[] = [];

    provinces.forEach((province) => {
      const category = getProvinceCategory(province);
      const elevation = getProvinceElevation(category);
      const geometries: THREE.BufferGeometry[] = [];
      // Use line segments instead of continuous line with NaN separators
      const outlineSegments: number[] = [];

      province.polygons.forEach((polygon) => {
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

          // Create line segments for outline (pairs of points)
          const y = elevation + 0.002;
          for (let i = 0; i < polygonPoints.length; i++) {
            const p1 = polygonPoints[i];
            const p2 = polygonPoints[(i + 1) % polygonPoints.length];
            // Add segment: p1 -> p2
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

        // Create outline geometry from line segments
        let outlineGeo: THREE.BufferGeometry | null = null;
        if (outlineSegments.length > 0) {
          outlineGeo = new THREE.BufferGeometry();
          outlineGeo.setAttribute('position', new THREE.Float32BufferAttribute(outlineSegments, 3));
        }

        if (merged) {
          geos.push({
            geometry: merged,
            outlineGeometry: outlineGeo,
            province,
            category,
          });
        }

        // Dispose individual geometries after merging (if merged)
        if (geometries.length > 1) {
          geometries.forEach((g) => g.dispose());
        }
      }
    });

    return geos;
  }, [provinces]);

  // Outline material - shared for all outlines
  const outlineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: OUTLINE_COLOR,
      linewidth: 1, // Note: linewidth > 1 only works in WebGL1
      transparent: true,
      opacity: 0.6,
    });
  }, []);

  // Handle mouse move for raycasting - use refs to avoid stale closures
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!groupRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      // Raycast recursively to find meshes inside child groups
      const intersects = raycaster.current
        .intersectObjects(groupRef.current.children, true)
        .filter((hit) => hit.object.type === 'Mesh');

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const provinceName = mesh.userData.provinceName as string;

        if (provinceName !== hoveredProvinceRef.current) {
          hoveredProvinceRef.current = provinceName;
          setHoveredProvince(provinceName);
          const province = provinces.find((p) => p.name === provinceName);
          if (province && onHoverRef.current) {
            onHoverRef.current(province);
          }
        }
      } else if (hoveredProvinceRef.current !== null) {
        hoveredProvinceRef.current = null;
        setHoveredProvince(null);
        if (onHoverRef.current) {
          onHoverRef.current(null);
        }
      }
    },
    [camera, gl.domElement, provinces],
  );

  // Handle click for province selection
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!groupRef.current || !onClickRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current
        .intersectObjects(groupRef.current.children, true)
        .filter((hit) => hit.object.type === 'Mesh');

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const provinceName = mesh.userData.provinceName as string;
        const province = provinces.find((p) => p.name === provinceName);
        if (province) {
          onClickRef.current(province);
        }
      }
    },
    [camera, gl.domElement, provinces],
  );

  // Set up pointer event listener
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gl.domElement, handlePointerMove, handleClick]);

  if (provinceGeometries.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef} name="vietnam-provinces">
      {provinceGeometries.map((item, index) => {
        const isHovered = hoveredProvince === item.province.name;
        const color = isHovered ? HOVER_COLOR : PROVINCE_COLORS[item.category];

        return (
          <group key={index}>
            {/* Province mesh with shadows */}
            <mesh
              geometry={item.geometry}
              userData={{ provinceName: item.province.name }}
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
            {/* Coastline outline */}
            {item.outlineGeometry && (
              <lineSegments geometry={item.outlineGeometry} material={outlineMaterial} />
            )}
          </group>
        );
      })}
    </group>
  );
}
