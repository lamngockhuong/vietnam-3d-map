/**
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
  // Thủ đô Hà Nội (mahc: 1)
  '01': {
    mahc: 1,
    area: '3.359,80',
    population: '8.718.000',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '126 ĐVHC (51 phường và 75 xã)', en: '126 units (51 phường and 75 communes)' },
    isMerged: false,
  },
  // tỉnh Cao Bằng (mahc: 7)
  '04': {
    mahc: 7,
    area: '6.700,40',
    population: '555.809',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '56 ĐVHC (03 phường, 53 xã)', en: '56 units (03 wards, 53 communes)' },
    isMerged: false,
  },
  // tỉnh Tuyên Quang (mahc: 8)
  '08': {
    mahc: 8,
    area: '13.795,50',
    population: '1.865.270',
    adminCenter: { vi: 'Tuyên Quang (cũ)', en: 'Tuyên Quang (former)' },
    beforeMerger: { vi: 'tỉnh Hà Giang và tỉnh Tuyên Quang', en: 'Hà Giang and Tuyên Quang' },
    adminUnits: { vi: '124 ĐVHC (07 phường, 117 xã)', en: '124 units (07 wards, 117 communes)' },
    isMerged: true,
  },
  // tỉnh Lào Cai (mahc: 9)
  '15': {
    mahc: 9,
    area: '13.256,92',
    population: '1.778.785',
    adminCenter: { vi: 'Yên Bái (cũ)', en: 'Yên Bái (former)' },
    beforeMerger: { vi: 'tỉnh Yên Bái và tỉnh Lào Cai', en: 'Yên Bái and Lào Cai' },
    adminUnits: { vi: '99 ĐVHC (10 phường, 89 xã)', en: '99 units (10 wards, 89 communes)' },
    isMerged: true,
  },
  // tỉnh Điện Biên (mahc: 13)
  '11': {
    mahc: 13,
    area: '9.539,90',
    population: '653.422',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '45 ĐVHC (03 phường, 42 xã)', en: '45 units (03 phường, 42 communes)' },
    isMerged: false,
  },
  // tỉnh Lai Châu (mahc: 14)
  '12': {
    mahc: 14,
    area: '9.068,70',
    population: '494.626',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '38 ĐVHC (02 phường, 36 xã)', en: '38 units (02 phường, 36 xã)' },
    isMerged: false,
  },
  // tỉnh Sơn La (mahc: 15)
  '14': {
    mahc: 15,
    area: '14.109,80',
    population: '1.327.430',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '75 ĐVHC (08 phường, 67 xã)', en: '75 units (08 wards, 67 communes)' },
    isMerged: false,
  },
  // tỉnh Thái Nguyên (mahc: 10)
  '19': {
    mahc: 10,
    area: '8.375,21',
    population: '1.799.489',
    adminCenter: { vi: 'Thái Nguyên (cũ)', en: 'Thái Nguyên (former)' },
    beforeMerger: { vi: 'tỉnh Bắc Kạn và tỉnh Thái Nguyên', en: 'Bắc Kạn and Thái Nguyên' },
    adminUnits: { vi: '92 ĐVHC (15 phường, 77 xã)', en: '92 units (15 phường, 77 communes)' },
    isMerged: true,
  },
  // tỉnh Lạng Sơn (mahc: 11)
  '20': {
    mahc: 11,
    area: '8.310,20',
    population: '813.978',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '65 ĐVHC (04 phường, 61 xã)', en: '65 units (04 wards, 61 communes)' },
    isMerged: false,
  },
  // tỉnh Quảng Ninh (mahc: 3)
  '22': {
    mahc: 3,
    area: '6.207,90',
    population: '1.429.841',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '54 ĐVHC (02 đặc khu, 30 phường, 22 xã)', en: '54 units (02 special zones, 30 wards, 22 communes)' },
    isMerged: false,
  },
  // tỉnh Phú Thọ (mahc: 12)
  '25': {
    mahc: 12,
    area: '9.361,38',
    population: '4.022.638',
    adminCenter: { vi: 'Phú Thọ (cũ)', en: 'Phú Thọ (former)' },
    beforeMerger: { vi: 'tỉnh Vĩnh Phúc, tỉnh Hòa Bình và tỉnh Phú Thọ', en: 'Vĩnh Phúc, Hòa Bình and Phú Thọ' },
    adminUnits: { vi: '148 ĐVHC (15 phường, 133 xã)', en: '148 units (15 wards, 133 communes)' },
    isMerged: true,
  },
  // tỉnh Bắc Ninh (mahc: 2)
  '24': {
    mahc: 2,
    area: '4.718,60',
    population: '3.619.433',
    adminCenter: { vi: 'Bắc Giang (cũ)', en: 'Bắc Giang (former)' },
    beforeMerger: { vi: 'tỉnh Bắc Giang và tỉnh Bắc Ninh', en: 'Bắc Giang and Bắc Ninh' },
    adminUnits: { vi: '99 ĐVHC (33 phường, 66 xã)', en: '99 units (33 wards, 66 communes)' },
    isMerged: true,
  },
  // thành phố Hải Phòng (mahc: 4)
  '31': {
    mahc: 4,
    area: '3.194,72',
    population: '4.664.124',
    adminCenter: { vi: 'Hải Phòng (cũ)', en: 'Hải Phòng (former)' },
    beforeMerger: { vi: 'thành phố Hải Phòng và tỉnh Hải Dương', en: 'Hải Phòng and Hải Dương' },
    adminUnits: { vi: '114 ĐVHC (02 đặc khu, 45 phường, 67 xã)', en: '114 units (02 special zones, 45 phường, 67 communes)' },
    isMerged: true,
  },
  // tỉnh Hưng Yên (mahc: 5)
  '33': {
    mahc: 5,
    area: '2.514,81',
    population: '3.567.943',
    adminCenter: { vi: 'Hưng Yên (cũ)', en: 'Hưng Yên (former)' },
    beforeMerger: { vi: 'tỉnh Thái Bình và tỉnh Hưng Yên', en: 'Thái Bình and Hưng Yên' },
    adminUnits: { vi: '104 ĐVHC (11 phường, 93 xã)', en: '104 units (11 wards, 93 communes)' },
    isMerged: true,
  },
  // tỉnh Ninh Bình (mahc: 6)
  '37': {
    mahc: 6,
    area: '3.942,62',
    population: '4.412.264',
    adminCenter: { vi: 'Ninh Bình (cũ)', en: 'Ninh Bình (former)' },
    beforeMerger: { vi: 'tỉnh Hà Nam, tỉnh Nam Định và tỉnh Ninh Bình', en: 'Hà Nam, Nam Định and Ninh Bình' },
    adminUnits: { vi: '129 ĐVHC (32 phường, 97 xã)', en: '129 units (32 wards, 97 communes)' },
    isMerged: true,
  },
  // tỉnh Thanh Hóa (mahc: 16)
  '38': {
    mahc: 16,
    area: '11.114,70',
    population: '3.760.650',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '166 ĐVHC (19 phường, 147 xã)', en: '166 units (19 wards, 147 communes)' },
    isMerged: false,
  },
  // tỉnh Nghệ An (mahc: 17)
  '40': {
    mahc: 17,
    area: '16.493,70',
    population: '3.470.988',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '130 ĐVHC (11 phường, 119 xã)', en: '130 units (11 phường, 119 communes)' },
    isMerged: false,
  },
  // tỉnh Hà Tĩnh (mahc: 18)
  '42': {
    mahc: 18,
    area: '5.994,40',
    population: '1.622.901',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '69 ĐVHC (09 phường, 60 xã)', en: '69 units (09 phường, 60 communes)' },
    isMerged: false,
  },
  // tỉnh Quảng Trị (mahc: 19)
  '44': {
    mahc: 19,
    area: '12.700,00',
    population: '1.870.845',
    adminCenter: { vi: 'Quảng Bình (cũ)', en: 'Quảng Bình (former)' },
    beforeMerger: { vi: 'tỉnh Quảng Bình và tỉnh Quảng Trị', en: 'Quảng Bình and Quảng Trị' },
    adminUnits: { vi: '78 ĐVHC (01 đặc khu, 08 phường, 69 xã)', en: '78 units (01 special zones, 08 wards, 69 communes)' },
    isMerged: true,
  },
  // thành phố Huế (mahc: 20)
  '46': {
    mahc: 20,
    area: '4.947,10',
    population: '1.236.393',
    adminCenter: { vi: 'giữ nguyên', en: 'unchanged' },
    beforeMerger: { vi: 'không sáp nhập', en: 'not merged' },
    adminUnits: { vi: '40 ĐVHC (21 phường, 19 xã)', en: '40 units (21 wards, 19 communes)' },
    isMerged: false,
  },
  // thành phố Đà Nẵng (mahc: 21)
  '48': {
    mahc: 21,
    area: '11.859,59',
    population: '3.065.628',
    adminCenter: { vi: 'Đà Nẵng (cũ)', en: 'Đà Nẵng (former)' },
    beforeMerger: { vi: 'thành phố Đà Nẵng và tỉnh Quảng Nam', en: 'Đà Nẵng and Quảng Nam' },
    adminUnits: { vi: '94 ĐVHC (01 đặc khu, 23 phường, 70 xã)', en: '94 units (01 special zones, 23 wards, 70 communes)' },
    isMerged: true,
  },
  // tỉnh Quảng Ngãi (mahc: 22)
  '51': {
    mahc: 22,
    area: '14.832,55',
    population: '2.161.755',
    adminCenter: { vi: 'Quảng Ngãi (cũ)', en: 'Quảng Ngãi (former)' },
    beforeMerger: { vi: 'tỉnh Kon Tum và tỉnh Quảng Ngãi', en: 'Kon Tum and Quảng Ngãi' },
    adminUnits: { vi: '96 ĐVHC (01 đặc khu, 09 phường, 86 xã)', en: '96 units (01 special zones, 09 phường, 86 communes)' },
    isMerged: true,
  },
  // tỉnh Khánh Hòa (mahc: 23)
  '56': {
    mahc: 23,
    area: '8.555,86',
    population: '2.243.554',
    adminCenter: { vi: 'Khánh Hòa (cũ)', en: 'Khánh Hòa (former)' },
    beforeMerger: { vi: 'tỉnh Ninh Thuận và tỉnh Khánh Hòa', en: 'Ninh Thuận and Khánh Hòa' },
    adminUnits: { vi: '65 ĐVHC (01 đặc khu, 16 phường, 48 xã)', en: '65 units (01 special zones, 16 phường, 48 communes)' },
    isMerged: true,
  },
  // tỉnh Gia Lai (mahc: 24)
  '52': {
    mahc: 24,
    area: '21.576,53',
    population: '3.583.693',
    adminCenter: { vi: 'Bình Định (cũ)', en: 'Bình Định (former)' },
    beforeMerger: { vi: 'tỉnh Bình Định và tỉnh Gia Lai', en: 'Bình Định and Gia Lai' },
    adminUnits: { vi: '135 ĐVHC (25 phường, 110 xã)', en: '135 units (25 phường, 110 communes)' },
    isMerged: true,
  },
  // tỉnh Đắk Lắk (mahc: 25)
  '66': {
    mahc: 25,
    area: '18.096,40',
    population: '3.346.853',
    adminCenter: { vi: 'Đắk Lắk (cũ)', en: 'Đắk Lắk (former)' },
    beforeMerger: { vi: 'tỉnh Phú Yên và tỉnh Đắk Lắk', en: 'Phú Yên and Đắk Lắk' },
    adminUnits: { vi: '102 ĐVHC (14 phường, 88 xã)', en: '102 units (14 wards, 88 communes)' },
    isMerged: true,
  },
  // tỉnh Lâm Đồng (mahc: 26)
  '68': {
    mahc: 26,
    area: '24.233,07',
    population: '3.872.999',
    adminCenter: { vi: 'Lâm Đồng (cũ)', en: 'Lâm Đồng (former)' },
    beforeMerger: { vi: 'tỉnh Đắk Nông, tỉnh Bình Thuận và tỉnh Lâm Đồng', en: 'Đắk Nông, Bình Thuận and Lâm Đồng' },
    adminUnits: { vi: '124 ĐVHC (01 đặc khu, 20 phường, 103 xã)', en: '124 units (01 special zones, 20 phường, 103 communes)' },
    isMerged: true,
  },
  // tỉnh Tây Ninh (mahc: 27)
  '80': {
    mahc: 27,
    area: '8.536,44',
    population: '3.254.170',
    adminCenter: { vi: 'Long An (cũ)', en: 'Long An (former)' },
    beforeMerger: { vi: 'tỉnh Long An và tỉnh Tây Ninh', en: 'Long An and Tây Ninh' },
    adminUnits: { vi: '96 ĐVHC (14 phường, 82 xã)', en: '96 units (14 phường, 82 communes)' },
    isMerged: true,
  },
  // tỉnh Đồng Nai (mahc: 28)
  '75': {
    mahc: 28,
    area: '12.737,18',
    population: '4.491.408',
    adminCenter: { vi: 'Đồng Nai (cũ)', en: 'Đồng Nai (former)' },
    beforeMerger: { vi: 'tỉnh Bình Phước và tỉnh Đồng Nai', en: 'Bình Phước and Đồng Nai' },
    adminUnits: { vi: '95 ĐVHC (23 phường, 72 xã)', en: '95 units (23 wards, 72 communes)' },
    isMerged: true,
  },
  // thành phố Hồ Chí Minh (mahc: 29)
  '79': {
    mahc: 29,
    area: '6.772,59',
    population: '14.002.598',
    adminCenter: { vi: 'Tp. HCM (cũ)', en: 'Tp. HCM (former)' },
    beforeMerger: { vi: 'TPHCM, tỉnh Bà Rịa - Vũng Tàu và tỉnh Bình Dương', en: 'TPHCM, Bà Rịa - Vũng Tàu and Bình Dương' },
    adminUnits: { vi: '168 ĐVHC (01 đặc khu, 113 phường, 54 xã)', en: '168 units (01 đặc khu, 113 phường, 54 xã)' },
    isMerged: true,
  },
  // tỉnh Vĩnh Long (mahc: 30)
  '86': {
    mahc: 30,
    area: '6.296,20',
    population: '4.257.581',
    adminCenter: { vi: 'Vĩnh Long (cũ)', en: 'Vĩnh Long (former)' },
    beforeMerger: { vi: 'tỉnh Bến Tre, tỉnh Trà Vinh và tỉnh Vĩnh Long', en: 'Bến Tre, Trà Vinh and Vĩnh Long' },
    adminUnits: { vi: '124 ĐVHC (19 phường, 105 xã)', en: '124 units (19 phường, 105 communes)' },
    isMerged: true,
  },
  // tỉnh Đồng Tháp (mahc: 31)
  '82': {
    mahc: 31,
    area: '5.938,64',
    population: '4.370.046',
    adminCenter: { vi: 'Tiền Giang (cũ)', en: 'Tiền Giang (former)' },
    beforeMerger: { vi: 'tỉnh Tiền Giang và tỉnh Đồng Tháp', en: 'Tiền Giang and Đồng Tháp' },
    adminUnits: { vi: '102 ĐVHC (20 phường, 82 xã)', en: '102 units (20 phường, 82 communes)' },
    isMerged: true,
  },
  // tỉnh An Giang (mahc: 32)
  '91': {
    mahc: 32,
    area: '9.888,91',
    population: '4.952.238',
    adminCenter: { vi: 'Kiên Giang (cũ)', en: 'Kiên Giang (former)' },
    beforeMerger: { vi: 'tỉnh Kiên Giang và tỉnh An Giang', en: 'Kiên Giang and An Giang' },
    adminUnits: { vi: '102 ĐVHC (03 đặc khu, 14 phường, 85 xã)', en: '102 units (03 special zones, 14 wards, 85 communes)' },
    isMerged: true,
  },
  // thành phố Cần Thơ (mahc: 33)
  '92': {
    mahc: 33,
    area: '6.360,83',
    population: '4.199.824',
    adminCenter: { vi: 'Cần Thơ (cũ)', en: 'Cần Thơ (former)' },
    beforeMerger: { vi: 'thành phố Cần Thơ, tỉnh Sóc Trăng và tỉnh Hậu Giang', en: 'Cần Thơ, Sóc Trăng and Hậu Giang' },
    adminUnits: { vi: '103 ĐVHC (31 phường và 72 xã)', en: '103 units (31 wards and 72 communes)' },
    isMerged: true,
  },
  // tỉnh Cà Mau (mahc: 34)
  '96': {
    mahc: 34,
    area: '7.942,39',
    population: '2.606.672',
    adminCenter: { vi: 'Cà mau (cũ)', en: 'Cà mau (former)' },
    beforeMerger: { vi: 'tỉnh Bạc Liêu và tỉnh Cà Mau', en: 'Bạc Liêu and Cà Mau' },
    adminUnits: { vi: '64 ĐVHC (09 phường, 55 xã)', en: '64 units (09 wards, 55 communes)' },
    isMerged: true,
  },
};

// Mapping from GeoJSON province ID to API mahc (for ward metadata lookup)
const GEOJSON_TO_MAHC: Record<string, number> = {
  '01': 1, // Hà Nội
  '04': 7, // Cao Bằng
  '08': 8, // Tuyên Quang
  '11': 13, // Điện Biên
  '12': 14, // Lai Châu
  '14': 15, // Sơn La
  '15': 9, // Lào Cai
  '19': 10, // Thái Nguyên
  '20': 11, // Lạng Sơn
  '22': 3, // Quảng Ninh
  '24': 2, // Bắc Ninh
  '25': 12, // Phú Thọ
  '31': 4, // Hải Phòng
  '33': 5, // Hưng Yên
  '37': 6, // Ninh Bình
  '38': 16, // Thanh Hóa
  '40': 17, // Nghệ An
  '42': 18, // Hà Tĩnh
  '44': 19, // Quảng Trị
  '46': 20, // Huế
  '48': 21, // Đà Nẵng
  '51': 22, // Quảng Ngãi
  '52': 24, // Gia Lai
  '56': 23, // Khánh Hòa
  '66': 25, // Đắk Lắk
  '68': 26, // Lâm Đồng
  '75': 28, // Đồng Nai
  '79': 29, // TP.HCM
  '80': 27, // Tây Ninh
  '82': 31, // Đồng Tháp
  '86': 30, // Vĩnh Long
  '91': 32, // An Giang
  '92': 33, // Cần Thơ
  '96': 34, // Cà Mau
};

// Ward metadata from API (raw format)
interface WardMetadataRaw {
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

interface WardsMetadataFile {
  provinceId: number;
  provinceName: string;
  mahc: number;
  wards: WardMetadataRaw[];
}

// Cache for loaded ward metadata
const wardMetadataCache: Map<number, WardsMetadataFile> = new Map();

/**
 * Get merger info for a province
 */
