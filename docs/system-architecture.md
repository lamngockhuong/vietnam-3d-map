# System Architecture

## High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client-Side Only)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js 16 Application Layer               │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Locale Router (/vi, /en) via proxy.ts            │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                         ↓                                │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  MapWrapper.tsx (Client Component, ssr: false)   │ │   │
│  │  │  - Province preloading                            │ │   │
│  │  │  - Hand tracking state management                 │ │   │
│  │  │  - Loading & error states                         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                         ↓                                │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  React Three Fiber Canvas (VietnamMap.tsx)       │ │   │
│  │  │  - Scene setup                                    │ │   │
│  │  │  - 5-light system (directional, ambient, spots)   │ │   │
│  │  │  - Post-processing (bloom)                        │ │   │
│  │  │  - Camera controller integration                  │ │   │
│  │  │  - Raycasting for hover detection                │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                         ↓                                │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  3D Components (Fiber/Three.js)                  │ │   │
│  │  │  ├─ Provinces (ExtrudeGeometry from data)        │ │   │
│  │  │  ├─ Ocean (Shader-based animation)               │ │   │
│  │  │  ├─ SkyDome (Gradient sphere)                    │ │   │
│  │  │  ├─ IslandMarkers (Hoàng Sa, Trường Sa)         │ │   │
│  │  │  └─ ProvinceLabels (Billboard text)              │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Controllers & Hooks                             │ │   │
│  │  │  ├─ CameraController (OrbitControls + zoom)      │ │   │
│  │  │  ├─ useHandTracking (MediaPipe integration)      │ │   │
│  │  │  ├─ useTooltip (Province info display)           │ │   │
│  │  │  └─ useLocale (i18n dictionary access)           │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  UI Overlay Components (HTML/CSS on Canvas)      │ │   │
│  │  │  ├─ Controls Panel (collapsible)                  │ │   │
│  │  │  ├─ Legend (color categories)                    │ │   │
│  │  │  ├─ LanguageSwitcher (VI/EN)                     │ │   │
│  │  │  ├─ LoadingScreen                                │ │   │
│  │  │  ├─ HandTrackingVideo (camera feed)              │ │   │
│  │  │  └─ Tooltip (province hover info)                │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Input Handlers                                               │
│  ├─ Mouse: Drag (rotate), Scroll (zoom)                       │
│  ├─ Touch: Two-finger drag (rotate), Pinch (zoom)            │
│  ├─ Keyboard: Arrow keys, +/-, R for reset                   │
│  └─ Hand Tracking: Gestures via MediaPipe                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Data Sources (Static Files)                  │
├─────────────────────────────────────────────────────────────────┤
│  ├─ public/provinces.json (~800 KB)                             │
│  ├─ src/i18n/dictionaries.ts (Vietnamese & English)            │
│  └─ src/data/provinces-data.ts (Province metadata + types)    │
└─────────────────────────────────────────────────────────────────┘
```

## Rendering Pipeline

### Component Hierarchy

```text
<MapWrapper>                              (Client Component, ssr: false)
  ├─ <LoadingScreen />
  ├─ <Canvas>                            (React Three Fiber)
  │   ├─ <PerspectiveCamera />
  │   ├─ <VietnamMap>                    (Main scene setup)
  │   │   ├─ <Provinces />               (63 ExtrudeGeometry meshes)
  │   │   ├─ <Ocean />                   (Animated water plane)
  │   │   ├─ <SkyDome />                 (Gradient background)
  │   │   ├─ <IslandMarkers />           (Hoàng Sa, Trường Sa)
  │   │   ├─ <ProvinceLabels />          (Billboard text)
  │   │   └─ <Lights>                    (5-light system)
  │   │       ├─ Directional light 1 (north)
  │   │       ├─ Directional light 2 (south)
  │   │       ├─ Ambient light (global)
  │   │       ├─ Spot light 1 (map center)
  │   │       └─ Spot light 2 (accent)
  │   ├─ <EffectComposer />              (Post-processing)
  │   │   ├─ <RenderPass />
  │   │   └─ <UnrealBloomPass />
  │   └─ <CameraController />            (OrbitControls + animations)
  │
  ├─ <Controls />                         (UI overlay panel)
  ├─ <Legend />                          (Color category legend)
  ├─ <LanguageSwitcher />                (VI/EN toggle)
  ├─ <Tooltip />                         (Province hover info)
  ├─ <HandTrackingVideo />               (Optional camera feed)
  └─ Context providers
      ├─ <LocaleProvider />
      ├─ <HandTrackingProvider />
      └─ <TooltipProvider />
