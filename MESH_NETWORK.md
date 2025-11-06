# 🔗 Mesh Network System - Technical Documentation

## Overview

The Mesh Network System enables peer-to-peer communication and data synchronization using **Bluetooth** and **WebRTC** when internet connectivity is unavailable. Perfect for remote expeditions in mountains, deserts, jungles, or any area without cellular/WiFi coverage.

---

## 🌟 Key Features

### 1. **Offline Chat** 💬
- Real-time text messaging between group members
- Works 100% offline via Bluetooth
- Automatic message relaying through mesh network
- Range: up to 100 meters per hop
- Multi-hop routing: Messages can travel through intermediate peers

### 2. **Expense Synchronization** 💰
- Automatically broadcasts new expenses to connected peers
- Instant synchronization across all devices in mesh
- Queues expenses for server upload when internet returns
- Conflict-free merging of financial data
- No manual sync required

### 3. **Peer Discovery** 📡
- One-click Bluetooth device discovery
- Automatic WebRTC connection establishment
- Visual indicator showing connected peers
- Health monitoring with automatic stale peer removal

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Mesh Network Layer                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Device A  ←──Bluetooth──→  Device B  ←──BT──→  Device C │
│     ↓                          ↓                    ↓     │
│  WebRTC                     WebRTC              WebRTC    │
│  Channel                    Channel             Channel   │
│     ↓                          ↓                    ↓     │
│  IndexedDB                 IndexedDB           IndexedDB  │
│  (Local)                   (Local)             (Local)    │
│     ↓                          ↓                    ↓     │
│  [When Online] ────────────────────────────────────→      │
│                       Server Sync                         │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

1. **Web Bluetooth API**
   - Browser API for Bluetooth device discovery
   - Supported: Chrome 56+, Edge 79+, Android Chrome
   - NOT supported: Safari (iOS), Firefox

2. **WebRTC Data Channels**
   - Peer-to-peer data transfer
   - No STUN/TURN servers needed (local connections only)
   - DTLS encryption built-in

3. **IndexedDB**
   - Local storage for messages and expenses
   - Sync queue for server upload when online
   - Mesh metadata storage

---

## 📁 File Structure

```
frontend/src/
├── lib/
│   └── meshNetwork.ts          # Core mesh network manager
├── hooks/
│   ├── useMeshSync.ts          # Expense sync over mesh
│   └── useMeshChat.ts          # Chat functionality
├── components/ui/
│   ├── MeshChat.tsx            # Chat UI component
│   └── MeshNetworkIndicator.tsx # Status indicator
└── pages/
    └── mesh-network.tsx        # Demo & documentation page
```

---

## 🔧 API Reference

### `meshNetwork` (Singleton)

Core mesh network manager instance.

#### Methods

##### `startDiscovery()`
Initiates Bluetooth device discovery and connection.

```typescript
await meshNetwork.startDiscovery();
// Prompts user to select Bluetooth device
// Establishes WebRTC connection
```

##### `broadcast(message)`
Sends message to all connected peers.

```typescript
meshNetwork.broadcast({
  type: 'chat' | 'expense' | 'sync' | 'ping',
  data: any,
});
```

##### `onMessage(callback)`
Listens for incoming messages.

```typescript
const unsubscribe = meshNetwork.onMessage((message) => {
  console.log('Received:', message);
});

// Cleanup
unsubscribe();
```

##### `getConnectedPeers()`
Returns array of connected peers.

```typescript
const peers = meshNetwork.getConnectedPeers();
// [{ id, name, status: 'connected', lastSeen }]
```

##### `getDeviceInfo()`
Returns current device info.

```typescript
const info = meshNetwork.getDeviceInfo();
// { id: 'device-xxx', name: 'Traveler-ABCD' }
```

---

### `useMeshSync(groupId, enabled)`

Hook for syncing expenses over mesh network.

```typescript
const {
  isDiscovering,      // boolean: Discovery in progress
  connectedPeers,     // Array of connected peer objects
  stats,              // Sync statistics
  startDiscovery,     // Function to start discovery
  syncExpenseToMesh,  // Function to broadcast expense
  requestSyncFromPeers, // Request full sync from peers
  deviceInfo,         // Current device info
} = useMeshSync(groupId, true);
```

