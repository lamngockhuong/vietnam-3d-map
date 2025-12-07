# Codebase Summary

## Directory Structure Overview

```bash
vietnam-3d-map/
├── src/                              # Next.js 16 application source
│   ├── app/
│   │   ├── [locale]/                # Route parameter for i18n (vi, en)
│   │   │   ├── page.tsx             # Main page per locale
│   │   │   ├── layout.tsx           # Locale-specific layout
│   │   │   ├── about/page.tsx       # About page
│   │   │   ├── terms/page.tsx       # Terms of Service page
│   │   │   └── privacy/page.tsx     # Privacy Policy page
│   │   ├── layout.tsx               # Root layout (metadata, providers)
│   │   ├── globals.css              # Global styles (Tailwind v4 @import)
│   │   └── page.tsx                 # Root page (redirect to /vi)
│   │
│   ├── components/                  # React components
│   │   ├── MapWrapper.tsx           # Main wrapper (Client Component)
│   │   │                             # - Province data preloading
│   │   │                             # - Loading state management
│   │   │                             # - Hand tracking state
│   │   │                             # - Dynamic R3F import with ssr: false
│   │   │
│   │   ├── map/                     # 3D map components
│   │   │   ├── VietnamMap.tsx       # Canvas setup & scene
│   │   │   │                         # - PerspectiveCamera configuration
│   │   │   │                         # - 5-light system setup
│   │   │   │                         # - EffectComposer (bloom post-processing)
│   │   │   │                         # - Tooltip state management
│   │   │   │
│   │   │   ├── Provinces.tsx        # 63 province geometries
│   │   │   │                         # - Renders ExtrudeGeometry per province
│   │   │   │                         # - Hover detection via raycasting
│   │   │   │                         # - Color mapping by province type
│   │   │   │                         # - Memoized for performance
│   │   │   │
│   │   │   ├── Ocean.tsx            # Animated water plane
│   │   │   │                         # - Custom GLSL shaders
│   │   │   │                         # - Time-based wave animation
│   │   │   │                         # - Depth gradient caustics
│   │   │   │                         # - Uniforms: time, viewPos, resolution
│   │   │   │
│   │   │   ├── SkyDome.tsx          # Gradient background sphere
│   │   │   │                         # - Custom GLSL shader
│   │   │   │                         # - Gradient from horizon to sky
│   │   │   │
│   │   │   ├── CameraController.tsx # Interaction & camera logic
│   │   │   │                         # - OrbitControls wrapper
│   │   │   │                         # - Zoom-to-cursor implementation
│   │   │   │                         # - Hand gesture integration
│   │   │   │                         # - Keyboard shortcuts (arrows, +/-, R)
│   │   │   │                         # - Touch/trackpad gestures
│   │   │   │                         # - Camera animation (easing)
│   │   │   │
│   │   │   ├── ProvinceLabels.tsx   # Billboard text labels
│   │   │   │                         # - Renders province names in 3D space
│   │   │   │                         # - Always faces camera (billboard)
│   │   │   │                         # - Responsive scaling
│   │   │   │
│   │   │   ├── IslandMarkers.tsx    # Hoàng Sa & Trường Sa visualization
│   │   │   │                         # - Island archipelago positions
│   │   │   │                         # - Sovereignty markers
│   │   │   │                         # - Tooltip integration
│   │   │   │
│   │   │   └── Lights.tsx           # 5-light system
│   │   │                             # - Directional light (north)
│   │   │                             # - Directional light (south)
│   │   │                             # - Ambient light (global)
│   │   │                             # - Spot light 1 (map center)
│   │   │                             # - Spot light 2 (accent)
│   │   │
│   │   ├── ui/                      # UI overlay components
│   │   │   ├── Controls.tsx         # Control panel
│   │   │   │                         # - Collapsible controls reference
│   │   │   │                         # - Device-specific instructions
│   │   │   │                         # - Localized text
│   │   │   │
│   │   │   ├── Legend.tsx           # Color category legend
│   │   │   │                         # - Shows color meaning
│   │   │   │                         # - Collapsible state
│   │   │   │                         # - Interactive filters (future)
│   │   │   │
│   │   │   ├── Tooltip.tsx          # Province hover information
│   │   │   │                         # - Position: mouse/touch location
│   │   │   │                         # - Content: province name, metadata
│   │   │   │                         # - Auto-hide on scroll
│   │   │   │
│   │   │   ├── LanguageSwitcher.tsx # VI/EN language toggle
│   │   │   │                         # - Button group or dropdown
│   │   │   │                         # - Navigates to /[locale]/page
│   │   │   │                         # - Current locale highlighted
│   │   │   │
│   │   │   ├── LoadingScreen.tsx    # Loading state display
│   │   │   │                         # - Shown while provinces loading
│   │   │   │                         # - Loading animation
│   │   │   │                         # - Progress indicator (optional)
│   │   │   │
│   │   │   ├── HandTrackingVideo.tsx │ Camera feed visualization
│   │   │   │                         # - Live camera stream
│   │   │   │                         # - Hand landmarks overlay
│   │   │   │                         # - Toggle button
│   │   │   │                         # - Permission request handling
│   │   │   │
│   │   │   ├── Button.tsx           # Reusable button component
│   │   │   │                         # - Variant: primary, secondary, ghost
│   │   │   │                         # - Size: sm, md, lg
│   │   │   │                         # - Tailwind styled
│   │   │   │
│   │   │   ├── PageLayout.tsx       # Shared layout for info pages
│   │   │   │                         # - Nav bar with back link
│   │   │   │                         # - Footer with page links
│   │   │   │                         # - Decorative backgrounds
│   │   │   │
│   │   │   └── ...                  # Other UI components as needed
│   │   │
│   │   └── providers/               # Context providers
│   │       ├── LocaleProvider.tsx   # i18n context
│   │       │                         # - Provides: locale, dictionary, setLocale
│   │       │                         # - Wraps entire app
│   │       │
│   │       ├── HandTrackingProvider.tsx
│   │       │                         # - Provides: gesture state, enabled flag
│   │       │                         # - Singleton MediaPipe instance
│   │       │
│   │       └── TooltipProvider.tsx  # Tooltip state context
│   │                                 # - Provides: tooltip visible/content
│   │                                 # - Global position tracking
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useLocale.ts             # Get current locale & dictionary
│   │   │                             # - Returns: { locale, dict, setLocale }
│   │   │                             # - Used in components for i18n
│   │   │
│   │   ├── useHandTracking.ts       # MediaPipe Hands integration
│   │   │                             # - Returns: HandGestureState
│   │   │                             # - Handles permissions, lifecycle
│   │   │
│   │   ├── useTooltip.ts            # Tooltip state management
│   │   │                             # - Show/hide, content, position
│   │   │
│   │   ├── useUIState.ts            # UI panel state persistence
│   │   │                             # - localStorage-based
│   │   │                             # - First visit detection
│   │   │                             # - Panel open/close state
│   │   │
│   │   ├── useClickOutside.ts       # Click outside detection
│   │   │                             # - Mobile-only (< 640px)
│   │   │                             # - Auto-close panels
│   │   │
│   │   └── useMapControls.ts        # Input handling (mouse/touch/keyboard)
│   │                                 # - Processes input events
│   │                                 # - Updates camera state
│   │
│   ├── data/                        # Data files & loaders
│   │   ├── provinces-data.ts        # Province types & loader
│   │   │                             # - Interface: ProvinceData
│   │   │                             # - Function: loadProvinces()
│   │   │                             # - Maps public/provinces.json
│   │   │
│   │   └── island-data.ts           # Island coordinates & metadata
│   │                                 # - Hoàng Sa archipelago
│   │                                 # - Trường Sa archipelago
│   │
│   ├── i18n/                        # Internationalization
│   │   ├── config.ts                # Locale configuration
│   │   │                             # - locales = ['vi', 'en'] as const
│   │   │                             # - defaultLocale = 'vi'
│   │   │                             # - Type-safe locale definition
│   │   │
│   │   ├── dictionaries.ts          # Translation dictionaries
│   │   │                             # - dictionaries.en (English)
│   │   │                             # - dictionaries.vi (Vietnamese)
│   │   │                             # - Structure:
│   │   │                             #   - common: title, loading, etc.
│   │   │                             #   - controls: UI instructions
│   │   │                             #   - legend: color meanings
│   │   │                             #   - provinces: 63 names
│   │   │                             #   - metadata: labels
│   │   │                             #   - gestures: hand tracking text
│   │   │                             #   - footer: page links
│   │   │                             #   - pages: about, terms, privacy
│   │   │
│   │   ├── province-names.ts        # Province name translations
│   │   │                             # - Vietnamese → English mapping
│   │   │                             # - Used by ProvinceLabels
│   │   │
│   │   └── types.ts                 # Dictionary type definition
│   │                                 # - Interface: Dictionary
│   │                                 # - For type-safe access
│   │
│   ├── types/                       # Global TypeScript definitions
│   │   └── index.ts                 # Central type exports
│   │                                 # - ProvinceData
│   │                                 # - HandGestureState
│   │                                 # - Coordinate, Bounds, MapCenter
│   │                                 # - Dictionary
│   │                                 # - Locale
│   │                                 # - ProvinceType
│   │
│   ├── shaders/                     # GLSL shader files
│   │   ├── ocean.glsl               # Ocean vertex & fragment shaders
│   │   │                             # - Vertex: Wave displacement
│   │   │                             # - Fragment: Caustics, specular, depth
│   │   │                             # - Uniforms: time, viewPos, resolution
│   │   │
│   │   ├── skydome.glsl             # Sky gradient shader
│   │   │                             # - Fragment only
│   │   │                             # - Gradient: horizon to sky
│   │   │
│   │   └── types.ts                 # Shader uniform interfaces
│   │                                 # - OceanUniforms
│   │                                 # - SkyUniforms
│   │
│   ├── utils/                       # Utility functions
│   │   ├── geometry.ts              # Geometry creation helpers
│   │   │                             # - createExtrudeGeometry()
│   │   │                             # - simplifyPolygon() (Douglas-Peucker)
│   │   │
│   │   ├── colors.ts                # Color mapping utilities
│   │   │                             # - PROVINCE_COLORS map
│   │   │                             # - getProvinceColor(type)
│   │   │                             # - colorToHex()
│   │   │
│   │   ├── math.ts                  # Camera & geometry math
│   │   │                             # - degToRad(), radToDeg()
│   │   │                             # - easeInOutCubic() animation
│   │   │                             # - calculateZoomTarget()
│   │   │
│   │   └── performance.ts           # Perf monitoring
│   │                                 # - fps counter
│   │                                 # - memory tracking
│   │
│   ├── proxy.ts or middleware.ts    # Locale routing (Next.js 16 specific)
│   │                                 # - Redirects / → /vi
│   │                                 # - URL rewriting for locales
│   │
│   └── styles/                      # Supplementary styles (if needed)
│       └── ...                      # Additional CSS modules
│
├── public/                          # Static files served at root
│   ├── provinces.json               # Preprocessed province data (~800 KB)
│   │                                 # - Array of ProvinceData objects
│   │                                 # - Contains coordinates, metadata
│   │                                 # - 97.6% reduction from source
│   │
│   └── [legacy files]               # Standalone HTML demos (not used in app)
│       ├── index.html
│       ├── vietnam-3d-realistic-map.html
│       └── ... (other demo files)
│
├── data/                            # Raw source data
│   └── vietnam-provinces.geojson    # Raw GeoJSON (32 MB)
│                                     # - Source for preprocessing
│                                     # - Not included in build
│
├── scripts/                         # Build & utility scripts
│   └── preprocess-geojson.ts        # Data preprocessing script
│                                     # - Input: data/vietnam-provinces.geojson
│                                     # - Algorithm: Douglas-Peucker simplification
│                                     # - Output: public/provinces.json
│                                     # - Run: pnpm preprocess
│
├── docs/                            # Documentation (this directory)
│   ├── project-overview-pdr.md      # Vision, goals, requirements
│   ├── system-architecture.md       # Architecture & pipelines
│   ├── code-standards.md            # Code conventions
│   ├── codebase-summary.md          # This file
│   └── ...                          # Other documentation
│
├── .next/                           # Build output (generated)
│   ├── static/
│   │   ├── chunks/                  # JavaScript bundles (per locale)
│   │   └── css/                     # Tailwind CSS bundles
│   └── standalone/                  # Serverless-ready output
│
├── node_modules/                    # Dependencies (git-ignored)
│
├── Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── pnpm-lock.yaml               # Dependency lock file
│   ├── tsconfig.json                # TypeScript configuration
│   ├── next.config.ts               # Next.js configuration
│   │                                 # - reactStrictMode: false (WebGL)
│   │                                 # - Turbopack enabled
│   │
│   ├── tailwind.config.ts           # Tailwind CSS v4 config
│   │                                 # - Theme colors
│   │                                 # - Custom breakpoints
│   │
│   ├── postcss.config.mjs           # PostCSS configuration
│   │                                 # - Tailwind CSS 4 plugin
│   │
│   ├── eslint.config.js             # ESLint rules
│   │
│   ├── .gitignore                   # Git ignore rules
│   ├── CLAUDE.md                    # Project-specific instructions
│   └── README.md                    # Project overview & quick start
```

