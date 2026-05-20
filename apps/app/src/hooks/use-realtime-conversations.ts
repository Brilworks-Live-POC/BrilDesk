'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables } from '@brildesk/supabase/types';

type Conversation = Tables<'conversations'>;

export function useRealtimeConversations(teamId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    const supabase = getSupabaseBrowserClient();

    // Initial fetch
    supabase
      .from('conversations')
      .select('*')
      .eq('team_id', teamId)
      .order('last_message_at', { ascending: false })
      .then(({ data }) => {
        if (data) setConversations(data);
        setLoading(false);
      });

    // Subscribe to changes
    const channel = supabase
      .channel(`conversations:team:${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversations((prev) => [payload.new as Conversation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === (payload.new as Conversation).id
                  ? (payload.new as Conversation)
                  : c,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setConversations((prev) =>
              prev.filter((c) => c.id !== (payload.old as { id: string }).id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  return { conversations, loading };
}
