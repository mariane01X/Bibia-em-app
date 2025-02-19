import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Book } from "lucide-react";
import { Link, useLocation } from "wouter";
//import { useState } from "react"; //Removed as no longer needed.

const BIBLE_BOOKS = {
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
  const [, setLocation] = useLocation();

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Livros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(BIBLE_BOOKS).map(([book, chapters]) => (
                  <Button
                    key={book}
                    variant="outline"
                    className="justify-start"
                    onClick={() => setLocation(`/bible/${encodeURIComponent(book)}`)}
                  >
                    <Book className="h-4 w-4 mr-2" />
                    {book}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export { BIBLE_BOOKS };