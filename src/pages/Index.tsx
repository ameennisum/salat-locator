import { useState, useEffect, useMemo, useRef } from "react";
import PrayerCountdown from "@/components/PrayerCountdown";
import SearchBar from "@/components/SearchBar";
import MasjidCard from "@/components/MasjidCard";
import LocationBar from "@/components/LocationBar";
import { useMasjidData } from "@/hooks/useMasjidData";
import {
  DEFAULT_LOCATION,
  requestLocation,
  calculateDistance,
  estimateTravelMinutes,
  type UserLocation,
} from "@/utils/locationUtils";
import { getNextPrayer, canReachBeforeJamaat } from "@/utils/prayerUtils";
import { getMaghribTime, isFriday } from "@/utils/sunsetUtils";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Index() {
  const { masajid, isOnline, isSyncing } = useMasjidData();
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [hasLocation, setHasLocation] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"smart" | "time" | "distance">("smart");
  const [now, setNow] = useState(new Date());

  // (connectivity toast removed — using sticky bar instead)

  // Update time every 30s for card re-sorting
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Request location on mount
  useEffect(() => {
    refreshLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshLocation() {
    setLocLoading(true);
    requestLocation()
      .then((loc) => {
        setUserLocation(loc);
        setHasLocation(true);
      })
      .catch(() => {
        setHasLocation(false);
      })
      .finally(() => setLocLoading(false));
  }

  const sortedMasjids = useMemo(() => {
    const query = search.toLowerCase();
    const filtered = masajid.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.area.toLowerCase().includes(query) ||
        m.address.toLowerCase().includes(query)
    );

    return filtered
      .map((m) => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, m.lat, m.lng);
        const driveMins = estimateTravelMinutes(distance, "driving");
        const maghrib = getMaghribTime(m.lat, m.lng, now);
        const timingsWithMaghrib = { ...m.timings, maghrib };
        const friday = isFriday(now);
        const nextP = getNextPrayer(timingsWithMaghrib, now, friday);
        const reachable = nextP
          ? canReachBeforeJamaat(driveMins, nextP.timeStr, now)
          : "passed";
        const nextMins = nextP?.minutesRemaining ?? Infinity;
        return { masjid: m, distance, reachable, nextMins };
      })
      .sort((a, b) => {
        if (sortBy === "distance") return a.distance - b.distance;
        if (sortBy === "time") {
          return a.nextMins - b.nextMins;
        }
        // smart: reachability first, then distance
        const order = { can_reach: 0, arriving_late: 1, passed: 2 };
        const diff = order[a.reachable] - order[b.reachable];
        if (diff !== 0) return diff;
        return a.distance - b.distance;
      });
  }, [search, masajid, userLocation, now, sortBy]);

  return (
    <div className="min-h-screen bg-background pb-8">
      {!isOnline && (
        <div className="sticky top-0 z-50 bg-destructive text-destructive-foreground text-center text-xs font-medium py-2">
          <WifiOff className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          No Internet Connection
        </div>
      )}
      <div className="mx-auto max-w-md px-4 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Masjid Near Me
            </h1>
            <LocationBar
              hasLocation={hasLocation}
              loading={locLoading}
              onRefresh={refreshLocation}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Connectivity indicator */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isSyncing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : isOnline ? (
                <Wifi className="h-3.5 w-3.5 text-success" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-warning" />
              )}
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🕌</span>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <PrayerCountdown masajid={masajid} />

        {/* Sticky Search & Sort */}
        <div className="sticky top-0 z-30 bg-background pb-2 -mx-4 px-4 pt-2 space-y-2">
          <SearchBar value={search} onChange={setSearch} />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {sortedMasjids.length} masjid{sortedMasjids.length !== 1 ? "s" : ""} found
            </p>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "smart" | "time" | "distance")}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smart">Smart Sort</SelectItem>
                <SelectItem value="time">Next Prayer</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Masjid List */}
        <div className="space-y-3">
          {sortedMasjids.map(({ masjid, distance }) => (
            <MasjidCard
              key={masjid.id}
              masjid={masjid}
              distance={distance}
              userLocation={userLocation}
              now={now}
            />
          ))}
          {sortedMasjids.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No masajid found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
