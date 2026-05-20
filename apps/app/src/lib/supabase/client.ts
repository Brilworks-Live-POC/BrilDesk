'use client';

import { createBrowserClient } from '@brildesk/supabase';

// Re-export the typed browser client from @brildesk/supabase.
// This uses @supabase/supabase-js directly with the Database type.
export function getSupabaseBrowserClient() {
  return createBrowserClient();
}
