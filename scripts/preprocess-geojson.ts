/**
 * GeoJSON Preprocessing Script
 * Simplifies polygon coordinates and generates optimized TypeScript data
 *
 * Run: npx tsx scripts/preprocess-geojson.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface GeoJSONProperties {
  ma_tinh: string;
  ten_tinh: string;
  loai: string;
  dtich_km2: number;
  dan_so: number;
  matdo_km2: number;
}

interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: GeoJSONProperties;
  geometry: GeoJSONGeometry;
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Simplified province data structure
interface SimplifiedProvince {
  id: string;
  name: string;
  type: string;
  area: number;
  population: number;
  density: number;
  center: [number, number]; // [lon, lat]
  polygons: number[][][]; // Array of polygons, each polygon is array of [lon, lat]
}

/**
 * Douglas-Peucker algorithm for polygon simplification
 */
function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];

  if (dx === 0 && dy === 0) {
    return Math.sqrt(Math.pow(point[0] - lineStart[0], 2) + Math.pow(point[1] - lineStart[1], 2));
  }

  const t = ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / (dx * dx + dy * dy);

  const nearestX = lineStart[0] + t * dx;
  const nearestY = lineStart[1] + t * dy;

  return Math.sqrt(Math.pow(point[0] - nearestX, 2) + Math.pow(point[1] - nearestY, 2));
}

function douglasPeucker(points: number[][], epsilon: number): number[][] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIndex), epsilon);
    return left.slice(0, -1).concat(right);
  }

  return [points[0], points[points.length - 1]];
}

/**
 * Simplify a polygon ring
 */
function simplifyRing(ring: number[][], tolerance: number): number[][] {
  // Douglas-Peucker simplification
  const simplified = douglasPeucker(ring, tolerance);

  // Ensure minimum points for a valid polygon
  if (simplified.length < 4) {
    return ring.slice(0, Math.min(ring.length, 10));
  }

  return simplified;
}

/**
 * Round coordinates to reduce file size
 */
function roundCoord(coord: number[], precision: number = 4): number[] {
  return coord.map((c) => Math.round(c * Math.pow(10, precision)) / Math.pow(10, precision));
}

/**
 * Process a single feature
 */
function processFeature(feature: GeoJSONFeature, tolerance: number): SimplifiedProvince | null {
  const { properties, geometry } = feature;

  if (!properties || !geometry) return null;

  const polygons: number[][][] = [];
  let totalLon = 0;
  let totalLat = 0;
  let pointCount = 0;

  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as number[][][];
    coords.forEach((ring) => {
      const simplified = simplifyRing(ring, tolerance);
      const rounded = simplified.map((c) => roundCoord(c));
      polygons.push(rounded);

      rounded.forEach((coord) => {
        totalLon += coord[0];
        totalLat += coord[1];
        pointCount++;
      });
    });
  } else if (geometry.type === 'MultiPolygon') {
    const multiCoords = geometry.coordinates as number[][][][];
    multiCoords.forEach((polygon) => {
      polygon.forEach((ring) => {
        const simplified = simplifyRing(ring, tolerance);
        const rounded = simplified.map((c) => roundCoord(c));
        polygons.push(rounded);

        rounded.forEach((coord) => {
          totalLon += coord[0];
          totalLat += coord[1];
          pointCount++;
        });
      });
    });
  }

  if (polygons.length === 0) return null;

  return {
    id: properties.ma_tinh,
    name: properties.ten_tinh,
    type: properties.loai,
    area: Math.round(properties.dtich_km2 * 100) / 100,
    population: properties.dan_so,
    density: Math.round(properties.matdo_km2 * 100) / 100,
    center: [
      Math.round((totalLon / pointCount) * 10000) / 10000,
      Math.round((totalLat / pointCount) * 10000) / 10000,
    ],
    polygons,
  };
}

/**
 * Calculate bounds from provinces
 */
