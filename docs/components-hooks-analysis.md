# Components & Hooks Architecture Analysis

**Document Generated:** 2025-12-06
**Scope:** `/src/components` and `/src/hooks` directories
**Project:** Vietnam 3D Map (Next.js 16, React Three Fiber, Three.js)

---

## Directory Structure

```text
src/
├── components/
│   ├── MapWrapper.tsx                 # Entry point wrapper component
│   ├── ui/
│   │   ├── Controls.tsx               # Control panel UI
│   │   ├── LanguageSwitcher.tsx       # i18n locale switcher
│   │   ├── Legend.tsx                 # Map legend/color key
│   │   ├── LoadingScreen.tsx          # Loading state display
│   │   └── HandTrackingVideo.tsx      # Camera feed with hand visualization
│   └── map/
│       ├── VietnamMap.tsx             # Main 3D scene container
│       ├── CameraController.tsx       # Camera controls & gestures
│       ├── Provinces.tsx              # Province 3D geometries & interaction
│       ├── ProvinceLabels.tsx         # Text labels for cities/provinces
│       ├── Ocean.tsx                  # Animated water shader
│       └── SkyDome.tsx                # Background gradient sphere
└── hooks/
    └── useHandTracking.ts             # MediaPipe hand gesture detection
```

---

## COMPONENTS ANALYSIS

### Root Wrapper Component

#### **MapWrapper.tsx**

**Purpose:** Entry point client component that orchestrates the entire 3D map experience.

**Key Exports:**

- `MapWrapper(props: MapWrapperProps)` - Main component accepting i18n dictionary

**Key Responsibilities:**

1. Dynamically imports VietnamMap with SSR disabled (`ssr: false`)
2. Manages hand tracking state and gesture propagation
3. Preloads province data at wrapper level
4. Handles loading state during data initialization
5. Orchestrates child components: VietnamMap, HandTrackingVideo, Controls

**Key State:**

- `handTrackingEnabled` - Toggle for hand gesture mode
- `gestureState` - Current hand gesture data
- `provinces` - All 63 province geometries loaded from disk
- `isLoading` - Data loading state

**Props:**

```typescript
interface MapWrapperProps {
  dict: Dictionary;  // i18n translations
}
```

**Important Patterns:**

- Uses `useRef` for exposing resetCamera via MapWrapper ref
- Uses `useCallback` to prevent gesture handler recreation
- Implements loading screen until provinces data ready
- Hand tracking toggle button positioned at top-right (right of language switcher)

**Dependencies:**

- `next/dynamic` - Dynamic import for Three.js component
- `@/i18n/dictionaries` - i18n system
- `@/components/ui/HandTrackingVideo` - Camera input
- `@/components/ui/Controls` - Control panel
- `@/components/map/VietnamMap` - 3D scene
- `@/hooks/useHandTracking` - Gesture detection
- `@/data/provinces-data` - Province geometry data

**Related Components:**

- Parent: Page component in `[locale]/page.tsx`
- Children: VietnamMap, HandTrackingVideo, Controls

---

### Map Rendering Components

#### **VietnamMap.tsx**

**Purpose:** React Three Fiber Canvas setup with scene composition, lighting, post-processing.

**Key Exports:**

- `VietnamMap(props, ref)` - Forwardref component exposing `resetCamera` method
- `VietnamMapRef` - Ref interface for camera reset
- Internal `Lights()` component - Scene lighting setup

**Key Responsibilities:**

1. Canvas initialization with WebGL context handling
2. Scene lighting (ambient + directional + hemisphere)
3. Province hover state management with raycasting info
4. Tooltip rendering above canvas
5. Post-processing effects (Bloom + BrightnessContrast)
6. WebGL context loss recovery

**Key State:**

- `tooltip` - Hovered province info display
- `mousePos` - Cursor position for tooltip tracking
- `contextLost` - WebGL context recovery state
- Refs: `rendererRef`, `cameraControllerRef`, `containerRef`

**Props:**

```typescript
interface VietnamMapProps {
  dict: Dictionary;
  gestureState?: HandGestureState | null;
  provinces: ProvinceData[];
  showLabels?: boolean;  // Default: true
}
```

**Lighting Setup:**

- **Ambient:** 0.4 intensity white light (base illumination)
- **Main directional:** Position [5, 12, 8], warm 0xfff8e7, with soft shadows
- **Fill light:** Position [-4, 8, -5], cool 0xe0f0ff from opposite side
- **Hemisphere:** Sky blue to ocean teal gradient
- **Rim light:** Subtle 0.3 intensity highlight

