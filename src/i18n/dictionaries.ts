import type { Locale } from './config';

export interface Dictionary {
  // Meta
  meta: {
    title: string;
    description: string;
  };
  // Loading
  loading: {
    initializing: string;
    creatingOcean: string;
    creatingProvinces: string;
    addingIslands: string;
    settingUpControls: string;
    initializingHandTracking: string;
    ready: string;
    error: string;
  };
  // Title HUD
  title: {
    main: string;
    subtitle: string;
  };
  // Legend
  legend: {
    title: string;
    lowlands: string;
    mountains: string;
    sovereignty: string;
    coastalIslands: string;
    capital: string;
    majorCities: string;
    // Location info section
    locationInfo: string;
    selectLocation: string;
    // Merger info
    mergerInfo: string;
    mergedFrom: string;
    mergedYear: string;
    adminCenter: string;
    adminUnits: string;
    noMergerInfo: string;
    notMerged: string;
  };
  // Controls
  controls: {
    title: string;
    drag: string;
    scroll: string;
    reset: string;
    zoom: string;
    handTracking: string;
    openPalm: string;
    pinch: string;
    fist: string;
    peace: string;
    pointing: string;
    twoHandPeace: string;
    enableCamera: string;
    disableCamera: string;
    touchControls: string;
    touchDrag: string;
    touchPinch: string;
    touchTwoFinger: string;
    movement: string;
    zoomLabel: string;
  };
  // Camera
  camera: {
    status: string;
    loading: string;
    active: string;
    error: string;
  };
  // Provinces
  provinces: {
    type: string;
    population: string;
    area: string;
    density: string;
  };
  // Islands
  islands: {
    hoangSa: string;
    truongSa: string;
    sovereignty: string;
  };
  // Sidebar
  sidebar: {
    title: string;
    searchPlaceholder: string;
    provinces: string;
    wards: string;
    noResults: string;
    backToProvinces: string;
    selectProvince: string;
    loading: string;
  };
  // Footer
  footer: {
    about: string;
    terms: string;
    privacy: string;
  };
  // Pages
  pages: {
    backToMap: string;
    about: {
      title: string;
      description: string;
      purpose: string;
      purposeText: string;
      features: string;
      featuresText: string[];
      technology: string;
      technologyText: string;
      openSource: string;
      openSourceText: string;
      contact: string;
      contactText: string;
    };
    terms: {
      title: string;
      description: string;
      acceptance: string;
      acceptanceText: string;
      educationalUse: string;
      educationalUseText: string;
      accuracy: string;
      accuracyText: string;
      intellectualProperty: string;
      intellectualPropertyText: string;
      limitations: string;
      limitationsText: string;
      changes: string;
      changesText: string;
      lastUpdated: string;
    };
    privacy: {
      title: string;
      description: string;
      collection: string;
      collectionText: string;
      localStorage: string;
      localStorageText: string;
      cookies: string;
      cookiesText: string;
      thirdParty: string;
      thirdPartyText: string;
      children: string;
      childrenText: string;
      changes: string;
      changesText: string;
      contact: string;
      contactText: string;
      lastUpdated: string;
    };
  };
}

