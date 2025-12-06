# Code Standards & Development Guidelines

## Project Structure

```text
vietnam-3d-map/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx              # Main page component (per locale)
│   │   │   └── layout.tsx            # Layout wrapper
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles (Tailwind v4)
│   │
│   ├── components/
│   │   ├── MapWrapper.tsx            # Main wrapper (Client Component)
│   │   ├── map/
│   │   │   ├── VietnamMap.tsx        # Canvas + scene setup
│   │   │   ├── Provinces.tsx         # 63 province geometries
│   │   │   ├── Ocean.tsx             # Water plane with shader
│   │   │   ├── SkyDome.tsx           # Background sphere
│   │   │   ├── CameraController.tsx  # OrbitControls + camera logic
│   │   │   ├── ProvinceLabels.tsx    # Billboard text labels
│   │   │   ├── IslandMarkers.tsx     # Hoàng Sa, Trường Sa
│   │   │   └── Lights.tsx            # 5-light system
│   │   │
│   │   ├── ui/
│   │   │   ├── Controls.tsx          # Control panel (collapsible)
│   │   │   ├── Legend.tsx            # Color legend
│   │   │   ├── Tooltip.tsx           # Province hover info
│   │   │   ├── LanguageSwitcher.tsx  # VI/EN toggle
│   │   │   ├── LoadingScreen.tsx     # Loading state
│   │   │   ├── HandTrackingVideo.tsx # Camera feed display
│   │   │   └── Button.tsx            # Reusable button component
│   │   │
│   │   └── providers/
│   │       ├── LocaleProvider.tsx    # i18n context
│   │       ├── HandTrackingProvider.tsx
│   │       └── TooltipProvider.tsx
│   │
│   ├── hooks/
│   │   ├── useLocale.ts              # Get current locale & dictionary
│   │   ├── useHandTracking.ts        # MediaPipe Hands integration
│   │   ├── useTooltip.ts             # Tooltip state management
│   │   └── useMapControls.ts         # Input handling & camera control
│   │
│   ├── data/
│   │   ├── provinces-data.ts         # Types + loader function
│   │   └── island-data.ts            # Hoàng Sa, Trường Sa coordinates
│   │
│   ├── i18n/
│   │   ├── config.ts                 # Locale configuration (const as const)
│   │   ├── dictionaries.ts           # Vietnamese & English translations
│   │   └── types.ts                  # Dictionary interface
│   │
│   ├── types/
│   │   └── index.ts                  # Global type definitions
│   │
│   ├── shaders/
│   │   ├── ocean.glsl               # Ocean vertex & fragment shaders
│   │   ├── skydome.glsl             # Sky gradient shader
│   │   └── types.ts                 # Shader uniform types
│   │
│   ├── utils/
│   │   ├── geometry.ts              # ExtrudeGeometry creation
│   │   ├── colors.ts                # Province color mapping
│   │   ├── math.ts                  # Camera math, vectors
│   │   └── performance.ts           # Performance monitoring
│   │
│   └── middleware.ts / proxy.ts    # Locale routing
│
├── public/
│   ├── provinces.json               # Preprocessed province data (~800 KB)
│   └── [legacy HTML demos]          # Standalone demos (not part of app)
│
├── data/
│   └── vietnam-provinces.geojson    # Source GeoJSON (32 MB raw)
│
├── scripts/
│   └── preprocess-geojson.ts        # Preprocessing script
│
├── docs/
│   ├── project-overview-pdr.md      # This file
│   ├── system-architecture.md       # Architecture details
│   ├── code-standards.md            # This file
│   └── codebase-summary.md          # File summaries
│
├── .next/
├── node_modules/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.js
├── CLAUDE.md
└── README.md
```

## TypeScript Conventions

### Type Naming

```typescript
// Use PascalCase for all types
type ProvinceData = { ... }
interface Dictionary { ... }
type HandGestureState = { ... }
type Coordinate = [number, number]

// Avoid generic "Type" suffix unless necessary for clarity
// Good: type GestureType = 'pinch' | 'rotate' | ...
// Avoid: type GestureType = { gesture: string }

// Use readonly for immutable data
type Province = {
  readonly id: string
  readonly name: string
  readonly polygons: readonly Polygon[]
}
```

### Type Organization

```typescript
// src/types/index.ts - centralized global types
export type Coordinate = [longitude: number, latitude: number]
export type Bounds = { min: Coordinate; max: Coordinate }
export type MapCenter = Coordinate & { zoom: number }

// co-locate types with their components
// src/components/map/Provinces.tsx
type ProvinceHoverState = {
  provinceId: string | null
  position: [x: number, y: number]
}
```

