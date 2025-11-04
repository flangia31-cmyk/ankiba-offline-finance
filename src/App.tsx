import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Statistics from "./pages/Statistics";
import Profile from "./pages/Profile";
import ChargesFixes from "./pages/ChargesFixes";
import NotFound from "./pages/NotFound";
import BiometricLock from "./pages/BiometricLock";
import CurrencySetup from "./pages/CurrencySetup";
import { isNativePlatform } from "./lib/biometric";
import { getCurrency } from "./lib/storage";

const queryClient = new QueryClient();

const App = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasCurrency, setHasCurrency] = useState(false);

  useEffect(() => {
    // Vérifier si on est sur une plateforme native et si la devise est configurée
    const checkPlatform = async () => {
      const native = isNativePlatform();
      const currency = getCurrency();
      
      // Si pas natif, déverrouiller automatiquement
      if (!native) {
        setIsUnlocked(true);
      }
      
      // Vérifier si la devise est configurée
      setHasCurrency(!!currency);
      
      setIsChecking(false);
    };
    
    checkPlatform();
  }, []);

  // Pendant la vérification, ne rien afficher (ou un loader)
  if (isChecking) {
    return null;
  }

  // Afficher l'écran de configuration de la devise si nécessaire
  if (!hasCurrency) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <CurrencySetup onComplete={() => setHasCurrency(true)} />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  // Afficher l'écran de verrouillage biométrique si nécessaire
  if (!isUnlocked) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BiometricLock onUnlock={() => setIsUnlocked(true)} />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/charges-fixes" element={<ChargesFixes />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
