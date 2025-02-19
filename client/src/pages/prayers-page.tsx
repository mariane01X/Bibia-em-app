import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Plus, Bell, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPrayerSchema } from "@shared/schema";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Prayer } from "@shared/schema";

const CATEGORIAS = [
  "Pessoal",
  "Família",
  "Amigos",
  "Igreja",
  "Missões",
  "Outros",
];

type FormData = {
  titulo: string;
  descricao: string;
  categoria: string;
  foiRespondida: boolean;
  lembretes: string[];
};

export default function PrayersPage() {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(
      insertPrayerSchema.omit({ usuarioId: true })
    ),
    defaultValues: {
      titulo: "",
      descricao: "",
      categoria: "Pessoal",
      foiRespondida: false,
      lembretes: [],
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

  const toggleAnsweredMutation = useMutation({
    mutationFn: async ({ id, foiRespondida }: { id: string; foiRespondida: boolean }) => {
      const res = await apiRequest("PATCH", `/api/prayers/${id}`, { foiRespondida });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

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
                <form
                  onSubmit={form.handleSubmit((data) =>
                    createPrayerMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Descrição</FormLabel>
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
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIAS.map((categoria) => (
                              <SelectItem key={categoria} value={categoria}>
                                {categoria}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createPrayerMutation.isPending}
                  >
                    Salvar Pedido de Oração
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {prayers?.map((prayer) => (
            <Card key={prayer.id} className={prayer.foiRespondida ? "opacity-75" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {prayer.titulo}
                    {Array.isArray(prayer.lembretes) && prayer.lembretes.length > 0 && (
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline">{prayer.categoria}</Badge>
                  </CardDescription>
                </div>
                <FormField
                  control={form.control}
                  name="foiRespondida"
                  render={() => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={prayer.foiRespondida || false}
                          onCheckedChange={(checked) =>
                            toggleAnsweredMutation.mutate({
                              id: prayer.id,
                              foiRespondida: !!checked,
                            })
                          }
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Respondida
                      </FormLabel>
                    </FormItem>
                  )}
                />
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