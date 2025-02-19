import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookMarked, BookOpen, Heart, LogOut, Settings } from "lucide-react";

export default function HomePage() {
  const auth = useAuth();
  const [, setLocation] = useLocation();

  if (!auth) {
    return <p className="text-center text-lg mt-10">Carregando...</p>;
  }

  const { user, logoutMutation } = auth;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Bem-vindo, {user?.nomeUsuario}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 py-4">
        <div className="grid gap-4 grid-cols-2">
          {/* Memorization */}
          <Link href="/memorize">
            <Card className="cursor-pointer hover:bg-primary/5 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Memorização de Versículos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pratique e memorize versículos bíblicos com ferramentas interativas
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Devotionals */}
          <Link href="/devotionals">
            <Card className="cursor-pointer hover:bg-primary/5 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Devocionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organize e acesse suas devocionais e anotações de sermões
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Prayer Requests */}
          <Link href="/prayers">
            <Card className="cursor-pointer hover:bg-primary/5 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Pedidos de Oração
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acompanhe e gerencie seus pedidos de oração e respostas
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Bible */}
          <Link href="/bible">
            <Card className="cursor-pointer hover:bg-primary/5 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Bíblia Sagrada (ACF'07)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acesse a Bíblia Sagrada na tradução Almeida Corrigida Fiel (2007)
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}