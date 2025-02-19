import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Moon, Sun, User, QrCode, Languages } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface QRCodeData {
  qrCodeUrl: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t, i18n } = useTranslation();

  // Buscar o QR Code PIX
  const { data: qrCodeData } = useQuery<QRCodeData>({
    queryKey: ['/api/qrcode-pix'],
    enabled: true,
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('settings.personalData')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Username</Label>
                <p className="text-muted-foreground">{user?.username}</p>
              </div>
              <div>
                <Label className="font-bold">{t('settings.newCreature.title')}</Label>
                <div className="mt-2 space-y-2">
                  <div>
                    <Label>{t('settings.newCreature.salvationAge')}</Label>
                    <Input 
                      value={user?.salvationAge || ''} 
                      onChange={(e) => {
                        // TODO: Implement update
                        console.log(e.target.value);
                      }} 
                    />
                  </div>
                  <div>
                    <Label>{t('settings.newCreature.baptismDate')}</Label>
                    <Input 
                      value={user?.baptismDate || ''} 
                      onChange={(e) => {
                        // TODO: Implement update
                        console.log(e.target.value);
                      }} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                {t('settings.language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={i18n.language}
                onValueChange={changeLanguage}
              >
                <SelectTrigger>
                  <SelectValue>{t(`settings.languages.${i18n.language}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">{t('settings.languages.pt')}</SelectItem>
                  <SelectItem value="en">{t('settings.languages.en')}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                {t('settings.appearance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">{t('settings.darkMode')}</Label>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t('settings.donate.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {qrCodeData?.qrCodeUrl ? (
                <>
                  <img 
                    src={qrCodeData.qrCodeUrl} 
                    alt="QR Code PIX" 
                    className="w-48 h-48"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {t('settings.donate.scanQR')}
                  </p>
                  <div className="text-sm text-muted-foreground space-y-4 max-w-xl text-center">
                    <h3 className="font-semibold text-base text-foreground">
                      {t('settings.donate.qrTitle')}
                    </h3>
                    <p>{t('settings.donate.description')}</p>
                    <div className="space-y-2">
                      <p>{t('settings.donate.usage.development')}</p>
                      <p>{t('settings.donate.usage.personal')}</p>
                      <p>{t('settings.donate.usage.voluntary')}</p>
                    </div>
                    <p className="italic">{t('settings.donate.verse')}</p>
                    <p>{t('settings.donate.thanks')}</p>
                    <p className="font-medium">{t('settings.donate.signature')}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Carregando QR Code PIX...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}