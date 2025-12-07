/**
 * Generate merger-data.ts from API metadata
 *
 * This script reads the fetched provinces-metadata.json and generates
 * the TypeScript merger data file for use in the Legend component.
 *
 * Run: npx tsx scripts/generate-merger-data.ts
 *
 * Prerequisites:
 * - data/provinces-metadata.json (from fetch-data.ts)
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

// Mapping from API mahc to GeoJSON ma_tinh (province codes in current GeoJSON)
const MAHC_TO_GEOJSON: Record<number, string> = {
  1: '01', // Hà Nội
  7: '04', // Cao Bằng
  8: '08', // Tuyên Quang (merged with Hà Giang)
  13: '11', // Điện Biên
  14: '12', // Lai Châu
  15: '14', // Sơn La
  9: '15', // Lào Cai (merged with Yên Bái)
  10: '19', // Thái Nguyên (merged with Bắc Kạn)
  11: '20', // Lạng Sơn
  3: '22', // Quảng Ninh
  2: '24', // Bắc Ninh (merged with Bắc Giang)
  12: '25', // Phú Thọ (merged with Vĩnh Phúc, Hòa Bình)
  4: '31', // Hải Phòng (merged with Hải Dương)
  5: '33', // Hưng Yên (merged with Thái Bình)
  6: '37', // Ninh Bình (merged with Hà Nam, Nam Định)
  16: '38', // Thanh Hóa
  17: '40', // Nghệ An
  18: '42', // Hà Tĩnh
  19: '44', // Quảng Trị (merged with Quảng Bình)
  20: '46', // Huế
  21: '48', // Đà Nẵng (merged with Quảng Nam)
  22: '51', // Quảng Ngãi (merged with Kon Tum)
  24: '52', // Gia Lai (merged with Bình Định)
  23: '56', // Khánh Hòa (merged with Ninh Thuận)
  25: '66', // Đắk Lắk (merged with Phú Yên)
  26: '68', // Lâm Đồng (merged with Đắk Nông, Bình Thuận)
  28: '75', // Đồng Nai (merged with Bình Phước)
  29: '79', // TP.HCM (merged with Bà Rịa-Vũng Tàu, Bình Dương)
  27: '80', // Tây Ninh (merged with Long An)
  31: '82', // Đồng Tháp (merged with Tiền Giang)
  30: '86', // Vĩnh Long (merged with Bến Tre, Trà Vinh)
  32: '91', // An Giang (merged with Kiên Giang)
  33: '92', // Cần Thơ (merged with Sóc Trăng, Hậu Giang)
  34: '96', // Cà Mau (merged with Bạc Liêu)
};

/**
 * Translate Vietnamese administrative text to English
 */
function translateToEnglish(text: string): string {
  let result = text;

  // Order matters - longer phrases first
  const translations: [RegExp, string][] = [
    [/không sáp nhập/gi, 'not merged'],
    [/giữ nguyên/gi, 'unchanged'],
    [/\(cũ\)/gi, '(former)'],
    [/thành phố/gi, ''],
    [/tỉnh/gi, ''],
    [/ĐVHC/gi, 'units'],
    [/phường/gi, 'wards'],
    [/xã/gi, 'communes'],
    [/đặc khu/gi, 'special zones'],
    [/ và /gi, ' and '],
  ];

  for (const [pattern, replacement] of translations) {
    result = result.replace(pattern, replacement);
  }

  // Clean up extra spaces and formatting
  result = result.replace(/\s+/g, ' ').trim();
  result = result.replace(/\(\s+/g, '(');
  result = result.replace(/\s+\)/g, ')');
  result = result.replace(/,\s*,/g, ',');

  return result;
}

