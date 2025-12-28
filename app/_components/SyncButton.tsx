"use client";

import { useState } from "react";
import { syncExternalData } from "@/app/_actions/sync";
import { Button } from "@/components/ui/button";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setStatus("Syncing...");
    try {
      const result = await syncExternalData();
      if (result.success) {
        setStatus(
          `Synced! Chars: ${result.counts?.characters}, Eps: ${result.counts?.episodes}, Locs: ${result.counts?.locations}`
        );
      } else {
        setStatus("Sync failed. Check console.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Error invoking sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={handleSync} disabled={loading}>
        {loading ? "Syncing..." : "Sync Data from API"}
      </Button>
      {status && <p className="text-sm text-gray-500">{status}</p>}
    </div>
  );
}