## Key Files & Purposes

### Entry Points

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Root page - redirects to default locale (/vi) |
| `src/app/[locale]/page.tsx` | Main map page per locale |
| `src/app/layout.tsx` | Root layout with providers & global setup |
| `src/app/globals.css` | Global styles using Tailwind v4 @import syntax |

### Core Map Components

| File | Responsibility |
|------|-----------------|
| `src/components/MapWrapper.tsx` | Client wrapper, province preloading, state setup |
| `src/components/map/VietnamMap.tsx` | R3F Canvas, scene setup, lighting, post-processing |
| `src/components/map/Provinces.tsx` | 63 ExtrudeGeometry meshes, hover detection, colors |
| `src/components/map/CameraController.tsx` | Interaction handling, camera animation |
| `src/components/map/Ocean.tsx` | Water plane with animated GLSL shader |
| `src/components/map/SkyDome.tsx` | Gradient background |

### UI Components

| File | Responsibility |
|------|-----------------|
| `src/components/ui/Controls.tsx` | Control panel with instructions |
| `src/components/ui/Legend.tsx` | Color category legend |
| `src/components/ui/Tooltip.tsx` | Province hover info display |
| `src/components/ui/LanguageSwitcher.tsx` | Language selection (VI/EN) |
| `src/components/ui/LoadingScreen.tsx` | Loading state display |

