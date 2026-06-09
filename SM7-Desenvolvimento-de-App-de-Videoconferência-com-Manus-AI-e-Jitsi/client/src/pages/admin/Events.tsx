import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function AdminEvents() {
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.events.list.useQuery({ churchId: CHURCH_ID });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("culto");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const create = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Evento criado!");
      setOpen(false);
      setTitle(""); setDescription(""); setLocation(""); setStartAt(""); setEndAt("");
      utils.events.list.invalidate({ churchId: CHURCH_ID });
    },
    onError: () => toast.error("Erro ao criar evento"),
  });

  const remove = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Evento removido");
      utils.events.list.invalidate({ churchId: CHURCH_ID });
    },
  });

  return (
    <AdminLayout title="Eventos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-light text-foreground">Eventos</h2>
            <p className="text-sm text-muted-foreground">{events?.length ?? 0} eventos cadastrados</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Novo Evento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Título *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do evento" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="culto">Culto</SelectItem>
                      <SelectItem value="celula">Célula</SelectItem>
                      <SelectItem value="conferencia">Conferência</SelectItem>
                      <SelectItem value="retiro">Retiro</SelectItem>
                      <SelectItem value="oracao">Oração</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Início *</Label>
                    <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fim</Label>
                    <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Local</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Endereço ou link" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="online" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="rounded" />
                  <Label htmlFor="online" className="cursor-pointer">Evento online</Label>
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
                    type: type as "culto" | "celula" | "conferencia" | "retiro" | "oracao" | "outro",
                    location: location || undefined,
                    startAt: new Date(startAt).getTime(),
                    endAt: endAt ? new Date(endAt).getTime() : undefined,
                    isOnline,
                  })}
                  disabled={!title.trim() || !startAt || create.isPending}
                  className="w-full"
                >
                  {create.isPending ? "Criando..." : "Criar Evento"}
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
            {events?.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[48px] bg-primary/10 rounded-xl p-2 shrink-0">
                      <div className="text-lg font-serif font-semibold text-primary leading-none">
                        {format(new Date(event.startAt), "dd")}
                      </div>
                      <div className="text-xs text-primary/70 uppercase">
                        {format(new Date(event.startAt), "MMM", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.startAt), "HH:mm")} · {event.type}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => remove.mutate({ id: event.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {events?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum evento cadastrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
