// Mesh Network Chat Component
'use client';
import { useState, useEffect, useRef } from 'react';
import { useMeshChat } from '../../hooks/useMeshChat';
import { useMeshSync } from '../../hooks/useMeshSync';

interface MeshChatProps {
  groupId?: string;
}

export default function MeshChat({ groupId }: MeshChatProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    messages, 
    sendMessage, 
    clearMessages, 
    isConnected, 
    deviceInfo 
  } = useMeshChat(groupId);

  const {
    isDiscovering,
    connectedPeers,
    stats,
    startDiscovery,
  } = useMeshSync(groupId);

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
    <div className="flex flex-col h-full max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">🔗 Mesh Chat</h3>
            <p className="text-xs opacity-90">
              {deviceInfo.name} • {isConnected ? '🟢 Connected' : '🔴 Offline'}
            </p>
          </div>
          <button
            onClick={startDiscovery}
            disabled={isDiscovering}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium disabled:opacity-50 transition"
          >
            {isDiscovering ? '⏳ Discovering...' : '📡 Find Peers'}
          </button>
        </div>

        {/* Connection Stats */}
        <div className="mt-2 flex gap-4 text-xs">
          <span>👥 {connectedPeers.length} peers</span>
          <span>💬 {messages.length} messages</span>
          <span>🔄 {stats.expensesSynced} synced</span>
        </div>
      </div>

      {/* Connected Peers */}
      {connectedPeers.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-gray-700 border-b border-blue-200 dark:border-gray-600">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            Connected to: {connectedPeers.map(p => p.name).join(', ')}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Connect to peers to start chatting!</p>
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
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connect to peers first..."}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:hover:bg-blue-500 transition"
          >
            Send
          </button>
        </div>

        {/* Clear button */}
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearMessages}
            className="mt-2 text-xs text-gray-500 hover:text-red-500 transition"
          >
            Clear messages
          </button>
        )}
      </form>

      {/* Instructions */}
      {!isConnected && (
        <div className="px-4 pb-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
              📱 How to connect:
            </p>
            <ol className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
              <li>Click "Find Peers" button</li>
              <li>Allow Bluetooth permission</li>
              <li>Select nearby device</li>
              <li>Start chatting offline!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
