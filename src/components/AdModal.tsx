import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import adBanner from "@/assets/ad-banner.png";

export default function AdModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("ad-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleClose() {
    setOpen(false);
    sessionStorage.setItem("ad-dismissed", "1");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="p-0 overflow-hidden max-w-sm rounded-2xl border-0 bg-transparent shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">Advertisement</DialogTitle>
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 rounded-full bg-background/80 backdrop-blur-sm p-1.5 text-foreground hover:bg-background transition-colors"
            aria-label="Close ad"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={adBanner}
            alt="Salat Locator - Find Nearby Masjids"
            className="w-full h-auto rounded-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
