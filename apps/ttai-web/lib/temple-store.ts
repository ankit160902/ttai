// Multi-temple file store — 5 temples with ~1.5 lakh rows each.
//
// Storage backends:
//   - Development (NODE_ENV !== 'production'): local filesystem at data/temples/
//   - Production  (NODE_ENV === 'production'): Google Cloud Storage bucket
//
// On first boot, generates all 5 temples from TEMPLE_PROFILES using
// the large-scale generator and writes them to the storage backend.
// After that, all reads go through the in-memory cache.

import { promises as fs } from 'fs';
import path from 'path';
import type { Temple } from './temple-types';
import { TEMPLE_PROFILES, generateLargeTempleData, getRowCounts } from './mock-data';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const GCS_BUCKET = process.env.GCS_BUCKET_NAME;
const LOCAL_DATA_DIR = path.join(process.cwd(), 'data', 'temples');

let cache: Map<string, Temple> | null = null;
let initPromise: Promise<void> | null = null;

// ─── Storage abstraction ───────────────────────────────────

async function storageWrite(templeId: string, data: string): Promise<void> {
  if (IS_PRODUCTION && GCS_BUCKET) {
    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage();
    const file = storage.bucket(GCS_BUCKET).file(`temples/${templeId}.json`);
    await file.save(data, { contentType: 'application/json' });
  } else {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DATA_DIR, `${templeId}.json`), data, 'utf-8');
  }
}

async function storageReadAll(): Promise<Temple[]> {
  if (IS_PRODUCTION && GCS_BUCKET) {
    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage();
    const [files] = await storage.bucket(GCS_BUCKET).getFiles({ prefix: 'temples/' });
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));
    const temples = await Promise.all(
      jsonFiles.map(async (file) => {
        const [content] = await file.download();
        return JSON.parse(content.toString()) as Temple;
      })
    );
    return temples;
  } else {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
    const entries = await fs.readdir(LOCAL_DATA_DIR);
    const jsonFiles = entries.filter(f => f.endsWith('.json'));
    const temples = await Promise.all(
      jsonFiles.map(async (file) => {
        const raw = await fs.readFile(path.join(LOCAL_DATA_DIR, file), 'utf-8');
        return JSON.parse(raw) as Temple;
      })
    );
    return temples;
  }
}

async function storageHasData(): Promise<boolean> {
  if (IS_PRODUCTION && GCS_BUCKET) {
    try {
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage();
      const [files] = await storage.bucket(GCS_BUCKET).getFiles({ prefix: 'temples/', maxResults: 1 });
      return files.length > 0;
    } catch {
      return false;
    }
  } else {
    try {
      await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
      const entries = await fs.readdir(LOCAL_DATA_DIR);
      return entries.some(f => f.endsWith('.json'));
    } catch {
      return false;
    }
  }
}

// ─── Core store logic ──────────────────────────────────────

async function writeTempleFile(temple: Temple): Promise<void> {
  await storageWrite(temple.id, JSON.stringify(temple));
}

async function seedIfEmpty(): Promise<void> {
  const hasData = await storageHasData();
  if (hasData) return;

  const backend = IS_PRODUCTION && GCS_BUCKET ? `gs://${GCS_BUCKET}/temples/` : LOCAL_DATA_DIR;
  console.log(`[temple-store] Generating 5 temples → ${backend}`);
  const start = Date.now();

  for (const profile of TEMPLE_PROFILES) {
    console.log(`  Generating ${profile.name}...`);
    const temple = generateLargeTempleData(profile);
    const counts = getRowCounts(temple);
    console.log(`  → ${counts['TOTAL']?.toLocaleString('en-IN')} rows`);
    await writeTempleFile(temple);
  }

  console.log(`[temple-store] Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

async function init(): Promise<void> {
  await seedIfEmpty();
  const all = await storageReadAll();
  cache = new Map(all.map((t) => [t.id, t]));
  console.log(`[temple-store] Loaded ${cache.size} temples into memory`);
}

async function ready(): Promise<Map<string, Temple>> {
  if (!cache) {
    if (!initPromise) initPromise = init();
    await initPromise;
  }
  return cache!;
}

export async function getAllTemples(): Promise<Temple[]> {
  const map = await ready();
  return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export async function getTemple(id: string): Promise<Temple | undefined> {
  const map = await ready();
  return map.get(id);
}

export async function getTempleSummaries(): Promise<Array<{
  id: string;
  name: string;
  deity: string;
  city: string;
  state: string;
  totalRows: number;
  devoteeCount: number;
  monthlyDonationsINR: number;
}>> {
  const all = await getAllTemples();
  return all.map(t => {
    const counts = getRowCounts(t);
    return {
      id: t.id,
      name: t.name,
      deity: t.deity,
      city: t.city,
      state: t.state,
      totalRows: counts['TOTAL'] ?? 0,
      devoteeCount: t.stats.devoteeCount,
      monthlyDonationsINR: t.stats.monthlyDonationsINR,
    };
  });
}

export async function writeAndCacheTemple(temple: Temple): Promise<void> {
  const map = await ready();
  await writeTempleFile(temple);
  map.set(temple.id, temple);
}
