import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { findAllEpisodes } from "@/app/_lib/repositories";
import { EpisodeCardSkeleton } from "@/app/_components/Skeleton";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

async function EpisodeList() {
  let episodes: Awaited<ReturnType<typeof findAllEpisodes>> = [];
  let error = null;

  try {
    episodes = await findAllEpisodes();
  } catch (e) {
    console.error("Error loading episodes:", e);
    error = "Failed to load episodes. Please try again later.";
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 mb-6"
      >
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {episodes.map((ep) => (
          <Link key={ep.id} href={`/episodes/${ep.id}`}>
            <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer overflow-hidden">
              <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800">
                {ep.image_url ? (
                  <Image
                    src={ep.image_url}
                    alt={ep.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-sm text-zinc-400">No image</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{ep.title}</CardTitle>
                  <Badge variant="secondary">
                    S{ep.season} E{ep.episode_number}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {ep.synopsis}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>    </>
  );
}

export default function EpisodesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Episodes</h1>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <EpisodeCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <EpisodeList />
      </Suspense>    </div>
  );
}
