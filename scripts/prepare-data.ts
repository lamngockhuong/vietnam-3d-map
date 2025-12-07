#!/usr/bin/env npx tsx
/**
 * Vietnam Map Data Preparation Pipeline
 *
 * This is the master script that orchestrates the entire data pipeline:
 * 1. Fetch metadata from API (optional, skip if already exists)
 * 2. Generate merger-data.ts for Legend component
 * 3. Copy ward metadata to public folder
 * 4. Merge metadata with GeoJSON boundaries
 * 5. Preprocess provinces (simplify polygons)
 * 6. Preprocess wards (simplify polygons)
 *
 * Usage:
 *   npx tsx scripts/prepare-data.ts [options]
 *
 * Options:
 *   --fetch      Force fetch fresh data from API
 *   --skip-wards Skip ward preprocessing (faster)
 *   --help       Show help
 *
 * Prerequisites:
 *   - data/vietnam-provinces.geojson (32 MB) - Province boundaries
 *   - data/vietnam-wards.geojson (276 MB) - Ward boundaries (optional for wards)
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const forceFetch = args.includes("--fetch");
const skipWards = args.includes("--skip-wards");
const showHelp = args.includes("--help") || args.includes("-h");

if (showHelp) {
  console.log(`
Vietnam Map Data Preparation Pipeline

Usage: npx tsx scripts/prepare-data.ts [options]

Options:
  --fetch      Force fetch fresh data from API
  --skip-wards Skip ward preprocessing (faster)
  --help       Show this help message

Prerequisites:
  - data/vietnam-provinces.geojson (32 MB) - Province boundaries
  - data/vietnam-wards.geojson (276 MB) - Ward boundaries (optional)

Output:
  - public/provinces.json - Preprocessed province data (~570 KB)
  - public/wards/*.json - Preprocessed ward data (~9.4 MB total)
  - src/data/provinces-data.ts - TypeScript types
  - src/data/merger-data.ts - Province merger info for Legend
  `);
  process.exit(0);
}

// Paths
const dataDir = path.join(__dirname, "../data");
const publicDir = path.join(__dirname, "../public");
const provincesGeoJson = path.join(dataDir, "vietnam-provinces.geojson");
const wardsGeoJson = path.join(dataDir, "vietnam-wards.geojson");
const metadataPath = path.join(dataDir, "provinces-metadata.json");
const wardsMetadataDir = path.join(dataDir, "wards-metadata");
const publicWardsMetadataDir = path.join(publicDir, "wards-metadata");

/**
 * Run a script and wait for completion
 */
function runScript(scriptPath: string, description: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`${description}`);
    console.log(`${"=".repeat(60)}\n`);

    const child = spawn("npx", ["tsx", scriptPath], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} failed with code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

/**
 * Copy ward metadata files to public folder
 */
function copyWardsMetadata(): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log("Copying ward metadata to public folder...");
  console.log(`${"=".repeat(60)}\n`);

  // Create target directory
  if (!fs.existsSync(publicWardsMetadataDir)) {
    fs.mkdirSync(publicWardsMetadataDir, { recursive: true });
  }

  // Copy all JSON files
  const files = fs.readdirSync(wardsMetadataDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    fs.copyFileSync(
      path.join(wardsMetadataDir, file),
      path.join(publicWardsMetadataDir, file)
    );
  }
  console.log(`✅ Copied ${files.length} ward metadata files`);
}

/**
 * Check prerequisites
 */
function checkPrerequisites(): boolean {
  console.log("Checking prerequisites...\n");

  let allGood = true;

  // Check provinces GeoJSON
  if (fs.existsSync(provincesGeoJson)) {
    const size = fs.statSync(provincesGeoJson).size;
    console.log(
      `✅ vietnam-provinces.geojson (${(size / 1024 / 1024).toFixed(1)} MB)`
    );
  } else {
    console.log("❌ vietnam-provinces.geojson - MISSING");
    console.log("   Download from: https://gis.vn/ban-do-hanh-chinh-viet-nam");
    allGood = false;
  }

  // Check wards GeoJSON (optional)
  if (fs.existsSync(wardsGeoJson)) {
    const size = fs.statSync(wardsGeoJson).size;
    console.log(
      `✅ vietnam-wards.geojson (${(size / 1024 / 1024).toFixed(1)} MB)`
    );
  } else {
    console.log(`⚠️  vietnam-wards.geojson - MISSING (optional for wards)`);
    if (!skipWards) {
      console.log("   Use --skip-wards to skip ward preprocessing");
    }
  }

  // Check metadata (can be fetched)
  if (fs.existsSync(metadataPath)) {
    console.log("✅ provinces-metadata.json (from API)");
  } else {
    console.log("⚠️  provinces-metadata.json - Will fetch from API");
  }

  return allGood;
}