function formatArea(area: number): string {
  // Format as Vietnamese number style: 3.359,80
  const formatted = area.toFixed(2);
  const [intPart, decPart] = formatted.split('.');
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intFormatted},${decPart}`;
}

function formatPopulation(population: number): string {
  // Format as Vietnamese number style: 8.718.000
  return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Main function
 */
async function main() {
  const dataDir = path.join(__dirname, '../data');
  const metadataPath = path.join(dataDir, 'provinces-metadata.json');
  const outputPath = path.join(__dirname, '../src/data/merger-data.ts');

  // Check if metadata exists
  if (!fs.existsSync(metadataPath)) {
    console.error(`Metadata file not found: ${metadataPath}`);
    console.log('Run "pnpm fetch-data" first to fetch metadata from API.');
    process.exit(1);
  }

  console.log('Loading provinces metadata...');
  const metadata: ProvinceMetadata[] = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  console.log(`Loaded ${metadata.length} provinces`);

  // Generate merger data entries
  const entries: string[] = [];

  for (const province of metadata) {
    const geojsonId = MAHC_TO_GEOJSON[province.mahc];

    if (!geojsonId) {
      console.warn(`  No GeoJSON mapping for mahc ${province.mahc} (${province.name})`);
      continue;
    }

    const beforeMergerEn = translateToEnglish(province.beforeMerger);
    const adminCenterEn = translateToEnglish(province.adminCenter);
    const adminUnitsEn = translateToEnglish(province.adminUnits.replace('\n', ''));

    const entry = `  // ${province.name} (mahc: ${province.mahc})
  '${geojsonId}': {
    mahc: ${province.mahc},
    area: '${formatArea(province.area)}',
    population: '${formatPopulation(province.population)}',
    adminCenter: { vi: '${province.adminCenter}', en: '${adminCenterEn}' },
    beforeMerger: { vi: '${province.beforeMerger}', en: '${beforeMergerEn}' },
    adminUnits: { vi: '${province.adminUnits.replace('\n', '').trim()}', en: '${adminUnitsEn}' },
    isMerged: ${province.isMerged},
  },`;

    entries.push(entry);
    console.log(`  ✓ ${province.name} -> ${geojsonId}`);
  }

  // Generate TypeScript file content
  const tsContent = `/**
 * Vietnam Administrative Unit Merger Data (2025)
 * Official data about province mergers and administrative reorganization
 *
 * AUTO-GENERATED from API metadata
 * Run: pnpm generate-merger-data
 */

import type { Locale } from '@/i18n/config';

export interface LocalizedText {
  vi: string;
  en: string;
}

export interface MergerInfo {
  /** Administrative code (mã hành chính) */
  mahc: number;
  /** Area in km² */
  area: string;
  /** Population */
  population: string;
  /** Administrative center status */
  adminCenter: LocalizedText;
  /** Before merger - which provinces/cities were merged */
  beforeMerger: LocalizedText;
  /** Administrative units (wards, communes) */
  adminUnits: LocalizedText;
  /** Whether this province was merged */
  isMerged: boolean;
}

// Province merger data keyed by province ID (ma_tinh from GeoJSON)
// Based on official 2025 administrative reorganization data
const provinceMergers: Record<string, MergerInfo> = {
${entries.join('\n')}
};

// Ward/District merger history (keyed by "provinceId-wardId")
// TODO: Add ward merger data as needed
const wardMergers: Record<string, MergerInfo> = {};

/**
 * Get merger info for a province
 */
export function getProvinceMergerInfo(provinceId: string): MergerInfo | null {
  return provinceMergers[provinceId] || null;
}

/**
 * Get merger info for a ward/district
 */
export function getWardMergerInfo(provinceId: string, wardId: string): MergerInfo | null {
  const key = \`\${provinceId}-\${wardId}\`;
  return wardMergers[key] || null;
}

/**
 * Get localized text
 */
export function getLocalizedText(text: LocalizedText, locale: Locale): string {
  return locale === 'vi' ? text.vi : text.en;
}
`;

  // Write output file
  console.log('\nWriting merger-data.ts...');
  fs.writeFileSync(outputPath, tsContent);

  console.log(`\n✅ Generated: ${outputPath}`);
  console.log(`   Provinces: ${entries.length}`);
}

main().catch(console.error);
