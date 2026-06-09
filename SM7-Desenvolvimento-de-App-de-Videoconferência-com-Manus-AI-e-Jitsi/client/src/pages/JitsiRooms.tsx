import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Video, ArrowRight, Calendar } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

const ROOM_TYPE_LABELS: Record<string, string> = {
  reuniao: "Reunião",
  celula: "Célula",
  oracao: "Oração",
  estudo: "Estudo Bíblico",
  outro: "Sala",
};

const ROOM_TYPE_COLORS: Record<string, string> = {
  reuniao: "bg-blue-100 text-blue-700",
  celula: "bg-green-100 text-green-700",
  oracao: "bg-pink-100 text-pink-700",
  estudo: "bg-amber-100 text-amber-700",
  outro: "bg-gray-100 text-gray-700",
};

export default function JitsiRooms() {
  const { data: rooms, isLoading } = trpc.jitsi.list.useQuery({ churchId: CHURCH_ID });

  const activeRooms = rooms?.filter((r) => r.isActive) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-950 to-slate-900 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-6 w-6 text-green-300" />
            <span className="text-green-300 text-sm font-medium uppercase tracking-wide">Comunidade</span>
          </div>
          <h1 className="font-serif text-4xl font-light">Salas Interativas</h1>
          <p className="text-white/60 mt-2">Participe de reuniões, células e grupos de oração online</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activeRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRooms.map((room) => (
              <Link key={room.id} href={`/salas/${room.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/30">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${ROOM_TYPE_COLORS[room.type] ?? "bg-gray-100 text-gray-700"}`}>
                        <Video className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {ROOM_TYPE_LABELS[room.type] ?? room.type}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {room.name}
                    </h3>

                    {room.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{room.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {room.scheduledAt ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(room.scheduledAt), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Até {room.maxParticipants} participantes
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                        Entrar <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-muted-foreground">Nenhuma sala disponível</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Em breve novas salas serão criadas para a comunidade
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