```

### Rendering Performance

**Frame Budget**: 16.67 ms @ 60 FPS

1. **Input Processing** (2 ms)
   - Mouse, touch, keyboard event handling
   - Hand tracking gesture recognition (if enabled)
   - Input state update

2. **Logic & Physics** (3 ms)
   - Camera animation/movement
   - Raycasting for hover detection
   - Province state updates

3. **Rendering** (9 ms)
   - Three.js render pass
   - Shader execution (Ocean, SkyDome)
   - Post-processing (Bloom)

4. **Composition & Paint** (2.67 ms)
   - React DOM updates (UI overlay)
   - Browser composite

## Data Pipeline

### Province Data Flow

```text
Raw Source
└─ data/vietnam-provinces.geojson (32 MB, raw GeoJSON)
   │
   ├─ preprocessing: Douglas-Peucker simplification
   │  └─ Tolerance: 0.008° (~800m at equator)
   │
   ├─ coordinate rounding to 4 decimal places
   │
   ├─ type categorization & metadata enrichment
   │  ├─ Capital: Hà Nội
   │  ├─ Cities: TP HCM, Hải Phòng, etc.
   │  ├─ Highland: Đà Nẵng, Nha Trang, etc.
   │  ├─ Coastal: Hà Tĩnh, Phu Yen, etc.
   │  └─ Default: remaining provinces
   │
   └─ Output Files
      │
      ├─ public/provinces.json (~800 KB)
      │  └─ JSON array of ProvinceData
      │     [{ id, name, type, area, population, density, center, polygons }, ...]
      │
      └─ src/data/provinces-data.ts
         └─ TypeScript types + loader function
            ├─ ProvinceData interface
            ├─ ProvincesLoader (lazy-loaded)
            └─ Province metadata

Data Reduction: 97.6% (32 MB → 800 KB)
```

### Loading Sequence

```text
1. Page Load
   └─ Next.js initial HTML + JS bundle

2. Browser Renders MapWrapper
   └─ Loading screen displayed

3. R3F Canvas Mounts
   └─ Scene initialization begins

4. Province Data Preloading (in MapWrapper)
   └─ fetch('public/provinces.json')
      └─ Parse & validate JSON
         └─ Create Three.js ExtrudeGeometry for each province
            └─ Store in component state

5. Provinces Component Mounts
   └─ Map loaded state → true
      └─ Loading screen hidden
         └─ Map interactive

Time to Interactive: ~3-5 seconds (4G network)
```

## i18n System

### Architecture

```text
Request: /en/page → redirect via proxy.ts
           ↓
        /[locale]/page.tsx
           ↓
        useLocale() hook
           ↓
        dictionaries.ts
           ├─ dictionaries.en (English)
           ├─ dictionaries.vi (Vietnamese)
           └─ getDictionary(locale) → Dictionary type