### Const as Const Pattern

```typescript
// src/i18n/config.ts - use 'as const' for type-safe enums
export const locales = ['vi', 'en'] as const
export type Locale = typeof locales[number] // 'vi' | 'en'

// src/data/color-map.ts
export const PROVINCE_TYPES = {
  CAPITAL: 'capital',
  CITY: 'city',
  HIGHLAND: 'highland',
  COASTAL: 'coastal',
  DEFAULT: 'default',
} as const
export type ProvinceType = typeof PROVINCE_TYPES[keyof typeof PROVINCE_TYPES]
```

### Generics Usage

```typescript
// Use generics for reusable hooks
function useAsync<T>(asyncFn: () => Promise<T>, deps: any[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  // ...
}

// Use generics for component wrappers
interface ProviderProps<T> {
  children: React.ReactNode
  initialValue: T
}

// Avoid unnecessary generics - keep it simple
// Bad: type Container<T = unknown> = { value: T }
// Good: type Container<T> = { value: T } (require T unless default is essential)
```

## React & Next.js Patterns

### Client/Server Component Boundary

```typescript
// ✓ Server Component (default in Next.js 16)
export default function Page({ params }: { params: { locale: string } }) {
  return <MapWrapper locale={params.locale} />  // Can import Client Components
}

// ✗ Cannot use hooks, interactive features
export default function Page() {
  const [state, setState] = useState() // ERROR: hooks only in Client
}

// ✓ Client Component (use when needed for interactivity)
'use client'
export default function MapWrapper() {
  const [provinces, setProvinces] = useState<Province[]>([])
  // ...
}

// ✓ For dynamic imports with ssr: false (required for Three.js)
'use client'
import dynamic from 'next/dynamic'
const VietnamMap = dynamic(() => import('./VietnamMap'), { ssr: false })
```

### Hook Patterns

```typescript
// ✓ Custom hooks for logic extraction
function useHandTracking(enabled: boolean) {
  const [gesture, setGesture] = useState<HandGestureState>(initialState)

  useEffect(() => {
    if (!enabled) return
    // Initialize MediaPipe
    // Detect gestures
    // Update state
  }, [enabled])

  return gesture
}

// ✓ Context + Provider pattern for app-level state
type LocaleContextType = {
  locale: Locale
  dictionary: Dictionary
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('vi')
  // ...
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useLocale must be used within LocaleProvider')
  return context
}
```

### Component Composition

```typescript
// ✓ Props interface for every component
interface ProvincesProps {
  readonly hover: string | null
  readonly onHover: (provinceId: string | null) => void
  readonly onSelect: (provinceId: string) => void
}

export function Provinces({ hover, onHover, onSelect }: ProvincesProps) {
  // ...
}

// ✓ Use React.memo for expensive components
export const Ocean = React.memo(function Ocean(props: OceanProps) {
  // ...
})

// ✓ Callback memoization for event handlers
function VietnamMap() {
  const handleProvinceHover = useCallback((id: string | null) => {
    // Handler logic
  }, [])

  return <Provinces onHover={handleProvinceHover} />
}
```

### Error Boundaries

```typescript
// ✓ Wrap Client Components that might error
'use client'
import { ErrorBoundary } from 'react-error-boundary'

export default function MapWrapper() {
  return (
    <ErrorBoundary FallbackComponent={MapError} onReset={() => window.location.reload()}>
      <Canvas>
        <VietnamMap />
      </Canvas>
    </ErrorBoundary>
  )
}

function MapError({ error }: { error: Error }) {
  return <div>Map failed to load: {error.message}</div>
}
```

## Three.js / React Three Fiber Patterns

### Geometry Creation

```typescript
// ✓ Create geometries outside render
function useProvinceGeometry(polygons: Polygon[]) {
  const geometry = useMemo(() => {
    const geom = new THREE.ExtrudeGeometry(shapes, {
      depth: 10000,
      bevelEnabled: false,
    })
    return geom
  }, [polygons])

  return geometry
}

// ✗ Avoid recreating geometries every frame
function Provinces() {
  // Bad: this runs every frame
  const geometry = new THREE.ExtrudeGeometry(...)
}
```

### Materials

```typescript
// ✓ Memoize materials, share across geometries
function useProvinceMaterial(color: THREE.Color) {
  return useMemo(() => new THREE.MeshPhongMaterial({ color }), [color])
}

// ✓ Store material instances for reuse
const materialCache = new Map<string, THREE.Material>()

function getMaterial(colorHex: string): THREE.Material {
  if (!materialCache.has(colorHex)) {
    materialCache.set(colorHex, new THREE.MeshPhongMaterial({
      color: parseInt(colorHex, 16),
    }))
  }
  return materialCache.get(colorHex)!
}
```

