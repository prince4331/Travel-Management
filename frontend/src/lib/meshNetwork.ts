// Mesh Network Manager using Web Bluetooth and WebRTC
// Enables peer-to-peer sync and offline chat without internet

interface MeshPeer {
  id: string;
  name: string;
  device?: any; // BluetoothDevice - using any for build compatibility
  connection?: RTCPeerConnection;
  channel?: RTCDataChannel;
  lastSeen: number;
  status: 'connecting' | 'connected' | 'disconnected';
}

interface MeshMessage {
  type: 'expense' | 'chat' | 'sync' | 'ping';
  from: string;
  to?: string; // broadcast if undefined
  timestamp: number;
  data: any;
}

class MeshNetworkManager {
  private peers: Map<string, MeshPeer> = new Map();
  private deviceId: string;
  private deviceName: string;
  private onMessageCallbacks: ((msg: MeshMessage) => void)[] = [];
  private onPeerConnectedCallbacks: ((peer: MeshPeer) => void)[] = [];
  private onPeerDisconnectedCallbacks: ((peerId: string) => void)[] = [];

  constructor() {
    this.deviceId = this.generateDeviceId();
    this.deviceName = this.getDeviceName();
  }

  private generateDeviceId(): string {
    if (typeof window === 'undefined') return `device-${Date.now()}`;
    const stored = localStorage.getItem('mesh_device_id');
    if (stored) return stored;
    
    const newId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('mesh_device_id', newId);
    return newId;
  }

