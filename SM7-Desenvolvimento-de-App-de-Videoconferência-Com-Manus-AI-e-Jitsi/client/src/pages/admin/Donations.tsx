import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

const METHOD_LABELS: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  boleto: "Boleto",
  transferencia: "Transferência",
};

export default function AdminDonations() {
  const { data: donations, isLoading } = trpc.donations.list.useQuery({ churchId: CHURCH_ID });
  const { data: stats } = trpc.donations.stats.useQuery({ churchId: CHURCH_ID });

  return (
    <AdminLayout title="Doações">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-light text-foreground">Doações</h2>
          <p className="text-sm text-muted-foreground">Histórico de dízimos e ofertas</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-serif font-semibold text-foreground">
                  R$ {parseFloat(String(stats.total ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground">Total arrecadado</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-serif font-semibold text-foreground">{stats.count ?? 0}</div>
                <div className="text-sm text-muted-foreground">Contribuições</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-serif font-semibold text-foreground">
                  R$ {parseFloat(String(stats.thisMonth ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground">Este mês</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {donations?.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {donation.isAnonymous ? "Anônimo" : (donation.donorName ?? "Sem nome")}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {METHOD_LABELS[donation.method] ?? donation.method}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {donation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(donation.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        {donation.message && ` · "${donation.message}"`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-foreground">
                        R$ {parseFloat(String(donation.amount)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {donations?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma doação registrada</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
