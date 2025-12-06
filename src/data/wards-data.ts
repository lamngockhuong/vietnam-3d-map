/**
 * Vietnam Wards Data Types
 * Data is loaded from /wards/{provinceId}.json on demand
 */

export interface WardData {
  id: string;
  name: string;
  type: string;
  area: number;
  population: number;
  density: number;
  center: [number, number];
  polygons: number[][][];
}

export interface ProvinceWardsData {
  provinceId: string;
  provinceName: string;
  wards: WardData[];
}

export interface WardIndexEntry {
  id: string;
  name: string;
  wardCount: number;
}

// Cache for loaded ward data
const wardCache = new Map<string, ProvinceWardsData>();
const loadingPromises = new Map<string, Promise<ProvinceWardsData>>();

/**
 * Load wards for a specific province
 */
export async function loadWardsForProvince(provinceId: string): Promise<ProvinceWardsData | null> {
  // Return cached data immediately
  if (wardCache.has(provinceId)) {
    return wardCache.get(provinceId)!;
  }

  // Return existing promise if already loading
  if (loadingPromises.has(provinceId)) {
    return loadingPromises.get(provinceId)!;
  }

  // Start new fetch
  const loadPromise = (async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`${baseUrl}/wards/${provinceId}.json`);
      if (!res.ok) {
        if (res.status === 404) {
          // No ward data for this province
          return null;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data: ProvinceWardsData = await res.json();
      wardCache.set(provinceId, data);
      return data;
    } catch (err) {
      loadingPromises.delete(provinceId);
      console.error(`Failed to load wards for province ${provinceId}:`, err);
      return null;
    }
  })();

  loadingPromises.set(provinceId, loadPromise as Promise<ProvinceWardsData>);
  return loadPromise;
}

/**
 * Get cached wards for a province (synchronous)
 */
export function getCachedWards(provinceId: string): ProvinceWardsData | null {
  return wardCache.get(provinceId) ?? null;
}

/**
 * Check if wards are cached for a province
 */
export function hasWardsLoaded(provinceId: string): boolean {
  return wardCache.has(provinceId);
}

/**
 * Clear ward cache (for memory management)
 */
export function clearWardCache(): void {
  wardCache.clear();
  loadingPromises.clear();
}
