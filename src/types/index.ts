/**
 * Type definitions for Vietnam 3D Map
 */

// Geographic coordinate [longitude, latitude]
export type Coordinate = [number, number];

// Map center position
export interface MapCenter {
  lat: number;
  lon: number;
}

// Geographic bounds
export interface Bounds {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
  centerLon: number;
  centerLat: number;
}

// Mountain/Highland region
export interface MountainRegion {
  name: string;
  nameEn: string;
  coords: Coordinate[];
  height: number;
}

// Island definition
export interface Island {
  name: string;
  lat: number;
  lon: number;
  size: number;
}

// Archipelago (island group)
export interface Archipelago {
  name: string;
  nameEn: string;
  centerLat: number;
  centerLon: number;
  islands: Island[];
}

// City definition
export interface City {
  name: string;
  lat: number;
  lon: number;
  isCapital?: boolean;
  pop: string;
}

// Terrain color palette
export interface TerrainColors {
  lowland: number;
  mountain: number;
  oceanDeep: number;
  oceanShallow: number;
  island: number;
  sovereignty: number;
  capital: number;
  city: number;
  coastline: number;
}
