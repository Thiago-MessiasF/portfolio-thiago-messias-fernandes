import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Search, Video } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function Recordings() {
  const [search, setSearch] = useState("");
  const { data: recordings, isLoading } = trpc.recordings.list.useQuery({ churchId: CHURCH_ID });

  const filtered = recordings?.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.preacher ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.topic ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 to-slate-900 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Video className="h-6 w-6 text-purple-300" />
            <span className="text-purple-300 text-sm font-medium uppercase tracking-wide">Biblioteca</span>
          </div>
          <h1 className="font-serif text-4xl font-light">Pregações e Mensagens</h1>
          <p className="text-white/60 mt-2">Assista quando e onde quiser</p>

          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Buscar por título, pregador ou tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15"
            />
          </div>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="aspect-video bg-secondary/50 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-secondary/50 rounded animate-pulse" />
                  <div className="h-3 bg-secondary/50 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((rec) => (
              <Link key={rec.id} href={`/pregacoes/${rec.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                  <div className="aspect-video bg-gradient-to-br from-purple-900 to-slate-900 relative overflow-hidden">
                    {rec.thumbnailUrl ? (
                      <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="h-6 w-6 text-primary ml-0.5" />
                      </div>
                    </div>
                    {rec.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                        {Math.floor(rec.duration / 60)}:{String(rec.duration % 60).padStart(2, "0")}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {rec.title}
                    </h3>
                    {rec.preacher && (
                      <p className="text-sm text-muted-foreground">{rec.preacher}</p>
                    )}
                    {rec.topic && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{rec.topic}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{rec.viewCount ?? 0} visualizações</span>
                      {rec.recordedAt && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(rec.recordedAt), "dd MMM yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-muted-foreground">
              {search ? "Nenhuma pregação encontrada" : "Nenhuma pregação disponível"}
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {search ? "Tente buscar com outros termos" : "Em breve novas mensagens serão adicionadas"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
