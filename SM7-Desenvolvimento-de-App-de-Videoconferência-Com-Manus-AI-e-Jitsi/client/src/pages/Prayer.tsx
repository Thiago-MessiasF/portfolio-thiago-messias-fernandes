import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, HandHeart, Lock, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function Prayer() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [authorName, setAuthorName] = useState(user?.name ?? "");

  const { data: requests, isLoading } = trpc.prayer.list.useQuery({ churchId: CHURCH_ID });

  const createRequest = trpc.prayer.create.useMutation({
    onSuccess: () => {
      toast.success("Pedido de oração enviado! A comunidade orará por você.");
      setTitle("");
      setContent("");
      setShowForm(false);
      utils.prayer.list.invalidate({ churchId: CHURCH_ID });
    },
    onError: () => toast.error("Erro ao enviar pedido"),
  });

  const prayFor = trpc.prayer.pray.useMutation({
    onSuccess: () => {
      utils.prayer.list.invalidate({ churchId: CHURCH_ID });
    },
  });

  const publicRequests = requests?.filter((r) => r.isPublic && r.status === "active") ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-950 to-slate-900 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="h-6 w-6 text-pink-300" />
            <span className="text-pink-300 text-sm font-medium uppercase tracking-wide">Comunidade</span>
          </div>
          <h1 className="font-serif text-4xl font-light">Pedidos de Oração</h1>
          <p className="text-white/60 mt-2">Compartilhe seus pedidos e ore pelos irmãos</p>
        </div>
      </div>

      <div className="container py-10 max-w-2xl">
        {/* Submit Button */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground text-sm">
            {publicRequests.length} pedido{publicRequests.length !== 1 ? "s" : ""} ativo{publicRequests.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancelar" : "Enviar Pedido"}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base font-medium">Novo Pedido de Oração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated && (
                <div className="space-y-1.5">
                  <Label>Seu nome</Label>
                  <Input
                    placeholder="Como podemos chamar você?"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Título do pedido</Label>
                <Input
                  placeholder="Ex: Cura para minha família"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Detalhes</Label>
                <Textarea
                  placeholder="Compartilhe mais detalhes sobre seu pedido..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={!isPublic}
                  onChange={(e) => setIsPublic(!e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="private" className="cursor-pointer flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Pedido privado (apenas pastores verão)
                </Label>
              </div>
              <Button
                onClick={() =>
                  createRequest.mutate({
                    churchId: CHURCH_ID,
                    title,
                    content,
                    isPublic,
                    authorName: isAuthenticated ? (user!.name ?? authorName) : authorName,
                  })
                }
                disabled={!title.trim() || !content.trim() || createRequest.isPending}
                className="w-full"
              >
                {createRequest.isPending ? "Enviando..." : "Enviar Pedido"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : publicRequests.length > 0 ? (
          <div className="space-y-4">
            {publicRequests.map((req) => (
              <Card key={req.id} className="hover:shadow-sm transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{req.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {req.isPublic ? "Público" : "Privado"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{req.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium">{req.authorName}</span>
                      <span>·</span>
                      <span>{format(new Date(req.createdAt), "dd MMM", { locale: ptBR })}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                      onClick={() => prayFor.mutate({ id: req.id })}
                    >
                      <HandHeart className="h-4 w-4" />
                      <span className="text-xs">{req.prayerCount} oraram</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-muted-foreground">Nenhum pedido ativo</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Seja o primeiro a compartilhar um pedido de oração
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
