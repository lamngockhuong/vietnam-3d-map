# Vietnam 3D Map - Project Overview & Product Development Requirements

## Project Vision

An interactive 3D web application that enables users to explore Vietnam's geography, administrative divisions, and territorial claims through an immersive, gesture-controlled interface. The application serves as both an educational tool and an interactive reference for Vietnam's political geography.

## Goals

### Primary Goals

1. **Accurate Geographic Representation** - Visualize all 63 Vietnamese provinces/cities with proper boundaries and categorization
2. **Interactive Exploration** - Provide intuitive controls for desktop, mobile, and gesture-based interaction
3. **Internationalization** - Support Vietnamese and English languages with seamless locale switching
4. **Territorial Clarity** - Display disputed island territories (Hoàng Sa/Paracel and Trường Sa/Spratly) appropriately
5. **Performance** - Render complex geographic data efficiently in browsers with minimal loading time

### Secondary Goals

1. **Hand Gesture Control** - Optional MediaPipe Hands integration for natural gesture-based navigation
2. **Educational Value** - Display province-level demographic data (population, area, density)
3. **Visual Fidelity** - Realistic terrain visualization with ambient ocean animation
4. **Accessibility** - Responsive design working across devices and input methods

## Target Users

- **Students & Educators** - Learning Vietnamese geography and administrative divisions
- **Researchers** - Analyzing territorial claims and geographic patterns
- **Government & Policy** - Reference tool for geographic/territorial information
- **General Public** - Interactive exploration of Vietnam's geography
- **Developers** - Extensible 3D mapping platform for geographic applications

## Core Features

### Map Visualization

- **63 Provinces/Cities** - Color-coded by type (capital, city, highland, coastal, default)
- **Terrain Rendering** - Extruded 3D polygons representing province boundaries
- **Ocean Animation** - Shader-based water with caustics and wave effects
- **Island Territories** - Hoàng Sa and Trường Sa archipelagos with sovereignty visualization
- **Sky Dome** - Gradient background for atmospheric effect
- **Province Labels** - Billboard text labels that face camera
- **Hover Tooltips** - Province info on mouse hover/touch

### Interaction Methods

- **Mouse Controls** - Drag to rotate, scroll to zoom, cursor zoom-to-point
- **Touch/Trackpad** - Gesture support for pinch zoom and two-finger rotation
- **Keyboard** - Arrow keys for rotation, +/- for zoom, R to reset
- **Hand Gestures** - Optional MediaPipe Hands integration:
  - Palm open = rotate
  - Pinch gesture = zoom
  - Two hands = combined rotate + zoom
  - Fist = reset view
  - Pointing = directional control

### Internationalization (i18n)

- **Locale Routing** - `/vi` and `/en` URL paths
- **Dynamic Switching** - Language switcher component
- **Comprehensive Translations** - UI controls, legends, province names, tooltips
- **Type-Safe Config** - `as const` configuration for locale management

### Performance & Technical Excellence

- **Client-Side Rendering** - Full WebGL rendering in browser for responsiveness
- **Data Preprocessing** - Douglas-Peucker simplification reduces GeoJSON by 97.6%
- **Efficient Loading** - ~800 KB preprocessed province data (vs 32 MB raw)
- **Post-Processing Effects** - Bloom effect via Three.js post-processing
- **5-Light System** - Directional, ambient, and spot lights for realistic illumination
- **Raycasting** - Efficient hover detection on 63 province meshes

## Technical Requirements

### Functional Requirements

- [ ] Render 63 Vietnamese provinces with accurate boundaries
- [ ] Support mouse, touch, keyboard, and hand gesture controls
- [ ] Provide simultaneous Vietnamese and English interfaces
- [ ] Display province tooltips with administrative/demographic data
- [ ] Show island territories (Hoàng Sa, Trường Sa) with visual distinction
- [ ] Implement zoom-to-cursor and camera animation
- [ ] Handle real-time hand tracking (optional feature flag)
- [ ] Responsive design for desktop (1920x1080) and mobile (375x667)

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
- **Linting** - ESLint

## Acceptance Criteria

### MVP (Minimum Viable Product)

- [x] Render all 63 provinces with distinct colors
- [x] Support mouse and touch controls
- [x] Implement hover detection and province info display
- [x] Support Vietnamese and English languages
- [x] Responsive layout (desktop & mobile)
- [x] Deploy to production

### Phase 2 Enhancements

- [ ] Hand gesture control via MediaPipe
- [ ] Island territory visualization improvements
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
  "tsx": "4.19.2",
  "eslint": "9.x",
  "postcss": "8.4.x"
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
