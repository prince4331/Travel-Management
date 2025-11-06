import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { WifiOff, Wifi } from "lucide-react";
import { useOfflineSync } from "../../hooks/useOfflineSync";

export function SyncStatusBar() {
  const router = useRouter();
  const { isSyncing, pendingJobs } = useOfflineSync();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(typeof window !== "undefined" ? navigator.onLine : true);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Don't show on landing page, login, or signup pages
  const publicPages = ['/', '/login', '/signup', '/auth/login', '/auth/signup'];
  if (publicPages.includes(router.pathname)) {
    return null;
  }

  return (
    <div className="sticky top-0 z-30 w-full bg-slate-900 text-xs text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 text-amber-300" />}
          <span>{online ? "Mesh connected" : "Offline mode"}</span>
        </div>
        <span>{isSyncing ? "Syncing..." : pendingJobs > 0 ? `${pendingJobs} pending changes` : "All changes synced"}</span>
      </div>
    </div>
  );
}