### Animation Loop

```typescript
// ✓ Use useFrame for per-frame updates
function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    meshRef.current.material.uniforms.time.value = time
  })

  return <mesh ref={meshRef} {...} />
}

// ✗ Avoid imperative state updates in render
function BadComponent() {
  const [time, setTime] = useState(0)  // Causes re-renders!
  useFrame(() => setTime(t => t + 0.01))
}
```

### Raycasting

```typescript
// ✓ Raycasting for hover detection
function Provinces() {
  const groupRef = useRef<THREE.Group>(null)
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  useFrame(() => {
    raycaster.current.setFromCamera(mouse.current, camera)
    const intersects = raycaster.current.intersectObjects(groupRef.current?.children || [])

    if (intersects.length > 0) {
      const provinceId = intersects[0].object.userData.provinceId
      onHover(provinceId)
    }
  })

  const handleMouseMove = (e: React.MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  return <group ref={groupRef} onPointerMove={handleMouseMove} />
}
```

### Shader Materials

```typescript
// ✓ Use ShaderMaterial with typed uniforms
const oceanMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    viewPos: { value: new THREE.Vector3() },  // NOT cameraPosition
    waveAmplitude: { value: 0.5 },
  },
  vertexShader: OCEAN_VERTEX,
  fragmentShader: OCEAN_FRAGMENT,
})

// ✓ Update uniforms in useFrame
useFrame(({ clock, camera }) => {
  oceanMaterial.uniforms.time.value = clock.getElapsedTime()
  oceanMaterial.uniforms.viewPos.value.copy(camera.position)
})

// ✓ Store shader strings separately
// src/shaders/ocean.glsl (or .ts)
export const OCEAN_VERTEX = /* glsl */ `
  uniform float time;

  void main() {
    vec3 pos = position;
    pos.z += sin(uv.x * 10.0 + time) * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`
```

### Post-Processing

```typescript
// ✓ Use EffectComposer for post-processing
function VietnamMap() {
  return (
    <Canvas>
      <EffectComposer>
        <RenderPass attachArray="passes" />
        <UnrealBloomPass attachArray="passes" args={[undefined, 2, 1, 0.8]} />
      </EffectComposer>
    </Canvas>
  )
}
```

## i18n Patterns

### Dictionary Structure

```typescript
// ✓ Nested structure with clear sections
const dictionaries = {
  en: {
    common: {
      title: 'Vietnam 3D Map',
      loading: 'Loading map...',
    },
    controls: {
      rotate: 'Drag to rotate',
      zoom: 'Scroll to zoom',
    },
    provinces: {
      'hanoi': 'Ha Noi',
      'hochiminhcity': 'Ho Chi Minh City',
    },
  },
  vi: {
    common: {
      title: 'Bản đồ 3D Việt Nam',
      loading: 'Đang tải bản đồ...',
    },
    // ...
  },
}

// ✓ Type-safe dictionary access
type Dictionary = typeof dictionaries.en
type DictionaryKey = keyof Dictionary  // 'common' | 'controls' | ...

function useLocale() {
  const dict = dictionaries[locale] as Dictionary
  return dict
}
```

### URL Routing

```typescript
// ✓ Route structure with locale parameter
// /vi/page.tsx -> Vietnamese
// /en/page.tsx -> English
// / -> redirect to /vi (default)

// ✓ Link to other locales
<Link href={`/${newLocale}${pathname}`}>
  {newLocale.toUpperCase()}
</Link>

// ✓ Get current locale from params
export default function Page({ params }: { params: { locale: string } }) {
  const dict = getDictionary(params.locale as Locale)
  return <main>{dict.common.title}</main>
}
```

## Tailwind CSS v4 Conventions

### Global Styles

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary-blue: #0066cc;
  --color-neutral-dark: #1a1a1a;
  --shadow-lg-3d: 0 20px 40px rgba(0, 0, 0, 0.3);
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors;
  }

  .panel {
    @apply bg-white rounded-lg shadow-lg p-4 backdrop-blur-sm;
  }
}
```

### Component Styling

```typescript
// ✓ Use className with Tailwind utilities
function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
      {children}
    </button>
  )
}

// ✓ Use clsx for conditional classes (requires installation)
import clsx from 'clsx'

function Legend({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className={clsx('panel', {
      'h-12': isCollapsed,
      'h-auto': !isCollapsed,
    })}>
      {/* ... */}
    </div>
  )
}

