import { useEffect, useState } from "react";
import type { Masjid } from "@/data/masjidData";
import {
  getNextPrayerGlobal,
  PRAYER_LABELS,
  formatTime12h,
} from "@/utils/prayerUtils";
import { getMaghribTime, isFriday } from "@/utils/sunsetUtils";

const ISLAMIC_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Ula",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul Qi'dah",
  "Dhul Hijjah",
];

function getIslamicDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = Number(parts.find((p) => p.type === "month")?.value ?? "1");
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${day} ${ISLAMIC_MONTHS[month - 1]} ${year} AH`;
}

async function extractIslamicDate(url) {
  try {
    // Fetch the HTML of the prayer time page
    const response = await fetch(url);
    const htmlText = await response.text();

    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const hijriDateElement = doc.querySelector(
      "body > header > div.newHeaderTop > div > div.hdrTopRight > ul > li:nth-child(3)",
    );

    if (hijriDateElement) {
      return hijriDateElement.textContent;
    }
  } catch (err) {
    console.error("Error extracting Islamic date:", err);
    return null;
  }
}

interface PrayerCountdownProps {
  masajid: Masjid[];
}

export default function PrayerCountdown({ masajid }: PrayerCountdownProps) {
  const [now, setNow] = useState(new Date());
  const [islamicDate1, setIslamicDate1] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchIslamicDate() {
      const date = await extractIslamicDate("https://jang.com.pk/prayer-time");
      setIslamicDate1(date);
    }

    fetchIslamicDate();
  }, []);

  // Inject computed Maghrib into all timings
  const friday = isFriday(now);
  const allTimings = masajid.map((m) => ({
    ...m.timings,
    maghrib: getMaghribTime(m.lat, m.lng, now),
  }));
  const next = getNextPrayerGlobal(allTimings, now, friday);

  const hours = Math.floor(next.minutesRemaining / 60);
  const mins = next.minutesRemaining % 60;
  const secs = 59 - now.getSeconds();

  return (
    <div className="bg-primary islamic-pattern rounded-2xl p-5 text-primary-foreground shadow-lg">
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium opacity-80 tracking-wide uppercase">
          Next Prayer
        </p>

        <p className="text-xs font-semibold text-right leading-left opacity-90">
          {islamicDate1 ?? "Loading..."}
        </p>
      </div>

      {/* Center Content */}
      <div className="mt-3 text-center">
        <h2 className="text-3xl font-serif font-bold">
          {PRAYER_LABELS[next.prayer]}
        </h2>

        <p className="text-sm opacity-80 mt-1">
          Jamaat at {formatTime12h(next.timeStr)}
        </p>

        <div className="mt-4 flex justify-center gap-3">
          <TimeBlock value={hours} label="Hours" />
          <span className="text-3xl font-bold animate-pulse-glow">:</span>
          <TimeBlock value={mins} label="Mins" />
          <span className="text-3xl font-bold animate-pulse-glow">:</span>
          <TimeBlock value={secs} label="Secs" />
        </div>
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold tabular-nums w-12 text-center">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        {label}
      </span>
    </div>
  );
}