### Data & Configuration

| File | Purpose |
|------|---------|
| `src/data/provinces-data.ts` | Province types & loader function |
| `src/i18n/config.ts` | Locale configuration with type safety |
| `src/i18n/dictionaries.ts` | Vietnamese & English translations |
| `src/types/index.ts` | Global TypeScript type definitions |
| `public/provinces.json` | Preprocessed province data (~800 KB) |

### Build & Scripts

| File | Purpose |
|------|---------|
| `scripts/preprocess-geojson.ts` | GeoJSON to JSON conversion with simplification |
| `next.config.ts` | Next.js configuration (disables strict mode for WebGL) |
| `tailwind.config.ts` | Tailwind CSS v4 theme configuration |
| `package.json` | Dependencies & npm/pnpm scripts |

## Data Flow

### Application Load Sequence

```bash
1. User navigates to /vi or /en
   ↓
2. Next.js proxy/middleware routes to [locale]/page.tsx
   ↓
3. Root layout renders with providers (LocaleProvider, etc.)
   ↓
4. Page component renders MapWrapper (Client Component)
   ↓
5. MapWrapper.tsx mounts
   ├─ Shows LoadingScreen
   ├─ Fetches public/provinces.json
   ├─ Creates Three.js geometries for 63 provinces
   └─ Sets loaded state = true
   ↓
6. Canvas mounts (R3F dynamic import with ssr: false)
   ├─ VietnamMap initializes scene
   ├─ Provinces component creates ExtrudeGeometry meshes
   ├─ Ocean & SkyDome render
   ├─ Lights setup
   ├─ CameraController initializes OrbitControls
   └─ EffectComposer adds bloom post-processing
   ↓
7. Map interactive - LoadingScreen hidden
   ↓
8. User interactions routed through CameraController
   ├─ Mouse/touch input
   ├─ Keyboard shortcuts
   ├─ Hand gestures (if enabled)
   └─ Camera animation to target
```

