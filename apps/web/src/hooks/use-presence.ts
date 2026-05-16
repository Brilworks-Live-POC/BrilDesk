'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RealtimePresenceState } from '@supabase/supabase-js';

interface PresenceUser {
  id: string;
  email: string;
  name: string | null;
  onlineAt: string;
}

export function usePresence(teamId: string | null, currentUser: { id: string; email: string; name: string | null } | null) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!teamId || !currentUser) return;

    const supabase = getSupabaseBrowserClient();

    const channel = supabase.channel(`presence:team:${teamId}`, {
      config: { presence: { key: currentUser.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state: RealtimePresenceState = channel.presenceState();
        const users: PresenceUser[] = [];
        for (const presences of Object.values(state)) {
          for (const p of presences) {
            users.push(p as unknown as PresenceUser);
          }
        }
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, currentUser]);

  return { onlineUsers };
}