**Post-Processing:**

- Bloom: 0.1 intensity, 0.9 threshold (very subtle)
- Brightness/Contrast: +0.05 contrast boost

**Important Patterns:**

- Uses `Suspense` with `fallback={null}` for lazy component loading
- Tooltip positioned absolutely with fixed positioning (-10px offset)
- WebGL error handling with context lost/restored events
- Uses `useImperativeHandle` to expose reset function

**Dependencies:**

- `@react-three/fiber` - Three.js React renderer
- `@react-three/drei` - PerspectiveCamera, utilities
- `@react-three/postprocessing` - Effects
- `./SkyDome`, `./Ocean`, `./Provinces`, `./ProvinceLabels`, `./CameraController`

**Related Components:**

- Parent: MapWrapper
- Children: CameraController, Lights, SkyDome, Ocean, Provinces, ProvinceLabels
- Receives: Province geometry data, hand gesture state

---

#### **Provinces.tsx**

**Purpose:** Render all 63 provinces with 3D geometry, hover detection, and visual categorization.

**Key Exports:**

- `Provinces(props: ProvincesProps)` - Component rendering province meshes

**Key Responsibilities:**

1. Generate THREE.ExtrudeGeometry from preprocessed province polygon data
2. Categorize provinces by type (capital, city, highland, coastal)
3. Color-code based on category
4. Implement raycasting for hover detection
5. Render outline geometries (coastlines)
6. Manage geometry disposal and merging

**Key State:**

- `hoveredProvince` - Current hovered province name
- Refs: `groupRef`, `raycaster`, `mouse`, `hoveredProvinceRef`, `onHoverRef`

**Props:**

```typescript
interface ProvincesProps {
  provinces: ProvinceData[];
  onHover?: (province: ProvinceData | null) => void;
}
```

**Color Categories:**

```typescript
const PROVINCE_COLORS = {
  default: 0x4caf50,    // Saturated green
  city: 0xffc107,       // Gold/amber
  capital: 0xf44336,    // Red (Hà Nội)
  highland: 0x66bb6a,   // Medium green
  coastal: 0x00bcd4,    // Cyan
};
const HOVER_COLOR = 0xffffff;  // White highlight
```

**Province Categories:**

- **Capital:** Hà Nội
- **Cities:** Type === 'Thành phố'
- **Highland:** 10 provinces in northwest (Lai Châu, Điện Biên, etc.)
- **Coastal:** 14 provinces with ocean access
- **Default:** All others

**Elevation Strategy:**

- Capital: 0.06 units
- Cities: 0.04 units
- Highlands: 0.08 units
- Default: 0.03 units

**Important Patterns:**

- Uses `mergeGeometries` from Three.js utils for performance
- Creates outline geometry as separate LineBasicMaterial
- Geometry creation in `useMemo` for stable references
- Pointer event handling with rect boundary calculations
- Recursive raycasting to find meshes in nested groups
- Ref-based tracking to avoid stale closure issues

**Interactions:**

- Hover triggers province info via `onHover` callback
- Mesh userData stores `provinceName` for identification
- White outline appears on coastlines (elevation + 0.002)

**Dependencies:**

- `@react-three/fiber` - useThree hook
- `three/examples/jsm/utils/BufferGeometryUtils` - mergeGeometries
- `@/data/provinces-data` - Province polygon data and bounds

**Performance Notes:**

- Individual geometries merged per province (1-many polygons per province)
- Shared outline material across all outlines
- Pointer events throttled by browser frame rate
- Geometry disposal for merged intermediate geometries

---

#### **CameraController.tsx**

**Purpose:** Manage camera controls including orbit, zoom-to-cursor, pan, and hand gesture input.

**Key Exports:**

- `CameraController(props, ref)` - Forwardref component exposing `resetCamera` method
- `CameraControllerRef` - Ref interface

**Key Responsibilities:**

1. Integrate OrbitControls with custom wheel/touch handlers
2. Implement zoom-to-cursor for mouse scroll and trackpad pinch
3. Handle two-finger trackpad panning with camera-aware pan vector
4. Detect and handle touch pinch-to-zoom on mobile
5. Apply hand gesture state from MediaPipe
6. Smooth camera interpolation using spherical coordinates

**Key State:**

- `targetRef` - Target spherical coordinates for smooth interpolation
- `planeRef` - Y=0 plane for zoom-to-cursor calculations
- `touchStateRef` - Two-finger gesture tracking
- Camera constraints: distance [1, 10], polar angle [0.1, π/2.1]