### Province Rendering Data Flow

```bash
Raw Source
└─ data/vietnam-provinces.geojson (32 MB, GeoJSON features)
   │
   ├─ Run: pnpm preprocess
   │  └─ scripts/preprocess-geojson.ts
   │     ├─ Parse GeoJSON
   │     ├─ Apply Douglas-Peucker simplification (0.008° tolerance)
   │     ├─ Round coordinates to 4 decimals
   │     ├─ Categorize provinces (capital, city, highland, coastal)
   │     ├─ Add metadata (area, population, density)
   │     └─ Generate ProvinceData[]
   │
   ├─ Output
   │  ├─ public/provinces.json (~800 KB)
   │  │  └─ ProvinceData[] as JSON
   │  │
   │  └─ src/data/provinces-data.ts
   │     ├─ ProvinceData type definition
   │     └─ loadProvinces() function
   │
   ├─ Runtime Loading
   │  ├─ MapWrapper.tsx: fetch('public/provinces.json')
   │  ├─ Parse and validate JSON
   │  ├─ Create THREE.ExtrudeGeometry for each province
   │  ├─ Apply color by type (PROVINCE_COLORS map)
   │  ├─ Create THREE.Mesh for each geometry+material pair
   │  ├─ Add to provinces array in state
   │  └─ Return loaded state = true
   │
   └─ Rendering
      ├─ Provinces component receives provinces array
      ├─ Maps each province to <mesh>
      │  ├─ geometry={provinceGeometry}
      │  ├─ material={memoized MeshPhongMaterial}
      │  ├─ userData.provinceId for raycasting
      │  └─ onPointerEnter for hover detection
      ├─ VietnamMap frame loop:
      │  ├─ Raycasting from mouse position
      │  ├─ Detect intersects with province meshes
      │  ├─ Update hover state
      │  └─ Show tooltip
      └─ Canvas renders to WebGL
```

