"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl",
          title: "text-zinc-900 dark:text-zinc-100 font-bold",
          description: "text-zinc-600 dark:text-zinc-400",
          actionButton: "bg-yellow-500 text-white hover:bg-yellow-600",
          cancelButton:
            "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
          error: "border-red-500 dark:border-red-700",
          success: "border-green-500 dark:border-green-700",
          warning: "border-yellow-500 dark:border-yellow-700",
          info: "border-blue-500 dark:border-blue-700",
        },
      }}
      richColors
      closeButton
    />
  );
}
