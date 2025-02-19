import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Plus, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPrayerSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Prayer } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

type FormData = {
  titulo: string;
  descricao: string;
  idade: string;
};

export default function PrayersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(insertPrayerSchema.omit({ usuarioId: true })),
    defaultValues: {
      titulo: "",
      descricao: "",
      idade: "",
    },
  });

  const { data: prayers, isLoading } = useQuery<Prayer[]>({
    queryKey: ["/api/prayers"],
  });

  const createPrayerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/prayers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({
        title: "Pedido de oração adicionado",
        description: "Seu pedido de oração foi salvo com sucesso.",
      });
      form.reset();
    },
  });

  const prayForMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await apiRequest("PATCH", `/api/prayers/${id}`, {
        oradores: [...(prayers?.find(p => p.id === id)?.oradores || []), user?.id],
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
    },
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
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
                Novo Pedido de Oração
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Pedido de Oração</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createPrayerMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo da Oração</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createPrayerMutation.isPending}>
                    Salvar Pedido de Oração
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {prayers?.map((prayer) => (
            <Card key={prayer.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {prayer.titulo} ({prayer.idade} anos)
                  </CardTitle>
                  <CardDescription>
                    <span className="text-sm text-muted-foreground">
                      {prayer.oradores?.length || 0} pessoas orando
                    </span>
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => prayForMutation.mutate({ id: prayer.id })}
                  disabled={prayer.oradores?.includes(user?.id || "")}
                  className={prayer.oradores?.includes(user?.id || "") ? "bg-primary text-primary-foreground" : ""}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {prayer.oradores?.includes(user?.id || "") ? "Orando" : "Irei Orar"}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{prayer.descricao}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}