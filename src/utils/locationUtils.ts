// Default: central Karachi
export const DEFAULT_LOCATION = { lat: 24.8607, lng: 67.0011 };

export interface UserLocation {
  lat: number;
  lng: number;
}

export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Walking ~5 km/h, Driving ~25 km/h (Karachi traffic)
export function estimateTravelMinutes(distanceKm: number, mode: "walking" | "driving"): number {
  const speed = mode === "walking" ? 5 : 25;
  return Math.ceil((distanceKm / speed) * 60);
}

export function getGoogleMapsUrl(
  origin: UserLocation,
  destLat: number,
  destLng: number,
  mode: "driving" | "walking" = "driving"
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destLat},${destLng}&travelmode=${mode}`;
}

export function requestLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
