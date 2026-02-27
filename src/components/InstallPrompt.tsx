import { useState, useEffect } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return ("standalone" in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem("install-dismissed") === "1"; } catch { return false; }
  });

  useEffect(() => {
    if (isInStandaloneMode()) return;

    if (isIos()) {
      setShowIosPrompt(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem("install-dismissed", "1"); } catch {}
  };

  if (dismissed || isInStandaloneMode()) return null;
  if (!deferredPrompt && !showIosPrompt) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 bg-card border border-border rounded-xl shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        {showIosPrompt ? <Share className="h-5 w-5 text-primary" /> : <Download className="h-5 w-5 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Install Find My Masjid</p>
        {showIosPrompt ? (
          <p className="text-xs text-muted-foreground">
            Tap <Share className="inline h-3 w-3 -mt-0.5" /> then <span className="font-semibold">"Add to Home Screen"</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Quick access & offline use</p>
        )}
      </div>
      {!showIosPrompt && <Button size="sm" onClick={handleInstall}>Install</Button>}
      <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
