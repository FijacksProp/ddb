import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./components/MainLayout";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { AppProvider, useApp } from "./contexts/AppContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Landing from "./pages/Landing";
import Loans from "./pages/Loans";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Wallet from "./pages/Wallet";

function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Login />;
  }
  return <MainLayout>{children}</MainLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={() => <ProtectedPage><Dashboard /></ProtectedPage>} />
      <Route path="/wallet" component={() => <ProtectedPage><Wallet /></ProtectedPage>} />
      <Route path="/loans" component={() => <ProtectedPage><Loans /></ProtectedPage>} />
      <Route path="/investments" component={() => <ProtectedPage><Investments /></ProtectedPage>} />
      <Route path="/profile" component={() => <ProtectedPage><Profile /></ProtectedPage>} />
      <Route path="/notifications" component={() => <ProtectedPage><Notifications /></ProtectedPage>} />
      <Route path="/settings" component={() => <ProtectedPage><Settings /></ProtectedPage>} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
