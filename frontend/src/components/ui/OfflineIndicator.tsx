import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingJobs, syncNow } = useOfflineSync();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show indicator when offline or syncing
    setShow(!isOnline || isSyncing || pendingJobs > 0);
  }, [isOnline, isSyncing, pendingJobs]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        ${isOnline ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}
        transition-all duration-300
      `}>
        {!isOnline ? (
          <>
            <WifiOff className="h-5 w-5 text-amber-600" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-amber-900">Offline Mode</p>
              <p className="text-xs text-amber-700">
                {pendingJobs > 0 
                  ? `${pendingJobs} ${pendingJobs === 1 ? 'change' : 'changes'} will sync when online`
                  : 'Changes saved locally'
                }
              </p>
            </div>
            <CloudOff className="h-4 w-4 text-amber-500" />
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-blue-900">Syncing...</p>
              <p className="text-xs text-blue-700">
                {pendingJobs} {pendingJobs === 1 ? 'item' : 'items'} remaining
              </p>
            </div>
          </>
        ) : pendingJobs > 0 ? (
          <>
            <Wifi className="h-5 w-5 text-blue-600" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-blue-900">Back Online</p>
              <p className="text-xs text-blue-700">
                {pendingJobs} {pendingJobs === 1 ? 'change' : 'changes'} pending
              </p>
            </div>
            <button
              onClick={syncNow}
              className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sync Now
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
