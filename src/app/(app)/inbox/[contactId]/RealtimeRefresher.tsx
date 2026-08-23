"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Live-updates the thread as messages arrive, instead of the agent having
 * to manually refresh — the webhook route writes new rows straight to
 * Postgres, and Supabase Realtime pushes that change here over the same
 * connection already used for auth, no separate infra to run.
 *
 * Requires the `messages` table to be added to the `supabase_realtime`
 * publication (Database → Replication in the Supabase dashboard, or
 * `alter publication supabase_realtime add table messages;`) — without
 * that this subscribes but never receives anything, and the thread just
 * falls back to a manual refresh like before.
 */
export function RealtimeRefresher({ contactId }: { contactId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`thread-${contactId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `contact_id=eq.${contactId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, router]);

  return null;
}
