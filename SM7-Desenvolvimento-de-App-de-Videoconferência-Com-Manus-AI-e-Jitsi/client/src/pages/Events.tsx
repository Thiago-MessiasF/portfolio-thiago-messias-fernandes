import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Monitor, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

const EVENT_TYPE_LABELS: Record<string, string> = {
  culto: "Culto",
  celula: "Célula",
  conferencia: "Conferência",
  retiro: "Retiro",
  oracao: "Oração",
  outro: "Evento",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  culto: "bg-purple-100 text-purple-700",
  celula: "bg-green-100 text-green-700",
  conferencia: "bg-blue-100 text-blue-700",
  retiro: "bg-amber-100 text-amber-700",
  oracao: "bg-pink-100 text-pink-700",
  outro: "bg-gray-100 text-gray-700",
};

export default function Events() {
  const { data: events, isLoading } = trpc.events.list.useQuery({ churchId: CHURCH_ID });

  const upcoming = events?.filter((e) => new Date(e.startAt) >= new Date()) ?? [];
  const past = events?.filter((e) => new Date(e.startAt) < new Date()) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-6 w-6 text-blue-300" />
            <span className="text-blue-300 text-sm font-medium uppercase tracking-wide">Agenda</span>
          </div>
          <h1 className="font-serif text-4xl font-light">Eventos e Programação</h1>
          <p className="text-white/60 mt-2">Fique por dentro de tudo que está acontecendo</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-2xl font-light mb-6 text-foreground">Próximos Eventos</h2>
                <div className="space-y-4">
                  {upcoming.map((event) => (
                    <Link key={event.id} href={`/agenda/${event.id}`}>
                      <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-5">
                            {/* Date block */}
                            <div className="text-center min-w-[60px] bg-primary/10 rounded-xl p-3 shrink-0">
                              <div className="text-3xl font-serif font-semibold text-primary leading-none">
                                {format(new Date(event.startAt), "dd")}
                              </div>
                              <div className="text-xs text-primary/70 uppercase font-medium mt-0.5">
                                {format(new Date(event.startAt), "MMM", { locale: ptBR })}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {event.title}
                                </h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${EVENT_TYPE_COLORS[event.type] ?? "bg-gray-100 text-gray-700"}`}>
                                  {EVENT_TYPE_LABELS[event.type] ?? event.type}
                                </span>
                              </div>

                              {event.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
                              )}

                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {format(new Date(event.startAt), "EEEE, HH:mm", { locale: ptBR })}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {event.location}
                                  </span>
                                )}
                                {event.isOnline && (
                                  <span className="flex items-center gap-1 text-blue-500">
                                    <Monitor className="h-3.5 w-3.5" />
                                    Online
                                  </span>
                                )}
                              </div>
                            </div>

                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Past events */}
            {past.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-6 text-muted-foreground">Eventos Anteriores</h2>
                <div className="space-y-3">
                  {past.slice(0, 5).map((event) => (
                    <Card key={event.id} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[48px]">
                            <div className="text-lg font-serif font-semibold text-muted-foreground">
                              {format(new Date(event.startAt), "dd")}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase">
                              {format(new Date(event.startAt), "MMM", { locale: ptBR })}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-muted-foreground truncate">{event.title}</h3>
                            <p className="text-xs text-muted-foreground/70">
                              {format(new Date(event.startAt), "HH:mm", { locale: ptBR })}
                              {event.location && ` · ${event.location}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {events?.length === 0 && (
              <div className="text-center py-20">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-serif text-xl text-muted-foreground">Nenhum evento cadastrado</h3>
                <p className="text-sm text-muted-foreground/70 mt-1">Em breve novos eventos serão anunciados</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
