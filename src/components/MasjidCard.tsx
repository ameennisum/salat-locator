import { MapPin, Navigation, Clock, Footprints, Car } from "lucide-react";
import type { Masjid } from "@/data/masjidData";
import { formatTime12h, getNextPrayer, PRAYER_LABELS, canReachBeforeJamaat, getDayPrayerOrder, getEffectiveTime } from "@/utils/prayerUtils";
import { estimateTravelMinutes, getGoogleMapsUrl, type UserLocation } from "@/utils/locationUtils";
import { getMaghribTime, isFriday } from "@/utils/sunsetUtils";

interface MasjidCardProps {
  masjid: Masjid;
  distance: number;
  userLocation: UserLocation;
  now: Date;
}

export default function MasjidCard({ masjid, distance, userLocation, now }: MasjidCardProps) {
  const walkMins = estimateTravelMinutes(distance, "walking");
  const driveMins = estimateTravelMinutes(distance, "driving");

  // Inject computed Maghrib time
  const maghrib = getMaghribTime(masjid.lat, masjid.lng, now);
  const timingsWithMaghrib = { ...masjid.timings, maghrib };

  const friday = isFriday(now);
  const nextPrayer = getNextPrayer(timingsWithMaghrib, now, friday);

  const reachStatus = nextPrayer
    ? canReachBeforeJamaat(driveMins, nextPrayer.timeStr, now)
    : "passed";

  const navigateUrl = getGoogleMapsUrl(userLocation, masjid.lat, masjid.lng);
  const dayPrayers = getDayPrayerOrder(friday);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-bold text-card-foreground leading-tight truncate">
            {masjid.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{masjid.area} · {distance} km</span>
          </div>
        </div>
        <ReachBadge status={reachStatus} />
      </div>

      {/* Next prayer info */}
      {nextPrayer && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Clock className="h-3.5 w-3.5 text-accent" />
          <span className="font-medium text-card-foreground">
            {PRAYER_LABELS[nextPrayer.prayer]}
          </span>
          <span className="text-muted-foreground">
            at {formatTime12h(nextPrayer.timeStr)}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {nextPrayer.minutesRemaining} min left
          </span>
        </div>
      )}

      {/* Travel estimates */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Footprints className="h-3 w-3" /> {walkMins} min walk
        </span>
        <span className="flex items-center gap-1">
          <Car className="h-3 w-3" /> {driveMins} min drive
        </span>
      </div>

      {/* Jamaat timings row */}
      <div className="mt-3 grid grid-cols-5 gap-1">
        {dayPrayers.map((p) => (
          <div
            key={p}
            className={`text-center rounded-lg py-1.5 text-[10px] ${
              nextPrayer?.prayer === p
                ? "bg-primary/10 text-primary font-semibold"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <div className="uppercase tracking-wide">{PRAYER_LABELS[p].slice(0, 3)}</div>
            <div className="font-medium mt-0.5">{formatTime12h(getEffectiveTime(timingsWithMaghrib, p))}</div>
          </div>
        ))}
      </div>

      {/* Jumu'ah reference (always shown on non-Friday) */}
      {!friday && (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <span>🕌</span>
          <span>Jumu'ah: {formatTime12h(masjid.timings.juma)}</span>
        </div>
      )}

      {/* Navigate button */}
      <a
        href={navigateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium active:scale-[0.98] transition-transform"
      >
        <Navigation className="h-4 w-4" />
        Navigate
      </a>
    </div>
  );
}

function ReachBadge({ status }: { status: "can_reach" | "arriving_late" | "passed" }) {
  if (status === "can_reach") {
    return (
      <span className="shrink-0 rounded-full bg-success/15 text-success text-[11px] font-semibold px-2.5 py-0.5">
        Can Reach
      </span>
    );
  }
  if (status === "arriving_late") {
    return (
      <span className="shrink-0 rounded-full bg-warning/15 text-warning text-[11px] font-semibold px-2.5 py-0.5">
        Arriving Late
      </span>
    );
  }
  return null;
}
