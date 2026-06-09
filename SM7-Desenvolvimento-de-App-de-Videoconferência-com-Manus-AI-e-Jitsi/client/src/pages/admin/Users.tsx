import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.users.useQuery();

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Papel do usuário atualizado!");
      utils.admin.users.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar papel"),
  });

  return (
    <AdminLayout title="Usuários">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-light text-foreground">Usuários</h2>
          <p className="text-sm text-muted-foreground">{users?.length ?? 0} usuários cadastrados</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {users?.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">{user.name ?? "Sem nome"}</span>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {user.role === "admin" ? "Admin" : "Membro"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.email ?? "Sem e-mail"} · Entrou em {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateRole.mutate({
                        userId: user.id,
                        role: user.role === "admin" ? "user" : "admin",
                      })}
                      disabled={updateRole.isPending}
                    >
                      {user.role === "admin" ? "Remover Admin" : "Tornar Admin"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum usuário cadastrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
