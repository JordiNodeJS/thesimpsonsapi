import { pool } from "@/app/_lib/db";
import CharacterImage from "@/app/_components/CharacterImage";
import { notFound } from "next/navigation";
import FollowButton from "@/app/_components/FollowButton";
import CommentSection from "@/app/_components/CommentSection";
import TriviaSection from "@/app/_components/TriviaSection";
import { isFollowing, getComments } from "@/app/_actions/social";
import { getTrivia } from "@/app/_actions/trivia";

async function getCharacter(id: string) {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM characters WHERE id = $1`, [
      id,
    ]);
    return res.rows[0];
  } finally {
    client.release();
  }
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = await getCharacter(id);

  if (!character) notFound();

  const following = await isFollowing(parseInt(id));
  const comments = await getComments(parseInt(id));
  const trivia = await getTrivia("CHARACTER", parseInt(id));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6 text-center md:text-left">
          <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <CharacterImage
              src={character.image_url}
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
