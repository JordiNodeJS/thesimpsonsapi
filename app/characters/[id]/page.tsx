import CharacterImage from "@/app/_components/CharacterImage";
import { notFound } from "next/navigation";
import FollowButton from "@/app/_components/FollowButton";
import CommentSection from "@/app/_components/CommentSection";
import TriviaSection from "@/app/_components/TriviaSection";
import { isFollowing, getComments } from "@/app/_actions/social";
import { getTrivia } from "@/app/_actions/trivia";
import RecentlyViewedTracker from "@/app/_components/RecentlyViewedTracker";
import { findCharacterById } from "@/app/_lib/repositories";
import { Breadcrumbs } from "@/app/_components/Breadcrumbs";

async function loadCharacterData(id: number) {
  const character = await findCharacterById(id);
  if (!character) return null;

  const [following, comments, trivia] = await Promise.all([
    isFollowing(id),
    getComments(id),
    getTrivia("CHARACTER", id),
  ]);

  return { character, following, comments, trivia };
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadCharacterData(parseInt(id));

  if (!data) {
    notFound();
  }

  const { character, following, comments, trivia } = data;

  return (
    <div className="container mx-auto py-8 px-4">
      <RecentlyViewedTracker
        character={{
          id: character.id,
          name: character.name,
          image: character.image_url ?? "",
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Characters", href: "/characters" },
          { label: character.name },
        ]}
      />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6 text-center md:text-left">
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <CharacterImage
              src={character.image_url ?? ""}
              alt={character.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">{character.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">
              {character.occupation}
            </p>
            <FollowButton
              characterId={character.id}
              initialIsFollowing={following}
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="p-6 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold mb-4">Bio</h2>
            <p>
              A prominent resident of Springfield. Known for their role as{" "}
              {character.occupation}. (Note: Full bio data would come from a
              richer API response or wiki integration).
            </p>
          </div>

          <TriviaSection
            entityType="CHARACTER"
            entityId={character.id}
            facts={trivia}
          />
          <CommentSection characterId={character.id} comments={comments} />
        </div>
      </div>
    </div>
  );
}
