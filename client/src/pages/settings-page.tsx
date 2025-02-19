
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Moon, Sun, User, QrCode, Languages, Pencil } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QRCodeData {
  qrCodeUrl: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme ? savedTheme === 'dark' : systemTheme;
  });
  const { t, i18n } = useTranslation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    idadeConversao: user?.idadeConversao || '',
    dataBatismo: user?.dataBatismo || ''
  });

  const { data: qrCodeData } = useQuery<QRCodeData>({
    queryKey: ['/api/qrcode-pix'],
    enabled: true,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { idadeConversao?: string; dataBatismo?: string }) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso",
      });
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      setFormData({
        idadeConversao: user.idadeConversao || '',
        dataBatismo: user.dataBatismo || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: "idadeConversao" | "dataBatismo", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    updateUserMutation.mutate(formData);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
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
                <Label>Nome de Usuário</Label>
                <p className="text-muted-foreground">{user?.nomeUsuario}</p>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label className="font-bold">{t('settings.newCreature.title')}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                </div>
                <div className="mt-2 space-y-4">
                  <div>
                    <Label>{t('settings.newCreature.salvationAge')}</Label>
                    <p className="text-muted-foreground">{user?.idadeConversao || '-'}</p>
                  </div>
                  <div>
                    <Label>{t('settings.newCreature.baptismDate')}</Label>
                    <p className="text-muted-foreground">{user?.dataBatismo || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('settings.newCreature.title')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.newCreature.salvationAge')}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.idadeConversao}
                    onChange={(e) => handleInputChange("idadeConversao", e.target.value)}
                    disabled={updateUserMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.newCreature.baptismDate')}</Label>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="Ex: 2020"
                    value={formData.dataBatismo}
                    onChange={(e) => handleInputChange("dataBatismo", e.target.value)}
                    disabled={updateUserMutation.isPending}
                  />
                </div>
                <Button 
                  onClick={handleSave}
                  disabled={updateUserMutation.isPending}
                  className="w-full"
                >
                  {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
