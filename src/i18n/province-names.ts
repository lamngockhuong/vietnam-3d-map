import type { Locale } from './config';

// Province name translations (Vietnamese name -> English name)
// Only includes provinces that have different English names
const provinceNameTranslations: Record<string, string> = {
  'Hà Nội': 'Hanoi',
  'TP. Hồ Chí Minh': 'Ho Chi Minh City',
  'Đà Nẵng': 'Da Nang',
  'Hải Phòng': 'Hai Phong',
  'Cần Thơ': 'Can Tho',
  'Huế': 'Hue',
  'Khánh Hòa': 'Nha Trang',
  'Lâm Đồng': 'Da Lat',
  'Quảng Ninh': 'Quang Ninh',
  'Nghệ An': 'Nghe An',
  'Bà Rịa - Vũng Tàu': 'Ba Ria - Vung Tau',
  'Bắc Giang': 'Bac Giang',
  'Bắc Kạn': 'Bac Kan',
  'Bạc Liêu': 'Bac Lieu',
  'Bắc Ninh': 'Bac Ninh',
  'Bến Tre': 'Ben Tre',
  'Bình Định': 'Binh Dinh',
  'Bình Dương': 'Binh Duong',
  'Bình Phước': 'Binh Phuoc',
  'Bình Thuận': 'Binh Thuan',
  'Cà Mau': 'Ca Mau',
  'Cao Bằng': 'Cao Bang',
  'Đắk Lắk': 'Dak Lak',
  'Đắk Nông': 'Dak Nong',
  'Điện Biên': 'Dien Bien',
  'Đồng Nai': 'Dong Nai',
  'Đồng Tháp': 'Dong Thap',
  'Gia Lai': 'Gia Lai',
  'Hà Giang': 'Ha Giang',
  'Hà Nam': 'Ha Nam',
  'Hà Tĩnh': 'Ha Tinh',
  'Hải Dương': 'Hai Duong',
  'Hậu Giang': 'Hau Giang',
  'Hòa Bình': 'Hoa Binh',
  'Hưng Yên': 'Hung Yen',
  'Kiên Giang': 'Kien Giang',
  'Kon Tum': 'Kon Tum',
  'Lai Châu': 'Lai Chau',
  'Lạng Sơn': 'Lang Son',
  'Lào Cai': 'Lao Cai',
  'Long An': 'Long An',
  'Nam Định': 'Nam Dinh',
  'Ninh Bình': 'Ninh Binh',
  'Ninh Thuận': 'Ninh Thuan',
  'Phú Thọ': 'Phu Tho',
  'Phú Yên': 'Phu Yen',
  'Quảng Bình': 'Quang Binh',
  'Quảng Nam': 'Quang Nam',
  'Quảng Ngãi': 'Quang Ngai',
  'Quảng Trị': 'Quang Tri',
  'Sóc Trăng': 'Soc Trang',
  'Sơn La': 'Son La',
  'Tây Ninh': 'Tay Ninh',
  'Thái Bình': 'Thai Binh',
  'Thái Nguyên': 'Thai Nguyen',
  'Thanh Hóa': 'Thanh Hoa',
  'Tiền Giang': 'Tien Giang',
  'Trà Vinh': 'Tra Vinh',
  'Tuyên Quang': 'Tuyen Quang',
  'Vĩnh Long': 'Vinh Long',
  'Vĩnh Phúc': 'Vinh Phuc',
  'Yên Bái': 'Yen Bai',
  'An Giang': 'An Giang',
};

/**
 * Get the translated province name based on locale
 * @param vietnameseName - The Vietnamese name of the province
 * @param locale - The target locale
 * @returns Translated name or original Vietnamese name if no translation exists
 */
export function getProvinceName(vietnameseName: string, locale: Locale): string {
  if (locale === 'vi') {
    return vietnameseName;
  }

  return provinceNameTranslations[vietnameseName] || vietnameseName;
}