**Default Camera Position:**

```typescript
const DEFAULT_CAMERA = {
  position: [0, 3, 4],
  target: [0, 0, 0],
  azimuthalAngle: 0,
  polarAngle: Math.PI / 3,  // ~60 degrees
  distance: 5,
};
```

**Mouse/Trackpad Interactions:**

1. **Scroll wheel:** Zoom-to-cursor (speed: 0.1)
2. **Pinch gesture (Ctrl+Scroll):** Zoom-to-cursor (speed: 0.03)
3. **Two-finger pan:** Camera-relative panning (panSpeed: 0.002)
4. **OrbitControls drag:** Standard orbit rotation

**Touch Interactions (Mobile):**

1. **Two-finger pinch:** Zoom-to-cursor (scaling: 0.005x)
2. **Two-finger drag:** Camera-relative panning (panSpeed: 0.003)

**Hand Gesture Integration:**

- **palm-rotate:** Rotation based on palm position
- **pinch-zoom:** Zoom to pinch point (0.3x multiplier)
- **fist-reset:** Reset to default view
- **pointing:** Fine rotation using index finger
- **two-hand-zoom:** Zoom to center between hands
- **two-hand-rotate:** Rotation + angle tracking
- **two-hand-reset:** Reset to default view

**Hand Position Mapping:**

- Input: 0-1 normalized coordinates (mirrored from video)
- Output: Screen pixel coordinates
- Formula: `screenX = rect.left + (1 - handX) * rect.width`

**Important Patterns:**

- Zoom-to-cursor algorithm:
  1. Get point under cursor before zoom
  2. Apply zoom amount to distance
  3. Get point under cursor after zoom
  4. Apply offset to keep cursor point fixed
  5. Clamp target within bounds [-3, 3] on X/Z

- Smooth interpolation factor: 0.08 (lerp)
- Spherical coordinate conversion for smooth camera movement
- Passive: false on event listeners to allow preventDefault()

**Camera Constraints:**

- Target bounds: X/Z ∈ [-3, 3], Y = 0
- Distance: [1, 10] units
- Polar angle: [0.1, π/2.1] (prevents flipping)

**Dependencies:**

- `@react-three/fiber` - useThree hook, useFrame
- `@react-three/drei` - OrbitControls
- `three-stdlib` - OrbitControls implementation
- `@/hooks/useHandTracking` - HandGestureState type

---

#### **ProvinceLabels.tsx**

**Purpose:** Render text labels for major cities and important provinces.

**Key Exports:**

- `ProvinceLabels(props: ProvinceLabelProps)` - Component rendering text labels

**Key Responsibilities:**

1. Filter provinces to priority set + all cities
2. Calculate province centroids (center of mass of polygons)
3. Position labels above terrain
4. Billboard labels to always face camera
5. Adjust font size based on importance

**Key State:**

- `labelData` - Memoized array of label positions and metadata

**Props:**

```typescript
interface ProvinceLabelProps {
  provinces: ProvinceData[];
  showLabels: boolean;  // From parent
}
```

**Priority Provinces (Always Labeled):**

- Hà Nội (capital, elevation: 0.15)
- TP. Hồ Chí Minh (largest city)
- Đà Nẵng, Hải Phòng, Cần Thơ, Huế (major cities)
- Nha Trang, Đà Lạt, Quảng Ninh, Nghệ An (important regions)

**Label Properties:**

- **Priority labels:** Font size 0.08, white text, black outline (0.004)
- **City labels:** Font size 0.06, white text, black outline (0.004)
- **Hà Nội special:** Elevation 0.15 (higher than others at 0.12)

**Centroid Calculation:**

- Averages X/Z coordinates of all polygon vertices
- Handles multi-polygon provinces correctly

**Important Patterns:**

- Uses `Billboard` from drei to auto-orient labels
- `Text` component with outline for readability
- Memoized label data to avoid recalculation
- Filters using Set membership for O(1) lookup

**Dependencies:**

- `@react-three/drei` - Text, Billboard components
- `@/data/provinces-data` - Province data and bounds

---

#### **Ocean.tsx**

**Purpose:** Create animated water surface with shader-based ripples, depth gradient, and specular highlights.

**Key Exports:**

- `Ocean()` - Component rendering animated ocean mesh

**Key Responsibilities:**

1. Generate 256x256 plane geometry for high-resolution ripples
2. Implement simplex noise for natural wave patterns
3. Create depth-based color gradient (coast to deep ocean)
4. Calculate dynamic normals for specular lighting
5. Animate using shader time uniform
6. Blend seamlessly with SkyDome at edges

