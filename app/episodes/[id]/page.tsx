import { pool } from "@/app/_lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";
import EpisodeTracker from "@/app/_components/EpisodeTracker";
import TriviaSection from "@/app/_components/TriviaSection";
import { getEpisodeProgress } from "@/app/_actions/episodes";
import { getTrivia } from "@/app/_actions/trivia";

async function getEpisode(id: string) {
  try {
    const res = await pool.query(`SELECT * FROM episodes WHERE id = $1`, [id]);
    return res.rows[0];
  } catch (error) {
    console.error("Error in getEpisode:", error);
    throw error;
  }
}

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const episode = await getEpisode(id);

    if (!episode) notFound();

    const [progress, trivia] = await Promise.all([
      getEpisodeProgress(parseInt(id)),
      getTrivia("EPISODE", parseInt(id)),
    ]);

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden">
              {episode.image_url && (
                <Image
                  src={episode.image_url}
                  alt={episode.title}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{episode.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">
                Season {episode.season}, Episode {episode.episode_number}
              </p>
              <p className="text-lg leading-relaxed">{episode.synopsis}</p>
            </div>

            <TriviaSection
              entityType="EPISODE"
              entityId={episode.id}
              facts={trivia}
            />
          </div>

          <div className="space-y-6">
            <EpisodeTracker episodeId={episode.id} initialProgress={progress} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading episode detail:", error);
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Error loading episode
        </h1>
        <p className="text-zinc-500 mt-2">
          We couldn't find this episode of The Simpsons. Please try again later.
        </p>
      </div>
    );
  }
}
