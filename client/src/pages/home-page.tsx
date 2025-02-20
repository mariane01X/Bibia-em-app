import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookMarked, BookOpen, Heart, LogOut, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  if (!auth) {
    return <p className="text-center text-lg mt-10">{t('common.loading')}</p>;
  }

  const { user, logoutMutation } = auth;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center mb-2">
            <h1 className="text-2xl font-bold text-primary">{t('app.stylizedName')}</h1>
            <p className="text-sm text-muted-foreground">{t('app.description')}</p>
          </div>
          <div className="flex justify-between items-center">
            <h2 className="text-xl">{t('home.welcome', { name: user?.nomeUsuario })}</h2>
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
                {t('common.logout')}
              </Button>
            </div>
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
                  {t('home.memorization.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('home.memorization.description')}
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
                  {t('home.devotionals.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('home.devotionals.description')}
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
                  {t('home.prayers.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('home.prayers.description')}
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
                  {t('home.bible.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('home.bible.description')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}