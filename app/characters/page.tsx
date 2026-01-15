import { Suspense } from "react";
import Link from "next/link";
import CharacterImage from "@/app/_components/CharacterImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentlyViewedList from "@/app/_components/RecentlyViewedList";
import { findAllCharacters } from "@/app/_lib/repositories";
import { CharacterCardSkeleton } from "@/app/_components/Skeleton";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

async function CharacterList() {
  let characters: Awaited<ReturnType<typeof findAllCharacters>> = [];
  let error = null;

  try {
    characters = await findAllCharacters();
  } catch (e) {
    console.error("Error loading characters:", e);
    error = "Failed to load characters. Please try again later.";
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {characters.map((char) => (
          <Link key={char.id} href={`/characters/${char.id}`}>
            <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer overflow-hidden text-center">
              <div className="relative h-48 w-full mt-4">
                <CharacterImage
                  src={char.image_url}
                  alt={char.name}
                  fill
                  className="object-contain"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{char.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {char.occupation || "Unknown"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>    </>
  );
}

export default function CharactersPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Springfield Citizens</h1>

      <RecentlyViewedList />

      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <CharacterList />
      </Suspense>    </div>
  );
}
