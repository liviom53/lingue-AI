import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "./components/layout/AppLayout";
import { SplashScreen } from "./components/SplashScreen";
import { PwaInstallBanner } from "./components/PwaInstallBanner";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Uscite = lazy(() => import("./pages/Uscite"));
const Pescato = lazy(() => import("./pages/Pescato"));
const Spot = lazy(() => import("./pages/Spot"));
const Specie = lazy(() => import("./pages/Specie"));
const Attrezzatura = lazy(() => import("./pages/Attrezzatura"));
const Ricette = lazy(() => import("./pages/Ricette"));
const Meteo = lazy(() => import("./pages/Meteo"));
const Maree = lazy(() => import("./pages/Maree"));
const Previsioni = lazy(() => import("./pages/Previsioni"));
const Statistiche = lazy(() => import("./pages/Statistiche"));
const AI = lazy(() => import("./pages/AI"));
const ParcoAuto = lazy(() => import("./pages/ParcoAuto"));
const Finanze = lazy(() => import("./pages/Finanze"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  }
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/uscite" component={Uscite} />
          <Route path="/pescato" component={Pescato} />
          <Route path="/spot" component={Spot} />
          <Route path="/specie" component={Specie} />
          <Route path="/attrezzatura" component={Attrezzatura} />
          <Route path="/ricette" component={Ricette} />
          <Route path="/meteo" component={Meteo} />
          <Route path="/maree" component={Maree} />
          <Route path="/previsioni" component={Previsioni} />
          <Route path="/statistiche" component={Statistiche} />
          <Route path="/ai" component={AI} />
          <Route path="/parco-auto" component={ParcoAuto} />
          <Route path="/finanze" component={Finanze} />
          <Route>
            <div className="p-8 text-center">
              <h2 className="text-xl font-bold">404 - Pagina non trovata</h2>
            </div>
          </Route>
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("diario_has_seen_splash");
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem("diario_has_seen_splash", "true");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        {!showSplash && (
          <WouterRouter base={import.meta.env.BASE_URL === "/" ? "/diario-pescatore" : import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        )}
        {!showSplash && <PwaInstallBanner />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
