import { useEffect, useState } from "react";
import type { Masjid } from "@/data/masjidData";
import { getNextPrayerGlobal, PRAYER_LABELS, formatTime12h } from "@/utils/prayerUtils";
import { getMaghribTime, isFriday } from "@/utils/sunsetUtils";

interface PrayerCountdownProps {
  masajid: Masjid[];
}

export default function PrayerCountdown({ masajid }: PrayerCountdownProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Inject computed Maghrib into all timings
  const friday = isFriday(now);
  const allTimings = masajid.map((m) => ({
    ...m.timings,
    maghrib: getMaghribTime(m.lat, m.lng, now),
  }));
  const next = getNextPrayerGlobal(allTimings, now, friday);

  const totalSeconds = Math.max(0, next.minutesRemaining * 60 - now.getSeconds());
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return (
    <div className="bg-primary islamic-pattern rounded-2xl p-5 text-primary-foreground shadow-lg">
      <div className="text-center">
        <p className="text-sm font-medium opacity-80 tracking-wide uppercase">Next Prayer</p>
        <h2 className="text-3xl font-serif font-bold mt-1">
          {PRAYER_LABELS[next.prayer]}
        </h2>
        <p className="text-sm opacity-80 mt-1">Jamaat at {formatTime12h(next.timeStr)}</p>
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
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
}
