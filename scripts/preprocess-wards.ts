/**
 * Ward GeoJSON Preprocessing Script
 * Groups wards by province and simplifies polygon coordinates
 *
 * Run: npx tsx scripts/preprocess-wards.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface WardGeoJSONProperties {
  ma_xa: string;
  ten_xa: string;
  loai: string;
  cap: number;
  dtich_km2: number;
  dan_so: number;
  matdo_km2: number;
  ma_tinh: string;
  ten_tinh: string;
  sap_nhap?: string;
  tru_so?: string;
}

interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: WardGeoJSONProperties;
  geometry: GeoJSONGeometry;
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Simplified ward data structure
interface SimplifiedWard {
  id: string;
  name: string;
  type: string;
  area: number;
  population: number;
  density: number;
  center: [number, number]; // [lon, lat]
  polygons: number[][][];
}

// Province wards data structure
interface ProvinceWards {
  provinceId: string;
  provinceName: string;
  wards: SimplifiedWard[];
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
function roundCoord(coord: number[], precision: number = 5): number[] {
  return coord.map((c) => Math.round(c * Math.pow(10, precision)) / Math.pow(10, precision));
}

/**
 * Process a single ward feature
 */
function processWardFeature(feature: GeoJSONFeature, tolerance: number): SimplifiedWard | null {
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
    id: properties.ma_xa,
    name: properties.ten_xa,
    type: properties.loai,
    area: Math.round(properties.dtich_km2 * 100) / 100,
    population: properties.dan_so,
    density: Math.round(properties.matdo_km2 * 100) / 100,
    center: [
      Math.round((totalLon / pointCount) * 100000) / 100000,
      Math.round((totalLat / pointCount) * 100000) / 100000,
    ],
    polygons,
  };
}

/**
 * Main preprocessing function
 */
async function main() {
  const inputPath = path.join(__dirname, '../data/vietnam-wards.geojson');
  const outputDir = path.join(__dirname, '../public/wards');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Reading ward GeoJSON file...');
  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const geojson: GeoJSONCollection = JSON.parse(rawData);

  console.log(`Found ${geojson.features.length} ward features`);

  // Tolerance for simplification (wards need more detail than provinces)
  // 0.0005 ~ 50m accuracy for ward-level detail
  const tolerance = 0.0005;

  console.log(`Simplifying with tolerance: ${tolerance} degrees...`);

  // Group wards by province
  const wardsByProvince = new Map<string, ProvinceWards>();

  let totalOriginalPoints = 0;
  let totalSimplifiedPoints = 0;
  let processedCount = 0;

  geojson.features.forEach((feature, index) => {
    const provinceId = feature.properties.ma_tinh;
    const provinceName = feature.properties.ten_tinh;

    // Count original points
    if (feature.geometry.type === 'Polygon') {
      const coords = feature.geometry.coordinates as number[][][];
      coords.forEach((ring) => (totalOriginalPoints += ring.length));
    } else if (feature.geometry.type === 'MultiPolygon') {
      const coords = feature.geometry.coordinates as number[][][][];
      coords.forEach((poly) => poly.forEach((ring) => (totalOriginalPoints += ring.length)));
    }

    const simplified = processWardFeature(feature, tolerance);
    if (simplified) {
      if (!wardsByProvince.has(provinceId)) {
        wardsByProvince.set(provinceId, {
          provinceId,
          provinceName,
          wards: [],
        });
      }
      wardsByProvince.get(provinceId)!.wards.push(simplified);
      simplified.polygons.forEach((poly) => (totalSimplifiedPoints += poly.length));
      processedCount++;
    }

    if ((index + 1) % 1000 === 0) {
      console.log(`Processed ${index + 1}/${geojson.features.length} features`);
    }
  });

  console.log(`\nSimplification results:`);
  console.log(`  Original points: ${totalOriginalPoints.toLocaleString()}`);
  console.log(`  Simplified points: ${totalSimplifiedPoints.toLocaleString()}`);
  console.log(
    `  Reduction: ${((1 - totalSimplifiedPoints / totalOriginalPoints) * 100).toFixed(1)}%`,
  );

  // Generate individual JSON files per province
  console.log(`\nGenerating ${wardsByProvince.size} province ward files...`);

  const provinceIndex: { id: string; name: string; wardCount: number }[] = [];
  let totalOutputSize = 0;

  wardsByProvince.forEach((provinceWards, provinceId) => {
    const outputPath = path.join(outputDir, `${provinceId}.json`);
    const content = JSON.stringify(provinceWards, null, 0); // minified
    fs.writeFileSync(outputPath, content);

    const fileSize = Buffer.byteLength(content);
    totalOutputSize += fileSize;

    provinceIndex.push({
      id: provinceId,
      name: provinceWards.provinceName,
      wardCount: provinceWards.wards.length,
    });

    console.log(
      `  ${provinceId} (${provinceWards.provinceName}): ${provinceWards.wards.length} wards, ${(fileSize / 1024).toFixed(1)} KB`,
    );
  });

  // Generate index file
  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(provinceIndex, null, 0));

  const originalSize = fs.statSync(inputPath).size;

  console.log(`\nSummary:`);
  console.log(`  Provinces processed: ${wardsByProvince.size}`);
  console.log(`  Total wards: ${processedCount.toLocaleString()}`);
  console.log(`  Original file: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Total output: ${(totalOutputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Size reduction: ${((1 - totalOutputSize / originalSize) * 100).toFixed(1)}%`);
  console.log(`\nOutput directory: ${outputDir}`);
}

main().catch(console.error);
