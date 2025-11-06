// Mesh Network Demo & Documentation Page
'use client';
import { useState } from 'react';
import MeshChat from '../components/ui/MeshChat';
import MeshNetworkIndicator from '../components/ui/MeshNetworkIndicator';

export default function MeshNetworkPage() {
  const [activeTab, setActiveTab] = useState<'demo' | 'docs'>('demo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            🔗 Mesh Network System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Connect with nearby travelers using Bluetooth P2P - No Internet Required!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'demo'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            💬 Live Demo
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'docs'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📚 How It Works
          </button>
        </div>

        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🎯 Try Mesh Chat
              </h2>
              <MeshChat />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🧪 Testing Instructions
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                    📱 Step 1: Prepare Two Devices
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Open this page on two devices (phones, tablets, or laptops)</li>
                    <li>Both devices must support Bluetooth</li>
                    <li>Recommended: Chrome on Android or Chrome on desktop</li>
                    <li>Turn off WiFi/mobile data to test true offline mode</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">
                    🔗 Step 2: Connect Devices
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>On Device 1: Click "Find Peers" button</li>
                    <li>Allow Bluetooth permission when prompted</li>
                    <li>On Device 2: Do the same</li>
                    <li>Select each other's device from the list</li>
                    <li>Wait for "Connected" status (green indicator)</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded">
                  <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2">
                    💬 Step 3: Test Chat
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Type a message on Device 1 and send</li>
                    <li>Message appears on Device 2 instantly!</li>
                    <li>Reply from Device 2 - appears on Device 1</li>
                    <li>Works 100% offline via Bluetooth mesh</li>
                  </ul>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded">
                  <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-2">
                    💰 Step 4: Test Expense Sync
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Go to a group page on Device 1</li>
                    <li>Create a new expense while offline</li>
                    <li>Expense syncs automatically to Device 2 via mesh!</li>
                    <li>Both devices have the same financial data - no internet needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🏔️ Why Mesh Network?
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300">
                  When traveling to remote areas like mountains, deserts, or jungles, traditional
                  internet is unavailable. Our mesh network system lets your group stay connected
                  using Bluetooth peer-to-peer connections!
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">
                      ✅ With Mesh Network
                    </h4>
                    <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                      <li>✓ Chat with group members</li>
                      <li>✓ Share expenses instantly</li>
                      <li>✓ Sync financial data</li>
                      <li>✓ No internet required</li>
                      <li>✓ Works up to 100m range</li>
                      <li>✓ Auto-relays through peers</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">
                      ❌ Without Internet
                    </h4>
                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                      <li>✗ Can't chat with group</li>
                      <li>✗ Can't share expenses</li>
                      <li>✗ Must wait until back online</li>
                      <li>✗ Risk of data conflicts</li>
                      <li>✗ No real-time updates</li>
                      <li>✗ Manual syncing required</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🔧 Technical Details
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    🌐 Technology Stack
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">
                        Web Bluetooth API
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Discover and connect to nearby devices via Bluetooth Low Energy
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <p className="font-bold text-purple-900 dark:text-purple-200 mb-1">
                        WebRTC Data Channels
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Peer-to-peer data transfer without STUN/TURN servers
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="font-bold text-green-900 dark:text-green-200 mb-1">
                        IndexedDB Storage
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Local storage for offline data and message queues
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    📡 How Messages Travel
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm">
                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                      <div>Device A → Bluetooth → Device B ✅ Direct</div>
                      <div>Device A → Device B → Device C ✅ Mesh Routing</div>
                      <div>Device A → Device B → Device C → Device D ✅ Multi-hop</div>
                      <div className="text-green-600 dark:text-green-400 mt-4">
                        💡 Automatically relays messages through connected peers!
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    🔒 Security & Privacy
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔐</span>
                      <span>
                        <strong>Encrypted:</strong> All WebRTC connections use DTLS encryption
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">🎯</span>
                      <span>
                        <strong>Local Only:</strong> Data stays within your mesh - never goes to
                        internet
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">👥</span>
                      <span>
                        <strong>Permission Required:</strong> Users must explicitly accept
                        Bluetooth connection
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">📍</span>
                      <span>
                        <strong>Short Range:</strong> Bluetooth works up to ~100m - only nearby
                        people connect
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    ⚙️ Supported Features
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        💬 Mesh Chat
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Real-time text messaging</li>
                        <li>• Broadcast to all peers</li>
                        <li>• Message history</li>
                        <li>• Sender identification</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        💰 Expense Sync
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Auto-broadcast new expenses</li>
                        <li>• Sync on peer connection</li>
                        <li>• Conflict-free merging</li>
                        <li>• Upload to server when online</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ⚠️ Browser Compatibility
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Platform</th>
                      <th className="px-4 py-2 text-left">Browser</th>
                      <th className="px-4 py-2 text-center">Web Bluetooth</th>
                      <th className="px-4 py-2 text-center">WebRTC</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-300">
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">Android</td>
                      <td className="px-4 py-2">Chrome 56+</td>
                      <td className="px-4 py-2 text-center">✅</td>
                      <td className="px-4 py-2 text-center">✅</td>
                      <td className="px-4 py-2 text-center text-green-600 font-semibold">
                        Fully Supported
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">Windows/Mac/Linux</td>
                      <td className="px-4 py-2">Chrome 56+</td>
                      <td className="px-4 py-2 text-center">✅</td>
                      <td className="px-4 py-2 text-center">✅</td>
                      <td className="px-4 py-2 text-center text-green-600 font-semibold">
                        Fully Supported
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">Windows/Mac/Linux</td>
                      <td className="px-4 py-2">Edge 79+</td>
                      <td className="px-4 py-2 text-center">✅</td>
                      <td className="px-4 py-2 text-center">✅</td>
                      <td className="px-4 py-2 text-center text-green-600 font-semibold">
                        Fully Supported
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">iOS/iPadOS</td>
                      <td className="px-4 py-2">Safari</td>
                      <td className="px-4 py-2 text-center">❌</td>
                      <td className="px-4 py-2 text-center">✅</td>
                      <td className="px-4 py-2 text-center text-red-600 font-semibold">
                        Not Supported
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">Android</td>
                      <td className="px-4 py-2">Firefox</td>
                      <td className="px-4 py-2 text-center">❌</td>
                      <td className="px-4 py-2 text-center">✅</td>
                      <td className="px-4 py-2 text-center text-red-600 font-semibold">
                        Not Supported
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                💡 <strong>Recommendation:</strong> Use Chrome on Android for best mobile mesh
                networking experience!
              </p>
            </div>
          </div>
        )}

        {/* Mesh Network Indicator */}
        <MeshNetworkIndicator />
      </div>
    </div>
  );
}
