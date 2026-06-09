import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Radio, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function AdminLivestreams() {
  const utils = trpc.useUtils();
  const { data: streams, isLoading } = trpc.livestreams.list.useQuery({ churchId: CHURCH_ID });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preacher, setPreacher] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const create = trpc.livestreams.create.useMutation({
    onSuccess: () => {
      toast.success("Transmissão criada!");
      setOpen(false);
      setTitle(""); setDescription(""); setPreacher(""); setStreamUrl(""); setScheduledAt("");
      utils.livestreams.list.invalidate({ churchId: CHURCH_ID });
    },
    onError: () => toast.error("Erro ao criar transmissão"),
  });

  const updateStatus = trpc.livestreams.updateStatus.useMutation({
    onSuccess: () => utils.livestreams.list.invalidate({ churchId: CHURCH_ID }),
  });

  const remove = trpc.livestreams.delete.useMutation({
    onSuccess: () => {
      toast.success("Transmissão removida");
      utils.livestreams.list.invalidate({ churchId: CHURCH_ID });
    },
  });

  const STATUS_COLORS: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    live: "bg-red-100 text-red-700",
    ended: "bg-gray-100 text-gray-700",
  };

  const STATUS_LABELS: Record<string, string> = {
    scheduled: "Agendado",
    live: "Ao Vivo",
    ended: "Encerrado",
  };

  return (
    <AdminLayout title="Transmissões">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-light text-foreground">Transmissões</h2>
            <p className="text-sm text-muted-foreground">{streams?.length ?? 0} transmissões cadastradas</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Nova Transmissão</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Transmissão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Título *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do culto ou evento" />
                </div>
                <div className="space-y-1.5">
                  <Label>Pregador</Label>
                  <Input value={preacher} onChange={(e) => setPreacher(e.target.value)} placeholder="Nome do pregador" />
                </div>
                <div className="space-y-1.5">
                  <Label>URL do Stream</Label>
                  <Input value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Data e Hora</Label>
                  <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
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
                    streamUrl: streamUrl || undefined,
                    scheduledAt: scheduledAt ? new Date(scheduledAt).getTime() : undefined,
                  })}
                  disabled={!title.trim() || create.isPending}
                  className="w-full"
                >
                  {create.isPending ? "Criando..." : "Criar Transmissão"}
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
            {streams?.map((stream) => (
              <Card key={stream.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Radio className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium text-foreground truncate">{stream.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[stream.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {STATUS_LABELS[stream.status] ?? stream.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stream.preacher && `${stream.preacher} · `}
                        {stream.scheduledAt
                          ? format(new Date(stream.scheduledAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "Sem data"}
                        {` · ${stream.viewerCount ?? 0} espectadores`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {stream.status === "scheduled" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: stream.id, status: "live" })}>
                          Iniciar
                        </Button>
                      )}
                      {stream.status === "live" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: stream.id, status: "ended" })}>
                          Encerrar
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove.mutate({ id: stream.id })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {streams?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Radio className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma transmissão cadastrada</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
