# Vietnam 3D Map - Project Overview & Product Development Requirements

## Project Vision

An interactive 3D web application that enables users to explore Vietnam's geography, administrative divisions, and territorial claims through an immersive, gesture-controlled interface. The application serves as both an educational tool and an interactive reference for Vietnam's political geography.

## Goals

### Primary Goals

1. **Accurate Geographic Representation** - Visualize all 34 Vietnamese provinces/cities (2025 administrative reorganization) with proper boundaries and categorization
2. **Interactive Exploration** - Provide intuitive controls for desktop, mobile, and gesture-based interaction
3. **Internationalization** - Support Vietnamese and English languages with seamless locale switching
4. **Territorial Clarity** - Display disputed island territories (Hoàng Sa/Paracel and Trường Sa/Spratly) appropriately
5. **Performance** - Render complex geographic data efficiently in browsers with minimal loading time

### Secondary Goals

1. **Hand Gesture Control** - Optional MediaPipe Hands integration for natural gesture-based navigation
2. **Ward-Level Detail** - Drill down to 3,321 wards/communes within each province
3. **Educational Value** - Display province/ward-level demographic data (population, area, density)
4. **Visual Fidelity** - Realistic terrain visualization with ambient ocean animation
5. **Screenshot Capture** - High-resolution (2x) screenshot with 3-second countdown
6. **Accessibility** - Responsive design working across devices and input methods

## Target Users

- **Students & Educators** - Learning Vietnamese geography and administrative divisions
- **Researchers** - Analyzing territorial claims and geographic patterns
- **Government & Policy** - Reference tool for geographic/territorial information
- **General Public** - Interactive exploration of Vietnam's geography
- **Developers** - Extensible 3D mapping platform for geographic applications

## Core Features

### Map Visualization

- **34 Provinces/Cities** - Color-coded by type (capital, city, highland, coastal, default) - 2025 administrative reorganization
- **3,321 Wards/Communes** - Lazy-loaded ward boundaries when drilling into a province
- **Terrain Rendering** - Extruded 3D polygons representing province/ward boundaries
- **Ocean Animation** - Shader-based water with caustics and wave effects
- **Island Territories** - Hoàng Sa and Trường Sa archipelagos with sovereignty visualization
- **Sky Dome** - Gradient background for atmospheric effect
- **Province/Ward Labels** - Billboard text labels that face camera
- **Hover Tooltips** - Province/ward info on mouse hover/touch
- **Screenshot** - High-resolution capture (2x) with 3-second countdown overlay

### Interaction Methods

- **Mouse Controls** - Drag to rotate, scroll to zoom, cursor zoom-to-point
- **Touch/Trackpad** - Gesture support for pinch zoom and two-finger rotation
- **Keyboard** - Arrow keys for rotation, +/- for zoom, R to reset
- **Hand Gestures** - Optional MediaPipe Hands integration:
  - Single hand: Palm open = rotate, Pinch = zoom, Fist = reset, Pointing = fine rotation, Peace sign = toggle sidebar
  - Two hands: Two pointing = pan, Two peace signs = screenshot (3s countdown), Two palms = tilt, Two pinches = zoom, Two fists = reset

### Internationalization (i18n)

- **Locale Routing** - `/vi` and `/en` URL paths
- **Dynamic Switching** - Language switcher component
- **Comprehensive Translations** - UI controls, legends, province names, tooltips
- **Type-Safe Config** - `as const` configuration for locale management

### Performance & Technical Excellence

- **Client-Side Rendering** - Full WebGL rendering in browser for responsiveness
- **Data Preprocessing** - Douglas-Peucker simplification reduces GeoJSON by 97.6%
- **Efficient Loading** - ~570 KB preprocessed province data (vs 32 MB raw), ~9.4 MB ward data (lazy-loaded per province)
- **Post-Processing Effects** - Bloom effect via Three.js post-processing
- **5-Light System** - Directional, ambient, and spot lights for realistic illumination
- **Raycasting** - Efficient hover detection on 34 province meshes
- **Virtualized Lists** - TanStack Virtual for smooth scrolling through 3,321 wards

## Technical Requirements

### Functional Requirements

- [x] Render 34 Vietnamese provinces with accurate boundaries (2025 reorganization)
- [x] Support ward-level drill-down with 3,321 wards/communes
- [x] Support mouse, touch, keyboard, and hand gesture controls
- [x] Provide simultaneous Vietnamese and English interfaces
- [x] Display province/ward tooltips with administrative/demographic data
- [x] Show island territories (Hoàng Sa, Trường Sa) with visual distinction
- [x] Implement zoom-to-cursor and camera animation
- [x] Handle real-time hand tracking (optional feature flag)
- [x] Screenshot capture with 3-second countdown and 2x resolution
- [x] Responsive design for desktop (1920x1080) and mobile (375x667)

