// Mesh Network Status Indicator
'use client';
import { useEffect, useState } from 'react';
import { useMeshSync } from '../../hooks/useMeshSync';

interface MeshNetworkIndicatorProps {
  groupId?: string;
}

export default function MeshNetworkIndicator({ groupId }: MeshNetworkIndicatorProps) {
  const { connectedPeers, stats, startDiscovery, isDiscovering } = useMeshSync(groupId, true);
  const [showDetails, setShowDetails] = useState(false);

  if (connectedPeers.length === 0) {
    return (
      <button
        onClick={startDiscovery}
        disabled={isDiscovering}
        className="fixed bottom-20 right-4 z-40 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition transform hover:scale-105"
      >
        <span>📡</span>
        <span>{isDiscovering ? 'Discovering...' : 'Connect Mesh'}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Main indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition transform hover:scale-105"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span>🔗 {connectedPeers.length} Mesh Peer{connectedPeers.length !== 1 ? 's' : ''}</span>
      </button>

      {/* Details panel */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900 dark:text-white">Mesh Network</h4>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Connected Peers:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.connectedPeers}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Expenses Synced:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.expensesSynced}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Messages Received:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.messagesReceived}
              </span>
            </div>
            {stats.lastSync && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(stats.lastSync).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {/* Peer list */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Connected Devices:
            </p>
            <div className="space-y-2">
              {connectedPeers.map((peer) => (
                <div
                  key={peer.id}
                  className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg p-2"
                >
                  <span className="text-green-500">🟢</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {peer.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 <strong>Mesh Network:</strong> Share expenses and chat without internet using
              Bluetooth peer-to-peer connections.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
