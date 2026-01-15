import { getCollections } from "@/app/_actions/collections";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CreateCollectionForm from "@/app/_components/CreateCollectionForm";
import { getCurrentUserOptional } from "@/app/_lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  // Verificar autenticación primero
  const user = await getCurrentUserOptional();
  if (!user) {
    redirect("/login");
  }

  const collections = await getCollections();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quote Collections</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <CreateCollectionForm />
        </div>

        <div className="md:col-span-2 grid gap-4">
          {collections.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                No collections yet
              </p>
              <p className="text-sm text-muted-foreground">
                Create your first collection to start saving memorable quotes!
              </p>
            </div>
          ) : (
            collections.map((col) => (
              <Card key={col.id}>
                <CardHeader>
                  <CardTitle>{col.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {col.description}
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      View Quotes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
