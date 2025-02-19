import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MemorizePage from "@/pages/memorize-page";
import DevotionalsPage from "@/pages/devotionals-page";
import PrayersPage from "@/pages/prayers-page";
import SettingsPage from "@/pages/settings-page";
import NotFound from "@/pages/not-found";
import BiblePage from "@/pages/bible-page";
import BibleBookPage from "@/pages/bible/book-page";
import BibleChapterPage from "@/pages/bible/chapter-page";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/memorize" component={MemorizePage} />
      <ProtectedRoute path="/devotionals" component={DevotionalsPage} />
      <ProtectedRoute path="/prayers" component={PrayersPage} />
      <Route path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/bible" component={BiblePage} />
      <ProtectedRoute path="/bible/:book" component={BibleBookPage} />
      <ProtectedRoute path="/bible/:book/:chapter" component={BibleChapterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export default App;