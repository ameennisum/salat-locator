import { openDB, type IDBPDatabase } from "idb";
import type { Masjid, JamaatTimings } from "@/data/masjidData";

const DB_NAME = "masjid-near-me";
const DB_VERSION = 1;
const STORE_NAME = "masajid";
const META_STORE = "meta";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/164JfTdOQxdw3AZecHjEHEKfFN-dGkHSIEE0zi2xZICQ/export?format=csv";

// ─── IndexedDB helpers ───────────────────────────────────────

async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    },
  });
}

export async function getCachedMasajid(): Promise<Masjid[]> {
  try {
    const db = await getDb();
    return await db.getAll(STORE_NAME);
  } catch {
    return [];
  }
}

async function saveMasajid(masajid: Masjid[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([STORE_NAME, META_STORE], "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const meta = tx.objectStore(META_STORE);

  // Clear old data and insert new
  await store.clear();
  for (const m of masajid) {
    await store.put(m);
  }
  await meta.put(Date.now(), "lastSync");
  await tx.done;
}

export async function getLastSyncTime(): Promise<number | null> {
  try {
    const db = await getDb();
    return (await db.get(META_STORE, "lastSync")) ?? null;
  } catch {
    return null;
  }
}

// ─── CSV parsing ─────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Convert short time like "1:45" to 24h "13:45".
 * Fajr is always AM; zuhr/asr/maghrib/isha/juma are PM when hour < 12.
 */
function to24h(time: string, prayer: string): string {
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "00:00";

  const isPM = prayer !== "fajr" && h < 12;
  const hour24 = isPM ? h + 12 : h;
  return `${hour24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function csvToMasajid(csv: string): Masjid[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Skip header row
  const masajid: Masjid[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 11) continue;

    const [id, area, name, address, lng, lat, fajr, zuhr, asr, isha, juma] = cols;

    if (!id || !name) continue;

    const timings: JamaatTimings = {
      fajr: to24h(fajr, "fajr"),
      zuhr: to24h(zuhr, "zuhr"),
      asr: to24h(asr, "asr"),
      maghrib: "18:15", // Not in sheet — sensible Karachi default
      isha: to24h(isha, "isha"),
      juma: to24h(juma, "juma"),
    };

    masajid.push({
      id: id.trim(),
      name: name.trim(),
      area: area.trim(),
      address: address.trim(),
      lat: parseFloat(lat) || 24.86,
      lng: parseFloat(lng) || 67.0,
      timings,
    });
  }

  return masajid;
}

// ─── Network fetch ───────────────────────────────────────────

export async function fetchMasajidFromSheet(): Promise<Masjid[]> {
  const response = await fetch(SHEET_CSV_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const csv = await response.text();
  return csvToMasajid(csv);
}

// ─── Sync logic ──────────────────────────────────────────────

function masajidHash(masajid: Masjid[]): string {
  return JSON.stringify(masajid.map((m) => `${m.id}|${m.name}|${JSON.stringify(m.timings)}`));
}

/**
 * Fetch from sheet, compare with cached, save if changed.
 * Returns the latest data and whether it was updated.
 */
export async function syncMasajid(): Promise<{ data: Masjid[]; updated: boolean }> {
  const [cached, fetched] = await Promise.all([
    getCachedMasajid(),
    fetchMasajidFromSheet(),
  ]);

  if (fetched.length === 0) {
    return { data: cached, updated: false };
  }

  const changed = masajidHash(cached) !== masajidHash(fetched);

  if (changed) {
    await saveMasajid(fetched);
    return { data: fetched, updated: true };
  }

  return { data: cached.length ? cached : fetched, updated: false };
}
