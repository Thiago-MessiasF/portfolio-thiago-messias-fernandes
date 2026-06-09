import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useChurch } from "@/contexts/ChurchContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Heart,
  Home,
  LogOut,
  Menu,
  Radio,
  Settings,
  Users,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navLinks = [
  { href: "/", label: "Início", icon: Home },
  { href: "/ao-vivo", label: "Ao Vivo", icon: Radio },
  { href: "/pregacoes", label: "Pregações", icon: Video },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/salas", label: "Salas", icon: Users },
  { href: "/oracao", label: "Oração", icon: Heart },
  { href: "/doacoes", label: "Doações", icon: BookOpen },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { church } = useChurch();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            {church?.logoUrl ? (
              <img src={church.logoUrl} alt={church.name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.40 0.22 293))" }}
              >
                {church?.name?.[0] ?? "C"}
              </div>
            )}
            <span className="font-serif text-xl font-semibold text-foreground hidden sm:block">
              {church?.name ?? "ChurchStream"}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-sm">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">Meu Perfil</Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Painel Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild>
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
