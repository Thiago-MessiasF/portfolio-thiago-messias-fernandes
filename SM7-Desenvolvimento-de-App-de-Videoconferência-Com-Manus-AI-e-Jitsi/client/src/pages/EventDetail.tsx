import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Monitor } from "lucide-react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { data: event, isLoading } = trpc.events.getById.useQuery({ id }, { enabled: !!id });

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="h-64 bg-secondary/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-20 text-center">
        <h2 className="font-serif text-2xl text-muted-foreground">Evento não encontrado</h2>
        <Button asChild className="mt-4" variant="ghost">
          <Link href="/agenda"><ArrowLeft className="h-4 w-4 mr-2" />Voltar à agenda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/agenda"><ArrowLeft className="h-4 w-4 mr-2" />Agenda</Link>
      </Button>

      <Card>
        {event.coverUrl && (
          <div className="aspect-video overflow-hidden rounded-t-xl">
            <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="font-serif text-3xl font-light text-foreground">{event.title}</h1>
            <Badge variant="secondary" className="capitalize shrink-0">{event.type}</Badge>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.startAt), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(event.startAt), "HH:mm", { locale: ptBR })}
                {event.endAt && ` até ${format(new Date(event.endAt), "HH:mm", { locale: ptBR })}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
            {event.isOnline && (
              <div className="flex items-center gap-2 text-blue-500">
                <Monitor className="h-4 w-4" />
                <span>Evento online</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="border-t border-border pt-4">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
