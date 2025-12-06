# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D map of Vietnam built with Next.js 16, React Three Fiber, and Three.js. Features terrain visualization, province boundaries, island territories (Hoang Sa/Paracel and Truong Sa/Spratly), hand gesture controls via MediaPipe, and internationalization (Vietnamese/English).

## Commands

```bash
pnpm dev          # Start dev server with Turbopack (http://localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm preprocess   # Regenerate province data from GeoJSON (if source data changes)
```

## Architecture

### Rendering Pipeline

The 3D map uses client-side only rendering due to Three.js WebGL requirements:

1. **MapWrapper** (`src/components/MapWrapper.tsx`) - Client Component that dynamically imports VietnamMap with `ssr: false`
2. **VietnamMap** (`src/components/map/VietnamMap.tsx`) - React Three Fiber Canvas with scene setup, lighting, and post-processing
3. **Provinces** (`src/components/map/Provinces.tsx`) - Renders 63 provinces using Three.js ExtrudeGeometry with raycasting for hover detection
4. **Ocean** (`src/components/map/Ocean.tsx`) - Custom GLSL shader for animated water with depth gradient, caustics, and specular highlights
5. **CameraController** (`src/components/map/CameraController.tsx`) - OrbitControls with custom zoom-to-cursor, trackpad gestures, and hand gesture integration

### i18n System

- Locale routing via proxy (`src/proxy.ts`) - redirects `/` to `/vi` (Next.js 16 uses `proxy` instead of `middleware`)
- Route structure: `/[locale]/page.tsx` where locale is `vi` or `en`
- Dictionary system in `src/i18n/dictionaries.ts` - synchronous dictionary lookup
- Config in `src/i18n/config.ts` - defines supported locales

### Data Pipeline

Province boundary data flows:

1. Source: `data/vietnam-provinces.geojson` (raw GeoJSON)
2. Preprocessing: `scripts/preprocess-geojson.ts` applies Douglas-Peucker simplification
3. Output: `src/data/provinces-data.ts` (~2.5MB TypeScript with polygon coordinates)

The preprocessing script reduces polygon complexity while maintaining visual accuracy (~200m tolerance).

### Hand Tracking System

- `useHandTracking` hook (`src/hooks/useHandTracking.ts`) - MediaPipe Hands integration
- Gestures: open palm (rotate), pinch (zoom), fist (reset), pointing (fine rotation)
- Two-hand gestures: pinch zoom, rotation, reset
- Hand position passed to CameraController for zoom-to-point functionality

### Key Type Definitions

- `ProvinceData` - Province with id, name, type, area, population, density, center, polygons
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
