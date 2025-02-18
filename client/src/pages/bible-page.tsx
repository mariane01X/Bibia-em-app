
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Book } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const BIBLE_STRUCTURE = {
  "Gênesis": 50,
  "Êxodo": 40,
  "Levítico": 27,
  "Números": 36,
  "Deuteronômio": 34,
  "Josué": 24,
  "Juízes": 21,
  "Rute": 4,
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Reis": 22,
  "2 Reis": 25,
  "1 Crônicas": 29,
  "2 Crônicas": 36,
  "Esdras": 10,
  "Neemias": 13,
  "Ester": 10,
  "Jó": 42,
  "Salmos": 150,
  "Provérbios": 31,
  "Eclesiastes": 12,
  "Cânticos": 8,
  "Isaías": 66,
  "Jeremias": 52,
  "Lamentações": 5,
  "Ezequiel": 48,
  "Daniel": 12,
  "Oséias": 14,
  "Joel": 3,
  "Amós": 9,
  "Obadias": 1,
  "Jonas": 4,
  "Miquéias": 7,
  "Naum": 3,
  "Habacuque": 3,
  "Sofonias": 3,
  "Ageu": 2,
  "Zacarias": 14,
  "Malaquias": 4,
  "Mateus": 28,
  "Marcos": 16,
  "Lucas": 24,
  "João": 21,
  "Atos": 28,
  "Romanos": 16,
  "1 Coríntios": 16,
  "2 Coríntios": 13,
  "Gálatas": 6,
  "Efésios": 6,
  "Filipenses": 4,
  "Colossenses": 4,
  "1 Tessalonicenses": 5,
  "2 Tessalonicenses": 3,
  "1 Timóteo": 6,
  "2 Timóteo": 4,
  "Tito": 3,
  "Filemom": 1,
  "Hebreus": 13,
  "Tiago": 5,
  "1 Pedro": 5,
  "2 Pedro": 3,
  "1 João": 5,
  "2 João": 1,
  "3 João": 1,
  "Judas": 1,
  "Apocalipse": 22
};

export default function BiblePage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Bíblia Sagrada (ACF'07)</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Lista de Livros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Livros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-2">
                  {Object.keys(BIBLE_STRUCTURE).map((book) => (
                    <Button
                      key={book}
                      variant={selectedBook === book ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedBook(book);
                        setSelectedChapter(null);
                      }}
                    >
                      {book}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Lista de Capítulos */}
          {selectedBook && (
            <Card>
              <CardHeader>
                <CardTitle>Capítulos de {selectedBook}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh]">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from(
                      { length: BIBLE_STRUCTURE[selectedBook as keyof typeof BIBLE_STRUCTURE] },
                      (_, i) => i + 1
                    ).map((chapter) => (
                      <Button
                        key={chapter}
                        variant={selectedChapter === chapter ? "default" : "outline"}
                        onClick={() => setSelectedChapter(chapter)}
                      >
                        {chapter}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Versículos */}
          {selectedChapter && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedBook} {selectedChapter}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                    {/* TODO: Implementar chamada API para buscar versículos */}
                    <p className="text-muted-foreground">
                      Versículos serão carregados aqui...
                    </p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