export function getProvinceMergerInfo(provinceId: string): MergerInfo | null {
  return provinceMergers[provinceId] || null;
}

/**
 * Load ward metadata for a province (async, from public folder)
 */
export async function loadWardMetadata(provinceId: string): Promise<WardsMetadataFile | null> {
  const mahc = GEOJSON_TO_MAHC[provinceId];
  if (!mahc) return null;

  // Check cache first
  if (wardMetadataCache.has(mahc)) {
    return wardMetadataCache.get(mahc) || null;
  }

  try {
    const response = await fetch(`/wards-metadata/${mahc}.json`);
    if (!response.ok) return null;
    const data: WardsMetadataFile = await response.json();
    wardMetadataCache.set(mahc, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Get ward merger info (sync, requires prior loadWardMetadata call)
 */
export function getWardMergerInfo(provinceId: string, wardName: string): WardMergerInfo | null {
  const mahc = GEOJSON_TO_MAHC[provinceId];
  if (!mahc) return null;

  const cached = wardMetadataCache.get(mahc);
  if (!cached) return null;

  // Find ward by name (ward ID from GeoJSON may not match API ID)
  const ward = cached.wards.find(w => w.name === wardName);
  if (!ward) return null;

  return {
    code: ward.code,
    area: ward.area,
    population: ward.population,
    adminCenter: ward.adminCenter,
    beforeMerger: ward.beforeMerger,
    wardCode: ward.wardCode,
  };
}

/**
 * Ward merger info type
 */
export interface WardMergerInfo {
  code: string;
  area: number;
  population: number;
  adminCenter: string;
  beforeMerger: string;
  wardCode: number;
}

/**
 * Get localized text
 */
export function getLocalizedText(text: LocalizedText, locale: Locale): string {
  return locale === 'vi' ? text.vi : text.en;
}
