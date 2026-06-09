import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, HandHeart, Archive, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  answered: "Respondido",
  archived: "Arquivado",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  answered: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-700",
};

export default function AdminPrayer() {
  const utils = trpc.useUtils();
  const { data: requests, isLoading } = trpc.prayer.list.useQuery({ churchId: CHURCH_ID });

  const updateStatus = trpc.prayer.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.prayer.list.invalidate({ churchId: CHURCH_ID });
    },
  });

  return (
    <AdminLayout title="Pedidos de Oração">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-light text-foreground">Pedidos de Oração</h2>
          <p className="text-sm text-muted-foreground">{requests?.length ?? 0} pedidos no total</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {requests?.map((req: { id: number; title: string; content: string; status: string; isPublic: boolean; authorName: string; prayerCount: number; createdAt: Date }) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Heart className="h-4 w-4 text-pink-400 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{req.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {STATUS_LABELS[req.status] ?? req.status}
                        </span>
                        {!req.isPublic && (
                          <Badge variant="outline" className="text-xs">Privado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium">{req.authorName}</span>
                        <span>·</span>
                        <span>{format(new Date(req.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <HandHeart className="h-3 w-3" />{req.prayerCount} oraram
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {req.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-blue-600 border-blue-200"
                            onClick={() => updateStatus.mutate({ id: req.id, status: "answered" })}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Respondido
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-gray-500"
                            onClick={() => updateStatus.mutate({ id: req.id, status: "archived" })}
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum pedido de oração</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