  private getDeviceName(): string {
    if (typeof window === 'undefined') return 'Traveler-BUILD';
    const stored = localStorage.getItem('mesh_device_name');
    if (stored) return stored;
    
    const name = `Traveler-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    localStorage.setItem('mesh_device_name', name);
    return name;
  }

  // Check if Web Bluetooth is supported
  isBluetoothSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  // Start mesh network discovery
  async startDiscovery(): Promise<void> {
    console.log('[Mesh] Starting discovery...');

    if (!this.isBluetoothSupported()) {
      console.warn('[Mesh] Bluetooth not supported in this browser');
      throw new Error('Bluetooth not supported');
    }

    try {
      // Request Bluetooth device
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      console.log('[Mesh] Found device:', device.name);
      
      const peer: MeshPeer = {
        id: device.id,
        name: device.name || 'Unknown Device',
        device,
        lastSeen: Date.now(),
        status: 'connecting',
      };

      this.peers.set(peer.id, peer);
      await this.connectToPeer(peer);
    } catch (error) {
      console.error('[Mesh] Discovery error:', error);
      throw error;
    }
  }

  // Connect to a peer using WebRTC
  private async connectToPeer(peer: MeshPeer): Promise<void> {
    console.log('[Mesh] Connecting to peer:', peer.name);

    try {
      // Create WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [] // No STUN/TURN servers - local only!
      });

      peer.connection = pc;

      // Create data channel
      const channel = pc.createDataChannel('mesh-sync', {
        ordered: true,
      });

      peer.channel = channel;

      channel.onopen = () => {
        console.log('[Mesh] Data channel opened with', peer.name);
        peer.status = 'connected';
        peer.lastSeen = Date.now();
        this.onPeerConnectedCallbacks.forEach(cb => cb(peer));
        
        // Send introduction
        this.sendToPeer(peer.id, {
          type: 'ping',
          from: this.deviceId,
          timestamp: Date.now(),
          data: {
            deviceId: this.deviceId,
            deviceName: this.deviceName,
          },
        });
      };

      channel.onmessage = (event) => {
        try {
          const message: MeshMessage = JSON.parse(event.data);
          console.log('[Mesh] Received message:', message);
          peer.lastSeen = Date.now();
          this.handleMessage(message, peer);
        } catch (error) {
          console.error('[Mesh] Error parsing message:', error);
        }
      };

      channel.onclose = () => {
        console.log('[Mesh] Data channel closed with', peer.name);
        peer.status = 'disconnected';
        this.onPeerDisconnectedCallbacks.forEach(cb => cb(peer.id));
      };

      channel.onerror = (error) => {
        console.error('[Mesh] Data channel error:', error);
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log('[Mesh] WebRTC connection established with', peer.name);
    } catch (error) {
      console.error('[Mesh] Connection error:', error);
      peer.status = 'disconnected';
    }
  }

  // Send message to specific peer
  private sendToPeer(peerId: string, message: MeshMessage): void {
    const peer = this.peers.get(peerId);
    if (!peer || peer.status !== 'connected' || !peer.channel) {
      console.warn('[Mesh] Cannot send to peer:', peerId);
      return;
    }

    try {
      peer.channel.send(JSON.stringify(message));
      console.log('[Mesh] Sent message to', peer.name);
    } catch (error) {
      console.error('[Mesh] Send error:', error);
    }
  }

  // Broadcast message to all connected peers
  broadcast(message: Omit<MeshMessage, 'from' | 'timestamp'>): void {
    const fullMessage: MeshMessage = {
      ...message,
      from: this.deviceId,
      timestamp: Date.now(),
    };

    console.log('[Mesh] Broadcasting:', fullMessage);

    this.peers.forEach((peer, peerId) => {
      if (peer.status === 'connected') {
        this.sendToPeer(peerId, fullMessage);
      }
    });
  }

  // Handle incoming message
  private handleMessage(message: MeshMessage, fromPeer: MeshPeer): void {
    console.log('[Mesh] Handling message type:', message.type);

    // Update peer info
    fromPeer.lastSeen = Date.now();

    // Relay message to other peers (mesh routing)
    if (message.to && message.to !== this.deviceId) {
      const targetPeer = this.peers.get(message.to);
      if (targetPeer && targetPeer.status === 'connected') {
        this.sendToPeer(message.to, message);
        console.log('[Mesh] Relayed message to', targetPeer.name);
      }
    }

    // Notify listeners
    this.onMessageCallbacks.forEach(cb => cb(message));
  }

  // Register message listener
  onMessage(callback: (msg: MeshMessage) => void): () => void {
    this.onMessageCallbacks.push(callback);
    return () => {
      const index = this.onMessageCallbacks.indexOf(callback);
      if (index > -1) this.onMessageCallbacks.splice(index, 1);
    };
  }

  // Register peer connected listener
  onPeerConnected(callback: (peer: MeshPeer) => void): () => void {
    this.onPeerConnectedCallbacks.push(callback);
    return () => {
      const index = this.onPeerConnectedCallbacks.indexOf(callback);
      if (index > -1) this.onPeerConnectedCallbacks.splice(index, 1);
    };
  }

  // Register peer disconnected listener
  onPeerDisconnected(callback: (peerId: string) => void): () => void {
    this.onPeerDisconnectedCallbacks.push(callback);
    return () => {
      const index = this.onPeerDisconnectedCallbacks.indexOf(callback);
      if (index > -1) this.onPeerDisconnectedCallbacks.splice(index, 1);
    };
  }

  // Get connected peers
  getConnectedPeers(): MeshPeer[] {
    return Array.from(this.peers.values()).filter(p => p.status === 'connected');
  }

  // Get device info
  getDeviceInfo() {
    return {
      id: this.deviceId,
      name: this.deviceName,
    };
  }

  // Disconnect from all peers
  disconnect(): void {
    console.log('[Mesh] Disconnecting from all peers...');
    this.peers.forEach((peer) => {
      if (peer.channel) {
        peer.channel.close();
      }
      if (peer.connection) {
        peer.connection.close();
      }
      peer.status = 'disconnected';
    });
    this.peers.clear();
  }

  // Health check - remove stale peers
  healthCheck(): void {
    const now = Date.now();
    const timeout = 30000; // 30 seconds

    this.peers.forEach((peer, peerId) => {
      if (now - peer.lastSeen > timeout) {
        console.log('[Mesh] Peer timeout:', peer.name);
        if (peer.channel) peer.channel.close();
        if (peer.connection) peer.connection.close();
        peer.status = 'disconnected';
        this.onPeerDisconnectedCallbacks.forEach(cb => cb(peerId));
      }
    });
  }
}

// Singleton instance
export const meshNetwork = new MeshNetworkManager();

// Start health check every 10 seconds
if (typeof window !== 'undefined') {
  setInterval(() => meshNetwork.healthCheck(), 10000);
}
