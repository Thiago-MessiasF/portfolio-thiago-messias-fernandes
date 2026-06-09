import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useChurch } from "@/contexts/ChurchContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Heart,
  Play,
  Radio,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { church } = useChurch();

  const { data: liveStreams } = trpc.livestreams.live.useQuery({ churchId: CHURCH_ID });
  const { data: upcomingEvents } = trpc.events.list.useQuery({ churchId: CHURCH_ID, upcoming: true });
  const { data: recordings } = trpc.recordings.list.useQuery({ churchId: CHURCH_ID });

  const hasLive = liveStreams && liveStreams.length > 0;
  const featuredLive = liveStreams?.[0];
  const featuredRecordings = recordings?.slice(0, 3) ?? [];
  const nextEvents = upcomingEvents?.slice(0, 3) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, oklch(0.65 0.18 293) 0%, transparent 50%), radial-gradient(circle at 75% 75%, oklch(0.78 0.12 85) 0%, transparent 50%)"
          }} />
        </div>

        <div className="container relative py-20 lg:py-32">
          <div className="max-w-3xl">
            {hasLive && (
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-full px-4 py-1.5 mb-6">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-300 text-sm font-medium">Transmissão ao vivo agora</span>
              </div>
            )}

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-6">
              {church?.name ?? "Bem-vindo à"}{" "}
              {!church?.name && (
                <span className="italic" style={{ color: "var(--gold, oklch(0.78 0.12 85))" }}>
                  nossa comunidade
                </span>
              )}
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              {church?.description ??
                "Acompanhe cultos ao vivo, assista pregações, participe de grupos de oração e conecte-se com a comunidade de fé."}
            </p>

            <div className="flex flex-wrap gap-3">
              {hasLive ? (
                <Button size="lg" asChild className="bg-red-500 hover:bg-red-600 text-white gap-2">
                  <Link href={`/ao-vivo/${featuredLive!.id}`}>
                    <Radio className="h-5 w-5" />
                    Assistir ao Vivo
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="gap-2">
                  <Link href="/pregacoes">
                    <Play className="h-5 w-5" />
                    Ver Pregações
                  </Link>
                </Button>
              )}

              {!isAuthenticated && (
                <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                  <a href={getLoginUrl()}>Criar conta gratuita</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Live Now Banner */}
      {hasLive && featuredLive && (
        <section className="bg-red-50 border-y border-red-100">
          <div className="container py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Radio className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700">{featuredLive.title}</p>
                  <p className="text-xs text-red-500">{featuredLive.viewerCount ?? 0} assistindo agora</p>
                </div>
              </div>
              <Button size="sm" asChild className="bg-red-500 hover:bg-red-600 text-white shrink-0">
                <Link href={`/ao-vivo/${featuredLive.id}`}>
                  Assistir <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-light text-foreground mb-3">
            Tudo em um só lugar
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Uma plataforma completa para sua comunidade de fé crescer e se conectar.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Radio, label: "Ao Vivo", href: "/ao-vivo", color: "text-red-500 bg-red-50" },
            { icon: Video, label: "Pregações", href: "/pregacoes", color: "text-purple-500 bg-purple-50" },
            { icon: Calendar, label: "Agenda", href: "/agenda", color: "text-blue-500 bg-blue-50" },
            { icon: Users, label: "Salas", href: "/salas", color: "text-green-500 bg-green-50" },
            { icon: Heart, label: "Oração", href: "/oracao", color: "text-pink-500 bg-pink-50" },
            { icon: BookOpen, label: "Doações", href: "/doacoes", color: "text-amber-500 bg-amber-50" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 border-border/60">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Recordings */}
      {featuredRecordings.length > 0 && (
        <section className="bg-secondary/30 py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-light text-foreground">Pregações Recentes</h2>
                <p className="text-muted-foreground text-sm mt-1">Assista quando e onde quiser</p>
              </div>
              <Button variant="ghost" asChild className="gap-1 text-primary">
                <Link href="/pregacoes">
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRecordings.map((rec) => (
                <Link key={rec.id} href={`/pregacoes/${rec.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-purple-900 to-slate-900 relative overflow-hidden">
                      {rec.thumbnailUrl ? (
                        <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="h-12 w-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary ml-0.5" />
                        </div>
                      </div>
                      {rec.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {Math.floor(rec.duration / 60)}:{String(rec.duration % 60).padStart(2, "0")}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{rec.title}</h3>
                      {rec.preacher && (
                        <p className="text-sm text-muted-foreground">{rec.preacher}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">{rec.viewCount ?? 0} visualizações</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {nextEvents.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-light text-foreground">Próximos Eventos</h2>
              <p className="text-muted-foreground text-sm mt-1">Não perca nenhum momento especial</p>
            </div>
            <Button variant="ghost" asChild className="gap-1 text-primary">
              <Link href="/agenda">
                Ver agenda <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {nextEvents.map((event) => (
              <Link key={event.id} href={`/agenda/${event.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[52px] bg-primary/10 rounded-xl p-2">
                        <div className="text-2xl font-serif font-semibold text-primary leading-none">
                          {format(new Date(event.startAt), "dd")}
                        </div>
                        <div className="text-xs text-primary/70 uppercase font-medium">
                          {format(new Date(event.startAt), "MMM", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.startAt), "EEEE, HH:mm", { locale: ptBR })}
                          {event.location && ` · ${event.location}`}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize shrink-0">{event.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Features Banner */}
      <section className="bg-gradient-to-r from-purple-950 to-slate-900 text-white py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">Inteligência Artificial</span>
            </div>
            <h2 className="font-serif text-3xl font-light mb-4">
              Tecnologia a serviço da fé
            </h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Resumos automáticos de pregações, sugestão de versículos bíblicos, legendas em tempo real
              e moderação inteligente do chat — tudo para enriquecer sua experiência.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Resumos IA", desc: "Síntese automática" },
                { label: "Versículos", desc: "Sugestões bíblicas" },
                { label: "Legendas", desc: "Tempo real" },
                { label: "Moderação", desc: "Chat seguro" },
              ].map((f) => (
                <div key={f.label} className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="font-semibold text-sm">{f.label}</div>
                  <div className="text-xs text-white/60 mt-0.5">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white/60 py-10">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                {church?.name?.[0] ?? "C"}
              </div>
              <span className="font-serif text-white/80">{church?.name ?? "ChurchStream"}</span>
            </div>
            <p className="text-xs text-center">
              © {new Date().getFullYear()} {church?.name ?? "ChurchStream"}. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 text-xs">
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
