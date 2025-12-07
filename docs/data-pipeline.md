# Vietnam Map Data Pipeline

This document describes how to fetch, prepare, and update map data for the Vietnam 3D Map project.

## Overview

The project uses two types of data:

1. **GeoJSON Boundaries** - Province and ward polygon coordinates
2. **API Metadata** - Administrative information (area, population, merger history)

The data pipeline combines these sources and optimizes them for web rendering.

## Quick Start

```bash
# Run complete pipeline (recommended)
pnpm prepare-data

# Force fresh data from API
pnpm prepare-data --fetch

# Skip ward preprocessing (faster)
pnpm prepare-data --skip-wards
```

## Data Sources

### 1. GeoJSON Boundary Data

Province and ward boundaries in GeoJSON format:

| File | Size | Description |
|------|------|-------------|
| `data/vietnam-provinces.geojson` | 32 MB | 34 province boundaries |
| `data/vietnam-wards.geojson` | 276 MB | 3,321 ward boundaries (git ignored) |

**Source:** [Vietnam GIS Data](https://gis.vn/ban-do-hanh-chinh-viet-nam)

### 2. API Metadata

Administrative data from `sapnhap.bando.com.vn` (Vietnam 2025 administrative reorganization):

- 34 merged provinces
- 3,321 wards/communes
- Area, population, density
- Administrative center
- Merger history (which provinces were combined)

## Pipeline Scripts

### `pnpm prepare-data`

Master script that orchestrates the entire pipeline:

```bash
pnpm prepare-data [options]

Options:
  --fetch      Force fetch fresh data from API
  --skip-wards Skip ward preprocessing (faster)
  --help       Show help
```

### Individual Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `fetch-data.ts` | `pnpm fetch-data` | Fetch metadata from API |
| `generate-merger-data.ts` | `pnpm generate-merger-data` | Generate merger-data.ts for Legend |
| `merge-data.ts` | `pnpm merge-data` | Merge metadata with GeoJSON |
| `preprocess-geojson.ts` | `pnpm preprocess` | Preprocess province boundaries |
| `preprocess-wards.ts` | `pnpm preprocess:wards` | Preprocess ward boundaries |

## Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                            │
├─────────────────────────────────────────────────────────────┤
│  sapnhap.bando.com.vn API        data/vietnam-*.geojson     │
│  (metadata: area, population)    (boundaries: polygons)     │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             │
┌───────────────────────────────┐             │
│  Step 1: fetch-data.ts        │             │
│  ─────────────────────────    │             │
│  Output:                      │             │
│  • data/provinces-metadata.json│            │
│  • data/wards-metadata/*.json │             │
└───────────────┬───────────────┘             │
                │                             │
                ▼                             │
┌───────────────────────────────┐             │
│  Step 2: generate-merger-data │             │
│  ─────────────────────────    │             │
│  Output:                      │             │
│  • src/data/merger-data.ts    │             │
│    (province merger info)     │             │
└───────────────┬───────────────┘             │
                │                             │
                ▼                             │
┌───────────────────────────────┐             │
│  Step 3: copy wards-metadata  │             │
│  ─────────────────────────    │             │
│  Output:                      │             │
│  • public/wards-metadata/*.json│            │
│    (ward merger info, runtime)│             │
└───────────────┬───────────────┘             │
                │                             │
                ▼                             │
┌───────────────────────────────┐             │
│  Step 4: merge-data.ts        │◄────────────┘
│  ─────────────────────────    │
│  Combines metadata + GeoJSON  │
│  Output:                      │
│  • data/vietnam-provinces-    │
│    merged.geojson             │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  Step 5: preprocess-geojson.ts│
│  ─────────────────────────────│
│  Douglas-Peucker simplification│
│  97.7% polygon reduction      │
│  Output:                      │
│  • public/provinces.json      │
│    (~570 KB)                  │
│  • src/data/provinces-data.ts │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  Step 6: preprocess-wards.ts  │
│  ─────────────────────────────│
│  Groups by province           │
│  ~96% polygon reduction       │
│  Output:                      │
│  • public/wards/*.json        │
│    (34 files, ~9.4 MB total)  │
└───────────────────────────────┘
```

## Output Files

### Production Files (in `public/`)

| File | Size | Description |
|------|------|-------------|
| `provinces.json` | ~570 KB | Preprocessed province data |
| `wards/01.json` | varies | Hà Nội wards |
| `wards/79.json` | varies | TP. Hồ Chí Minh wards |
| ... | ... | 34 province ward files |
| `wards-metadata/*.json` | varies | Ward merger info (loaded at runtime) |

### Intermediate Files (in `data/`)

| File | Description |
|------|-------------|
| `provinces-metadata.json` | Province metadata from API |
| `wards-metadata/*.json` | Ward metadata per province |
| `vietnam-provinces-merged.geojson` | GeoJSON with merged metadata |

### TypeScript Types (in `src/data/`)

| File | Description |
|------|-------------|
| `provinces-data.ts` | Province types and loader |
| `wards-data.ts` | Ward types and lazy loader |
| `merger-data.ts` | Province/ward merger info for Legend (province data auto-generated, ward data loaded at runtime) |

## API Reference

### Province List Endpoint

```bash
curl 'https://sapnhap.bando.com.vn/pcotinh' \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw 'id=0'
```

Response fields:

- `id` - Internal ID (1-34)
- `mahc` - Administrative code
- `tentinh` - Province name
- `dientichkm2` - Area in km²
- `dansonguoi` - Population
- `kinhdo`, `vido` - Longitude, latitude
- `truocsapnhap` - Before merger info
- `con` - Administrative units count

### Ward Details Endpoint

```bash
curl 'https://sapnhap.bando.com.vn/ptracuu' \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw 'id={provinceId}'
```

Response fields:

- `ma` - Ward code
- `tenhc` - Ward name
- `loai` - Type (xã, phường, thị trấn)
- `dientichkm2` - Area in km²
- `dansonguoi` - Population
- `kinhdo`, `vido` - Longitude, latitude

## Updating Data

### Update from API (metadata changes)

```bash
pnpm prepare-data --fetch
```

### Update GeoJSON boundaries only

```bash
# Replace the GeoJSON files, then:
pnpm preprocess        # Provinces only
pnpm preprocess:wards  # Wards only
```

### Full refresh

```bash
pnpm prepare-data --fetch
```

## Troubleshooting

### Missing GeoJSON files

```text
❌ vietnam-provinces.geojson - MISSING
```

Download from [Vietnam GIS Data](https://gis.vn/ban-do-hanh-chinh-viet-nam) and place in `data/` directory.

### API fetch fails

Check network connectivity. The API may have rate limits - the script includes 500ms delays between requests.

### Ward data not loading

Ward GeoJSON is large (276 MB) and git-ignored. You may need to obtain it separately or use `--skip-wards` flag.

## Performance Notes

- Province data: ~570 KB (97.7% reduction from 32 MB)
- Ward data: ~9.4 MB total (96% reduction from 276 MB)
- Ward files are loaded on-demand per province
- Douglas-Peucker tolerance: 0.008° (~800m) for provinces, 0.0005° (~50m) for wards
