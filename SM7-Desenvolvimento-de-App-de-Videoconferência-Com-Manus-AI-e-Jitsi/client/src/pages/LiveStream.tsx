import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Video } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function LiveStream() {
  const { data: liveStreams, isLoading: loadingLive } = trpc.livestreams.live.useQuery({ churchId: CHURCH_ID });
  const { data: allStreams, isLoading: loadingAll } = trpc.livestreams.list.useQuery({ churchId: CHURCH_ID });

  const scheduled = allStreams?.filter((s) => s.status === "scheduled") ?? [];
  const ended = allStreams?.filter((s) => s.status === "ended") ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 to-slate-900 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Radio className="h-6 w-6 text-red-300" />
            <span className="text-red-300 text-sm font-medium uppercase tracking-wide">Transmissões</span>
          </div>
          <h1 className="font-serif text-4xl font-light">Ao Vivo</h1>
          <p className="text-white/60 mt-2">Acompanhe os cultos e eventos em tempo real</p>
        </div>
      </div>

      <div className="container py-10">
        {/* Live Now */}
        {(loadingLive || (liveStreams && liveStreams.length > 0)) && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <h2 className="font-serif text-2xl font-light text-foreground">Ao Vivo Agora</h2>
            </div>

            {loadingLive ? (
              <div className="h-48 bg-secondary/50 rounded-xl animate-pulse" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveStreams?.map((stream) => (
                  <Link key={stream.id} href={`/ao-vivo/${stream.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-red-200">
                      <div className="aspect-video bg-gradient-to-br from-red-950 to-slate-900 relative">
                        {stream.thumbnailUrl ? (
                          <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Radio className="h-16 w-16 text-white/20" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-red-500 text-white border-0 gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            AO VIVO
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {stream.viewerCount ?? 0}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-red-600 transition-colors">
                          {stream.title}
                        </h3>
                        {stream.preacher && (
                          <p className="text-sm text-muted-foreground mt-0.5">{stream.preacher}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scheduled */}
        {scheduled.length > 0 && (
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-light text-foreground mb-6">Próximas Transmissões</h2>
            <div className="space-y-3">
              {scheduled.map((stream) => (
                <Card key={stream.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Video className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{stream.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stream.scheduledAt
                            ? format(new Date(stream.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                            : "Horário a confirmar"}
                          {stream.preacher && ` · ${stream.preacher}`}
                        </p>
                      </div>
                      <Badge variant="secondary">Agendado</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No live */}
        {!loadingLive && (!liveStreams || liveStreams.length === 0) && scheduled.length === 0 && (
          <div className="text-center py-20">
            <Radio className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-muted-foreground">Nenhuma transmissão ativa</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Acompanhe a agenda para saber quando será o próximo culto ao vivo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
