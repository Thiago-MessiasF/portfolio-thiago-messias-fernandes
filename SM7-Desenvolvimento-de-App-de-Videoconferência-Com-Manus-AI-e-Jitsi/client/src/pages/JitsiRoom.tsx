import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { Link, useParams } from "wouter";
import { useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JitsiAPI = { dispose: () => void };
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiRoom() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { user } = useAuth();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiAPI | null>(null);

  const { data: room, isLoading } = trpc.jitsi.getById.useQuery({ id }, { enabled: !!id });

  useEffect(() => {
    if (!room || !jitsiContainerRef.current) return;

    const loadJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        setTimeout(loadJitsi, 500);
        return;
      }

      if (apiRef.current) {
        apiRef.current.dispose();
      }

      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: room.roomId,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName: user?.name ?? "Visitante",
          email: user?.email ?? "",
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "closedcaptions", "desktop",
            "fullscreen", "fodeviceselection", "hangup", "profile",
            "chat", "recording", "livestreaming", "etherpad",
            "sharedvideo", "settings", "raisehand", "videoquality",
            "filmstrip", "invite", "feedback", "stats", "shortcuts",
            "tileview", "select-background", "download", "help", "mute-everyone",
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      });
    };

    // Load Jitsi script
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.onload = loadJitsi;
    document.head.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [room, user]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="h-96 bg-secondary/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container py-20 text-center">
        <h2 className="font-serif text-2xl text-muted-foreground">Sala não encontrada</h2>
        <Button asChild className="mt-4" variant="ghost">
          <Link href="/salas"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="text-white hover:bg-slate-700">
          <Link href="/salas"><ArrowLeft className="h-4 w-4 mr-1" />Salas</Link>
        </Button>
        <div className="h-4 w-px bg-slate-600" />
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-white font-medium text-sm">{room.name}</span>
        </div>
        {room.description && (
          <span className="text-slate-400 text-xs hidden sm:block">· {room.description}</span>
        )}
      </div>

      {/* Jitsi Container */}
      <div className="flex-1" ref={jitsiContainerRef} style={{ minHeight: "calc(100vh - 56px)" }} />
    </div>
  );
}
