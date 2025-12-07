# Contributing to Vietnam 3D Map

Thank you for your interest in contributing to Vietnam 3D Map! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/vietnam-3d-map.git
   cd vietnam-3d-map
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open <http://localhost:3000>

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/` - New features (e.g., `feat/add-search-functionality`)
- `fix/` - Bug fixes (e.g., `fix/province-hover-state`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-rendering`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<type>: <description>

[optional body]
```

Types:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding tests
- `chore` - Maintenance tasks

Examples:

```bash
feat: add province search functionality
fix: correct hover state on mobile devices
docs: update installation instructions
```

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Run linter
pnpm lint

# Format code
pnpm format

# Check and fix both
pnpm check
```

## Project Structure

```bash
src/
├── app/                    # Next.js App Router pages
│   └── [locale]/          # Internationalized routes
├── components/
│   ├── map/               # 3D map components (Three.js/R3F)
│   └── ui/                # UI components (React)
├── hooks/                 # Custom React hooks
│   ├── useHandTracking.ts # MediaPipe hand gesture detection
│   ├── useDraggable.ts    # Drag-and-drop positioning
│   ├── useUIState.ts      # localStorage state persistence
│   └── useClickOutside.ts # Click outside detection
├── i18n/                  # Internationalization
│   ├── config.ts          # Locale configuration
│   ├── dictionaries.ts    # Translation strings
│   └── province-names.ts  # Province name translations
├── data/                  # Static data files
└── types/                 # TypeScript type definitions
```

## Adding Translations

### UI Translations

Edit `src/i18n/dictionaries.ts`:

```typescript
const vi: Dictionary = {
  // Add Vietnamese translations
};

const en: Dictionary = {
  // Add English translations
};
```

### Province Names

Edit `src/i18n/province-names.ts` to add or update province name translations.

## Working with GeoJSON Data

### Province Data

- Source: `data/vietnam-provinces.geojson`
- Run preprocessing: `pnpm preprocess`
- Output: `public/provinces.json`

### Ward Data

- Source: `data/vietnam-wards.geojson` (not in repo, ~276MB)
- Run preprocessing: `pnpm preprocess:wards`
- Output: `public/wards/{provinceId}.json`

## Working with Hand Tracking

### Overview

Hand tracking uses MediaPipe Hands to detect gestures via webcam. The main hook is `useHandTracking.ts`.

### Adding New Gestures

1. Add gesture type to `GestureType` union in `useHandTracking.ts`:

   ```typescript
   export type GestureType =
     | 'none'
     | 'palm-rotate'
     | 'your-new-gesture'  // Add here
     // ...
   ```

2. Add detection logic in `detectGesture()` function:

   ```typescript
   // Check finger count and positions
   if (extendedFingers === 3 && someCondition) {
     return 'your-new-gesture';
   }
   ```

3. Add state fields to `HandGestureState` if needed:

   ```typescript
   interface HandGestureState {
     // ...
     yourNewAction: boolean;
   }
   ```

4. Handle the gesture in `MapWrapper.tsx` or `CameraController.tsx`

5. Update `HandTrackingVideo.tsx` with icon and color:

   ```typescript
   const GESTURE_CONFIG = {
     'your-new-gesture': { icon: YourIcon, label: 'Label', color: 'bg-color-500' },
   };
   ```

6. Add translations to `dictionaries.ts` under `controls` section

7. Update documentation:
   - `docs/hand-gesture-guide.md` (EN & VI)
   - `README.md` Controls section
   - `docs/components-hooks-analysis.md`

### Gesture Detection Tips

- Use `countExtendedFingers()` to count raised fingers
- Use `isThumbExtended()` to differentiate pinch from peace sign
- For two-hand gestures, check `twoHandDist` to ensure hands are apart
- Add confidence threshold for stability

## Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Ensure code passes linting: `pnpm check`
4. Ensure build succeeds: `pnpm build`
5. Commit with a descriptive message
6. Push to your fork
7. Open a Pull Request

### PR Title Format

Use the same format as commit messages:

```bash
feat: add province search functionality
```

### PR Description

Include:

- **Summary**: Brief description of changes
- **Changes**: List of specific modifications
- **Test plan**: How to verify the changes work

## Reporting Issues

When reporting issues, please include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/device information
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
