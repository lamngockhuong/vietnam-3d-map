/**
 * Merge GeoJSON boundaries with API metadata
 *
 * This script combines:
 * - GeoJSON boundary data (polygons)
 * - API metadata (area, population, merger info)
 *
 * Run: npx tsx scripts/merge-data.ts
 *
 * Prerequisites:
 * - data/vietnam-provinces.geojson (boundaries)
 * - data/provinces-metadata.json (from fetch-data.ts)
 *
 * Output:
 * - data/vietnam-provinces-merged.geojson (enhanced with metadata)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface ProvinceMetadata {
  id: number;
  mahc: number;
  name: string;
  area: number;
  population: number;
  adminCenter: string;
  longitude: number;
  latitude: number;
  beforeMerger: string;
  adminUnits: string;
  isMerged: boolean;
}

interface GeoJSONProperties {
  ma_tinh: string;
  ten_tinh: string;
  loai: string;
  dtich_km2: number;
  dan_so: number;
  matdo_km2: number;
  // Enhanced properties from API
  mahc?: number;
  admin_center?: string;
  before_merger?: string;
  admin_units?: string;
  is_merged?: boolean;
  api_longitude?: number;
  api_latitude?: number;
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: GeoJSONProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Mapping from GeoJSON ma_tinh to API mahc code
// Based on 2025 administrative reorganization
const GEOJSON_TO_MAHC: Record<string, number> = {
  '01': 1, // Hà Nội
  '04': 7, // Cao Bằng
  '08': 8, // Tuyên Quang (merged with Hà Giang)
  '11': 13, // Điện Biên
  '12': 14, // Lai Châu
  '14': 15, // Sơn La
  '15': 9, // Lào Cai (merged with Yên Bái)
  '19': 10, // Thái Nguyên (merged with Bắc Kạn)
  '20': 11, // Lạng Sơn
  '22': 3, // Quảng Ninh
  '24': 2, // Bắc Ninh (merged with Bắc Giang)
  '25': 12, // Phú Thọ (merged with Vĩnh Phúc, Hòa Bình)
  '31': 4, // Hải Phòng (merged with Hải Dương)
  '33': 5, // Hưng Yên (merged with Thái Bình)
  '37': 6, // Ninh Bình (merged with Hà Nam, Nam Định)
  '38': 16, // Thanh Hóa
  '40': 17, // Nghệ An
  '42': 18, // Hà Tĩnh
  '44': 19, // Quảng Trị (merged with Quảng Bình)
  '46': 20, // Huế
  '48': 21, // Đà Nẵng (merged with Quảng Nam)
  '51': 22, // Quảng Ngãi (merged with Kon Tum)
  '52': 24, // Gia Lai (merged with Bình Định)
  '56': 23, // Khánh Hòa (merged with Ninh Thuận)
  '66': 25, // Đắk Lắk (merged with Phú Yên)
  '68': 26, // Lâm Đồng (merged with Đắk Nông, Bình Thuận)
  '75': 28, // Đồng Nai (merged with Bình Phước)
  '79': 29, // TP.HCM (merged with Bà Rịa-Vũng Tàu, Bình Dương)
  '80': 27, // Tây Ninh (merged with Long An)
  '82': 31, // Đồng Tháp (merged with Tiền Giang)
  '86': 30, // Vĩnh Long (merged with Bến Tre, Trà Vinh)
  '91': 32, // An Giang (merged with Kiên Giang)
  '92': 33, // Cần Thơ (merged with Sóc Trăng, Hậu Giang)
  '96': 34, // Cà Mau (merged with Bạc Liêu)
};

/**
 * Main function
 */
async function main() {
  const dataDir = path.join(__dirname, '../data');
  const geojsonPath = path.join(dataDir, 'vietnam-provinces.geojson');
  const metadataPath = path.join(dataDir, 'provinces-metadata.json');
  const outputPath = path.join(dataDir, 'vietnam-provinces-merged.geojson');

  // Check if files exist
  if (!fs.existsSync(geojsonPath)) {
    console.error(`GeoJSON file not found: ${geojsonPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(metadataPath)) {
    console.error(`Metadata file not found: ${metadataPath}`);
    console.log('Run "npx tsx scripts/fetch-data.ts" first to fetch metadata.');
    process.exit(1);
  }

  console.log('Loading GeoJSON...');
  const geojson: GeoJSONCollection = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
  console.log(`Loaded ${geojson.features.length} features from GeoJSON`);

  console.log('\nLoading metadata...');
  const metadata: ProvinceMetadata[] = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  console.log(`Loaded ${metadata.length} provinces from metadata`);

  // Create metadata lookup by mahc
  const metadataByMahc = new Map<number, ProvinceMetadata>();
  for (const m of metadata) {
    metadataByMahc.set(m.mahc, m);
  }

  // Process each GeoJSON feature
  console.log('\nMerging data...');
  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const feature of geojson.features) {
    const provinceCode = feature.properties.ma_tinh;
    const mahc = GEOJSON_TO_MAHC[provinceCode];

    if (mahc === undefined) {
      console.warn(`  No mapping for province ${provinceCode} (${feature.properties.ten_tinh})`);
      unmatchedCount++;
      continue;
    }

    const meta = metadataByMahc.get(mahc);
    if (meta) {
      // Enhance properties with API metadata
      feature.properties.mahc = mahc;
      feature.properties.admin_center = meta.adminCenter;
      feature.properties.before_merger = meta.beforeMerger;
      feature.properties.admin_units = meta.adminUnits;
      feature.properties.is_merged = meta.isMerged;
      feature.properties.api_longitude = meta.longitude;
      feature.properties.api_latitude = meta.latitude;

      // Update area and population from API if available
      if (meta.area > 0) {
        feature.properties.dtich_km2 = meta.area;
      }
      if (meta.population > 0) {
        feature.properties.dan_so = meta.population;
        // Recalculate density
        if (feature.properties.dtich_km2 > 0) {
          feature.properties.matdo_km2 = Math.round(meta.population / feature.properties.dtich_km2);
        }
      }

      console.log(`  ✓ ${feature.properties.ten_tinh} -> mahc ${mahc} (${meta.name})`);
      matchedCount++;
    } else {
      console.warn(`  No metadata for mahc ${mahc} (province ${provinceCode})`);
      unmatchedCount++;
    }
  }

  // Save merged GeoJSON
  console.log('\nSaving merged GeoJSON...');
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Features matched: ${matchedCount}`);
  console.log(`Features unmatched: ${unmatchedCount}`);
  console.log(`Output: ${outputPath}`);

  // Size comparison
  const originalSize = fs.statSync(geojsonPath).size;
  const mergedSize = fs.statSync(outputPath).size;
  console.log(`\nFile sizes:`);
  console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Merged: ${(mergedSize / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
