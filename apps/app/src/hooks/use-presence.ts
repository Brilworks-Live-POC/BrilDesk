'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RealtimePresenceState } from '@supabase/supabase-js';

export type AgentStatus = 'online' | 'away' | 'offline';

export interface PresenceUser {
  id: string;
  email: string;
  name: string | null;
  status: AgentStatus;
  onlineAt: string;
}

const AWAY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity

export function usePresence(
  teamId: string | null,
  currentUser: { id: string; email: string; name: string | null } | null,
) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseBrowserClient>['channel']> | null>(null);
  const awayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<AgentStatus>('online');

  const updateStatus = useCallback(
    (newStatus: AgentStatus) => {
      if (!channelRef.current || !currentUser || statusRef.current === newStatus) return;
      statusRef.current = newStatus;
      channelRef.current.track({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        status: newStatus,
        onlineAt: new Date().toISOString(),
      });
    },
    [currentUser],
  );

  const resetAwayTimer = useCallback(() => {
    if (awayTimerRef.current) clearTimeout(awayTimerRef.current);
    if (statusRef.current === 'away') {
      updateStatus('online');
    }
    awayTimerRef.current = setTimeout(() => {
      updateStatus('away');
    }, AWAY_TIMEOUT_MS);
  }, [updateStatus]);

  useEffect(() => {
    if (!teamId || !currentUser) return;

    const supabase = getSupabaseBrowserClient();

    const channel = supabase.channel(`presence:team:${teamId}`, {
      config: { presence: { key: currentUser.id } },
    });
    channelRef.current = channel;

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
          statusRef.current = 'online';
          await channel.track({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            status: 'online' as AgentStatus,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    // Activity listeners for away detection
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetAwayTimer();

    for (const event of activityEvents) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    // Start the away timer
    resetAwayTimer();

    return () => {
      for (const event of activityEvents) {
        window.removeEventListener(event, handleActivity);
      }
      if (awayTimerRef.current) clearTimeout(awayTimerRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [teamId, currentUser, resetAwayTimer]);

  return { onlineUsers, updateStatus };
}