**Shader Uniforms:**

```typescript
{
  time: 0 (updates each frame),
  coastColor: 0x35c4b8,      // Shallow turquoise
  shallowColor: 0x3bb8b0,    // Medium turquoise
  midColor: 0x1a9a92,        // Light sea green
  deepColor: 0x156d7a,       // Deeper teal
  abyssColor: 0x0a4d5e,      // Deep ocean
  edgeColor: 0x0a3248,       // Navy (sky edge)
  sunDirection: [0.5, 0.8, 0.3] (normalized),
  sunColor: 0xffffff,
  viewPos: [0, 3, 4] (camera position, updates each frame),
}
```

**Wave Animation:**

- **Ripple layers:** 3 scales (0.8, 1.5, 3.0) with different time speeds
- **Rolling waves:** 3 sine waves at different frequencies
- **Amplitude:** Decreases towards edges (smoothstep fade)

**Color Depth Zones:**

1. Coast (0-4m): Muted turquoise
2. Shallow (3-8m): Medium turquoise
3. Mid (7-14m): Light sea green
4. Deep (12-20m): Deeper teal
5. Abyss (18-26m): Deep ocean blue
6. Edge (24-30m): Navy (blends with sky)

**Additional Effects:**

- **Caustics:** Subtle animated patterns in shallow areas (0.03 intensity)
- **Specular highlights:** Softened sun reflection (0.25 intensity, 32 power)
- **Wave height highlights:** Subtle brightness variation
- **Fresnel effect:** Subtle edge brightening (0.1 intensity)
- **Edge fade:** Transparent towards edges to blend with sky

**Important Patterns:**

- Simplex noise implementation in GLSL for natural-looking waves
- Normal calculation using noise derivatives (for realistic lighting)
- Dual-layer noise: detail ripples + rolling waves
- Time scale: 0.5 multiplier for slower animation
- useFrame to update camera position uniform each frame
- Mesh positioning: y = -0.05 (slightly below terrain)

**Performance:**

- 256x256 geometry provides smooth wave deformation
- Single plane geometry reused with material updates
- Shader-based animation (GPU-side)

**Dependencies:**

- `three` - ShaderMaterial, PlaneGeometry, Vector3, Color
- `@react-three/fiber` - useFrame, useThree hooks

---

#### **SkyDome.tsx**

**Purpose:** Create seamless spherical background gradient from bright sky to dark edges.

**Key Exports:**

- `SkyDome()` - Component rendering gradient sphere background

**Key Responsibilities:**

1. Generate large 50-unit radius sphere
2. Create smooth gradient from center (bright cyan) to edges (dark navy)
3. Blend horizontal and vertical distance for natural effect
4. Ensure smooth transitions without hard horizon line

**Shader Uniforms:**

```typescript
{
  centerColor: 0x7dd3e8,   // Soft bright cyan (center/bottom)
  midColor: 0x4db6d4,      // Medium cyan
  edgeColor: 0x1a5a7a,     // Dark desaturated blue
  outerColor: 0x0d3a52,    // Deep navy (far edges)
}
```

**Gradient Calculation:**

- **Horizontal distance:** From map center (0, 0) in XZ plane
- **Vertical factor:** Height-based (higher = darker, simulating sky)
- **Radial distance:** Combined 3D distance normalized to sphere radius
- **Zone blending:** Three smoothstep zones for natural transitions

**Color Zones:**

1. Center (0-0.3): Bright cyan
2. Mid (0.3-0.6): Medium cyan to edge color
3. Edge (0.6-1.0): Dark blue to navy

**Important Patterns:**

- Renders inside of sphere (BackSide flag)
- No depth writing (depthWrite: false) for proper blending
- Memoized geometry/material (stable references)
- Combines horizontal and vertical influences (50/50 blend)

**Dependencies:**

- `three` - SphereGeometry, ShaderMaterial, Vector3, Color

---

### UI Components

#### **Controls.tsx**

**Purpose:** Collapsible control panel showing keyboard/mouse/hand gesture controls.

**Key Exports:**

- `Controls(props: ControlsProps)` - Main component
- Subcomponents: `ControlItem`, `KeyboardKey`, `MouseIcon`, `ScrollIcon`, `DragIcon`, `PinchIcon`, `TwoFingerIcon`, `HandIcon`, `FistIcon`

**Key Responsibilities:**