/**
 * Main pipeline
 */
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         Vietnam Map Data Preparation Pipeline                ║
╚══════════════════════════════════════════════════════════════╝
`);

  // Check prerequisites
  if (!checkPrerequisites()) {
    console.error(
      "\n❌ Missing required files. Please check prerequisites above."
    );
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    // Step 1: Fetch metadata from API (if needed)
    if (forceFetch || !fs.existsSync(metadataPath)) {
      await runScript(
        path.join(__dirname, "fetch-data.ts"),
        "Step 1/6: Fetching metadata from API..."
      );
    } else {
      console.log(`\n${"=".repeat(60)}`);
      console.log("Step 1/6: Skipping API fetch (metadata exists)");
      console.log(`${"=".repeat(60)}`);
      console.log("Use --fetch to force fresh data");
    }

    // Step 2: Generate merger-data.ts for Legend component
    if (fs.existsSync(metadataPath)) {
      await runScript(
        path.join(__dirname, "generate-merger-data.ts"),
        "Step 2/6: Generating merger-data.ts for Legend..."
      );
    } else {
      console.log(`\n${"=".repeat(60)}`);
      console.log("Step 2/6: Skipping merger-data generation (no metadata)");
      console.log(`${"=".repeat(60)}`);
    }

    // Step 3: Copy ward metadata to public folder
    if (fs.existsSync(wardsMetadataDir)) {
      copyWardsMetadata();
    } else {
      console.log(`\n${"=".repeat(60)}`);
      console.log("Step 3/6: Skipping ward metadata copy (no metadata)");
      console.log(`${"=".repeat(60)}`);
    }

    // Step 4: Merge metadata with GeoJSON (optional enhancement)
    if (fs.existsSync(metadataPath)) {
      await runScript(
        path.join(__dirname, "merge-data.ts"),
        "Step 4/6: Merging metadata with GeoJSON..."
      );
    } else {
      console.log(`\n${"=".repeat(60)}`);
      console.log("Step 4/6: Skipping merge (no metadata)");
      console.log(`${"=".repeat(60)}`);
    }

    // Step 5: Preprocess provinces
    await runScript(
      path.join(__dirname, "preprocess-geojson.ts"),
      "Step 5/6: Preprocessing province boundaries..."
    );

    // Step 6: Preprocess wards (if not skipped and file exists)
    if (!skipWards && fs.existsSync(wardsGeoJson)) {
      await runScript(
        path.join(__dirname, "preprocess-wards.ts"),
        "Step 6/6: Preprocessing ward boundaries..."
      );
    } else {
      console.log(`\n${"=".repeat(60)}`);
      console.log("Step 6/6: Skipping ward preprocessing");
      console.log(`${"=".repeat(60)}`);
      if (skipWards) {
        console.log("(--skip-wards flag provided)");
      } else {
        console.log("(vietnam-wards.geojson not found)");
      }
    }

    // Done!
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Pipeline Complete!                        ║
╚══════════════════════════════════════════════════════════════╝

Time elapsed: ${elapsed}s

Output files:
  📁 public/provinces.json        - Province boundaries
  📁 public/wards/*.json          - Ward boundaries (per province)
  📁 public/wards-metadata/*.json - Ward metadata (for Legend)
  📁 src/data/provinces-data.ts   - TypeScript types
  📁 src/data/merger-data.ts      - Province merger info for Legend

Next steps:
  1. Run 'pnpm dev' to start the development server
  2. Visit http://localhost:3000 to see the map
`);
  } catch (error) {
    console.error("\n❌ Pipeline failed:", error);
    process.exit(1);
  }
}

main();
