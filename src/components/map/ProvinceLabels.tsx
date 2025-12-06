'use client';

import { Billboard, Text } from '@react-three/drei';
import { useMemo } from 'react';
import { type ProvinceData, VIETNAM_BOUNDS } from '@/data/provinces-data';

interface ProvinceLabelProps {
  provinces: ProvinceData[];
  showLabels: boolean;
}

const center = {
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

// Calculate centroid of province polygons
function getProvinceCentroid(province: ProvinceData): { x: number; z: number } {
  let totalX = 0;
  let totalZ = 0;
  let count = 0;

  province.polygons.forEach((polygon) => {
    polygon.forEach((coord) => {
      const pos = geoTo3D(coord[0], coord[1]);
      totalX += pos.x;
      totalZ += pos.z;
      count++;
    });
  });

  return {
    x: totalX / count,
    z: totalZ / count,
  };
}

// Major cities and important provinces to always show labels
const PRIORITY_PROVINCES = new Set([
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Huế',
  'Nha Trang',
  'Đà Lạt',
  'Quảng Ninh',
  'Nghệ An',
]);

export function ProvinceLabels({ provinces, showLabels }: ProvinceLabelProps) {
  const labelData = useMemo(() => {
    return provinces
      .filter((p) => PRIORITY_PROVINCES.has(p.name) || p.type === 'Thành phố')
      .map((province) => {
        const centroid = getProvinceCentroid(province);
        const elevation = province.name === 'Hà Nội' ? 0.15 : 0.12;

        return {
          name: province.name,
          position: [centroid.x, elevation, centroid.z] as [number, number, number],
          isPriority: PRIORITY_PROVINCES.has(province.name),
        };
      });
  }, [provinces]);

  if (!showLabels) return null;

  return (
    <group name="province-labels">
      {labelData.map((label) => (
        <Billboard
          key={label.name}
          position={label.position}
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <Text
            fontSize={label.isPriority ? 0.08 : 0.06}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.004}
            outlineColor="#000000"
          >
            {label.name}
          </Text>
        </Billboard>
      ))}
    </group>
  );
}
