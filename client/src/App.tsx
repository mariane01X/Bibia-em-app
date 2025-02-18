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
import BiblePage from "@/pages/bible-page"; //Import the BiblePage component

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/memorize" component={MemorizePage} />
      <ProtectedRoute path="/devotionals" component={DevotionalsPage} />
      <ProtectedRoute path="/prayers" component={PrayersPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/bible" component={BiblePage} /> {/* Added Bible route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;