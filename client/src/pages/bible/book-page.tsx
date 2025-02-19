import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Book } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { BIBLE_BOOKS } from "../bible-page";

export default function BibleBookPage() {
  const [, params] = useRoute("/bible/:book");
  const [, setLocation] = useLocation();
  const bookName = params?.book ? decodeURIComponent(params.book) : "";
  const numberOfChapters = BIBLE_BOOKS[bookName as keyof typeof BIBLE_BOOKS] || 0;

  if (!bookName || !numberOfChapters) {
    setLocation("/bible");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/bible">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">
            {bookName} - Bíblia Sagrada (ACF'07)
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Capítulos de {bookName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {Array.from({ length: numberOfChapters }, (_, i) => i + 1).map(
                  (chapter) => (
                    <Button
                      key={chapter}
                      variant="outline"
                      onClick={() =>
                        setLocation(
                          `/bible/${encodeURIComponent(bookName)}/${chapter}`
                        )
                      }
                    >
                      {chapter}
                    </Button>
                  )
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
