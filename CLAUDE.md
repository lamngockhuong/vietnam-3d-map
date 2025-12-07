# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D map of Vietnam built with Next.js 16, React Three Fiber, and Three.js. Features terrain visualization, 34 province boundaries (2025 administrative reorganization), 3,321 wards, island territories (Hoang Sa/Paracel and Truong Sa/Spratly), hand gesture controls via MediaPipe, and internationalization (Vietnamese/English).

## Commands

```bash
pnpm dev              # Start dev server with Turbopack (http://localhost:3000)
pnpm build            # Production build
pnpm lint             # Biome linter
pnpm format           # Biome formatter
pnpm check            # Biome lint + format

# Data Pipeline
pnpm prepare-data         # Run complete pipeline (fetch → generate → merge → preprocess)
pnpm prepare-data --fetch # Force fresh data from API
pnpm fetch-data           # Fetch metadata from sapnhap.bando.com.vn API
pnpm generate-merger-data # Generate merger-data.ts for Legend
pnpm merge-data           # Merge API metadata with GeoJSON boundaries
pnpm preprocess           # Regenerate province data from GeoJSON
pnpm preprocess:wards     # Regenerate ward data from GeoJSON
```

## Architecture

### State Management & Component Communication

The app uses **lifted state** pattern for map-sidebar synchronization:

```text
MapWrapper (state owner)
├── VietnamMap (3D canvas)
│   ├── Provinces → onSelect/onDoubleClick callbacks
│   └── Wards → onSelect callback
├── Sidebar (UI panel)
│   ├── ProvinceList → onSelect/onDoubleClick callbacks
│   └── WardList → onSelect/onBack callbacks
├── HandTrackingVideo (draggable camera preview)
├── Legend (location info panel)
└── Controls (interaction guide panel)
```

Key state in `MapWrapper`:

- `highlightedProvince` - Currently highlighted province (single click)
- `selectedProvince` - Province showing wards (double-click triggers)
- `selectedWard` - Currently selected ward
- `sidebarOpen` - Sidebar visibility (controlled by gesture or click)
- `gestureState` - Hand tracking gesture state from `useHandTracking`

Selection flow:

1. Click province (map or sidebar) → highlights province, shows info
2. Double-click province → loads wards, zooms camera, shows ward list
3. Click ward → highlights ward, zooms to ward center
4. Back button → returns to province view

### Rendering Pipeline

Client-side only rendering (Three.js WebGL requirements):

1. **MapWrapper** (`src/components/MapWrapper.tsx`) - Dynamic import with `ssr: false`, owns selection state
2. **VietnamMap** (`src/components/map/VietnamMap.tsx`) - R3F Canvas, scene setup, post-processing
3. **Provinces** (`src/components/map/Provinces.tsx`) - 34 ExtrudeGeometry meshes, raycasting, flickering outline effect
4. **Wards** (`src/components/map/Wards.tsx`) - Lazy-loaded ward geometries when province double-clicked
5. **Ocean** (`src/components/map/Ocean.tsx`) - Custom GLSL shader for animated water
6. **CameraController** (`src/components/map/CameraController.tsx`) - OrbitControls, zoom-to-cursor, `zoomToLocation()` method

### Sidebar System

- **Sidebar** - Collapsible panel with province/ward lists, supports controlled props
- **ProvinceList/WardList** - Virtualized lists (`@tanstack/react-virtual`)
- **SearchInput** - Diacritic-insensitive Vietnamese search
- **InfoPanel** - Province/ward stats (type, area, population, density)

### i18n System

- Locale routing via `src/proxy.ts` (Next.js 16 proxy, not middleware)
- Route structure: `/[locale]/page.tsx` where locale is `vi` or `en`
- Dictionary system in `src/i18n/dictionaries.ts`
- Province name translations in `src/i18n/province-names.ts`

### Data Pipeline

Complete pipeline: `pnpm prepare-data` (6 steps)

```text
sapnhap.bando.com.vn API
        ↓
fetch-data.ts → data/provinces-metadata.json, data/wards-metadata/*.json
        ↓
generate-merger-data.ts → src/data/merger-data.ts (Legend info)
        ↓
merge-data.ts → data/vietnam-provinces-merged.geojson
        ↓
preprocess-geojson.ts → public/provinces.json (~570 KB, 97.7% reduction)
                      → src/data/provinces-data.ts (types)
        ↓
preprocess-wards.ts → public/wards/*.json (34 files, ~9.4 MB total)
```

**Data sources:**

- `data/vietnam-provinces.geojson` (32 MB) - Province boundaries
- `data/vietnam-wards.geojson` (276 MB, gitignored) - Ward boundaries
- API metadata from `sapnhap.bando.com.vn` - 2025 administrative data

### UI State Persistence

- **useUIState** hook - localStorage for panel open/close state
- **useClickOutside** hook - Auto-closes panels on mobile (< 640px)
- **useDraggable** hook - Draggable elements with position persistence

### Hand Tracking

- `useHandTracking` hook - MediaPipe Hands integration
- Single-hand gestures:
  - Open palm → rotate map
  - Pinch → zoom in/out
  - Fist → reset view
  - Pointing (1 finger) → fine rotation
  - Peace sign (2 fingers) → toggle sidebar
- Two-hand gestures:
  - Two pointing fingers → pan/move map
  - Two peace signs → take screenshot
  - Two open palms → tilt map
  - Two pinches → two-hand zoom
  - Two fists → reset view
- `HandTrackingVideo` component - Draggable camera preview with gesture indicator

## Technical Constraints

- **Tailwind CSS v4** - Uses `@import "tailwindcss"` in globals.css with `@theme` for custom colors
- **React 19 + R3F 9** - Peer dependency warnings expected but functional
- **Dynamic imports** - Must use `ssr: false` in Client Components (`'use client'`)
- **Shader uniforms** - Avoid `cameraPosition` (Three.js built-in); use `viewPos`
- **Canvas size** - Hand tracking uses fixed 320x240 resolution for MediaPipe

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useHandTracking` | MediaPipe Hands gesture detection |
| `useUIState` | localStorage-persisted UI state |
| `useClickOutside` | Close panels on outside click |
| `useDraggable` | Make elements draggable with position memory |
| `useDebounce` | Debounce rapidly changing values |

## Legacy Content

`public/` contains standalone HTML demos with inline Three.js code (not part of Next.js app).
