const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

async function getAuthHeaders(): Promise<Record<string, string>> {
  // Dynamic import to avoid SSR issues
  const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function sendMessage(conversationId: string, body: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversationId, body }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function assignConversation(conversationId: string, agentId: string | null) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/assign`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ agentId }),
  });
  if (!res.ok) throw new Error('Failed to assign conversation');
  return res.json();
}

export async function updateConversationStatus(
  conversationId: string,
  status: string,
) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}