const dictionaries: Record<Locale, Dictionary> = {
  vi: {
    meta: {
      title: 'Bản đồ 3D Việt Nam',
      description: 'Bản đồ 3D tương tác của Việt Nam với quần đảo Hoàng Sa và Trường Sa',
    },
    loading: {
      initializing: 'Đang khởi tạo khung cảnh 3D...',
      creatingOcean: 'Đang tạo đại dương...',
      creatingProvinces: 'Đang tạo các tỉnh thành Việt Nam...',
      addingIslands: 'Đang thêm các đảo...',
      settingUpControls: 'Đang thiết lập điều khiển...',
      initializingHandTracking: 'Đang khởi tạo nhận diện cử chỉ tay...',
      ready: 'Sẵn sàng!',
      error: 'Lỗi tải bản đồ. Kiểm tra console.',
    },
    title: {
      main: 'VIỆT NAM',
      subtitle: 'Hoàng Sa, Trường Sa là của Việt Nam',
    },
    legend: {
      title: 'CHÚ GIẢI',
      lowlands: 'Đồng bằng & Rừng',
      mountains: 'Núi & Cao nguyên',
      sovereignty: 'Hoàng Sa & Trường Sa',
      coastalIslands: 'Đảo ven biển',
      capital: 'Thủ đô',
      majorCities: 'Thành phố lớn',
      locationInfo: 'THÔNG TIN VỊ TRÍ',
      selectLocation: 'Nhấn vào tỉnh/thành trên bản đồ để xem thông tin',
      mergerInfo: 'THÔNG TIN SÁT NHẬP',
      mergedFrom: 'Trước sát nhập',
      mergedYear: 'Năm 2025',
      adminCenter: 'Trung tâm HC',
      adminUnits: 'Đơn vị HC',
      noMergerInfo: 'Không có thông tin sát nhập',
      notMerged: 'Không sát nhập',
    },
    controls: {
      title: 'ĐIỀU KHIỂN',
      drag: 'Kéo: Xoay',
      scroll: 'Cuộn: Thu phóng',
      reset: 'R: Đặt lại',
      zoom: '+/-: Thu phóng',
      handTracking: 'Cử chỉ tay',
      openPalm: 'Xòe tay: Xoay',
      pinch: 'Véo: Thu phóng',
      fist: 'Nắm tay: Đặt lại',
      peace: 'Chữ V: Bật/tắt sidebar',
      pointing: 'Chỉ tay: Xoay tinh chỉnh',
      twoHandPeace: 'Hai chữ V: Chụp màn hình',
      enableCamera: 'Bật Camera',
      disableCamera: 'Tắt Camera',
      touchControls: 'Cảm ứng',
      touchDrag: 'Kéo để xoay',
      touchPinch: 'Chụm để thu phóng',
      touchTwoFinger: 'Hai ngón để di chuyển',
      movement: 'Di chuyển',
      zoomLabel: 'Thu phóng',
    },
    camera: {
      status: 'Camera',
      loading: 'Đang tải...',
      active: 'Đang hoạt động',
      error: 'Lỗi',
    },
    provinces: {
      type: 'Loại',
      population: 'Dân số',
      area: 'Diện tích',
      density: 'Mật độ',
    },
    islands: {
      hoangSa: 'Quần đảo Hoàng Sa',
      truongSa: 'Quần đảo Trường Sa',
      sovereignty: 'Chủ quyền Việt Nam',
    },
    sidebar: {
      title: 'DANH SÁCH',
      searchPlaceholder: 'Tìm kiếm tỉnh thành, quận huyện...',
      provinces: 'Tỉnh thành',
      wards: 'Quận/Huyện/Xã',
      noResults: 'Không tìm thấy kết quả',
      backToProvinces: 'Quay lại danh sách tỉnh',
      selectProvince: 'Chọn một tỉnh để xem chi tiết',
      loading: 'Đang tải...',
    },
    footer: {
      about: 'Giới thiệu',
      terms: 'Điều khoản',
      privacy: 'Bảo mật',
    },
    pages: {
      backToMap: 'Quay lại bản đồ',
      about: {
        title: 'Giới thiệu',
        description: 'Tìm hiểu về Bản đồ 3D Việt Nam',
        purpose: 'Mục đích',
        purposeText: 'Bản đồ 3D Việt Nam là một dự án giáo dục nhằm giúp mọi người tìm hiểu về địa lý Việt Nam một cách trực quan và sinh động. Dự án này được xây dựng với mục tiêu giáo dục, phi thương mại.',
        features: 'Tính năng',
        featuresText: [
          'Hiển thị các tỉnh thành của Việt Nam với hình dạng 3D',
          'Thông tin chi tiết về dân số, diện tích của từng tỉnh',
          'Hiển thị quần đảo Hoàng Sa và Trường Sa - chủ quyền thiêng liêng của Việt Nam',
          'Hỗ trợ điều khiển bằng cử chỉ tay thông qua camera',
          'Giao diện đa ngôn ngữ (Tiếng Việt & English)',
        ],
        technology: 'Công nghệ',
        technologyText: 'Dự án được xây dựng với Next.js, React Three Fiber, Three.js và TypeScript. Dữ liệu địa lý được xử lý từ GeoJSON và tối ưu hóa để hiển thị trên web.',
        openSource: 'Mã nguồn mở',
        openSourceText: 'Dự án này là mã nguồn mở và có sẵn trên GitHub tại github.com/lamngockhuong/vietnam-3d-map. Chúng tôi hoan nghênh các đóng góp từ cộng đồng.',
        contact: 'Liên hệ',
        contactText: 'Nếu bạn có câu hỏi hoặc góp ý, vui lòng liên hệ qua website khuong.dev',
      },
      terms: {
        title: 'Điều khoản sử dụng',
        description: 'Điều khoản và điều kiện sử dụng Bản đồ 3D Việt Nam',
        acceptance: 'Chấp nhận điều khoản',
        acceptanceText: 'Bằng việc truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.',
        educationalUse: 'Mục đích giáo dục',
        educationalUseText: 'Website này được tạo ra với mục đích giáo dục và phi thương mại. Nội dung được cung cấp miễn phí để hỗ trợ việc học tập và nghiên cứu về địa lý Việt Nam.',
        accuracy: 'Độ chính xác dữ liệu',
        accuracyText: 'Chúng tôi cố gắng cung cấp thông tin chính xác nhất có thể. Tuy nhiên, dữ liệu địa lý và thống kê có thể thay đổi theo thời gian. Vui lòng tham khảo các nguồn chính thức để có thông tin cập nhật nhất.',
        intellectualProperty: 'Quyền sở hữu trí tuệ',
        intellectualPropertyText: 'Mã nguồn của dự án được phát hành theo giấy phép mã nguồn mở. Dữ liệu địa lý được sử dụng từ các nguồn công khai.',
        limitations: 'Giới hạn trách nhiệm',
        limitationsText: 'Website này được cung cấp "nguyên trạng". Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng website.',
        changes: 'Thay đổi điều khoản',
        changesText: 'Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng website sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.',
        lastUpdated: 'Cập nhật lần cuối: Tháng 12, 2025',
      },
      privacy: {
        title: 'Chính sách bảo mật',
        description: 'Chính sách bảo mật của Bản đồ 3D Việt Nam',
        collection: 'Thu thập dữ liệu',
        collectionText: 'Chúng tôi không thu thập bất kỳ thông tin cá nhân nào từ người dùng. Website hoạt động hoàn toàn ở phía client và không yêu cầu đăng ký tài khoản.',
        localStorage: 'Lưu trữ cục bộ',
        localStorageText: 'Website sử dụng localStorage của trình duyệt để lưu các tùy chọn giao diện (như trạng thái đóng/mở của các panel). Dữ liệu này chỉ được lưu trên thiết bị của bạn.',
        cookies: 'Cookies',
        cookiesText: 'Website không sử dụng cookies để theo dõi người dùng.',
        thirdParty: 'Dịch vụ bên thứ ba',
        thirdPartyText: 'Website có thể sử dụng các dịch vụ bên thứ ba như CDN để tải thư viện. Các dịch vụ này có thể có chính sách bảo mật riêng.',
        children: 'Trẻ em',
        childrenText: 'Website này phù hợp cho mọi lứa tuổi và đặc biệt khuyến khích sử dụng cho mục đích giáo dục.',
        changes: 'Thay đổi chính sách',
        changesText: 'Chúng tôi có thể cập nhật chính sách bảo mật này. Các thay đổi sẽ được đăng trên trang này.',
        contact: 'Liên hệ',
        contactText: 'Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ qua khuong.dev',
        lastUpdated: 'Cập nhật lần cuối: Tháng 12, 2025',
      },
    },
  },
  en: {
    meta: {
      title: 'Vietnam 3D Map',
      description: 'Interactive 3D Map of Vietnam including Paracel and Spratly Islands',
    },
    loading: {
      initializing: 'Initializing 3D scene...',
      creatingOcean: 'Creating ocean...',
      creatingProvinces: 'Creating Vietnam provinces...',
      addingIslands: 'Adding islands...',
      settingUpControls: 'Setting up controls...',
      initializingHandTracking: 'Initializing hand tracking...',
      ready: 'Ready!',
      error: 'Error loading map. Check console.',
    },
    title: {
      main: 'VIETNAM',
      subtitle: 'Hoang Sa, Truong Sa are of Vietnam',
    },
    legend: {
      title: 'LEGEND',
      lowlands: 'Lowlands & Forests',
      mountains: 'Mountains & Highlands',
      sovereignty: 'Paracel & Spratly',
      coastalIslands: 'Coastal Islands',
      capital: 'Capital',
      majorCities: 'Major Cities',
      locationInfo: 'LOCATION INFO',
      selectLocation: 'Click a province/district on the map to view info',
      mergerInfo: 'MERGER INFO',
      mergedFrom: 'Before merger',
      mergedYear: 'Year 2025',
      adminCenter: 'Admin center',
      adminUnits: 'Admin units',
      noMergerInfo: 'No merger information',
      notMerged: 'Not merged',
    },
    controls: {
      title: 'CONTROLS',
      drag: 'Drag: Rotate',
      scroll: 'Scroll: Zoom',
      reset: 'R: Reset View',
      zoom: '+/-: Zoom',
      handTracking: 'Hand Tracking',
      openPalm: 'Open Palm: Rotate',
      pinch: 'Pinch: Zoom',
      fist: 'Fist: Reset',
      peace: 'Peace Sign: Toggle sidebar',
      pointing: 'Pointing: Fine rotation',
      twoHandPeace: 'Two Peace Signs: Screenshot',
      enableCamera: 'Enable Camera',
      disableCamera: 'Disable Camera',
      touchControls: 'Touch',
      touchDrag: 'Drag to rotate',
      touchPinch: 'Pinch to zoom',
      touchTwoFinger: 'Two fingers to pan',
      movement: 'Movement',
      zoomLabel: 'Zoom',
    },
    camera: {
      status: 'Camera',
      loading: 'Loading...',
      active: 'Active',
      error: 'Error',
    },
    provinces: {
      type: 'Type',
      population: 'Population',
      area: 'Area',
      density: 'Density',
    },
    islands: {
      hoangSa: 'Paracel Islands',
      truongSa: 'Spratly Islands',
      sovereignty: 'Vietnamese Sovereignty',
    },
    sidebar: {
      title: 'DIRECTORY',
      searchPlaceholder: 'Search provinces, districts...',
      provinces: 'Provinces',
      wards: 'Districts/Wards',
      noResults: 'No results found',
      backToProvinces: 'Back to provinces',
      selectProvince: 'Select a province to view details',
      loading: 'Loading...',
    },
    footer: {
      about: 'About',
      terms: 'Terms',
      privacy: 'Privacy',
    },
    pages: {
      backToMap: 'Back to map',
      about: {
        title: 'About',
        description: 'Learn about Vietnam 3D Map',
        purpose: 'Purpose',
        purposeText: 'Vietnam 3D Map is an educational project designed to help people learn about Vietnam\'s geography in an interactive and engaging way. This project is built for educational purposes and is non-commercial.',
        features: 'Features',
        featuresText: [
          'Display provinces of Vietnam in 3D',
          'Detailed information about population and area of each province',
          'Display Paracel and Spratly Islands - sacred sovereignty of Vietnam',
          'Hand gesture control support via camera',
          'Multilingual interface (Vietnamese & English)',
        ],
        technology: 'Technology',
        technologyText: 'The project is built with Next.js, React Three Fiber, Three.js, and TypeScript. Geographic data is processed from GeoJSON and optimized for web display.',
        openSource: 'Open Source',
        openSourceText: 'This project is open source and available on GitHub at github.com/lamngockhuong/vietnam-3d-map. We welcome contributions from the community.',
        contact: 'Contact',
        contactText: 'If you have questions or feedback, please contact via khuong.dev',
      },
      terms: {
        title: 'Terms of Service',
        description: 'Terms and conditions for using Vietnam 3D Map',
        acceptance: 'Acceptance of Terms',
        acceptanceText: 'By accessing and using this website, you agree to comply with the terms and conditions outlined below.',
        educationalUse: 'Educational Purpose',
        educationalUseText: 'This website is created for educational and non-commercial purposes. Content is provided free of charge to support learning and research about Vietnam\'s geography.',
        accuracy: 'Data Accuracy',
        accuracyText: 'We strive to provide the most accurate information possible. However, geographic and statistical data may change over time. Please refer to official sources for the most up-to-date information.',
        intellectualProperty: 'Intellectual Property',
        intellectualPropertyText: 'The project source code is released under an open source license. Geographic data is used from public sources.',
        limitations: 'Limitation of Liability',
        limitationsText: 'This website is provided "as is". We are not responsible for any damages arising from the use of the website.',
        changes: 'Changes to Terms',
        changesText: 'We reserve the right to update these terms at any time. Continued use of the website after changes means you accept the new terms.',
        lastUpdated: 'Last updated: December 2025',
      },
      privacy: {
        title: 'Privacy Policy',
        description: 'Privacy policy for Vietnam 3D Map',
        collection: 'Data Collection',
        collectionText: 'We do not collect any personal information from users. The website operates entirely on the client side and does not require account registration.',
        localStorage: 'Local Storage',
        localStorageText: 'The website uses browser localStorage to save UI preferences (such as panel open/close states). This data is stored only on your device.',
        cookies: 'Cookies',
        cookiesText: 'The website does not use cookies to track users.',
        thirdParty: 'Third-Party Services',
        thirdPartyText: 'The website may use third-party services such as CDNs to load libraries. These services may have their own privacy policies.',
        children: 'Children',
        childrenText: 'This website is suitable for all ages and is especially encouraged for educational purposes.',
        changes: 'Policy Changes',
        changesText: 'We may update this privacy policy. Changes will be posted on this page.',
        contact: 'Contact',
        contactText: 'If you have questions about the privacy policy, please contact via khuong.dev',
        lastUpdated: 'Last updated: December 2025',
      },
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.vi;
}