1. Display control instructions
2. Detect device type (touch vs desktop)
3. Show context-specific controls
4. Provide reset camera button
5. Collapsible/expandable state

**Key State:**

- `isCollapsed` - Toggle panel visibility
- `isTouchDevice` - Detect touch capabilities

**Props:**

```typescript
interface ControlsProps {
  dict: Dictionary;      // i18n translations
  onResetCamera?: () => void;
}
```

**Control Sections:**

1. **Touch Controls** (mobile only):
   - Drag to rotate
   - Pinch to zoom
   - Two-finger pan

2. **Movement/Rotation:**
   - Mouse drag
   - R key to reset

3. **Zoom:**
   - Scroll wheel
   - +/- keys

4. **Hand Tracking:**
   - Open palm for rotation
   - Pinch for zoom
   - Fist for reset

**Styling:**

- Background: White with 90% opacity + blur
- Border: Gray 100, subtle shadow
- Collapsed: 44x44px icon button
- Expanded: 240px min-width

**Important Patterns:**

- SVG icons inlined for instant rendering
- `useEffect` to detect touch at mount time
- Conditional rendering based on device type
- Custom icon components for visual consistency

**Dependencies:**

- `@/i18n/dictionaries` - i18n system

---

#### **LanguageSwitcher.tsx**

**Purpose:** Provide locale switching between Vietnamese and English.

**Key Exports:**

- `LanguageSwitcher(props: LanguageSwitcherProps)` - Component

**Key Responsibilities:**

1. Display compact locale toggle
2. Switch between vi/en routes
3. Preserve path segment when switching

**Key State:**

- Uses Next.js routing (`usePathname`, `useRouter`)

**Props:**

```typescript
interface LanguageSwitcherProps {
  currentLocale: Locale;  // 'vi' or 'en'
}
```

**Locale Labels:**

- **VI** → Tiếng Việt
- **EN** → English

**Route Handling:**

- Splits pathname by '/'
- Replaces segment[1] with new locale
- Navigates via router.push

**Styling:**

- Background: White with 90% opacity + blur
- Selected: Dark gray background, white text
- Unselected: Gray text, hover highlight
- Padding: 1.5px spacing between buttons

**Important Patterns:**

- Compact button design (px-3.5 py-2)
- Smooth transitions on locale change
- Title attribute for accessibility

**Dependencies:**

- `next/navigation` - usePathname, useRouter
- `@/i18n/config` - Locale configuration

---

#### **Legend.tsx**

**Purpose:** Display color legend mapping categories to visual representations.

**Key Exports:**

- `Legend(props: LegendProps)` - Component

**Key Responsibilities:**

1. Show color-to-category mapping
2. Collapsible/expandable state
3. Correspond to province coloring scheme

**Key State:**

- `isCollapsed` - Toggle visibility

**Props:**

```typescript
interface LegendProps {
  dict: Dictionary;  // i18n system
}
```

**Legend Items:**

| Item | Color | Hex |
|------|-------|-----|
| Lowlands | Bright green | #22c55e |
| Mountains | Lime green | #84cc16 |
| Sovereignty (Cities) | Yellow/gold | #eab308 |
| Coastal Islands | Cyan | #06b6d4 |
| Capital | Red | #ef4444 |
| Major Cities | Amber | #f59e0b |

**Styling:**

- Similar to Controls (white, translucent, collapsible)
- 200px min-width
- Color swatches with subtle border and shadow

**Important Patterns:**

- Icon-only button when collapsed
- Full panel when expanded
- Close button with hover states
- Reuses ControlItem pattern concepts

**Dependencies:**

- `@/i18n/dictionaries` - i18n system

---

#### **LoadingScreen.tsx**

**Purpose:** Display loading state during data initialization.

**Key Exports:**

- `LoadingScreen(props: LoadingScreenProps)` - Component

**Key Responsibilities:**

1. Show animated loader rings
2. Display status message
3. Hide when ready

**Key State:**

- Props determine visibility

**Props:**

```typescript
interface LoadingScreenProps {
  dict: Dictionary;
  status: string;      // Status message
  isReady: boolean;    // Show/hide flag
}
```

**Styling:**

- Full screen overlay (fixed inset-0)
- Ocean background color
- Animated loader rings (3-ring concentric animation)
- Centered text layout
- Z-index: 50 (above content)

**Important Patterns:**

- Simple exit when ready (return null)
- Uses Tailwind animation classes
- Status text updates dynamically

**Dependencies:**

- `@/i18n/dictionaries` - i18n system

---

#### **HandTrackingVideo.tsx**

