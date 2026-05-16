'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface TypingUser {
  userId: string;
  name: string | null;
}

export function useTypingIndicator(
  conversationId: string | null,
  currentUser: { id: string; name: string | null } | null,
) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseBrowserClient>['channel']> | null>(null);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`typing:conversation:${conversationId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === currentUser.id) return;

        setTypingUsers((prev) => {
          const exists = prev.some((u) => u.userId === payload.userId);
          if (!exists) {
            return [...prev, { userId: payload.userId, name: payload.name }];
          }
          return prev;
        });

        // Clear previous timeout for this user
        const prev = timeoutsRef.current.get(payload.userId);
        if (prev) clearTimeout(prev);

        // Remove after 3 seconds of no typing events
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
          timeoutsRef.current.delete(payload.userId);
        }, 3000);
        timeoutsRef.current.set(payload.userId, timeout);
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
        const prev = timeoutsRef.current.get(payload.userId);
        if (prev) clearTimeout(prev);
        timeoutsRef.current.delete(payload.userId);
      })
      .subscribe();

    return () => {
      // Clean up timeouts
      for (const timeout of timeoutsRef.current.values()) {
        clearTimeout(timeout);
      }
      timeoutsRef.current.clear();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, currentUser]);

  const sendTyping = useCallback(() => {
    if (!channelRef.current || !currentUser) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUser.id, name: currentUser.name },
    });
  }, [currentUser]);

  const sendStopTyping = useCallback(() => {
    if (!channelRef.current || !currentUser) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'stop_typing',
      payload: { userId: currentUser.id },
    });
  }, [currentUser]);

  return { typingUsers, sendTyping, sendStopTyping };
}
