import { pool } from "@/app/_lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getEpisodes() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM episodes 
      ORDER BY season ASC, episode_number ASC 
      LIMIT 50
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

export default async function EpisodesPage() {
  const episodes = await getEpisodes();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Episodes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {episodes.map((ep) => (
          <Link key={ep.id} href={`/episodes/${ep.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
              <div className="relative h-48 w-full">
                {ep.image_url && (
                  <Image
                    src={ep.image_url}
                    alt={ep.title}
                    fill
                    className="object-cover"
                  />
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
      </div>
    </div>
  );
}
