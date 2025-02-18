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

export default function MemorizePage() {
  const { toast } = useToast();
  const [showContent, setShowContent] = useState(true);
  const [showTips, setShowTips] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertVerseSchema.omit({ userId: true })),
    defaultValues: {
      reference: "",
      content: "",
      category: "",
      progress: "0",
    },
  });

  const { data: verses, isLoading } = useQuery<Verse[]>({
    queryKey: ["/api/verses"],
  });

  const createVerseMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
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
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const res = await apiRequest("PATCH", `/api/verses/${id}`, { progress });
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
    return <div>Loading...</div>;
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
                    name="reference"
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
                    name="content"
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
                    name="category"
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
                  <span>{verse.reference}</span>
                  {verse.category && (
                    <span className="text-sm text-muted-foreground">
                      {verse.category}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`mb-4 text-lg ${
                    showContent ? "" : "filter blur-sm"
                  }`}
                >
                  {verse.content}
                </p>
                <div className="space-y-2">
                  <Progress 
                    value={parseInt(verse.progress)} 
                    className="w-full h-2"
                  />
                  <div className="flex gap-2">
                    <TooltipProvider>
                      {PROGRESS_LEVELS.map(({ value, label, description }) => (
                        <Tooltip key={value}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={parseInt(verse.progress) === value ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                updateVerseMutation.mutate({
                                  id: verse.id,
                                  progress: value,
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