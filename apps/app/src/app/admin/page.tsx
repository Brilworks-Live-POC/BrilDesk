'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface Stats {
  totalUsers: number;
  totalTeams: number;
  totalConversations: number;
  openConversations: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function loadStats() {
      const [users, teams, conversations, open] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
        supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open'),
      ]);

      setStats({
        totalUsers: users.count ?? 0,
        totalTeams: teams.count ?? 0,
        totalConversations: conversations.count ?? 0,
        openConversations: open.count ?? 0,
      });
      setLoading(false);
    }

    loadStats();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0 },
    { label: 'Total Teams', value: stats?.totalTeams ?? 0 },
    { label: 'Total Conversations', value: stats?.totalConversations ?? 0 },
    { label: 'Open Conversations', value: stats?.openConversations ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Superadmin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
