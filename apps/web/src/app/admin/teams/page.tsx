'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables } from '@brildesk/supabase/types';

type Team = Tables<'teams'>;

interface TeamWithCount extends Team {
  memberCount: number;
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function load() {
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (!teamsData) {
        setLoading(false);
        return;
      }

      // Get member counts per team
      const teamsWithCounts: TeamWithCount[] = await Promise.all(
        teamsData.map(async (team) => {
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('team_id', team.id);
          return { ...team, memberCount: count ?? 0 };
        }),
      );

      setTeams(teamsWithCounts);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading teams...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Teams</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900">{team.name}</h2>
            {team.description && (
              <p className="mt-1 text-sm text-gray-500">{team.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>{team.memberCount} members</span>
              <span className="text-gray-300">|</span>
              <span>
                Created {new Date(team.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <p className="text-gray-500 col-span-full">No teams found.</p>
        )}
      </div>
    </div>
  );
}