```

### Dictionary Structure

```typescript
interface Dictionary {
  common: {
    title: string
    description: string
    language: string
    loading: string
    ...
  }
  controls: {
    rotate: string
    zoom: string
    reset: string
    ...
  }
  legend: {
    capital: string
    city: string
    highland: string
    coastal: string
    default: string
  }
  provinces: {
    [provinceId: string]: string  // Province names by locale
  }
  metadata: {
    area: string
    population: string
    density: string
    ...
  }
  gestures: {
    palmRotate: string
    pinchZoom: string
    fistReset: string
    ...
  }
}
```

### Language Switching

1. User clicks language switcher
2. Router navigates to `/[newLocale]/page`
3. React re-renders with new locale
4. useLocale() hook returns updated dictionary
5. All UI text updates (no refresh needed)

Type Safety: `locales` defined as `const as const` → TypeScript enforces valid locales

## Hand Tracking Integration

### Hand Tracking Architecture

```text
MediaPipe Hands Solution
├─ Camera Input (getUserMedia)
│  └─ Video feed from device camera
│
├─ Hand Detection Model
│  └─ Detects hand landmarks (21 points per hand)
│
├─ Gesture Recognition (Custom Implementation)
│  ├─ Palm Open (rotation)
│  ├─ Pinch (zoom)
│  ├─ Fist (reset)
│  ├─ Pointing (direction)
│  ├─ Two-Hand Zoom
│  ├─ Two-Hand Rotate
│  └─ Two-Hand Reset
│
└─ Output: HandGestureState
   ├─ gesture: GestureType
   ├─ rotationDeltaX/Y: number
   ├─ zoomDelta: number
   ├─ shouldReset: boolean
   ├─ handsDetected: number
   └─ handPosition: { x, y }
```

### useHandTracking Hook

```text
useHandTracking()
├─ Initialize MediaPipe Hands
├─ Request camera permissions
├─ Start continuous hand landmark detection
├─ Recognize gestures from landmarks
├─ Update gesture state
└─ Cleanup on unmount
   └─ Stop camera
      └─ Release resources
```

### Gesture Detection Algorithm

1. **Palm Open Detection**
   - All fingers open (low curl)
   - Hand facing camera
   - → Trigger rotation mode

2. **Pinch Detection**
   - Thumb & index finger distance < threshold
   - → Trigger zoom mode

3. **Fist Detection**
   - All fingers curled
   - → Trigger reset

4. **Two-Hand Gestures**
   - Detect both hands
   - Calculate distance delta → zoom
   - Calculate angle delta → rotation
   - Combined gesture state sent to camera controller

### Camera Controller Integration

```text
CameraController receives:
├─ Mouse/Touch input
├─ Hand gesture input
└─ Keyboard input

→ CameraController combines all inputs:
  ├─ rotation_delta = mouse_delta + gesture_rotation_delta
  ├─ zoom_delta = scroll_delta + gesture_zoom_delta
  ├─ target_position = click_position or gesture_hand_position
  └─ auto_reset if gesture.shouldReset

→ Update OrbitControls parameters
   └─ Smooth camera animation to target
```

## Camera System

### OrbitControls Configuration

```javascript
new OrbitControls(camera, canvas)
  ├─ autoRotate: false
  ├─ autoRotateSpeed: 0
  ├─ dampingFactor: 0.08
  ├─ enableDamping: true
  ├─ enablePan: false
  ├─ enableZoom: true
  ├─ maxZoom: 3
  ├─ minZoom: 0.5
  ├─ panSpeed: 0.8
  ├─ rotateSpeed: 1
  ├─ touchDampingFactor: 0.08
  └─ zoomSpeed: 1.2
```

### Zoom-to-Cursor Algorithm

On mouse wheel scroll:

1. Get normalized cursor position (0-1)
2. Calculate world coordinates at cursor
3. Calculate zoom direction vector
4. Apply zoom with easing animation
5. Pan camera to keep cursor position under mouse

Result: Intuitive zoom that follows cursor

### Camera Animation

Target view change (e.g., province click):

1. Calculate target position & lookAt
2. Linear interpolation over 1 second
3. Cubic easing (easeInOutCubic)
4. Update camera & controls
5. Emit animation complete event

## Shading System

### Ocean Shader

```glsl
Vertex Shader:
├─ Position: Displaced by wave pattern (sin/cos)
├─ UV coordinates: Animated over time
└─ Normal: Recalculated for lighting

