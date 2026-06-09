import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const CHURCH_ID = 1;

const TYPE_LABELS: Record<string, string> = {
  reuniao: "Reunião",
  celula: "Célula",
  oracao: "Oração",
  estudo: "Estudo Bíblico",
  outro: "Outro",
};

export default function AdminRooms() {
  const utils = trpc.useUtils();
  const { data: rooms, isLoading } = trpc.jitsi.list.useQuery({ churchId: CHURCH_ID });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("reuniao");
  const [maxParticipants, setMaxParticipants] = useState("50");

  const create = trpc.jitsi.create.useMutation({
    onSuccess: () => {
      toast.success("Sala criada!");
      setOpen(false);
      setName(""); setDescription(""); setMaxParticipants("50");
      utils.jitsi.list.invalidate({ churchId: CHURCH_ID });
    },
    onError: () => toast.error("Erro ao criar sala"),
  });

  const toggle = trpc.jitsi.update.useMutation({
    onSuccess: () => utils.jitsi.list.invalidate({ churchId: CHURCH_ID }),
  });

  const remove = trpc.jitsi.delete.useMutation({
    onSuccess: () => {
      toast.success("Sala removida");
      utils.jitsi.list.invalidate({ churchId: CHURCH_ID });
    },
  });

  return (
    <AdminLayout title="Salas Jitsi">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-light text-foreground">Salas Interativas</h2>
            <p className="text-sm text-muted-foreground">{rooms?.length ?? 0} salas cadastradas</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Nova Sala</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Sala Jitsi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome da Sala *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Célula da Zona Norte" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="celula">Célula</SelectItem>
                      <SelectItem value="oracao">Grupo de Oração</SelectItem>
                      <SelectItem value="estudo">Estudo Bíblico</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Máximo de Participantes</Label>
                  <Input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} min="2" max="500" />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                </div>
                <Button
                  onClick={() => create.mutate({
                    churchId: CHURCH_ID,
                    name,
                    description: description || undefined,
                    type: type as "reuniao" | "celula" | "oracao" | "estudo" | "outro",
                    maxParticipants: parseInt(maxParticipants),
                  })}
                  disabled={!name.trim() || create.isPending}
                  className="w-full"
                >
                  {create.isPending ? "Criando..." : "Criar Sala"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {rooms?.map((room) => (
              <Card key={room.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${room.isActive ? "bg-green-50" : "bg-gray-50"}`}>
                      <Users className={`h-4 w-4 ${room.isActive ? "text-green-500" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">{room.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${room.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {room.isActive ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_LABELS[room.type] ?? room.type} · Até {room.maxParticipants} participantes
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/salas/${room.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggle.mutate({ id: room.id, isActive: !room.isActive })}
                      >
                        {room.isActive ? "Desativar" : "Ativar"}
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove.mutate({ id: room.id })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {rooms?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma sala cadastrada</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