**Purpose:** Display camera feed with hand landmark visualization and gesture detection status.

**Key Exports:**

- `HandTrackingVideo(props: HandTrackingVideoProps)` - Component

**Key Responsibilities:**

1. Render video and canvas elements
2. Show hand tracking status
3. Display current gesture
4. Propagate gesture changes to parent

**Key State:**

- Receives from `useHandTracking` hook

**Props:**

```typescript
interface HandTrackingVideoProps {
  dict: Dictionary;
  enabled: boolean;
  onGestureChange?: (gesture: HandGestureState) => void;
}
```

**Display Elements:**

1. **Video:** Mirrored camera feed (scaleX: -1)
2. **Canvas:** Overlaid hand landmarks and connections
3. **Status label:** Loading/error/active with hand count
4. **Gesture label:** Current detected gesture

**Status States:**

- **Loading:** Yellow text "Loading..."
- **Error:** Red text "Error: [message]"
- **Active:** Green text "Active (N hands)"

**Hand Visualization:**

- **Landmarks:** Colored dots (first hand: yellow, second: orange)
- **Connections:** Lines following MediaPipe hand skeleton
- **Colors:** Hand 0 = green/yellow, Hand 1 = blue/orange

**Container Class:** `glass-panel` (styled elsewhere in globals)

**Important Patterns:**

- `useEffect` to propagate gesture changes (avoids setState during render)
- Conditional rendering (only when enabled)
- Dual element approach (video + canvas overlay)
- Automatic gesture display (shown when gesture !== 'none')

**Dependencies:**

- `@/hooks/useHandTracking` - Gesture detection hook
- `@/i18n/dictionaries` - i18n system

---

## HOOKS ANALYSIS

### **useHandTracking.ts**

**Purpose:** Detect hand gestures using MediaPipe and convert to map control commands.

**Key Exports:**

- `useHandTracking(enabled: boolean)` - Hook function
- `HandGestureState` - Gesture state interface
- `GestureType` - Union type of gesture names

**Key Responsibilities:**

1. Initialize MediaPipe Hands model
2. Request camera access and start video stream
3. Process hand landmarks on each video frame
4. Detect single-hand and two-hand gestures
5. Draw hand visualization on canvas
6. Calculate gesture deltas (rotation, zoom, etc.)

**Gesture Types:**

```typescript
type GestureType =
  | 'none'
  | 'palm-rotate'          // Open palm for view rotation
  | 'pinch-zoom'           // Thumb-index pinch for zoom
  | 'fist-reset'           // Closed fist for reset
  | 'pointing'             // Single extended finger for fine rotation
  | 'two-hand-zoom'        // Both hands pinched (zoom)
  | 'two-hand-rotate'      // Both hands open (rotate + angle)
  | 'two-hand-reset';      // Both hands fist (reset)
```

**Hand Gesture State:**

```typescript
interface HandGestureState {
  gesture: GestureType;
  rotationDeltaX: number;     // Vertical rotation delta
  rotationDeltaY: number;     // Horizontal rotation delta
  zoomDelta: number;          // Zoom amount
  shouldReset: boolean;       // Reset to default camera
  handsDetected: number;      // Count of detected hands
  handPosition: { x: number; y: number } | null;  // Normalized 0-1
}
```

**Single-Hand Gestures:**

1. **Open Palm (≥4 fingers extended):**
   - `gesture: 'palm-rotate'`
   - `rotationDeltaX = (palm.y - 0.5) * 0.03`
   - `rotationDeltaY = (palm.x - 0.5) * 0.05`

2. **Pinch Zoom (thumb-index < 0.08 distance):**
   - `gesture: 'pinch-zoom'`
   - `zoomDelta = (lastPinchDistance - currentDistance) * 5`
   - `handPosition = center of pinch`

3. **Fist (0 fingers extended):**
   - `gesture: 'fist-reset'`
   - `shouldReset = true`

4. **Pointing (1 finger extended):**
   - `gesture: 'pointing'`
   - Fine rotation based on index finger position
   - `rotationDeltaX/Y = finger.position * 0.015-0.02`

**Two-Hand Gestures:**

1. **Two-Hand Pinch Zoom (both pinching):**
   - `gesture: 'two-hand-zoom'`
   - `zoomDelta = (lastDistance - currentDistance) * 3`
   - `handPosition = center between palms`

2. **Two-Hand Rotation (both open palms):**
   - `gesture: 'two-hand-rotate'`
   - Rotation based on center position
   - Additional rotation from angle delta between hands
   - Angle delta clamped to prevent jitter

