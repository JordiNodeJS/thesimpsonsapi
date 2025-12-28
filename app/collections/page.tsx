import { getCollections } from "@/app/_actions/collections";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CreateCollectionForm from "@/app/_components/CreateCollectionForm";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  try {
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
              <p className="text-muted-foreground">
                No collections yet. Create one to start saving quotes!
              </p>
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
  } catch (error) {
    console.error("Error loading collections page:", error);
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Error loading collections
        </h1>
        <p className="text-zinc-500 mt-2">
          We couldn't load your quote collections. Please try again later.
        </p>
      </div>
    );
  }
}
