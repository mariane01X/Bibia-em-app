import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Book } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { BIBLE_BOOKS } from "../bible-page";

export default function BibleChapterPage() {
  const [, params] = useRoute("/bible/:book/:chapter");
  const [, setLocation] = useLocation();
  const bookName = params?.book ? decodeURIComponent(params.book) : "";
  const chapter = params?.chapter ? parseInt(params.chapter) : 0;
  const maxChapters = BIBLE_BOOKS[bookName as keyof typeof BIBLE_BOOKS] || 0;

  if (!bookName || !chapter || chapter > maxChapters) {
    setLocation("/bible");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/bible/${encodeURIComponent(bookName)}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">
            {bookName} {chapter} - Bíblia Sagrada (ACF'07)
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              {bookName} - Capítulo {chapter}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              <div className="space-y-4">
                {/* TODO: Implement API call to fetch verses */}
                <p className="text-muted-foreground">
                  Em breve, os versículos serão mostrados aqui...
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
