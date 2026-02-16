import { MapPin, RefreshCw, Loader2 } from "lucide-react";

interface LocationBarProps {
  hasLocation: boolean;
  loading: boolean;
  onRefresh: () => void;
}

export default function LocationBar({ hasLocation, loading, onRefresh }: LocationBarProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors active:scale-95"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <MapPin className="h-3.5 w-3.5 text-primary" />
      )}
      <span>
        {loading
          ? "Detecting location..."
          : hasLocation
          ? "Location detected"
          : "Using default location"}
      </span>
      {!loading && (
        <RefreshCw className="h-3 w-3 ml-1 opacity-50" />
      )}
    </button>
  );
}
