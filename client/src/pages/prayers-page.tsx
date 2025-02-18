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

const CATEGORIES = [
  "Personal",
  "Family",
  "Friends",
  "Church",
  "Missions",
  "Other",
];

export default function PrayersPage() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(
      insertPrayerSchema.omit({ userId: true })
    ),
    defaultValues: {
      title: "",
      description: "",
      category: "Personal",
      isAnswered: false,
      reminders: [],
    },
  });

  const { data: prayers, isLoading } = useQuery<Prayer[]>({
    queryKey: ["/api/prayers"],
  });

  const createPrayerMutation = useMutation({
    mutationFn: async (data: Parameters<typeof form.handleSubmit>[0]) => {
      const res = await apiRequest("POST", "/api/prayers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({
        title: "Prayer request added",
        description: "Your prayer request has been saved successfully.",
      });
      form.reset();
    },
  });

  const toggleAnsweredMutation = useMutation({
    mutationFn: async ({ id, isAnswered }: { id: number; isAnswered: boolean }) => {
      const res = await apiRequest("PATCH", `/api/prayers/${id}`, { isAnswered });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Prayer Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Prayer Request</DialogTitle>
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
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
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
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
                    Save Prayer Request
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {prayers?.map((prayer) => (
            <Card key={prayer.id} className={prayer.isAnswered ? "opacity-75" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {prayer.title}
                    {Array.isArray(prayer.reminders) && prayer.reminders.length > 0 && (
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline">{prayer.category}</Badge>
                  </CardDescription>
                </div>
                <FormField
                  control={form.control}
                  name="isAnswered"
                  render={() => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={prayer.isAnswered}
                          onCheckedChange={(checked) =>
                            toggleAnsweredMutation.mutate({
                              id: prayer.id,
                              isAnswered: !!checked,
                            })
                          }
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Answered
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{prayer.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}