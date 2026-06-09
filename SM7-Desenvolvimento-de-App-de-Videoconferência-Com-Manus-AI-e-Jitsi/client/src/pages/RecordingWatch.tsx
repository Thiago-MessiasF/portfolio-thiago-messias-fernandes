import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Eye, Sparkles, Video } from "lucide-react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Streamdown } from "streamdown";

export default function RecordingWatch() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { data: recording, isLoading } = trpc.recordings.getById.useQuery({ id }, { enabled: !!id });

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="aspect-video bg-secondary/50 rounded-xl animate-pulse mb-6" />
        <div className="h-8 bg-secondary/50 rounded animate-pulse mb-3 w-2/3" />
        <div className="h-4 bg-secondary/50 rounded animate-pulse w-1/3" />
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="container py-20 text-center">
        <h2 className="font-serif text-2xl text-muted-foreground">Pregação não encontrada</h2>
        <Button asChild className="mt-4" variant="ghost">
          <Link href="/pregacoes"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Link>
        </Button>
      </div>
    );
  }

  const aiVerses = recording.aiVerses as Array<{ reference: string; text: string }> | null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href="/pregacoes"><ArrowLeft className="h-4 w-4 mr-2" />Pregações</Link>
        </Button>

        {/* Video Player */}
        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-6 relative">
          {recording.videoUrl ? (
            <iframe
              src={recording.videoUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
              <Video className="h-16 w-16 mb-3" />
              <p className="text-sm">Vídeo não disponível</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-light text-foreground mb-2">{recording.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {recording.preacher && <span className="font-medium text-foreground">{recording.preacher}</span>}
            {recording.recordedAt && (
              <span>{format(new Date(recording.recordedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {recording.viewCount ?? 0} visualizações
            </span>
          </div>
          {recording.topic && (
            <Badge variant="secondary" className="mt-2">{recording.topic}</Badge>
          )}
        </div>

        {recording.description && (
          <p className="text-muted-foreground leading-relaxed mb-8 border-t border-border pt-6">
            {recording.description}
          </p>
        )}

        {/* AI Summary */}
        {recording.aiSummary && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Resumo gerado por IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Streamdown className="text-sm text-muted-foreground leading-relaxed">
                {recording.aiSummary}
              </Streamdown>
            </CardContent>
          </Card>
        )}

        {/* AI Verses */}
        {aiVerses && aiVerses.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-amber-700">
                <BookOpen className="h-4 w-4" />
                Versículos relacionados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiVerses.map((verse, i) => (
                  <div key={i} className="border-l-2 border-amber-300 pl-3">
                    <p className="text-xs font-semibold text-amber-700 mb-0.5">{verse.reference}</p>
                    <p className="text-sm text-muted-foreground italic">{verse.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