3. **Two-Hand Reset (both fists):**
   - `gesture: 'two-hand-reset'`
   - `shouldReset = true`

**MediaPipe Configuration:**

```typescript
{
  maxNumHands: 2,
  modelComplexity: 1,        // Balanced accuracy/speed
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
}
```

**Hand Landmark Indices:**

- 0: Wrist (palm center)
- 4: Thumb tip
- 8: Index finger tip
- 12: Middle finger tip
- 16: Ring finger tip
- 20: Pinky finger tip

**Helper Functions:**

- `getPinchDistance(landmarks)` - Euclidean distance thumb to index
- `countExtendedFingers(landmarks)` - Count fingers above knuckle height

**Canvas Visualization:**

- Green connections + yellow dots for hand 0
- Blue connections + orange dots for hand 1
- Connections follow 21-point MediaPipe skeleton
- Landmark size: 3px radius circles

**Return Values:**

```typescript
{
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  isLoading: boolean,        // Model initialization status
  error: string | null,      // Error message if any
  gestureState: HandGestureState,
}
```

**MediaPipe Loading:**

- Dynamically imports from CDN: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/`
- Lazy loading only when enabled
- Cleanup: stops camera, closes hands model

**Camera Configuration:**

- Requested resolution: 320x240 (fast processing)
- Facing mode: 'user' (front-facing)
- MediaStream handling with proper track cleanup

**Important Patterns:**

- `useRef` for mutable tracking state (pinch distance, hand positions)
- `useCallback` for onResults to maintain stable reference
- `onResults` debounced by video frame rate (~30 FPS)
- Mounted check prevents state updates after unmount
- Gesture state reset on hand count change
- Normalization: hand positions in 0-1 range (relative to viewport)

**Browser Requirements:**

- Modern browser with getUserMedia support
- HTTPS required (or localhost) for camera access
- WebGL for canvas rendering

**Performance Considerations:**

- Model complexity 1: ~30 FPS on most devices
- Canvas update throttled to video frame rate
- Lazy loading prevents bundle bloat
- Cleanup on unmount prevents memory leaks

---

## KEY ARCHITECTURAL PATTERNS

### Component Hierarchy & Data Flow

```text
[locale]/page.tsx
  ↓
MapWrapper (client-side orchestrator)
  ├─ VietnamMap (3D scene)
  │   ├─ CameraController (camera + input)
  │   ├─ Lights
  │   ├─ SkyDome (background)
  │   ├─ Ocean (water)
  │   ├─ Provinces (geometries + hover)
  │   └─ ProvinceLabels (text)
  ├─ HandTrackingVideo (camera feed + visualization)
  ├─ Controls (UI panel)
  └─ LanguageSwitcher (i18n)