Fragment Shader:
├─ Base Color: Gradient from deep to light blue
├─ Caustics: Procedural pattern based on UV + time
├─ Specular: Calculated from light direction + viewPos
├─ Depth Gradient: Darker at edges, lighter in center
└─ Final: Combine diffuse + specular + caustics
```

**Custom Uniform**: `viewPos` (camera position)

- Avoids conflict with Three.js built-in `cameraPosition`
- Updated each frame by CameraController

### SkyDome Shader

```glsl
Fragment Shader:
├─ UV coordinates from sphere position
├─ Vertical gradient: Horizon (light) → Sky (dark blue)
├─ Horizontal: Subtle color variation
└─ Final: Smooth gradient background
```

## Performance Optimizations

### Geometry Optimization

- **ExtrudeGeometry**: Single extrude operation per province (no mesh merging)
- **Vertex Count**: ~5,000-50,000 per province depending on complexity
- **Total Vertices**: ~2.5M across all 63 provinces
- **Indexed Buffers**: Standard Three.js indexed geometry

### Rendering Optimization

- **Frustum Culling**: Built-in Three.js culling
- **Backface Culling**: Enabled for all geometries
- **Shadow Maps**: Disabled (post-processing bloom sufficient)
- **Instancing**: Not used (provinces have unique colors/states)

### Data Optimization

- **GeoJSON Simplification**: Douglas-Peucker → 97.6% reduction
- **Lazy Loading**: Provinces data loaded only when needed
- **No SSR**: Client-only rendering avoids double-work

### Memory Optimization

- **Geometry Reuse**: Province shapes cached after first load
- **Texture Pooling**: Minimal textures used (mostly colors)
- **No Particle Systems**: Keep memory footprint small
- **Cleanup**: Proper disposal of geometries/materials on unmount

## Build & Deployment Pipeline

```text
Source Code
└─ src/
   ├─ components/
   ├─ data/
   ├─ types/
   ├─ i18n/
   └─ styles/

Preprocessing (pnpm preprocess)
└─ scripts/preprocess-geojson.ts
   └─ data/vietnam-provinces.geojson
      └─ public/provinces.json

Build (pnpm build)
└─ Next.js 16 + Turbopack
   ├─ TypeScript compilation
   ├─ Tree-shaking
   ├─ Code splitting by locale
   ├─ CSS minification (Tailwind v4)
   └─ JavaScript minification

Output
└─ .next/
   ├─ static/
   │  ├─ chunks/ (JS bundles)
   │  └─ css/ (Tailwind CSS)
   └─ standalone/ (Serverless-ready)

Deployment
├─ Option 1: Vercel (Recommended)
│  └─ Automatic from git push
├─ Option 2: Self-hosted Node
│  └─ pnpm start
└─ Option 3: Static export (future)
   └─ next export (requires ISR/SSR removal)
```

## Error Handling & Resilience

### Error Scenarios

```text
Scenario 1: Province data fails to load
├─ Error caught in MapWrapper
├─ Fallback: Use placeholder geometry
└─ Display error message to user

Scenario 2: WebGL not supported
├─ Detect at Canvas mount
├─ Display polite error message
└─ Suggest browser upgrade

Scenario 3: Hand tracking permission denied
├─ Graceful degradation
├─ Hand tracking disabled (continue without)
├─ Other controls still functional

Scenario 4: Camera controls error
├─ Error logged to console
├─ Camera state reset
├─ User can click to recover
```

### Recovery Mechanisms

- **Try-Catch Blocks**: Wrap all async operations
- **Fallbacks**: Default states for all optional features
- **User Feedback**: Error messages + recovery actions
- **Monitoring**: Console logging for debugging

## Security Considerations

### Client-Side Only

- No sensitive data processing
- No authentication required
- All geographic data is public

### Data Integrity

- GeoJSON source validated on preprocess
- Province IDs immutable
- Types immutable (const)

### Third-Party Dependencies

- MediaPipe Hands: Optional feature (can be disabled)
- Three.js: Well-established, widely used
- Dependencies: Regular updates via pnpm

### Content Security Policy

- Inline styles via Tailwind CSS (allowed)
- Inline scripts: None (trusted code only)
- External resources: Fonts, CDN-hosted libs (future)

## Related Documents

- `docs/code-standards.md` - Code patterns and conventions
- `docs/codebase-summary.md` - Directory structure and files
- `docs/project-overview-pdr.md` - Requirements and feature scope
- `CLAUDE.md` - Development guidelines and constraints
