import { useAuth } from "@/_core/hooks/useAuth";
import { useChurch } from "@/contexts/ChurchContext";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  ChevronLeft,
  Heart,
  LogOut,
  Radio,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/transmissoes", label: "Transmissões", icon: Radio },
  { href: "/admin/pregacoes", label: "Pregações", icon: Video },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/salas", label: "Salas Jitsi", icon: Users },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/doacoes", label: "Doações", icon: BookOpen },
  { href: "/admin/oracao", label: "Pedidos de Oração", icon: Heart },
  { href: "/admin/igreja", label: "Configurações", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { church } = useChurch();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-foreground mb-4">Acesso restrito</h2>
          <Button asChild><a href={getLoginUrl()}>Entrar</a></Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-foreground mb-2">Sem permissão</h2>
          <p className="text-muted-foreground mb-4">Você não tem acesso ao painel administrativo.</p>
          <Button asChild variant="ghost"><Link href="/">Voltar ao início</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 hidden lg:flex">
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold text-sm">
              {church?.name?.[0] ?? "C"}
            </div>
            <div>
              <div className="text-sm font-semibold text-sidebar-foreground">{church?.name ?? "ChurchStream"}</div>
              <div className="text-xs text-sidebar-foreground/50">Painel Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  location === link.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</div>
              <div className="text-xs text-sidebar-foreground/50">Administrador</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center gap-3 px-6 shrink-0">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <Link href="/"><ChevronLeft className="h-4 w-4" />Voltar ao site</Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-medium text-foreground text-sm">{title}</h1>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
