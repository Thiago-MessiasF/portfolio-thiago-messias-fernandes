import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Video, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function AdminRecordings() {
  const utils = trpc.useUtils();
  const { data: recordings, isLoading } = trpc.recordings.list.useQuery({ churchId: CHURCH_ID });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preacher, setPreacher] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [topic, setTopic] = useState("");

  const create = trpc.recordings.create.useMutation({
    onSuccess: () => {
      toast.success("Pregação adicionada!");
      setOpen(false);
      setTitle(""); setDescription(""); setPreacher(""); setVideoUrl(""); setThumbnailUrl(""); setDuration(""); setTopic("");
      utils.recordings.list.invalidate({ churchId: CHURCH_ID });
    },
    onError: () => toast.error("Erro ao adicionar pregação"),
  });

  const remove = trpc.recordings.delete.useMutation({
    onSuccess: () => {
      toast.success("Pregação removida");
      utils.recordings.list.invalidate({ churchId: CHURCH_ID });
    },
  });

  return (
    <AdminLayout title="Pregações">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-light text-foreground">Biblioteca de Pregações</h2>
            <p className="text-sm text-muted-foreground">{recordings?.length ?? 0} pregações cadastradas</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Adicionar Pregação</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Pregação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Título *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da pregação" />
                </div>
                <div className="space-y-1.5">
                  <Label>Pregador</Label>
                  <Input value={preacher} onChange={(e) => setPreacher(e.target.value)} placeholder="Nome do pregador" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tema</Label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Tema da pregação" />
                </div>
                <div className="space-y-1.5">
                  <Label>URL do Vídeo *</Label>
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>URL da Thumbnail</Label>
                  <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Duração (minutos)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <Button
                  onClick={() => create.mutate({
                    churchId: CHURCH_ID,
                    title,
                    description: description || undefined,
                    preacher: preacher || undefined,
                    videoUrl,
                    thumbnailUrl: thumbnailUrl || undefined,
                    duration: duration ? parseInt(duration) : undefined,
                    topic: topic || undefined,
                  })}
                  disabled={!title.trim() || !videoUrl.trim() || create.isPending}
                  className="w-full"
                >
                  {create.isPending ? "Adicionando..." : "Adicionar Pregação"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {recordings?.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                      <Video className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{rec.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {rec.preacher && `${rec.preacher} · `}
                        {rec.duration && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />{rec.duration}min ·{" "}
                          </span>
                        )}
                        {format(new Date(rec.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        {` · ${rec.viewCount ?? 0} views`}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => remove.mutate({ id: rec.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {recordings?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma pregação cadastrada</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
