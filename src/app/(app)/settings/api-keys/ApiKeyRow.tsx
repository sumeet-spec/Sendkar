"use client";

import { useTransition } from "react";
import { revokeApiKey } from "./actions";

interface Key {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export function ApiKeyRow({ apiKey }: { apiKey: Key }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="sk-card flex items-center justify-between p-4">
      <div>
        <div className="font-medium">{apiKey.name}</div>
        <div className="mt-0.5 font-mono text-[12.5px] text-faint">{apiKey.key_prefix}••••••••</div>
        <div className="mt-0.5 text-[11.5px] text-faint">
          {apiKey.last_used_at ? `Last used ${new Date(apiKey.last_used_at).toLocaleString()}` : "Never used"}
        </div>
      </div>
      <button disabled={pending} onClick={() => startTransition(() => revokeApiKey(apiKey.id))} className="text-xs text-faint hover:text-danger">
        Revoke
      </button>
    </div>
  );
}