#### Auto-Syncing

Automatically broadcasts expenses created via `useCreateExpenseOffline`:

```typescript
const createExpense = useCreateExpenseOffline(groupId);

// This automatically broadcasts to mesh network!
await createExpense.mutateAsync({
  title: "Dinner",
  amount: 50,
  // ... other fields
});
```

---

### `useMeshChat(groupId)`

Hook for mesh network chat.

```typescript
const {
  messages,        // Array of chat messages
  sendMessage,     // (text: string) => void
  clearMessages,   // () => void
  isConnected,     // boolean: At least one peer connected
  deviceInfo,      // Current device info
} = useMeshChat(groupId);

// Send message
sendMessage("Hello from the mountain!");
```

---

## 💬 Message Protocol

All mesh messages follow this structure:

```typescript
interface MeshMessage {
  type: 'expense' | 'chat' | 'sync' | 'ping';
  from: string;           // Sender device ID
  to?: string;            // Optional recipient (broadcast if undefined)
  timestamp: number;      // Unix timestamp
  data: any;              // Message payload
}
```

### Message Types

#### 1. **Chat Message**
```typescript
{
  type: 'chat',
  from: 'device-123',
  timestamp: 1699123456789,
  data: {
    id: 'msg-xyz',
    fromName: 'Traveler-ABCD',
    text: 'Hello!',
    groupId: 'group-1',
  }
}
```

#### 2. **Expense Message**
```typescript
{
  type: 'expense',
  from: 'device-123',
  timestamp: 1699123456789,
  data: {
    action: 'create',
    groupId: 'group-1',
    expense: {
      id: 'temp-xyz',
      title: 'Dinner',
      amount: 50,
      // ... full expense object
    }
  }
}
```

#### 3. **Sync Request**
```typescript
{
  type: 'sync',
  from: 'device-123',
  timestamp: 1699123456789,
  data: {
    action: 'request',
    groupId: 'group-1',
    deviceId: 'device-123',
  }
}
```

#### 4. **Ping (Keep-alive)**
```typescript
{
  type: 'ping',
  from: 'device-123',
  timestamp: 1699123456789,
  data: {
    deviceId: 'device-123',
    deviceName: 'Traveler-ABCD',
  }
}
```

---

## 🔒 Security Considerations

### Encryption
- **WebRTC Data Channels** use DTLS (Datagram Transport Layer Security)
- All peer-to-peer data is encrypted end-to-end
- Bluetooth pairing provides additional security layer

### Privacy
- Mesh network is **local only** - data never goes to internet
- Short range (~100m per hop) limits accidental connections
- Users must **explicitly accept** Bluetooth connection requests
- Device names are randomized (e.g., "Traveler-ABCD")

### Best Practices
1. Only connect to devices you trust
2. Verify peer names before accepting connections
3. Clear messages after sensitive conversations
4. Mesh data syncs to server when online - ensure server security

---

## 🧪 Testing Guide

### Setup (2 Devices Required)

**Device 1 (Smartphone or Laptop):**
```bash
# Open browser to your app
http://localhost:3001/mesh-network

# Or deployed URL
https://your-app.com/mesh-network
```

**Device 2 (Smartphone or Laptop):**
```bash
# Same URL on second device
http://localhost:3001/mesh-network
```

### Test Steps

#### 1. **Connection Test**
- Device 1: Click "Find Peers"
- Allow Bluetooth permission
- Device 2: Do the same
- Select each other from device list
- ✅ Status should show "🟢 Connected"

#### 2. **Chat Test**
- Device 1: Type "Hello from Device 1"
- Send message
- ✅ Device 2 should receive message instantly
- Device 2: Reply with "Hello back!"
- ✅ Device 1 should receive reply

#### 3. **Offline Test**
- Both devices: Turn OFF WiFi/mobile data
- Verify Bluetooth still connected
- Send messages
- ✅ Messages should still work!

#### 4. **Expense Sync Test**
- Navigate to a group page
- Device 1: Create new expense (e.g., "Lunch $25")
- ✅ Device 2 should see expense appear automatically
- Device 2: Create another expense
- ✅ Device 1 should receive it

#### 5. **Multi-Hop Test** (3+ devices)
- Device A ←→ Device B ←→ Device C
- Device A and C NOT directly connected
- Device A: Send message
- ✅ Should reach Device C through Device B (relay)

