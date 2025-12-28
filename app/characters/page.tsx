import Link from "next/link";
import CharacterImage from "@/app/_components/CharacterImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentlyViewedList from "@/app/_components/RecentlyViewedList";
import { findAllCharacters } from "@/app/_lib/repositories";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  let characters: Awaited<ReturnType<typeof findAllCharacters>> = [];
  let error = null;

  try {
    characters = await findAllCharacters();
  } catch (e) {
    console.error("Error loading characters:", e);
    error = "Failed to load characters. Please try again later.";
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Springfield Citizens</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 mb-6">
          {error}
        </div>
      )}

      <RecentlyViewedList />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {characters.map((char) => (
          <Link key={char.id} href={`/characters/${char.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden text-center">
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
      </div>
    </div>
  );
}
