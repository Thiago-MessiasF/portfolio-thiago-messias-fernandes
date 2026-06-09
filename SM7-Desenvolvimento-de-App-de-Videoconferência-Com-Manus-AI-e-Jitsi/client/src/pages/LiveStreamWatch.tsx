import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Radio, Send, Users } from "lucide-react";
import { Link, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHURCH_ID = 1;

export default function LiveStreamWatch() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: stream, isLoading } = trpc.livestreams.getById.useQuery({ id }, { enabled: !!id });
  const { data: messages, isLoading: loadingMessages } = trpc.chat.list.useQuery(
    { livestreamId: id, limit: 100 },
    { enabled: !!id, refetchInterval: 3000 }
  );

  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessage("");
      if (data.moderated) {
        toast.warning("Sua mensagem foi moderada e não será exibida.");
      }
      utils.chat.list.invalidate({ livestreamId: id });
    },
    onError: () => toast.error("Erro ao enviar mensagem"),
  });

  const incrementViewers = trpc.livestreams.incrementViewers.useMutation();

  useEffect(() => {
    if (id) incrementViewers.mutate({ id });
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({
      livestreamId: id,
      content: message.trim(),
      authorName: user?.name ?? "Visitante",
    });
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="aspect-video bg-secondary/50 rounded-xl animate-pulse mb-4" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="container py-20 text-center">
        <h2 className="font-serif text-2xl text-muted-foreground">Transmissão não encontrada</h2>
        <Button asChild className="mt-4" variant="ghost">
          <Link href="/ao-vivo"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Link>
        </Button>
      </div>
    );
  }

  const sortedMessages = [...(messages ?? [])].reverse();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <Button asChild variant="ghost" className="mb-4 -ml-2">
          <Link href="/ao-vivo"><ArrowLeft className="h-4 w-4 mr-2" />Transmissões</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video + Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative">
              {stream.streamUrl ? (
                <iframe
                  src={stream.streamUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                  <Radio className="h-16 w-16 mb-3" />
                  <p className="text-sm">Aguardando transmissão...</p>
                </div>
              )}

              {stream.status === "live" && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 text-white border-0 gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    AO VIVO
                  </Badge>
                </div>
              )}

              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Users className="h-3 w-3" />
                {stream.viewerCount ?? 0}
              </div>
            </div>

            {/* Stream Info */}
            <div>
              <h1 className="font-serif text-2xl font-light text-foreground">{stream.title}</h1>
              {stream.preacher && (
                <p className="text-muted-foreground mt-1">{stream.preacher}</p>
              )}
              {stream.description && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{stream.description}</p>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            <Card className="h-[500px] flex flex-col">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Chat ao Vivo
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    {messages?.length ?? 0} mensagens
                  </span>
                </CardTitle>
              </CardHeader>

              <ScrollArea className="flex-1 p-3">
                {loadingMessages ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-secondary/50 rounded animate-pulse" />
                    ))}
                  </div>
                ) : sortedMessages.length > 0 ? (
                  <div className="space-y-2">
                    {sortedMessages.map((msg) => (
                      <div key={msg.id} className="group">
                        <div className="flex items-start gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0 mt-0.5">
                            {msg.authorName[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs font-semibold text-foreground">{msg.authorName}</span>
                              <span className="text-xs text-muted-foreground/60">
                                {format(new Date(msg.createdAt), "HH:mm")}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/90 leading-snug break-words">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground/50 text-sm">
                    Seja o primeiro a comentar!
                  </div>
                )}
              </ScrollArea>

              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder={isAuthenticated ? "Digite uma mensagem..." : "Entre para comentar"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={!isAuthenticated || sendMessage.isPending}
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!isAuthenticated || !message.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground mt-1.5 text-center">
                    <a href="/login" className="text-primary hover:underline">Faça login</a> para participar do chat
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
