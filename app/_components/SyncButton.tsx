"use client";

import { useState } from "react";
import { syncExternalData, SyncResult } from "@/app/_actions/sync";
import { useFormAction } from "@/app/_lib/hooks";
import { Button } from "@/components/ui/button";

export default function SyncButton() {
  const [status, setStatus] = useState<string | null>(null);

  const { execute, isPending } = useFormAction(
    async () => {
      setStatus("Syncing...");
      const result: SyncResult = await syncExternalData();
      if (result.success && result.counts) {
        setStatus(
          `Synced! Chars: ${result.counts.characters}, Eps: ${result.counts.episodes}, Locs: ${result.counts.locations}`
        );
      } else {
        setStatus("Sync failed. Check console.");
      }
      return result;
    },
    { onError: () => setStatus("Error invoking sync.") }
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={() => execute()} disabled={isPending}>
        {isPending ? "Syncing..." : "Sync Data from API"}
      </Button>
      {status && <p className="text-sm text-gray-500">{status}</p>}
    </div>
  );
}
