"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJoinLink } from "./actions";

export function CreateLink({ label, busyLabel }: { label: string; busyLabel: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        className="sk-btn sk-btn-primary disabled:opacity-60"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const res = await createJoinLink();
          setBusy(false);
          if (res.error) setError(res.error); else router.refresh();
        }}
      >
        {busy ? busyLabel : label}
      </button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
