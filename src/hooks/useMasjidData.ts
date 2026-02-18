import { useState, useEffect, useCallback } from "react";
import type { Masjid } from "@/data/masjidData";
import { masjidData as fallbackData } from "@/data/masjidData";
import { getCachedMasajid, syncMasajid } from "@/lib/masjidStore";

interface UseMasjidDataReturn {
  masajid: Masjid[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncError: string | null;
}

export function useMasjidData(): UseMasjidDataReturn {
  const [masajid, setMasajid] = useState<Masjid[]>(fallbackData);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Track connectivity
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Load cached data immediately on mount
  useEffect(() => {
    getCachedMasajid().then((cached) => {
      if (cached.length > 0) {
        setMasajid(cached);
      }
    });
  }, []);

  // Background sync
  const doSync = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    setLastSyncError(null);
    try {
      const { data, updated } = await syncMasajid();
      if (updated && data.length > 0) {
        setMasajid(data);
      } else if (data.length > 0) {
        setMasajid(data);
      }
    } catch (err) {
      console.warn("Sync failed, using cached/fallback data", err);
      setLastSyncError("Could not sync — using offline data");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync on mount and when coming back online
  useEffect(() => {
    doSync();
  }, [doSync]);

  useEffect(() => {
    if (isOnline) doSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return { masajid, isOnline, isSyncing, lastSyncError };
}
