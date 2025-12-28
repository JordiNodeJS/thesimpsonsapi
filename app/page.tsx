import { pool } from "@/app/_lib/db";
import Link from "next/link";
import CharacterImage from "@/app/_components/CharacterImage";
import IntroSection from "@/app/_components/IntroSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tv, Users, BookOpen, Star, ArrowRight, Quote } from "lucide-react";
import SyncButton from "@/app/_components/SyncButton";

async function getStats() {
  const client = await pool.connect();
  try {
    const charCount = await client.query("SELECT COUNT(*) FROM characters");
    const epCount = await client.query("SELECT COUNT(*) FROM episodes");
    const triviaCount = await client.query("SELECT COUNT(*) FROM trivia_facts");
    return {
      characters: parseInt(charCount.rows[0].count),
      episodes: parseInt(epCount.rows[0].count),
      trivia: parseInt(triviaCount.rows[0].count),
    };
  } finally {
    client.release();
  }
}

async function getFeaturedCharacters() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM characters 
      WHERE name IN ('Homer Simpson', 'Marge Simpson', 'Bart Simpson', 'Lisa Simpson', 'Maggie Simpson')
      LIMIT 5
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

async function getLatestTrivia() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT t.*, u.username 
      FROM trivia_facts t
      JOIN users u ON t.submitted_by_user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 3
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

export default async function Home() {
  const stats = await getStats();
  const featuredChars = await getFeaturedCharacters();
  const latestTrivia = await getLatestTrivia();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black overflow-x-hidden">
      <IntroSection />

      {/* Quick Actions */}
      <section className="py-12 px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-6">
            <Button
              asChild
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black px-10 py-8 text-xl rounded-2xl shadow-lg hover:shadow-yellow-500/20 transition-all hover:-translate-y-1"
            >
              <Link href="/episodes">
                <Tv className="mr-3 w-6 h-6" /> Start Tracking
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-10 py-8 text-xl rounded-2xl border-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all hover:-translate-y-1"
            >
              <Link href="/characters">
                <Users className="mr-3 w-6 h-6" /> Meet the Cast
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-12 border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-black dark:text-white">
                {stats.episodes}+
              </span>
              <span className="text-sm text-zinc-500 uppercase tracking-widest">
                Episodes
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-black dark:text-white">
                {stats.characters}+
              </span>
              <span className="text-sm text-zinc-500 uppercase tracking-widest">
                Characters
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-black dark:text-white">
                {stats.trivia}+
              </span>
              <span className="text-sm text-zinc-500 uppercase tracking-widest">
                Trivia Facts
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-black dark:text-white">
                35+
              </span>
              <span className="text-sm text-zinc-500 uppercase tracking-widest">
                Seasons
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Characters */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                The Main Cast
              </h2>
              <p className="text-zinc-500 mt-2">
                The family that started it all.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/characters" className="group">
                View all{" "}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {featuredChars.map((char) => (
              <Link
                key={char.id}
                href={`/characters/${char.id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all group-hover:border-yellow-500/50 group-hover:shadow-2xl group-hover:shadow-yellow-500/10">
                  <CharacterImage
                    src={char.image_url}
                    alt={char.name}
                    fill
                    className="object-contain p-4 transition-transform group-hover:scale-110"
                  />
                  {/* Floating Label */}
                  <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 transition-all group-hover:bg-[#FFD90F] group-hover:border-[#FFD90F] group-hover:shadow-lg group-hover:-translate-y-1">
                    <p className="text-zinc-900 dark:text-zinc-100 font-black text-[10px] uppercase tracking-[0.2em] truncate text-center group-hover:text-black transition-colors">
                      {char.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-black">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Episode Tracker</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Keep track of every episode you&apos;ve watched. Rate them, take
                notes, and never miss a moment of Springfield history.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-black">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Character Profiles</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Deep dive into the lives of Springfield&apos;s finest. Follow
                characters to get updates and see what others are saying.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-black">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Personal Diary</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Document your journey through the series. Create collections of
                your favorite quotes and moments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Trivia */}
      {latestTrivia.length > 0 && (
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight">
                Community Trivia
              </h2>
              <p className="text-zinc-500 mt-2">
                Fresh facts from the Springfield community.
              </p>
            </div>

            <div className="space-y-6">
              {latestTrivia.map((trivia) => (
                <div
                  key={trivia.id}
                  className="relative p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <Quote className="absolute top-6 left-6 w-8 h-8 text-yellow-500/20" />
                  <p className="text-xl italic relative z-10 leading-relaxed">
                    &quot;{trivia.content}&quot;
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <span className="text-sm font-medium">
                        {trivia.username}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase tracking-tighter"
                    >
                      {trivia.related_entity_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admin Zone (Footer-ish) */}
      <section className="py-24 px-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold mb-4">System Status</h2>
          <p className="text-zinc-500 mb-8">
            Keep the Springfield database in sync with the latest data from the
            API.
          </p>
          <div className="p-8 border rounded-3xl bg-white dark:bg-zinc-950 shadow-xl shadow-yellow-500/5">
            <SyncButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Springfield Life. Built for fans, by
          fans.
        </p>
      </footer>
    </div>
  );
}
