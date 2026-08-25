import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DemoStatePersistence, shouldSyncDemoStateForPathname } from "./components/DemoStatePersistence";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Planner from "./pages/Planner";
import Artisan from "./pages/Artisan";
import Authority from "./pages/Authority";
import CraftDetail from "./pages/CraftDetail";
import ArtisanProfile from "./pages/ArtisanProfile";
import ProductDetail from "./pages/ProductDetail";
import ExperienceDetail from "./pages/ExperienceDetail";
import CulturalResourceDetail from "./pages/CulturalResourceDetail";
import TravellerHome from "./pages/TravellerHome";
import TravellerBookings from "./pages/TravellerBookings";
import TravellerProfile from "./pages/TravellerProfile";
import MyJourney from "./pages/MyJourney";
import HeritageNotes from "./pages/HeritageNotes";
import CraftAtlas from "./pages/CraftAtlas";
import Settings from "./pages/Settings";
function DemoStateBridge() {
  const [location] = useLocation();
  return shouldSyncDemoStateForPathname(location) ? <DemoStatePersistence /> : null;
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  const Traveller = ({ children }: { children: React.ReactNode }) => <ProtectedRoute role="traveller">{children}</ProtectedRoute>;
  const ArtisanGate = ({ children }: { children: React.ReactNode }) => <ProtectedRoute role="artisan">{children}</ProtectedRoute>;
  const AuthorityGate = ({ children }: { children: React.ReactNode }) => <ProtectedRoute role="authority">{children}</ProtectedRoute>;
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/settings">{() => <ProtectedRoute role={["traveller", "artisan", "authority"]}><Settings /></ProtectedRoute>}</Route>
    <Route path="/traveller">{() => <Traveller><TravellerHome /></Traveller>}</Route>
    <Route path="/traveller/bookings">{() => <Traveller><TravellerBookings /></Traveller>}</Route>
    <Route path="/traveller/profile">{() => <Traveller><TravellerProfile /></Traveller>}</Route>
    <Route path="/traveller/journey">{() => <Traveller><MyJourney /></Traveller>}</Route>
    <Route path="/atlas">{() => <Traveller><CraftAtlas /></Traveller>}</Route>
    <Route path="/explore">{() => <Traveller><Explore /></Traveller>}</Route>
    <Route path="/notes">{() => <Traveller><HeritageNotes /></Traveller>}</Route>
    <Route path="/planner">{() => <Traveller><Planner /></Traveller>}</Route>
    <Route path="/artisan">{() => <ArtisanGate><Artisan /></ArtisanGate>}</Route>
    <Route path="/authority">{() => <AuthorityGate><Authority /></AuthorityGate>}</Route>
    <Route path="/craft/:id">{() => <Traveller><CraftDetail /></Traveller>}</Route>
    <Route path="/maker/:slug">{() => <Traveller><ArtisanProfile /></Traveller>}</Route>
    <Route path="/product/:id">{() => <Traveller><ProductDetail /></Traveller>}</Route>
    <Route path="/resources/:id">{() => <Traveller><CulturalResourceDetail /></Traveller>}</Route>
    <Route path="/experience/channapatna-toy-making">{() => <Traveller><ExperienceDetail /></Traveller>}</Route>
    <Route path="/experience/:slug">{() => <Traveller><ExperienceDetail /></Traveller>}</Route>
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
        <TooltipProvider>
          <DemoStateBridge />
          <Toaster />
          <Router />
        </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
