/**
 * Vietnam Provinces Data Types
 * Data is loaded from /provinces.json for better performance
 */

export interface ProvinceData {
  id: string;
  name: string;
  type: string;
  area: number;
  population: number;
  density: number;
  center: [number, number];
  polygons: number[][][];
}

export interface ProvincesJSON {
  bounds: typeof VIETNAM_BOUNDS;
  provinces: ProvinceData[];
}

export const VIETNAM_BOUNDS = {
  "minLon": 102.1439,
  "maxLon": 117.3933,
  "minLat": 6.936,
  "maxLat": 23.3923,
  "centerLon": 109.7686,
  "centerLat": 15.1642
};

let cachedProvinces: ProvinceData[] | null = null;

export async function loadProvinces(): Promise<ProvinceData[]> {
  if (cachedProvinces) return cachedProvinces;

  const res = await fetch('/provinces.json');
  const data: ProvincesJSON = await res.json();
  cachedProvinces = data.provinces;
  return cachedProvinces;
}

export function getProvinces(): ProvinceData[] | null {
  return cachedProvinces;
}
