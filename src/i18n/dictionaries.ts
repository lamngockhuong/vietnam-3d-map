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
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.vi;
}
