'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRealtimeConversations } from '@/hooks/use-realtime-conversations';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';
import { usePresence } from '@/hooks/use-presence';
import { sendMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Tables } from '@brildesk/supabase/types';

type Conversation = Tables<'conversations'>;

export default function InboxPage() {
  const { user, signOut } = useAuth();
  const { conversations, loading: convLoading } = useRealtimeConversations(
    user?.teamId ?? null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { messages, loading: msgLoading } = useRealtimeMessages(selectedId);
  const { onlineUsers } = usePresence(user?.teamId ?? null, user);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  const selected = conversations.find((c) => c.id === selectedId);

  const filteredConversations = conversations.filter((c) => {
    if (filter === 'assigned') return c.assigned_to_id === user?.id;
    if (filter === 'unassigned') return !c.assigned_to_id;
    return true;
  });

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !selectedId) return;
    setSending(true);
    try {
      await sendMessage(selectedId, messageText.trim());
      setMessageText('');
    } catch {
      // Message will appear via realtime subscription if successful
    }
    setSending(false);
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-600">BrilDesk</h1>
          <div className="flex items-center gap-2">
            {user?.role === 'superadmin' && (
              <a href="/admin" className="text-xs text-gray-500 hover:text-gray-700">
                Admin
              </a>
            )}
            <button
              onClick={signOut}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="p-2 space-y-1">
          {(['all', 'assigned', 'unassigned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left',
                filter === f
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              {f === 'all' ? 'Inbox' : f === 'assigned' ? 'Assigned to Me' : 'Unassigned'}
            </button>
          ))}
        </nav>
        {onlineUsers.length > 0 && (
          <div className="p-4 border-t border-gray-200 mt-auto">
            <p className="text-xs font-medium text-gray-500 mb-2">Online</p>
            <div className="space-y-1">
              {onlineUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  {u.name || u.email}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Conversation list */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
            <p className="p-4 text-sm text-gray-500">Loading conversations...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No conversations found.</p>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                selected={conv.id === selectedId}
                onClick={() => setSelectedId(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Select a conversation to start</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {selected.wa_contact_name || 'Unknown'}
                </h2>
                <p className="text-sm text-gray-500">{selected.wa_contact_phone}</p>
              </div>
              <span
                className={cn(
                  'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                  selected.status === 'open'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800',
                )}
              >
                {selected.status}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {msgLoading ? (
                <p className="text-sm text-gray-500">Loading messages...</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'max-w-md px-4 py-2 rounded-lg text-sm',
                      msg.direction === 'outbound'
                        ? 'ml-auto bg-green-100 text-green-900'
                        : 'bg-white border border-gray-200 text-gray-900',
                    )}
                  >
                    <p>{msg.body ?? ''}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <form
              onSubmit={handleSend}
              className="bg-white border-t border-gray-200 px-6 py-4 flex gap-3"
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  selected,
  onClick,
}: {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50',
        selected && 'bg-green-50',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 truncate">
          {conversation.wa_contact_name || 'Unknown'}
        </p>
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded-full',
            conversation.status === 'open'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500',
          )}
        >
          {conversation.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{conversation.wa_contact_phone}</p>
      {conversation.last_message_at && (
        <p className="text-xs text-gray-400 mt-1">
          {new Date(conversation.last_message_at).toLocaleString()}
        </p>
      )}
    </button>
  );
}
