import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookMarked, Heart, LogOut, Settings } from "lucide-react";

export default function HomePage() {
  const auth = useAuth();
  const [, setLocation] = useLocation();

  if (!auth) {
    return <p className="text-center text-lg mt-10">Carregando...</p>;
  }

  const { user, logoutMutation } = auth;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              className="text-black"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/memorize">
            <Card className="cursor-pointer hover:bg-primary/5 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Scripture Memorization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practice and memorize Bible verses with interactive tools
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/devotionals">
            <Card className="cursor-pointer hover:bg-primary/5 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Devotionals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organize and access your devotionals and sermon notes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/prayers">
            <Card className="cursor-pointer hover:bg-primary/5 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Prayer Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track and manage your prayer requests and answers
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}