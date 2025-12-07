/**
 * Vietnam Administrative Data Fetching Script
 *
 * Fetches province and ward metadata from sapnhap.bando.com.vn API
 * This data includes the 2025 administrative reorganization (province mergers)
 *
 * Run: npx tsx scripts/fetch-data.ts
 *
 * Output:
 * - data/provinces-metadata.json - Province list with metadata
 * - data/wards-metadata/{provinceId}.json - Ward details per province
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Configuration
const API_BASE = 'https://sapnhap.bando.com.vn';
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0',
  Accept: 'text/plain, */*; q=0.01',
  'Accept-Language': 'vi,en-US;q=0.7,en;q=0.3',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Origin: API_BASE,
  Referer: `${API_BASE}/`,
};

// Types for API responses
interface RawProvinceData {
  id: number;
  mahc: number;
  tentinh: string;
  dientichkm2: string;
  dansonguoi: string;
  trungtamhc: string;
  kinhdo: number;
  vido: number;
  truocsapnhap: string;
  con: string; // Administrative units info
}

interface RawWardData {
  id: number;
  matinh: number;
  ma: string;
  tentinh: string;
  loai: string;
  tenhc: string;
  cay: string;
  dientichkm2: number;
  dansonguoi: string;
  trungtamhc: string;
  kinhdo: number;
  vido: number;
  truocsapnhap: string;
  maxa: number;
  khoa: string;
}

// Processed types
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

interface WardMetadata {
  id: number;
  code: string;
  name: string;
  type: string;
  area: number;
  population: number;
  adminCenter: string;
  longitude: number;
  latitude: number;
  beforeMerger: string;
  wardCode: number;
}

interface ProvinceWardsMetadata {
  provinceId: number;
  provinceName: string;
  mahc: number;
  wards: WardMetadata[];
}

// Utility functions
function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  // Handle Vietnamese number format: "3.359,80" -> 3359.80
  return Number.parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch province list from API
 */
async function fetchProvinces(): Promise<RawProvinceData[]> {
  console.log('Fetching province list...');

  const response = await fetch(`${API_BASE}/pcotinh`, {
    method: 'POST',
    headers: HEADERS,
    body: 'id=0',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch provinces: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Fetched ${data.length} provinces`);
  return data;
}

/**
 * Fetch ward details for a province
 */
async function fetchWards(provinceId: number): Promise<RawWardData[]> {
  const response = await fetch(`${API_BASE}/ptracuu`, {
    method: 'POST',
    headers: HEADERS,
    body: `id=${provinceId}`,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wards for province ${provinceId}: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Process raw province data into clean format
 */
function processProvinceData(raw: RawProvinceData): ProvinceMetadata {
  const isMerged = raw.truocsapnhap !== 'không sáp nhập';

  return {
    id: raw.id,
    mahc: raw.mahc,
    name: raw.tentinh,
    area: parseNumber(raw.dientichkm2),
    population: parseNumber(raw.dansonguoi),
    adminCenter: raw.trungtamhc,
    longitude: raw.kinhdo,
    latitude: raw.vido,
    beforeMerger: raw.truocsapnhap,
    adminUnits: raw.con,
    isMerged,
  };
}

/**
 * Process raw ward data into clean format
 */
function processWardData(raw: RawWardData): WardMetadata {
  return {
    id: raw.id,
    code: raw.ma,
    name: raw.tenhc,
    type: raw.loai,
    area: raw.dientichkm2,
    population: parseNumber(raw.dansonguoi),
    adminCenter: raw.trungtamhc,
    longitude: raw.kinhdo,
    latitude: raw.vido,
    beforeMerger: raw.truocsapnhap,
    wardCode: raw.maxa,
  };
}

/**
 * Main function
 */
async function main() {
  const dataDir = path.join(__dirname, '../data');
  const wardsMetadataDir = path.join(dataDir, 'wards-metadata');

  // Ensure directories exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(wardsMetadataDir)) {
    fs.mkdirSync(wardsMetadataDir, { recursive: true });
  }

  try {
    // Step 1: Fetch and process provinces
    console.log('\n=== Fetching Province Data ===\n');
    const rawProvinces = await fetchProvinces();
    const provinces = rawProvinces.map(processProvinceData);

    // Save province metadata
    const provincesPath = path.join(dataDir, 'provinces-metadata.json');
    fs.writeFileSync(provincesPath, JSON.stringify(provinces, null, 2));
    console.log(`\nSaved province metadata to ${provincesPath}`);

    // Log province summary
    console.log('\nProvince Summary:');
    console.log(`  Total provinces: ${provinces.length}`);
    console.log(`  Merged provinces: ${provinces.filter((p) => p.isMerged).length}`);
    console.log(`  Non-merged provinces: ${provinces.filter((p) => !p.isMerged).length}`);

    // Step 2: Fetch wards for each province
    console.log('\n=== Fetching Ward Data ===\n');

    let totalWards = 0;
    const wardsIndex: { id: number; name: string; mahc: number; wardCount: number }[] = [];

    for (const province of provinces) {
      console.log(`Fetching wards for ${province.name} (ID: ${province.id})...`);

      try {
        const rawWards = await fetchWards(province.id);
        const wards = rawWards.map(processWardData);

        const provinceWards: ProvinceWardsMetadata = {
          provinceId: province.id,
          provinceName: province.name,
          mahc: province.mahc,
          wards,
        };

        // Save ward data for this province
        const wardPath = path.join(wardsMetadataDir, `${province.id}.json`);
        fs.writeFileSync(wardPath, JSON.stringify(provinceWards, null, 2));

        wardsIndex.push({
          id: province.id,
          name: province.name,
          mahc: province.mahc,
          wardCount: wards.length,
        });

        totalWards += wards.length;
        console.log(`  Found ${wards.length} wards`);
      } catch (error) {
        console.error(`  Error fetching wards: ${error}`);
      }

      // Rate limiting - wait 500ms between requests
      await sleep(500);
    }

    // Save wards index
    const indexPath = path.join(wardsMetadataDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(wardsIndex, null, 2));

    // Final summary
    console.log('\n=== Summary ===\n');
    console.log(`Provinces processed: ${provinces.length}`);
    console.log(`Total wards fetched: ${totalWards}`);
    console.log(`\nOutput files:`);
    console.log(`  ${provincesPath}`);
    console.log(`  ${wardsMetadataDir}/*.json`);
    console.log(`  ${indexPath}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
