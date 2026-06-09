import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ChurchProvider } from "./contexts/ChurchContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LiveStream from "./pages/LiveStream";
import LiveStreamWatch from "./pages/LiveStreamWatch";
import Recordings from "./pages/Recordings";
import RecordingWatch from "./pages/RecordingWatch";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import JitsiRooms from "./pages/JitsiRooms";
import JitsiRoom from "./pages/JitsiRoom";
import Prayer from "./pages/Prayer";
import Donations from "./pages/Donations";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLivestreams from "./pages/admin/Livestreams";
import AdminEvents from "./pages/admin/Events";
import AdminUsers from "./pages/admin/Users";
import AdminRecordings from "./pages/admin/Recordings";
import AdminChurch from "./pages/admin/Church";
import AdminDonations from "./pages/admin/Donations";
import AdminPrayer from "./pages/admin/Prayer";
import AdminRooms from "./pages/admin/Rooms";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={() => <PublicLayout><Home /></PublicLayout>} />
      <Route path="/ao-vivo" component={() => <PublicLayout><LiveStream /></PublicLayout>} />
      <Route path="/ao-vivo/:id" component={() => <PublicLayout><LiveStreamWatch /></PublicLayout>} />
      <Route path="/pregacoes" component={() => <PublicLayout><Recordings /></PublicLayout>} />
      <Route path="/pregacoes/:id" component={() => <PublicLayout><RecordingWatch /></PublicLayout>} />
      <Route path="/agenda" component={() => <PublicLayout><Events /></PublicLayout>} />
      <Route path="/agenda/:id" component={() => <PublicLayout><EventDetail /></PublicLayout>} />
      <Route path="/salas" component={() => <PublicLayout><JitsiRooms /></PublicLayout>} />
      <Route path="/salas/:id" component={() => <PublicLayout><JitsiRoom /></PublicLayout>} />
      <Route path="/oracao" component={() => <PublicLayout><Prayer /></PublicLayout>} />
      <Route path="/doacoes" component={() => <PublicLayout><Donations /></PublicLayout>} />
      <Route path="/perfil" component={() => <PublicLayout><Profile /></PublicLayout>} />

      {/* Admin pages */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/transmissoes" component={AdminLivestreams} />
      <Route path="/admin/eventos" component={AdminEvents} />
      <Route path="/admin/usuarios" component={AdminUsers} />
      <Route path="/admin/pregacoes" component={AdminRecordings} />
      <Route path="/admin/igreja" component={AdminChurch} />
      <Route path="/admin/doacoes" component={AdminDonations} />
      <Route path="/admin/oracao" component={AdminPrayer} />
      <Route path="/admin/salas" component={AdminRooms} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ChurchProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ChurchProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
