import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { Verse } from "@shared/schema";

export default function MemorizePage() {
  const { toast } = useToast();
  const [showContent, setShowContent] = useState(true);

  const { data: verses, isLoading } = useQuery<Verse[]>({
    queryKey: ["/api/verses"],
  });

  const updateVerseMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: number; progress: number }) => {
      const res = await apiRequest("PATCH", `/api/verses/${id}`, { progress });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verses"] });
      toast({
        title: "Progress updated",
        description: "Your memorization progress has been saved.",
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
              Back to Home
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowContent(!showContent)}
          >
            {showContent ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Content
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Content
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6">
          {verses?.map((verse) => (
            <Card key={verse.id}>
              <CardHeader>
                <CardTitle>{verse.reference}</CardTitle>
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
                  <Progress value={verse.progress} className="w-full" />
                  <div className="flex gap-2">
                    {[0, 25, 50, 75, 100].map((progress) => (
                      <Button
                        key={progress}
                        variant={verse.progress === progress ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateVerseMutation.mutate({
                            id: verse.id,
                            progress,
                          })
                        }
                        disabled={updateVerseMutation.isPending}
                      >
                        {progress}%
                      </Button>
                    ))}
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