### Non-Functional Requirements

- **Performance** - 60 FPS minimum on modern browsers (Chrome, Firefox, Safari, Edge)
- **Load Time** - Initial page load < 5 seconds on 4G connection
- **Browser Support** - Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Bundle Size** - Total JS < 500 KB gzipped (excluding Three.js dependencies)
- **Memory Usage** - < 150 MB on mobile devices during interaction
- **Accessibility** - WCAG 2.1 AA compliance for UI controls (labels, contrast, keyboard nav)

### Technical Constraints

1. **WebGL Requirement** - Three.js requires client-side rendering, no Server-Side Rendering possible
2. **React Strict Mode** - Disabled (`reactStrictMode: false`) for WebGL compatibility
3. **Shader Uniforms** - Must use `viewPos` instead of `cameraPosition` (Three.js built-in conflict)
4. **Dynamic Imports** - R3F Canvas must use `ssr: false` in Client Components
5. **Tailwind CSS v4** - Must use `@import "tailwindcss"` syntax with `@theme` directives
6. **Data Preprocessing** - GeoJSON changes require `pnpm preprocess` before build

### Technology Stack

- **Frontend Framework** - Next.js 16, React 19, TypeScript 5.9
- **3D Rendering** - Three.js 0.181.2, React Three Fiber 9, Drei 10.7.7
- **Styling** - Tailwind CSS v4, PostCSS
- **Hand Tracking** - MediaPipe Hands (optional)
- **Internationalization** - Custom dictionary-based system (no i18n library)
- **Build Tool** - Turbopack (Next.js 16 default)
- **Package Manager** - pnpm 10.21.0
- **Linting** - Biome

## Acceptance Criteria

### MVP (Minimum Viable Product)

- [x] Render all 34 provinces with distinct colors (2025 reorganization)
- [x] Support mouse and touch controls
- [x] Implement hover detection and province info display
- [x] Support Vietnamese and English languages
- [x] Responsive layout (desktop & mobile)
- [x] Deploy to production

### Phase 2 Enhancements

- [x] Hand gesture control via MediaPipe (single & two-hand gestures)
- [x] Ward-level drill-down (3,321 wards)
- [x] Screenshot capture with countdown
- [x] Island territory visualization improvements
- [ ] Advanced province filtering (by type, population range)
- [ ] History of province boundary changes
- [ ] Export/share map views

### Phase 3+ Roadmap

- [ ] Province comparison tool
- [ ] Historical map overlays
- [ ] Tourism data integration (attractions, events)
- [ ] Economic data visualization layers
- [ ] Real-time geospatial data integration
- [ ] Mobile app (React Native/Flutter)

## Dependencies & Versions

### Core Dependencies

```json
{
  "next": "16.0.7",
  "react": "19.2.1",
  "react-dom": "19.2.1",
  "typescript": "5.9.3",
  "three": "0.181.2",
  "@react-three/fiber": "9.4.2",
  "@react-three/drei": "10.7.7",
  "tailwindcss": "4.1.17"
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
  "@biomejs/biome": "2.3.8",
  "tsx": "4.21.0",
  "postcss": "8.5.6"
}
```

## Success Metrics

### User Engagement

- Page load time: < 5 seconds on 4G
- Session duration: Average 3+ minutes
- Return visit rate: > 30% of users
- Geographic features discovered: > 80% of provinces visited

### Technical Performance

- FPS: Consistent 60 FPS during interaction
- Memory footprint: < 150 MB on mobile
- CPU usage: < 30% during normal navigation
- Network: Initial bundle < 1 MB total

### Code Quality

- Test coverage: > 70% of critical paths
- Lighthouse scores: Performance > 90, Accessibility > 90
- Type safety: 100% TypeScript coverage
- No console errors in production

## Maintenance & Support

### Update Frequency

- **Critical Fixes** - Within 24 hours
- **Feature Updates** - Quarterly releases
- **Data Updates** - When province boundaries/definitions change

### Documentation Maintenance

- API documentation updated with feature releases
- Architecture docs reviewed quarterly
- Code standards enforced via ESLint
- Dependencies updated monthly (security patches)

## Known Limitations

1. **IE 11 Support** - Not supported; requires modern browser
2. **Offline Mode** - Requires initial load; fully functional offline after
3. **Hand Tracking** - Requires camera permissions; optional feature
4. **Mobile Performance** - Lower-end devices may experience < 60 FPS
5. **Very Small Screens** - < 320px width not tested
6. **Shader Support** - Requires WebGL 2.0 support

## Related Documents

- `docs/system-architecture.md` - Technical architecture and data pipelines
- `docs/codebase-summary.md` - Directory structure and file organization
- `docs/code-standards.md` - Development guidelines and patterns
- `CLAUDE.md` - Development instructions and constraints