```

### Data Dependencies

**Province Data Flow:**

1. Loaded in MapWrapper via `loadProvinces()`
2. Passed to Provinces component for geometry generation
3. Used in ProvinceLabels for centroid calculation
4. Hover info formatted in VietnamMap

**Hand Gesture Flow:**

1. Detected in useHandTracking hook
2. Passed to HandTrackingVideo display
3. Propagated to MapWrapper as gestureState
4. Applied in CameraController for camera movement

**i18n Dictionary Flow:**

1. Provided by server to page component
2. Passed down to MapWrapper
3. Distributed to Controls, Legend, LoadingScreen
4. Extracted for specific UI text

### State Management

**Stateful Components:**

- **MapWrapper:** Province loading, hand tracking toggle, gesture state
- **VietnamMap:** Tooltip state, context loss recovery
- **CameraController:** Smooth camera interpolation targets
- **Provinces:** Hovered province name
- **Controls, Legend:** Collapsed/expanded state
- **useHandTracking:** Gesture detection state

**No Global State Manager:**

- Props-based communication
- Refs for imperative actions (resetCamera)
- Callbacks for event propagation

---

## DEPENDENCIES OVERVIEW

### External Libraries (Used in Components/Hooks)

| Package | Used For | Files |
|---------|----------|-------|
| `@react-three/fiber` | 3D rendering | VietnamMap, Provinces, Ocean, SkyDome, CameraController |
| `@react-three/drei` | Helper components | VietnamMap (Camera), ProvinceLabels (Text/Billboard), CameraController (OrbitControls) |
| `@react-three/postprocessing` | Post-effects | VietnamMap (Bloom, BrightnessContrast) |
| `three` | 3D graphics | Provinces, Ocean, SkyDome, CameraController, ProvinceLabels |
| `three-stdlib` | Orbit controls | CameraController |
| `next/navigation` | Routing | LanguageSwitcher |
| `@mediapipe/hands` | Hand tracking | useHandTracking |
| `@mediapipe/camera_utils` | Camera setup | useHandTracking |

### Internal Dependencies

**Type Imports:**

- `@/types` - MapCenter, Bounds, Coordinate
- `@/i18n/dictionaries` - Dictionary type
- `@/i18n/config` - Locale configuration
- `@/data/provinces-data` - ProvinceData type, VIETNAM_BOUNDS, loadProvinces()

---

## IMPORTANT PATTERNS & TECHNIQUES

### Custom Hooks Patterns

- **useHandTracking:** Initializes external library, manages refs, cleanup on unmount
- **useFrame:** Animation loop within Fiber canvas context
- **useThree:** Access to camera, renderer, raycaster
- **useImperativeHandle:** Expose imperative methods via forwardRef

### Three.js Integration

- **Dynamic Imports:** VietnamMap imported with `ssr: false` to prevent SSR hydration mismatches
- **Geometry Management:** Merged geometries for performance, manual disposal
- **Shader Materials:** Custom GLSL in Ocean and SkyDome for complex effects
- **Raycasting:** Mouse-to-3D space intersection for province hovering

### React Patterns

- **Client Components:** All use `'use client'` directive (Three.js WebGL requirement)
- **Refs:** Used for DOM access (video, canvas) and component communication
- **useCallback:** Stable function references to prevent effect re-runs
- **useMemo:** Expensive calculations (geometry generation, label data)
- **Suspense:** Lazy loading of scene components
- **forwardRef + useImperativeHandle:** Expose camera reset to parent

### UI/UX Patterns

- **Collapsible Panels:** Controls and Legend toggle state
- **Glassmorphism:** Translucent backgrounds with blur effects
- **Responsive Icons:** Inline SVG for instant rendering
- **Touch Detection:** Device-specific UI (mobile vs desktop)
- **Smooth Animations:** CSS transitions, camera interpolation, shader animations

---

## TYPE DEFINITIONS SUMMARY

### From Components

- `VietnamMapRef` - Ref interface with resetCamera method
- `CameraControllerRef` - Ref interface with resetCamera method
- `TooltipData` - Province name and info string

### From Hooks

- `GestureType` - Union of gesture names
- `HandGestureState` - Complete gesture state
- `HandLandmark` - Hand landmark with x, y, z

### From i18n

- `Dictionary` - Localized text structure
- `Locale` - 'vi' | 'en'

---

## PERFORMANCE & OPTIMIZATION NOTES

### Rendering Optimization

1. **Geometry Merging:** Multiple province polygons merged per province
2. **Shared Materials:** Outline material reused across all provinces
3. **useMemo:** Stable references for geometries and label data
4. **Lazy Loading:** Provinces component wrapped in Suspense
5. **Canvas Resolution:** Hand tracking at 320x240 for speed
6. **Shader-Based Animation:** Ocean waves computed on GPU

### Event Handling Optimization

1. **Ref-Based Tracking:** useRef for hover state avoids state updates
2. **Memoized Callbacks:** useCallback for event handlers
3. **Passive Event Listeners:** Reduce jank on scroll/touch
4. **Throttling:** Pointer events naturally throttled by browser frame rate

### Asset Management

1. **Dynamic Imports:** Three.js components loaded only when needed
2. **Lazy MediaPipe:** Hand tracking library loaded on-demand
3. **Canvas Cleanup:** Proper disposal of geometries and event listeners
4. **Stream Cleanup:** Camera stream tracks stopped on unmount

---

## UNRESOLVED QUESTIONS / NOTES

1. **PostProcessing Effects:** Currently very subtle (Bloom 0.1, Contrast +0.05) - consider if stronger effects desired for visual impact

2. **Hand Gesture Responsiveness:** Gesture deltas hardcoded (0.03, 0.05, etc.) - could be exposed as tuning parameters

3. **Province Categorization:** Only 10 highland provinces defined - validate against official geographic data

4. **Mobile Testing:** Touch gesture implementation thorough, but real device testing recommended (pinch sensitivity thresholds)

5. **WebGL Context Loss:** Recovery implemented but untested in production - consider adding user notification

6. **Accessibility:** Limited ARIA labels in 3D components - hand gesture features may need alternative inputs for accessibility

7. **Localization Coverage:** Legend strings (lowlands, mountains, etc.) should be in dictionaries, not hardcoded
