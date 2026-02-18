import type { JamaatTimings } from "@/data/masjidData";

export type PrayerName = "fajr" | "zuhr" | "asr" | "maghrib" | "isha" | "juma";

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  zuhr: "Zuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  juma: "Jumu'ah",
};

const PRAYER_ORDER: PrayerName[] = ["fajr", "zuhr", "asr", "maghrib", "isha"];

/** Return the display prayer sequence for a given day. On Friday, Zuhr is replaced by Juma. */
export function getDayPrayerOrder(isFriday: boolean): PrayerName[] {
  if (isFriday) return ["fajr", "juma", "asr", "maghrib", "isha"];
  return [...PRAYER_ORDER];
}

/** Get the effective jamaat time for a prayer, using juma time on Fridays for the zuhr slot. */
export function getEffectiveTime(timings: JamaatTimings, prayer: PrayerName): string {
  if (prayer === "juma") return timings.juma;
  return timings[prayer];
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function getNextPrayer(
  timings: JamaatTimings,
  now: Date,
  friday?: boolean
): { prayer: PrayerName; timeStr: string; minutesRemaining: number } | null {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const isFri = friday ?? now.getDay() === 5;
  const order = getDayPrayerOrder(isFri);

  for (const prayer of order) {
    const timeStr = getEffectiveTime(timings, prayer);
    const prayerMins = timeToMinutes(timeStr);
    if (prayerMins > nowMins) {
      return {
        prayer,
        timeStr,
        minutesRemaining: prayerMins - nowMins,
      };
    }
  }

  // After Isha → next day Fajr
  const fajrMins = timeToMinutes(timings.fajr);
  const remaining = 24 * 60 - nowMins + fajrMins;
  return { prayer: "fajr", timeStr: timings.fajr, minutesRemaining: remaining };
}

export function canReachBeforeJamaat(
  travelMinutes: number,
  jamaatTimeStr: string,
  now: Date
): "can_reach" | "arriving_late" | "passed" {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const jamaatMins = timeToMinutes(jamaatTimeStr);

  if (jamaatMins <= nowMins) return "passed";
  if (nowMins + travelMinutes <= jamaatMins) return "can_reach";
  return "arriving_late";
}

export function getNextPrayerGlobal(
  allTimings: JamaatTimings[],
  now: Date,
  friday?: boolean
): { prayer: PrayerName; timeStr: string; minutesRemaining: number } {
  let best: { prayer: PrayerName; timeStr: string; minutesRemaining: number } | null = null;

  for (const timings of allTimings) {
    const next = getNextPrayer(timings, now, friday);
    if (next && (!best || next.minutesRemaining < best.minutesRemaining)) {
      best = next;
    }
  }

  return best || { prayer: "fajr", timeStr: "05:30", minutesRemaining: 0 };
}
