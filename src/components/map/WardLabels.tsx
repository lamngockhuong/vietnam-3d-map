'use client';

import { Billboard, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import { VIETNAM_BOUNDS } from '@/data/provinces-data';
import type { WardData } from '@/data/wards-data';

interface WardLabelsProps {
  wards: WardData[];
  showLabels: boolean;
}

const center = {
  lat: VIETNAM_BOUNDS.centerLat,
  lon: VIETNAM_BOUNDS.centerLon,
};
const scale = 0.35;

// Zoom threshold - labels only show when camera is closer than this distance
const ZOOM_THRESHOLD = 4;

function geoTo3D(lon: number, lat: number) {
  return {
    x: (lon - center.lon) * scale,
    z: -(lat - center.lat) * scale,
  };
}

// Calculate centroid of ward polygons
function getWardCentroid(ward: WardData): { x: number; z: number } {
  let totalX = 0;
  let totalZ = 0;
  let count = 0;

  ward.polygons.forEach((polygon) => {
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

export function WardLabels({ wards, showLabels }: WardLabelsProps) {
  const { camera } = useThree();
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  // Check camera distance each frame
  useFrame(() => {
    const distance = camera.position.length();
    const shouldShow = distance < ZOOM_THRESHOLD;
    if (shouldShow !== isZoomedIn) {
      setIsZoomedIn(shouldShow);
    }
  });

  const labelData = useMemo(() => {
    return wards.map((ward) => {
      const centroid = getWardCentroid(ward);
      const elevation = 0.04;

      return {
        id: ward.id,
        name: ward.name,
        position: [centroid.x, elevation, centroid.z] as [number, number, number],
        type: ward.type,
      };
    });
  }, [wards]);

  if (!showLabels || !isZoomedIn) return null;

  return (
    <group name="ward-labels">
      {labelData.map((label) => (
        <Billboard
          key={label.id}
          position={label.position}
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <Text
            fontSize={0.004}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.0003}
            outlineColor="#000000"
          >
            {label.name}
          </Text>
        </Billboard>
      ))}
    </group>
  );
}