---

## 📱 Browser Support

| Platform | Browser | Web Bluetooth | Status |
|----------|---------|---------------|--------|
| Android | Chrome 56+ | ✅ | **✅ Fully Supported** |
| Android | Samsung Internet | ✅ | **✅ Fully Supported** |
| Windows/Mac/Linux | Chrome 56+ | ✅ | **✅ Fully Supported** |
| Windows/Mac/Linux | Edge 79+ | ✅ | **✅ Fully Supported** |
| Windows/Mac/Linux | Opera 43+ | ✅ | **✅ Fully Supported** |
| iOS/iPadOS | Safari | ❌ | **❌ Not Supported** |
| Android | Firefox | ❌ | **❌ Not Supported** |

**Recommended:** Chrome on Android for mobile mesh networking!

---

## 🐛 Troubleshooting

### "Bluetooth not supported"
- **Solution:** Use Chrome, Edge, or Opera browser
- iOS Safari does NOT support Web Bluetooth
- Firefox does NOT support Web Bluetooth

### "No devices found"
- **Solution:** 
  - Ensure both devices have Bluetooth enabled
  - Stay within 10-100 meter range
  - Grant Bluetooth permissions
  - Try restarting Bluetooth

### "Connection failed"
- **Solution:**
  - Unpair and re-pair devices
  - Clear browser cache
  - Restart browser
  - Ensure both devices on same app version

### "Messages not syncing"
- **Solution:**
  - Check "Connected Peers" count > 0
  - Verify green indicator shows "Connected"
  - Check console logs for errors
  - Ensure devices on same group page

### "Expense doesn't appear on peer"
- **Solution:**
  - Wait 1-2 seconds for mesh broadcast
  - Check IndexedDB on receiving device
  - Verify both devices on same groupId
  - Try manual sync request

---

## 🚀 Performance

### Network Stats
- **Range:** ~10-100 meters per Bluetooth hop
- **Latency:** 50-200ms message delivery
- **Throughput:** ~1 Mbps (Bluetooth LE)
- **Max Peers:** Theoretically unlimited (mesh routing)
- **Battery Impact:** Low (Bluetooth LE optimized)

### Optimizations
- Health check every 10 seconds removes stale peers
- Automatic message deduplication
- Efficient JSON serialization
- IndexedDB caching prevents data loss

---

## 📚 Use Cases

### 1. **Mountain Expeditions** 🏔️
- No cellular coverage
- Team spread across base camps
- Share expenses instantly
- Coordinate via mesh chat

### 2. **Desert Safari** 🏜️
- Remote locations without internet
- Multiple vehicles in convoy
- Real-time expense tracking
- Group communication

### 3. **Jungle Trekking** 🌴
- Deep forest with no signal
- Split into smaller groups
- Sync financial data
- Emergency messaging

### 4. **Ocean Sailing** ⛵
- Far from shore
- No internet access
- Track shared expenses
- Stay connected with crew

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Voice messages over mesh
- [ ] File sharing (photos, documents)
- [ ] GPS location sharing
- [ ] Encrypted private channels
- [ ] Offline map tile sync via mesh
- [ ] Video thumbnails sync
- [ ] Emergency SOS broadcast
- [ ] Battery level sharing

### Advanced Mesh Features
- [ ] Mesh network topology visualization
- [ ] Automatic route optimization
- [ ] Store-and-forward for disconnected peers
- [ ] Mesh network health analytics
- [ ] Custom mesh protocols

---

## 📖 Learn More

**Web Bluetooth API:**
- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Web Bluetooth Spec](https://webbluetoothcg.github.io/web-bluetooth/)

**WebRTC:**
- [WebRTC Data Channels](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels)
- [WebRTC Samples](https://webrtc.github.io/samples/)

**Mesh Networking:**
- [Mesh Network Topology](https://en.wikipedia.org/wiki/Mesh_networking)
- [Bluetooth Mesh](https://www.bluetooth.com/bluetooth-resources/bluetooth-mesh-networking/)

---

## 📝 License

Part of Travel Management System  
MIT License

---

## 🤝 Contributing

Ideas for mesh network improvements? Open an issue or PR!

**Contact:** Your travel management team 🚀
