// Group Chat Component - Works online and offline with mesh network
'use client';
import { useState, useEffect, useRef } from 'react';
import { useMeshChat } from '../../hooks/useMeshChat';
import { useMeshSync } from '../../hooks/useMeshSync';
import { Send, Wifi, WifiOff } from 'lucide-react';

interface GroupChatProps {
  groupId: string;
  groupName?: string;
}

export default function GroupChat({ groupId, groupName }: GroupChatProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOnline, setIsOnline] = useState(true);

  const { 
    messages, 
    sendMessage, 
    deviceInfo 
  } = useMeshChat(groupId);

  const {
    connectedPeers,
    startDiscovery,
    isDiscovering,
  } = useMeshSync(groupId, true);

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText);
    setInputText('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">💬 {groupName || 'Group Chat'}</h3>
            <div className="flex items-center gap-2 text-xs opacity-90">
              {isOnline ? (
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline (Mesh)
                </span>
              )}
              <span>•</span>
              <span>{connectedPeers.length} peers connected</span>
            </div>
          </div>
          
          {!isOnline && connectedPeers.length === 0 && (
            <button
              onClick={startDiscovery}
              disabled={isDiscovering}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              {isDiscovering ? '⏳ Finding...' : '📡 Connect'}
            </button>
          )}
        </div>
      </div>

      {/* Connection Status Info */}
      {!isOnline && connectedPeers.length === 0 && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            ⚠️ Offline mode. Click &quot;Connect&quot; to find nearby group members via Bluetooth mesh.
          </p>
        </div>
      )}

      {!isOnline && connectedPeers.length > 0 && (
        <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300">
            ✓ Connected to {connectedPeers.length} peer{connectedPeers.length !== 1 ? 's' : ''} via mesh network
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] max-h-[600px]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.from === deviceInfo.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {msg.fromName}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:hover:bg-blue-500 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        {/* Mode indicator */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {isOnline ? (
            <span>🟢 Messages sent via internet</span>
          ) : connectedPeers.length > 0 ? (
            <span>🔗 Messages sent via Bluetooth mesh ({connectedPeers.length} peer{connectedPeers.length !== 1 ? 's' : ''})</span>
          ) : (
            <span>⚠️ Offline - connect to peers to send messages</span>
          )}
        </div>
      </form>
    </div>
  );
}
