// Hook for mesh network offline chat
import { useState, useEffect, useCallback } from 'react';
import { meshNetwork } from '../lib/meshNetwork';

export interface ChatMessage {
  id: string;
  from: string;
  fromName: string;
  text: string;
  timestamp: number;
  groupId?: string;
}

export function useMeshChat(groupId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Send chat message
  const sendMessage = useCallback((text: string) => {
    const deviceInfo = meshNetwork.getDeviceInfo();

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: deviceInfo.id,
      fromName: deviceInfo.name,
      text,
      timestamp: Date.now(),
      groupId,
    };

    // Add to local messages
    setMessages(prev => [...prev, message]);

    // Broadcast to mesh network
    meshNetwork.broadcast({
      type: 'chat',
      data: message,
    });

    console.log('[MeshChat] Sent message:', text);
  }, [groupId]);

  // Listen for incoming chat messages
  useEffect(() => {
    const unsubscribe = meshNetwork.onMessage((meshMessage) => {
      if (meshMessage.type === 'chat') {
        const chatMessage = meshMessage.data as ChatMessage;

        // Filter by group if specified
        if (groupId && chatMessage.groupId !== groupId) {
          return;
        }

        // Don't add own messages (already added)
        const deviceInfo = meshNetwork.getDeviceInfo();
        if (chatMessage.from === deviceInfo.id) {
          return;
        }

        console.log('[MeshChat] Received message:', chatMessage);

        setMessages(prev => {
          // Check if message already exists (avoid duplicates)
          if (prev.some(m => m.id === chatMessage.id)) {
            return prev;
          }
          return [...prev, chatMessage];
        });
      }
    });

    return unsubscribe;
  }, [groupId]);

  // Update connection status
  useEffect(() => {
    const updateStatus = () => {
      const peers = meshNetwork.getConnectedPeers();
      setIsConnected(peers.length > 0);
    };

    const unsubscribeConnect = meshNetwork.onPeerConnected(updateStatus);
    const unsubscribeDisconnect = meshNetwork.onPeerDisconnected(updateStatus);

    updateStatus();

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isConnected,
    deviceInfo: meshNetwork.getDeviceInfo(),
  };
}
