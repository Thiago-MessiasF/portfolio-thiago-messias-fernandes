import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Heart, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const { data: myDonations } = trpc.donations.myDonations.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myPrayers } = trpc.prayer.myRequests.useQuery(undefined, { enabled: isAuthenticated });

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      utils.auth.me.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar perfil"),
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-foreground mb-2">Faça login para ver seu perfil</h2>
        <Button asChild className="mt-4">
          <a href={getLoginUrl()}>Entrar</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="font-serif text-3xl font-light text-foreground mb-8">Meu Perfil</h1>

      {/* Profile Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled className="bg-secondary/50" />
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <Button
            onClick={() => updateProfile.mutate({ name, phone })}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>

      {/* My Donations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            Minhas Doações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myDonations && myDonations.length > 0 ? (
            <div className="space-y-3">
              {myDonations.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">R$ {parseFloat(String(d.amount)).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(d.createdAt), "dd/MM/yyyy", { locale: ptBR })} · {d.method.toUpperCase()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    d.status === "completed" ? "bg-green-100 text-green-700" :
                    d.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {d.status === "completed" ? "Confirmado" : d.status === "pending" ? "Pendente" : "Falhou"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma doação registrada</p>
          )}
        </CardContent>
      </Card>

      {/* My Prayer Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4" />
            Meus Pedidos de Oração
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myPrayers && myPrayers.length > 0 ? (
            <div className="space-y-3">
              {myPrayers.map((p) => (
                <div key={p.id} className="py-2 border-b border-border last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium">{p.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      p.status === "active" ? "bg-blue-100 text-blue-700" :
                      p.status === "answered" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {p.status === "active" ? "Ativo" : p.status === "answered" ? "Respondido" : "Arquivado"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {p.prayerCount} pessoas oraram · {format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido de oração enviado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
