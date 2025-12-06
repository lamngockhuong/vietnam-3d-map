# Vietnam 3D Map

Interactive 3D map of Vietnam built with Next.js, React Three Fiber, and Three.js. Explore 63 provinces with terrain visualization, animated ocean, island territories, and hand gesture controls.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Regenerate province data from GeoJSON (if source changes)
pnpm preprocess

# Regenerate ward data from GeoJSON
pnpm preprocess:wards
```

## Features

- **3D Province Map**: All 63 Vietnamese provinces with accurate boundaries
- **Ward-Level Detail**: Click any province to view its wards/communes (3,321 wards across 34 provinces)
- **Animated Ocean**: GLSL shader-based water with caustics and wave effects
- **Island Territories**: Hoàng Sa (Paracel) and Trường Sa (Spratly) with markers
- **Interactive Controls**: Mouse drag, scroll zoom, touch gestures, keyboard shortcuts
- **Hand Gesture Control**: Optional MediaPipe Hands integration for gesture navigation
- **Internationalization**: Vietnamese (VI) and English (EN) with URL-based routing
- **Responsive Design**: Works on desktop and mobile devices
- **Post-Processing**: Bloom effect for enhanced visuals

## Controls

| Input | Action |
|-------|--------|
| Mouse drag | Rotate map |
| Scroll wheel | Zoom in/out |
| Click province | View wards |
| Back button | Return to provinces |
| Touch drag | Rotate (mobile) |
| Two-finger drag | Rotate (trackpad) |
| Pinch gesture | Zoom (mobile/trackpad) |
| Arrow keys | Rotate |
| +/- keys | Zoom |
| R key | Reset view |
| Open palm | Rotate (hand tracking) |
| Pinch gesture | Zoom (hand tracking) |
| Fist | Reset (hand tracking) |

## Project Structure

```text
src/
├── app/[locale]/page.tsx       # Main map page per locale (vi/en)
├── components/
│   ├── map/                    # 3D map components
│   │   ├── VietnamMap.tsx      # Canvas & scene setup
│   │   ├── Provinces.tsx       # 63 province geometries
│   │   ├── Wards.tsx           # Ward-level geometries (lazy-loaded)
│   │   ├── Ocean.tsx           # Animated water shader
│   │   ├── CameraController.tsx # Interaction handling
│   │   └── ...
│   ├── ui/                     # UI overlay components
│   │   ├── Controls.tsx
│   │   ├── Legend.tsx
│   │   ├── Tooltip.tsx
│   │   └── ...
│   └── providers/              # Context providers (i18n, etc)
├── hooks/                      # Custom React hooks
├── data/                       # Province/ward types & loaders
├── i18n/                       # Translations (VI/EN)
├── shaders/                    # GLSL shader files
├── types/                      # TypeScript definitions
└── utils/                      # Helper functions
public/
├── provinces.json              # Preprocessed province data (~800 KB)
└── wards/                      # Ward data by province (~9.4 MB total)
    ├── 01.json                 # Hà Nội wards
    ├── 79.json                 # TP. Hồ Chí Minh wards
    └── ...                     # 34 province ward files
data/
├── vietnam-provinces.geojson   # Source GeoJSON (32 MB, not in build)
└── vietnam-wards.geojson       # Source GeoJSON (276 MB, git ignored)
docs/
├── project-overview-pdr.md     # Vision, goals, requirements
├── system-architecture.md      # Architecture & pipelines
├── code-standards.md           # Development conventions
└── codebase-summary.md         # Directory structure details
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.9
- **3D Rendering**: Three.js 0.181.2, React Three Fiber 9, Drei 10.7.7
- **Styling**: Tailwind CSS v4
- **Hand Tracking**: MediaPipe Hands (optional)
- **Build**: Turbopack
- **Package Manager**: pnpm

## Architecture Highlights

- **Client-Side Only**: Full WebGL rendering in browser (no SSR for Canvas)
- **Data Pipeline**: GeoJSON → Douglas-Peucker simplification → 93-97% reduction
- **Lazy Loading**: Province data (800 KB) loaded on init; ward data loaded on-demand per province
- **i18n System**: Locale routing `/vi` and `/en` with type-safe dictionaries
- **Performance**: 60 FPS on modern browsers, ~3-5s load time on 4G

## Documentation

See `/docs` directory for comprehensive documentation:

- **[project-overview-pdr.md](docs/project-overview-pdr.md)** - Vision, goals, features, technical requirements
- **[system-architecture.md](docs/system-architecture.md)** - Architecture diagrams, rendering pipeline, data flow
- **[code-standards.md](docs/code-standards.md)** - TypeScript, React, Three.js conventions
- **[codebase-summary.md](docs/codebase-summary.md)** - File organization, key files, data flow details

## Key Files

| File | Purpose |
|------|---------|
| `src/components/MapWrapper.tsx` | Main wrapper with province preloading |
| `src/components/map/VietnamMap.tsx` | R3F Canvas + scene setup |
| `src/components/map/Provinces.tsx` | 63 ExtrudeGeometry meshes with click handler |
| `src/components/map/Wards.tsx` | Ward geometries (lazy-loaded on click) |
| `src/components/map/CameraController.tsx` | Interaction & camera animation |
| `src/data/provinces-data.ts` | Province types and loader |
| `src/data/wards-data.ts` | Ward types and lazy loader |
| `src/i18n/dictionaries.ts` | Vietnamese & English translations |
| `scripts/preprocess-geojson.ts` | Province data preprocessing |
| `scripts/preprocess-wards.ts` | Ward data preprocessing |
| `public/provinces.json` | Preprocessed province data |
| `public/wards/*.json` | Preprocessed ward data (per province) |

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Metrics

| Metric | Target |
|--------|--------|
| Initial Load | < 5 sec (4G) |
| FPS | 60 FPS (modern browsers) |
| Memory | < 150 MB (mobile) |
| Bundle Size | ~1.3 MB (initial) |

## Development

### Linting & Formatting (Biome)

```bash
pnpm lint              # Run Biome linter
pnpm format            # Run Biome formatter
pnpm check             # Run both lint and format
```

### Data Updates

If you update `data/vietnam-provinces.geojson`:

```bash
pnpm preprocess        # Regenerate public/provinces.json
pnpm build             # Rebuild for production
```

If you update `data/vietnam-wards.geojson`:

```bash
pnpm preprocess:wards  # Regenerate public/wards/*.json
pnpm build             # Rebuild for production
```

## Known Constraints

- **No SSR**: React Strict Mode disabled for WebGL compatibility
- **Shader Uniforms**: Use `viewPos` instead of `cameraPosition`
- **Dynamic Imports**: R3F Canvas requires `ssr: false`
- **Tailwind v4**: Uses `@import "tailwindcss"` syntax

## License

MIT