function calculateBounds(provinces: SimplifiedProvince[]) {
  let minLon = Infinity,
    maxLon = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;

  provinces.forEach((p) => {
    p.polygons.forEach((poly) => {
      poly.forEach((coord) => {
        minLon = Math.min(minLon, coord[0]);
        maxLon = Math.max(maxLon, coord[0]);
        minLat = Math.min(minLat, coord[1]);
        maxLat = Math.max(maxLat, coord[1]);
      });
    });
  });

  return {
    minLon: Math.round(minLon * 10000) / 10000,
    maxLon: Math.round(maxLon * 10000) / 10000,
    minLat: Math.round(minLat * 10000) / 10000,
    maxLat: Math.round(maxLat * 10000) / 10000,
    centerLon: Math.round(((minLon + maxLon) / 2) * 10000) / 10000,
    centerLat: Math.round(((minLat + maxLat) / 2) * 10000) / 10000,
  };
}

/**
 * Generate JSON output for lazy loading
 */
function generateJSON(provinces: SimplifiedProvince[]): string {
  const bounds = calculateBounds(provinces);
  return JSON.stringify({ bounds, provinces }, null, 0); // minified
}

/**
 * Generate TypeScript types only (no data)
 */
function generateTypeScript(bounds: ReturnType<typeof calculateBounds>): string {
  return `/**
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

export const VIETNAM_BOUNDS = ${JSON.stringify(bounds, null, 2)};

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
`;
}

/**
 * Main preprocessing function
 */
async function main() {
  const inputPath = path.join(__dirname, '../data/vietnam-provinces.geojson');
  const tsOutputPath = path.join(__dirname, '../src/data/provinces-data.ts');
  const jsonOutputPath = path.join(__dirname, '../public/provinces.json');

  console.log('Reading GeoJSON file...');
  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const geojson: GeoJSONCollection = JSON.parse(rawData);

  console.log(`Found ${geojson.features.length} features`);

  // Tolerance for simplification (in degrees)
  // 0.001 ~ 100m, 0.005 ~ 500m, 0.01 ~ 1km
  const tolerance = 0.008; // ~800m accuracy - optimized for 3D map performance

  console.log(`Simplifying with tolerance: ${tolerance} degrees...`);

  const provinces: SimplifiedProvince[] = [];
  let totalOriginalPoints = 0;
  let totalSimplifiedPoints = 0;

  geojson.features.forEach((feature, index) => {
    // Count original points
    if (feature.geometry.type === 'Polygon') {
      const coords = feature.geometry.coordinates as number[][][];
      coords.forEach((ring) => (totalOriginalPoints += ring.length));
    } else if (feature.geometry.type === 'MultiPolygon') {
      const coords = feature.geometry.coordinates as number[][][][];
      coords.forEach((poly) => poly.forEach((ring) => (totalOriginalPoints += ring.length)));
    }

    const simplified = processFeature(feature, tolerance);
    if (simplified) {
      provinces.push(simplified);
      simplified.polygons.forEach((poly) => (totalSimplifiedPoints += poly.length));
    }

    if ((index + 1) % 10 === 0) {
      console.log(`Processed ${index + 1}/${geojson.features.length} features`);
    }
  });

  console.log(`\nSimplification results:`);
  console.log(`  Original points: ${totalOriginalPoints.toLocaleString()}`);
  console.log(`  Simplified points: ${totalSimplifiedPoints.toLocaleString()}`);
  console.log(
    `  Reduction: ${((1 - totalSimplifiedPoints / totalOriginalPoints) * 100).toFixed(1)}%`,
  );

  // Generate JSON for lazy loading
  console.log('\nGenerating JSON file for lazy loading...');
  const jsonContent = generateJSON(provinces);
  fs.writeFileSync(jsonOutputPath, jsonContent);

  // Generate TypeScript types
  console.log('Generating TypeScript types...');
  const bounds = calculateBounds(provinces);
  const tsContent = generateTypeScript(bounds);
  fs.writeFileSync(tsOutputPath, tsContent);

  const originalSize = fs.statSync(inputPath).size;
  const jsonSize = fs.statSync(jsonOutputPath).size;
  const tsSize = fs.statSync(tsOutputPath).size;

  console.log(`\nFile sizes:`);
  console.log(`  Original GeoJSON: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  provinces.json: ${(jsonSize / 1024).toFixed(2)} KB`);
  console.log(`  provinces-data.ts: ${(tsSize / 1024).toFixed(2)} KB`);
  console.log(`  Total reduction: ${((1 - (jsonSize + tsSize) / originalSize) * 100).toFixed(1)}%`);

  console.log(`\nOutput files:`);
  console.log(`  ${jsonOutputPath}`);
  console.log(`  ${tsOutputPath}`);
}

main().catch(console.error);