### i18n Data Flow

```bash
User navigates to /en
   ↓
Next.js proxy routes to /en/page.tsx
   ↓
[locale]/page.tsx receives params.locale = 'en'
   ↓
Page component uses useLocale() hook
   ↓
LocaleProvider context:
   ├─ Reads params.locale from URL
   ├─ Looks up dictionary from dictionaries.ts
   ├─ Returns { locale: 'en', dictionary: dictionaries.en, setLocale }
   ↓
Components access translations via dict:
   ├─ dict.common.title → 'Vietnam 3D Map'
   ├─ dict.controls.rotate → 'Drag to rotate'
   ├─ dict.provinces[provinceId] → 'Ha Noi'
   └─ Automatic re-render on locale change
```

### Camera Control Data Flow

```bash
User Input (Mouse/Touch/Keyboard/Hand Gesture)
   ↓
CameraController.tsx:
   ├─ Receives input event
   ├─ Normalizes input type
   ├─ Combines with OrbitControls
   ├─ Updates camera position/rotation
   └─ Triggers frame render
   ↓
useFrame() in VietnamMap:
   ├─ Raycasting: cast ray from camera through mouse position
   ├─ Check intersections with province meshes
   ├─ If intersect: update hover state + show tooltip
   └─ Render frame with updated geometry
   ↓
Browser:
   ├─ Three.js renders WebGL scene
   ├─ Applies lighting & shaders
   ├─ Composites with UI overlays (React)
   └─ Paint to screen
```

## Build Process

### Development Build (pnpm dev)

```bash
Next.js dev server with Turbopack
├─ Watches src/ for changes
├─ Hot Module Replacement (HMR)
├─ Type checking via TypeScript
├─ ESLint checking (optional, can be disabled)
└─ Serves at http://localhost:3000
```

### Production Build (pnpm build)

```bash
1. Preprocessing (if needed)
   └─ pnpm preprocess → generates public/provinces.json

2. Next.js Build with Turbopack
   ├─ TypeScript compilation
   ├─ Tree-shaking unused code
   ├─ Code splitting per route/locale
   ├─ Tailwind CSS v4 compilation
   ├─ JavaScript minification
   └─ Output: .next/ directory

3. Output Structure
   ├─ .next/static/chunks/
   │  ├─ main-*.js (shared runtime)
   │  ├─ [locale]-*.js (locale-specific bundles)
   │  └─ _app-*.js (app shell)
   │
   ├─ .next/static/css/
   │  └─ [hash].css (Tailwind CSS)
   │
   └─ .next/standalone/ (if enabled in config)
      └─ Server for Node.js deployment
```

