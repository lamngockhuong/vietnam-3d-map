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
  minLon: 102.1439,
  maxLon: 117.3933,
  minLat: 6.936,
  maxLat: 23.3923,
  centerLon: 109.7686,
  centerLat: 15.1642,
};

let cachedProvinces: ProvinceData[] | null = null;
let loadingPromise: Promise<ProvinceData[]> | null = null;

export async function loadProvinces(): Promise<ProvinceData[]> {
  // Return cached data immediately
  if (cachedProvinces) return cachedProvinces;

  // Return existing promise if already loading (prevents double fetch in Strict Mode)
  if (loadingPromise) return loadingPromise;

  // Start new fetch
  loadingPromise = (async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`${baseUrl}/provinces.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ProvincesJSON = await res.json();
      cachedProvinces = data.provinces;
      return cachedProvinces;
    } catch (err) {
      loadingPromise = null; // Reset on error to allow retry
      throw err;
    }
  })();

  return loadingPromise;
}

export function getProvinces(): ProvinceData[] | null {
  return cachedProvinces;
}
