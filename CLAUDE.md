# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D map of Vietnam built with Next.js 16, React Three Fiber, and Three.js. Features terrain visualization, province boundaries, island territories (Hoang Sa/Paracel and Truong Sa/Spratly), hand gesture controls via MediaPipe, and internationalization (Vietnamese/English).

## Commands

```bash
pnpm dev              # Start dev server with Turbopack (http://localhost:3000)
pnpm build            # Production build
pnpm lint             # Biome linter
pnpm format           # Biome formatter
pnpm check            # Biome lint + format

# Data Pipeline
pnpm prepare-data     # Run complete pipeline (fetch → merge → preprocess)
pnpm fetch-data       # Fetch metadata from sapnhap.bando.com.vn API
pnpm merge-data       # Merge API metadata with GeoJSON boundaries
pnpm preprocess       # Regenerate province data from GeoJSON
pnpm preprocess:wards # Regenerate ward data from GeoJSON
```

## Architecture

### Rendering Pipeline

The 3D map uses client-side only rendering due to Three.js WebGL requirements:

1. **MapWrapper** (`src/components/MapWrapper.tsx`) - Client Component that dynamically imports VietnamMap with `ssr: false`, manages lifted state for province/ward selection
2. **VietnamMap** (`src/components/map/VietnamMap.tsx`) - React Three Fiber Canvas with scene setup, lighting, and post-processing
3. **Provinces** (`src/components/map/Provinces.tsx`) - Renders 34 provinces (2025 administrative reorganization) using Three.js ExtrudeGeometry with raycasting for hover/click/double-click detection, flickering outline effect for selected province
4. **Wards** (`src/components/map/Wards.tsx`) - Renders ward-level boundaries when a province is double-clicked (lazy-loaded), flickering outline effect for selected ward
5. **Ocean** (`src/components/map/Ocean.tsx`) - Custom GLSL shader for animated water with depth gradient, caustics, and specular highlights
6. **CameraController** (`src/components/map/CameraController.tsx`) - OrbitControls with custom zoom-to-cursor, trackpad gestures, hand gesture integration, and `zoomToLocation` method for programmatic camera movement

### Sidebar System

- **Sidebar** (`src/components/ui/Sidebar.tsx`) - Collapsible sidebar panel on right side with province/ward lists
- **ProvinceList** (`src/components/ui/sidebar/ProvinceList.tsx`) - Virtualized list of provinces with click-to-highlight and double-click-to-show-wards behavior
- **WardList** (`src/components/ui/sidebar/WardList.tsx`) - Virtualized list of wards with click-to-select and zoom-to-ward behavior
- **SearchInput** (`src/components/ui/sidebar/SearchInput.tsx`) - Diacritic-insensitive search for Vietnamese names
- **InfoPanel** (`src/components/ui/sidebar/InfoPanel.tsx`) - Displays province/ward information (type, area, population, density)
- Uses `@tanstack/react-virtual` for virtualized list performance

### i18n System

- Locale routing via proxy (`src/proxy.ts`) - redirects `/` to `/vi` (Next.js 16 uses `proxy` instead of `middleware`)
- Route structure: `/[locale]/page.tsx` where locale is `vi` or `en`
- Dictionary system in `src/i18n/dictionaries.ts` - synchronous dictionary lookup
- Config in `src/i18n/config.ts` - defines supported locales
- Province name translations in `src/i18n/province-names.ts` - Vietnamese to English mapping

### Info Pages

- **PageLayout** (`src/components/ui/PageLayout.tsx`) - Shared layout for info pages with nav, footer, decorative backgrounds
- **About** (`src/app/[locale]/about/page.tsx`) - Project information, features, technology stack
- **Terms** (`src/app/[locale]/terms/page.tsx`) - Terms of Service
- **Privacy** (`src/app/[locale]/privacy/page.tsx`) - Privacy Policy
- All pages support i18n (Vietnamese/English) and are scrollable

### UI State Management

- **useUIState** (`src/hooks/useUIState.ts`) - localStorage-based panel state persistence
  - First visit: All panels (Sidebar, Legend, Controls) closed by default
  - Subsequent visits: Restores saved open/close state
- **useClickOutside** (`src/hooks/useClickOutside.ts`) - Click outside detection for mobile
  - Auto-closes panels when clicking outside on screens < 640px

### Data Pipeline

The project includes automated scripts to fetch and prepare map data:

**Complete Pipeline:** `pnpm prepare-data` (6 steps)

1. **Fetch metadata** (`scripts/fetch-data.ts`)
   - Source: `sapnhap.bando.com.vn` API (2025 administrative reorganization data)
   - Output: `data/provinces-metadata.json`, `data/wards-metadata/*.json`
   - Contains: 34 merged provinces, 3,321 wards, area/population/merger info

2. **Generate merger data** (`scripts/generate-merger-data.ts`)
   - Generates TypeScript file with province merger info for Legend
   - Output: `src/data/merger-data.ts`

3. **Copy ward metadata** (inline in prepare-data.ts)
   - Copies ward metadata to public folder for runtime loading
   - Output: `public/wards-metadata/*.json`

4. **Merge data** (`scripts/merge-data.ts`)
   - Combines API metadata with GeoJSON boundaries
   - Output: `data/vietnam-provinces-merged.geojson`

5. **Preprocess provinces** (`scripts/preprocess-geojson.ts`)
   - Source: `data/vietnam-provinces.geojson` (raw GeoJSON, 32 MB)
   - Douglas-Peucker simplification (97.7% reduction)
   - Output: `public/provinces.json` (~570 KB) + `src/data/provinces-data.ts` (types)

6. **Preprocess wards** (`scripts/preprocess-wards.ts`)
   - Source: `data/vietnam-wards.geojson` (raw GeoJSON, 276 MB - git ignored)
   - Groups by province, applies simplification
   - Output: `public/wards/{provinceId}.json` (34 files, ~9.4 MB total)
   - Loaded on-demand when user clicks a province

**Data Sources:**
- GeoJSON boundaries: Local files in `data/` directory
- Province/ward metadata: `sapnhap.bando.com.vn` API (Vietnam 2025 administrative data)

### Hand Tracking System

- `useHandTracking` hook (`src/hooks/useHandTracking.ts`) - MediaPipe Hands integration
- Gestures: open palm (rotate), pinch (zoom), fist (reset), pointing (fine rotation)
- Two-hand gestures: pinch zoom, rotation, reset
- Hand position passed to CameraController for zoom-to-point functionality

### Key Type Definitions

- `ProvinceData` - Province with id, name, type, area, population, density, center, polygons
- `WardData` - Ward with id, name, type, area, population, density, center, polygons
- `ProvinceWardsData` - Container for province wards (provinceId, provinceName, wards[])
- `HandGestureState` - Gesture type, rotation/zoom deltas, hand position
- `Dictionary` - i18n structure for all UI text
- `MapCenter`, `Bounds`, `Coordinate` - Geographic types in `src/types/index.ts`

## Technical Constraints

- **Tailwind CSS v4** - Uses `@import "tailwindcss"` syntax in globals.css with `@theme` for custom colors
- **React 19 + React Three Fiber 9** - Peer dependency warnings are expected but functional
- **Dynamic imports with ssr: false** - Must be in Client Components (files with `'use client'` directive)
- **Shader uniforms** - Avoid using `cameraPosition` as uniform name (Three.js built-in); use custom names like `viewPos`

## Legacy Content

`public/` folder contains standalone HTML demos with inline Three.js code (not part of Next.js app).
