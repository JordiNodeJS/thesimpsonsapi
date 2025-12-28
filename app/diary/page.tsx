import { pool } from "@/app/_lib/db";
import DiaryForm from "@/app/_components/DiaryForm";
import { getDiaryEntries, getLocations } from "@/app/_actions/diary";

async function getCharacters() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, name FROM characters ORDER BY name ASC`
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export default async function DiaryPage() {
  const [characters, locations, entries] = await Promise.all([
    getCharacters(),
    getLocations(),
    getDiaryEntries(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Springfield Diary</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <DiaryForm characters={characters} locations={locations} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold">Your Timeline</h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground">
              No entries yet. Start living your Springfield life!
            </p>
          ) : (
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-8">
              {entries.map((entry) => (
                <div key={entry.id} className="ml-6 relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-yellow-400 border-2 border-white dark:border-zinc-950" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </span>
                    <h3 className="text-lg font-medium">
                      With{" "}
                      <span className="font-bold text-yellow-600 dark:text-yellow-400">
                        {entry.character_name}
                      </span>{" "}
                      at {entry.location_name}
                    </h3>
                    <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg mt-2">
                      {entry.activity_description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