// ✓ Extract repeated patterns to components
function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-lg p-4 backdrop-blur-sm', className)}>
      {children}
    </div>
  )
}
```

## File Naming Conventions

```text
Components:
├── PascalCase.tsx for React components
├── useHookName.ts for custom hooks
└── [name].types.ts for component prop types (co-located)

Examples:
├── VietnamMap.tsx
├── useHandTracking.ts
├── Provinces.types.ts
└── ProvinceLabels.tsx

Data & Types:
├── camelCase.ts for data/utilities
├── CONSTANT_NAME for constants
└── snake_case.json for data files (legacy)

Examples:
├── provinces-data.ts
├── island-data.ts
├── COLOR_MAP.ts
└── provinces.json

Shaders:
├── shaderName.glsl
└── shaders/ocean.glsl, skydome.glsl
```

## Code Style Rules

### Import Organization

```typescript
// ✓ Group imports in order
// 1. External packages
import React, { useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 2. Local absolute imports
import { Provinces } from '@/components/map/Provinces'
import type { ProvinceData } from '@/types'

// 3. Local relative imports (rarely used)
import { helper } from './helper'

// ✗ Avoid mixing import styles
// Bad: mixing default + named in one import
import VietnamMap, { Provinces } from './map'
```

### Line Length

```typescript
// ✓ Aim for < 100 characters, max 120
const isHovering = provinceId !== null && provinceId === highlightedId

// ✗ Long lines
const isHovering = provinceId !== null && provinceId === highlightedId && !isLoading && isMapReady && hasData

// Break into multiple lines
const isHovering =
  provinceId !== null &&
  provinceId === highlightedId &&
  !isLoading &&
  isMapReady &&
  hasData
```

### Naming Conventions

```typescript
// ✓ Boolean variables start with is/has/can/should
const isLoading = true
const hasError = false
const canInteract = true
const shouldRender = true

// ✓ Event handlers start with handle/on
const handleMouseMove = () => {}
const onProvinceHover = () => {}

// ✓ Callback/async handlers
const fetchProvinces = async () => {}
const renderProvince = (province: ProvinceData) => {}

// ✗ Avoid abbreviations
// Bad: prov, hdl, cfg
// Good: province, handle, config
```

### Arrow Functions

```typescript
// ✓ Use arrow functions for consistency
const getValue = () => 123
const double = (x: number) => x * 2

// ✓ Single argument without parens (if no type annotation)
const items = data.map(item => item.name)

// ✓ Multiple args or type annotations need parens
const add = (a: number, b: number) => a + b
const process = (item: DataItem) => ({ ...item })
```

## Performance Guidelines

### Avoid Unnecessary Renders

```typescript
// ✓ Memoize expensive components
const Provinces = React.memo(function Provinces(props: ProvincesProps) {
  return <group>{/* expensive rendering */}</group>
})

// ✓ Memoize callbacks
const handleHover = useCallback((id: string) => {
  // ...
}, [])

// ✓ Use useMemo for expensive calculations
const colorMap = useMemo(
  () => new Map(provinceData.map(p => [p.id, getColor(p)])),
  [provinceData]
)
```

### Async Data Loading

```typescript
// ✓ Lazy load province data
function useProvinces() {
  const [provinces, setProvinces] = useState<ProvinceData[] | null>(null)

  useEffect(() => {
    fetch('/provinces.json')
      .then(r => r.json())
      .then(setProvinces)
      .catch(err => console.error('Failed to load provinces', err))
  }, [])

  return provinces
}

// ✓ Show loading state
function MapWrapper() {
  const provinces = useProvinces()

  if (!provinces) return <LoadingScreen />
  return <VietnamMap provinces={provinces} />
}
```

## Testing Guidelines

### Unit Tests

```typescript
// Test files co-located with components
// VietnamMap.tsx → VietnamMap.test.ts

import { render } from '@testing-library/react'
import { VietnamMap } from './VietnamMap'

describe('VietnamMap', () => {
  it('renders without crashing', () => {
    const { container } = render(<VietnamMap />)
    expect(container).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// Test component interactions
describe('ProvinceInteraction', () => {
  it('shows tooltip on hover', async () => {
    const user = userEvent.setup()
    render(<MapWrapper />)

    await user.hover(screen.getByTestId('province-hanoi'))
    expect(screen.getByText('Hà Nội')).toBeVisible()
  })
})
```

## ESLint Configuration

```javascript
// eslint.config.js - enforces standards
export default [
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/jsx-key': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
]
```

## Related Documents

- `docs/system-architecture.md` - How components interact
- `docs/codebase-summary.md` - File organization
- `CLAUDE.md` - Project-specific constraints
- `README.md` - Quick reference
