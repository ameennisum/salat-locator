import type { JamaatTimings } from "@/data/masjidData";

export type PrayerName = "fajr" | "zuhr" | "asr" | "maghrib" | "isha";

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  zuhr: "Zuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const PRAYER_ORDER: PrayerName[] = ["fajr", "zuhr", "asr", "maghrib", "isha"];

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
  now: Date
): { prayer: PrayerName; timeStr: string; minutesRemaining: number } | null {
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (const prayer of PRAYER_ORDER) {
    const prayerMins = timeToMinutes(timings[prayer]);
    if (prayerMins > nowMins) {
      return {
        prayer,
        timeStr: timings[prayer],
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
  now: Date
): { prayer: PrayerName; timeStr: string; minutesRemaining: number } {
  // Use the earliest next prayer across all masajid
  let best: { prayer: PrayerName; timeStr: string; minutesRemaining: number } | null = null;

  for (const timings of allTimings) {
    const next = getNextPrayer(timings, now);
    if (next && (!best || next.minutesRemaining < best.minutesRemaining)) {
      best = next;
    }
  }

  return best || { prayer: "fajr", timeStr: "05:30", minutesRemaining: 0 };
}
