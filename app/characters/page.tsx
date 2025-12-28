import { pool } from "@/app/_lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getCharacters() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM characters 
      ORDER BY id ASC 
      LIMIT 50
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

export default async function CharactersPage() {
  const characters = await getCharacters();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Springfield Citizens</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {characters.map((char) => (
          <Link key={char.id} href={`/characters/${char.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden text-center">
              <div className="relative h-48 w-full mt-4">
                {char.image_url && (
                  <Image
                    src={char.image_url}
                    alt={char.name}
                    fill
                    className="object-contain"
                  />
                )}
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
