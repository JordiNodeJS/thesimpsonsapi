import Image from "next/image";
import { notFound } from "next/navigation";
import EpisodeTracker from "@/app/_components/EpisodeTracker";
import TriviaSection from "@/app/_components/TriviaSection";
import { getEpisodeProgress } from "@/app/_actions/episodes";
import { getTrivia } from "@/app/_actions/trivia";
import { findEpisodeById } from "@/app/_lib/repositories";

async function loadEpisodeData(id: number) {
  const episode = await findEpisodeById(id);
  if (!episode) return null;

  const [progress, trivia] = await Promise.all([
    getEpisodeProgress(id),
    getTrivia("EPISODE", id),
  ]);

  return { episode, progress, trivia };
}

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadEpisodeData(parseInt(id));

  if (!data) {
    notFound();
  }

  const { episode, progress, trivia } = data;

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
                sizes="(max-width: 768px) 100vw, 66vw"
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
}
