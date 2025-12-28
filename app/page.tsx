import SyncButton from "@/app/_components/SyncButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          Springfield Life & Tracker
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Welcome to the ultimate Simpsons companion app. Track episodes, follow
          characters, and live the Springfield life.
        </p>

        <div className="p-6 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Admin Zone</h2>
          <SyncButton />
        </div>
      </main>
    </div>
  );
}
