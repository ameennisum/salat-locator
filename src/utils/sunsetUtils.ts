import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

const CACHE_KEY = "maghrib_cache";

interface MaghribCacheEntry {
  date: string;
  lat: number;
  lng: number;
  maghrib24: string;
}

interface MaghribCache {
  entries: Record<string, MaghribCacheEntry>;
}

function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function loadCache(): MaghribCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : { entries: {} };
  } catch {
    return { entries: {} };
  }
}

function saveCache(cache: MaghribCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full — ignore
  }
}

function formatTime24(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Calculate Maghrib (sunset) time for a given lat/lng and date.
 * Uses adhan-js with Karachi calculation method.
 * Results are cached per day + location in localStorage for offline use.
 */
export function getMaghribTime(lat: number, lng: number, date: Date = new Date()): string {
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  const key = getCacheKey(lat, lng);
  const cache = loadCache();

  // Return cached if same day + location
  const cached = cache.entries[key];
  if (cached && cached.date === dateStr) {
    return cached.maghrib24;
  }

  // Calculate using adhan-js
  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.Karachi();
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  const maghrib24 = formatTime24(prayerTimes.maghrib);

  // Cache result
  cache.entries[key] = { date: dateStr, lat, lng, maghrib24 };

  // Prune old entries (keep only today's)
  for (const k of Object.keys(cache.entries)) {
    if (cache.entries[k].date !== dateStr) {
      delete cache.entries[k];
    }
  }

  saveCache(cache);
  return maghrib24;
}

/**
 * Check if today is Friday (Jumu'ah day).
 */
export function isFriday(date: Date = new Date()): boolean {
  return date.getDay() === 5;
}
