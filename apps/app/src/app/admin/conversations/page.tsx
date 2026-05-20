'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables, Enums } from '@brildesk/supabase/types';

type Conversation = Tables<'conversations'>;
type ConversationStatus = Enums<'conversation_status'>;

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    let query = supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(100);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as ConversationStatus);
    }

    query.then(({ data }) => {
      if (data) setConversations(data);
      setLoading(false);
    });
  }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Conversations</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setLoading(true);
            setStatusFilter(e.target.value);
          }}
          className="text-sm border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading conversations...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Team
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <tr key={conv.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {conv.wa_contact_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {conv.wa_contact_phone}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[conv.status] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      {conv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {conv.last_message_at
                      ? new Date(conv.last_message_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {conv.team_id ? conv.team_id.slice(0, 8) : '—'}
                  </td>
                </tr>
              ))}
              {conversations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No conversations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
