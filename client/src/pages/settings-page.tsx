import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Moon, Sun, User, QrCode } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select"; // Assuming this import is correct


export default function SettingsPage() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar o QR Code PIX
  const { data: qrCodeData } = useQuery({
    queryKey: ['/api/qrcode-pix'],
    enabled: true,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async () => {
      setIsSaving(true);
      const response = await fetch('/api/settings/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Falha ao salvar progresso');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Seu progresso foi salvo com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Houve um erro ao salvar seu progresso.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
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
          <h1 className="text-xl font-bold">Configurações</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Username</Label>
                <p className="text-muted-foreground">{user?.username}</p>
              </div>
              <div>
                <Label className="font-bold">Nova Criatura</Label>
                <div className="mt-2 space-y-2">
                  <div>
                    <Label>Idade quando aceitou Jesus</Label>
                    <Input 
                      value={user?.salvationAge || ''} 
                      onChange={(e) => {
                        // TODO: Implement update
                        console.log(e.target.value);
                      }} 
                    />
                  </div>
                  <div>
                    <Label>Data/Ano do Batismo</Label>
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
                {isDarkMode ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
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
                <Save className="h-5 w-5" />
                Salvar Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label>Salvar seu progresso atual</Label>
                <Button 
                  onClick={() => saveProgressMutation.mutate()} 
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar Agora"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Doar via PIX
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
                    Escaneie o código QR com seu aplicativo bancário para fazer uma doação
                  </p>
                  <div className="text-sm text-muted-foreground space-y-4 max-w-xl text-center">
                    <h3 className="font-semibold text-base text-foreground">📌 Meu QR Code para Doações</h3>
                    <p>
                      Este é o QR Code oficial do nosso aplicativo. Caso queira apoiar o desenvolvimento, sinta-se à vontade para contribuir via Pix.
                    </p>
                    <div className="space-y-2">
                      <p>✅ 70% das doações são investidas diretamente no desenvolvimento do app.</p>
                      <p>✅ 30% é utilizado para despesas pessoais, garantindo que eu possa continuar trabalhando neste projeto.</p>
                      <p>✅ As doações são totalmente voluntárias e não há taxas ou cobranças dentro do aplicativo.</p>
                    </div>
                    <p className="italic">
                      "E disse-lhes: Ide por todo o mundo e pregai o evangelho a toda criatura." <span className="font-medium">*(Marcos 16:15)*</span>
                    </p>
                    <p>
                      Agradeço imensamente a todos que apoiam este projeto! Seu suporte nos ajuda a crescer e melhorar a cada dia.
                    </p>
                    <p className="font-medium">
                      Atenciosamente, Felipe Benchimol ~ Desenvolvedor.
                    </p>
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