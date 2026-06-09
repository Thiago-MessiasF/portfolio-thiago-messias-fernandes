import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Heart, Radio, Users, Video } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function AdminDashboard() {
  const { data: users } = trpc.admin.users.useQuery();
  const { data: livestreams } = trpc.livestreams.list.useQuery({ churchId: CHURCH_ID });
  const { data: events } = trpc.events.list.useQuery({ churchId: CHURCH_ID });
  const { data: recordings } = trpc.recordings.list.useQuery({ churchId: CHURCH_ID });
  const { data: donationStats } = trpc.donations.stats.useQuery({ churchId: CHURCH_ID });
  const { data: prayerRequests } = trpc.prayer.list.useQuery({ churchId: CHURCH_ID });

  const liveNow = livestreams?.filter((l) => l.status === "live") ?? [];
  const upcomingEvents = events?.filter((e) => new Date(e.startAt) >= new Date()) ?? [];
  const activePrayers = prayerRequests?.filter((p) => p.status === "active") ?? [];

  const stats = [
    {
      label: "Usuários",
      value: users?.length ?? 0,
      icon: Users,
      color: "text-blue-500 bg-blue-50",
      href: "/admin/usuarios",
    },
    {
      label: "Transmissões",
      value: livestreams?.length ?? 0,
      icon: Radio,
      color: "text-red-500 bg-red-50",
      href: "/admin/transmissoes",
      badge: liveNow.length > 0 ? `${liveNow.length} ao vivo` : undefined,
    },
    {
      label: "Pregações",
      value: recordings?.length ?? 0,
      icon: Video,
      color: "text-purple-500 bg-purple-50",
      href: "/admin/pregacoes",
    },
    {
      label: "Eventos",
      value: events?.length ?? 0,
      icon: Calendar,
      color: "text-green-500 bg-green-50",
      href: "/admin/eventos",
      badge: upcomingEvents.length > 0 ? `${upcomingEvents.length} próximos` : undefined,
    },
    {
      label: "Doações",
      value: `R$ ${parseFloat(String(donationStats?.total ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: BookOpen,
      color: "text-amber-500 bg-amber-50",
      href: "/admin/doacoes",
    },
    {
      label: "Pedidos de Oração",
      value: activePrayers.length,
      icon: Heart,
      color: "text-pink-500 bg-pink-50",
      href: "/admin/oracao",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    {stat.badge && (
                      <Badge className="bg-red-500 text-white border-0 text-xs">{stat.badge}</Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-serif font-semibold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Live Now */}
        {liveNow.length > 0 && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Transmissão ao Vivo Agora
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liveNow.map((stream) => (
                <div key={stream.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{stream.title}</p>
                    <p className="text-sm text-muted-foreground">{stream.viewerCount ?? 0} espectadores</p>
                  </div>
                  <Link href={`/ao-vivo/${stream.id}`}>
                    <Badge className="bg-red-500 text-white border-0 cursor-pointer">Ver</Badge>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Próximos Eventos
                <Link href="/admin/eventos">
                  <span className="text-xs text-primary hover:underline cursor-pointer">Ver todos</span>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.slice(0, 4).length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className="text-center min-w-[40px] bg-primary/10 rounded-lg p-1.5">
                        <div className="text-sm font-serif font-semibold text-primary leading-none">
                          {format(new Date(event.startAt), "dd")}
                        </div>
                        <div className="text-xs text-primary/70 uppercase">
                          {format(new Date(event.startAt), "MMM", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startAt), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento próximo</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Prayer Requests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Pedidos de Oração Recentes
                <Link href="/admin/oracao">
                  <span className="text-xs text-primary hover:underline cursor-pointer">Ver todos</span>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activePrayers.slice(0, 4).length > 0 ? (
                <div className="space-y-3">
                  {activePrayers.slice(0, 4).map((req) => (
                    <div key={req.id} className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{req.title}</p>
                        <p className="text-xs text-muted-foreground">{req.authorName} · {req.prayerCount} oraram</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido ativo</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
