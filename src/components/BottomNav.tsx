import { Home, Receipt, Target, BarChart3, FileText, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Accueil", path: "/", icon: Home },
  { name: "Transactions", path: "/transactions", icon: Receipt },
  { name: "Objectifs", path: "/goals", icon: Target },
  { name: "Charges", path: "/charges-fixes", icon: FileText },
  { name: "Stats", path: "/statistics", icon: BarChart3 },
  { name: "Profil", path: "/profile", icon: User },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border shadow-glow">
      <div className="w-full px-1 py-2">
        <div className="flex justify-around items-center">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg transition-all duration-200 min-w-0 flex-shrink-0",
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all flex-shrink-0",
                    isActive && "drop-shadow-glow"
                  )}
                />
                <span className="text-[10px] font-medium whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
