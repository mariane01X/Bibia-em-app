import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Eye, EyeOff, Plus, Info } from "lucide-react";
import { useState } from "react";
import type { Verse } from "@shared/schema";
import { insertVerseSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PROGRESS_LEVELS = [
  { value: 0, label: "Não memorizado", description: "Acabou de adicionar o versículo" },
  { value: 25, label: "Início", description: "Consegue lembrar algumas partes" },
  { value: 50, label: "Metade", description: "Sabe metade do versículo" },
  { value: 75, label: "Quase lá", description: "Conhece quase todo o versículo" },
  { value: 100, label: "Memorizado", description: "Memorizou completamente!" },
];

type VerseFormData = {
  referencia: string;
  conteudo: string;
  categoria: string;
  progresso: string;
};

export default function MemorizePage() {
  const { toast } = useToast();
  const [showContent, setShowContent] = useState(true);
  const [showTips, setShowTips] = useState(false);

  const form = useForm<VerseFormData>({
    resolver: zodResolver(insertVerseSchema.omit({ usuarioId: true })),
    defaultValues: {
      referencia: "",
      conteudo: "",
      categoria: "",
      progresso: "0",
    },
  });

  const { data: verses, isLoading } = useQuery<Verse[]>({
    queryKey: ["/api/verses"],
  });

  const createVerseMutation = useMutation({
    mutationFn: async (data: VerseFormData) => {
      const res = await apiRequest("POST", "/api/verses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verses"] });
      toast({
        title: "Versículo adicionado",
        description: "O versículo foi salvo com sucesso.",
      });
      form.reset();
    },
  });

  const updateVerseMutation = useMutation({
    mutationFn: async ({ id, progresso }: { id: string; progresso: string }) => {
      const res = await apiRequest("PATCH", `/api/verses/${id}`, { progresso: progresso.toString() });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verses"] });
      toast({
        title: "Progresso atualizado",
        description: "Seu progresso de memorização foi salvo.",
      });
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Versículo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Versículo</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    createVerseMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="referencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: João 3:16" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="conteudo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Versículo</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria (opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Salvação" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createVerseMutation.isPending}
                  >
                    Salvar Versículo
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => setShowContent(!showContent)}
          >
            {showContent ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar Texto
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Mostrar Texto
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowTips(!showTips)}
          >
            <Info className="h-4 w-4 mr-2" />
            Dicas
          </Button>
        </div>

        {showTips && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Como usar o sistema de memorização:</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Leia o versículo várias vezes para familiarização</li>
                <li>Use o botão "Ocultar Texto" para testar sua memória</li>
                <li>Tente recitar o versículo sem olhar</li>
                <li>Marque seu progresso usando os botões de porcentagem</li>
                <li>Pratique regularmente até atingir 100%</li>
              </ol>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {verses?.map((verse) => (
            <Card key={verse.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{verse.referencia}</span>
                  <div className="flex flex-col items-end text-sm">
                    {verse.categoria && (
                      <span className="text-muted-foreground">
                        {verse.categoria}
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs">
                      Adicionado em: {new Date(verse.dataCriacao!).toLocaleString()}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`mb-4 text-lg ${
                    showContent ? "" : "filter blur-sm"
                  }`}
                >
                  {verse.conteudo}
                </p>
                <div className="space-y-2">
                  <Progress 
                    value={parseInt(verse.progresso || "0")} 
                    className="w-full h-2"
                  />
                  <div className="flex gap-2">
                    <TooltipProvider>
                      {PROGRESS_LEVELS.map(({ value, label, description }) => (
                        <Tooltip key={value}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={parseInt(verse.progresso || "0") === value ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                updateVerseMutation.mutate({
                                  id: verse.id,
                                  progresso: value.toString(),
                                })
                              }
                              disabled={updateVerseMutation.isPending}
                            >
                              {value}%
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p><strong>{label}</strong></p>
                            <p className="text-sm">{description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}