### Development Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm preprocess       # Regenerate provinces.json from GeoJSON
pnpm type-check       # Run TypeScript type checking
```

## Performance Characteristics

### Bundle Size

| Type | Size | Notes |
|------|------|-------|
| Initial HTML | ~50 KB | Root + layout |
| Main JS (shared) | ~200 KB | React, Next.js runtime |
| Locale JS (/vi) | ~150 KB | Locale-specific code |
| CSS (Tailwind) | ~100 KB | All utility classes |
| Provinces JSON | ~800 KB | Loaded async, not critical |
| **Total Initial** | **~1.3 MB** | Before provinces load |

### Data Size

| Source | Size | Reduction | Notes |
|--------|------|-----------|-------|
| GeoJSON (raw) | 32 MB | - | Source file (not in repo) |
| GeoJSON (in repo) | 32 MB | - | Not used in build |
| provinces.json | 800 KB | 97.6% | Preprocessed output |
| In-memory (Geometries) | ~100 MB | - | Three.js GPU memory |

### Runtime Performance

| Metric | Target | Actual |
|--------|--------|--------|
| FPS | 60 | 55-60 (modern browsers) |
| Memory | < 150 MB | ~120 MB on mobile |
| Load Time | < 5 sec (4G) | 3-5 sec |
| TTFP | < 2 sec | 1-2 sec |
| Interaction Response | < 100 ms | 16-33 ms |

## Dependencies Overview

### Core Dependencies

```json
{
  "next": "16.0.7",           // App framework
  "react": "19.2.1",          // UI library
  "react-dom": "19.2.1",      // DOM rendering
  "three": "0.181.2",         // 3D engine
  "@react-three/fiber": "9.4.2",  // R3F renderer
  "@react-three/drei": "10.7.7",  // R3F utilities
  "tailwindcss": "4.1.17"     // Styling
}
```

### Optional Dependencies (Hand Tracking)

```json
{
  "@mediapipe/hands": "0.4.1646424123",
  "@mediapipe/camera_utils": "0.4.1602916223"
}
```

### Dev Dependencies

```json
{
  "typescript": "5.9.3",
  "tsx": "4.19.2",            // TypeScript executor
  "eslint": "9.x",
  "postcss": "8.4.x"
}
```

## Import Paths

### Absolute Imports (via tsconfig.json)

```typescript
// ✓ Use absolute imports
import { Provinces } from '@/components/map/Provinces'
import type { ProvinceData } from '@/types'
import { useLocale } from '@/hooks/useLocale'

// ✗ Avoid relative imports (if absolute path available)
import { Provinces } from '../../../components/map/Provinces'
```

## State Management Strategy

### Context-Based State

```typescript
// Global State (via Context)
├─ LocaleContext
│  ├─ locale: 'vi' | 'en'
│  ├─ dictionary: Dictionary
│  └─ setLocale: (locale: Locale) => void
│
├─ HandTrackingContext
│  ├─ enabled: boolean
│  ├─ gesture: HandGestureState
│  └─ handsDetected: number
│
└─ TooltipContext
   ├─ visible: boolean
   ├─ content: string
   └─ position: [x, y]

// Component State (useState)
├─ MapWrapper
│  ├─ provinces: ProvinceData[]
│  ├─ loading: boolean
│  └─ error: Error | null
│
├─ VietnamMap
│  ├─ hoveredProvinceId: string | null
│  └─ selectedProvinceId: string | null
│
└─ Tooltip
   └─ (from context)
```

### No Redux/Zustand

- Application state is simple enough for Context
- Avoid extra library complexity
- Context is sufficient for i18n + hand tracking

## Async Operations

### Province Loading

```typescript
// Async lifecycle in MapWrapper
useEffect(() => {
  const load = async () => {
    try {
      const response = await fetch('/provinces.json')
      const data = await response.json()
      // Validate and process data
      setProvinces(data)
      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  load()
}, [])
```

### MediaPipe Hand Tracking

```typescript
// Async initialization in useHandTracking
useEffect(() => {
  if (!enabled) return

  const init = async () => {
    try {
      const hands = new Hands(config)
      await hands.initialize()
      // Start tracking
    } catch (err) {
      console.error('Hand tracking failed', err)
    }
  }

  init()
}, [enabled])
```

## Error Handling

### Error Boundaries

- MapWrapper wrapped in ErrorBoundary
- Fallback UI for rendering errors
- Error logging to console

### Async Errors

```typescript
// Try-catch in data loading
try {
  await fetchProvinces()
} catch (err) {
  setError(err)
  showErrorNotification('Failed to load map')
}
```

## Related Documents

- `docs/project-overview-pdr.md` - Project vision and requirements
- `docs/system-architecture.md` - Architecture details and pipelines
- `docs/code-standards.md` - Development conventions
- `CLAUDE.md` - Project-specific constraints
