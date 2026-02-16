import { useState, useEffect, useMemo } from "react";
import PrayerCountdown from "@/components/PrayerCountdown";
import SearchBar from "@/components/SearchBar";
import MasjidCard from "@/components/MasjidCard";
import LocationBar from "@/components/LocationBar";
import { masjidData } from "@/data/masjidData";
import {
  DEFAULT_LOCATION,
  requestLocation,
  calculateDistance,
  estimateTravelMinutes,
  type UserLocation,
} from "@/utils/locationUtils";
import { getNextPrayer, canReachBeforeJamaat } from "@/utils/prayerUtils";

export default function Index() {
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [hasLocation, setHasLocation] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());

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
    const filtered = masjidData.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.area.toLowerCase().includes(query) ||
        m.address.toLowerCase().includes(query)
    );

    return filtered
      .map((m) => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, m.lat, m.lng);
        const driveMins = estimateTravelMinutes(distance, "driving");
        const nextP = getNextPrayer(m.timings, now);
        const reachable = nextP
          ? canReachBeforeJamaat(driveMins, nextP.timeStr, now)
          : "passed";
        return { masjid: m, distance, reachable };
      })
      .sort((a, b) => {
        // Reachable first
        const order = { can_reach: 0, arriving_late: 1, passed: 2 };
        const diff = order[a.reachable] - order[b.reachable];
        if (diff !== 0) return diff;
        return a.distance - b.distance;
      });
  }, [search, userLocation, now]);

  return (
    <div className="min-h-screen bg-background pb-8">
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
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🕌</span>
          </div>
        </div>

        {/* Countdown */}
        <PrayerCountdown />

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          {sortedMasjids.length} masjid{sortedMasjids.length !== 1 ? "s" : ""} found
        </p>

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
