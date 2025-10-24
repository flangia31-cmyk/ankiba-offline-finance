import { Home, Receipt, Target, BarChart3, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Accueil", path: "/", icon: Home },
  { name: "Transactions", path: "/transactions", icon: Receipt },
  { name: "Objectifs", path: "/goals", icon: Target },
  { name: "Charges", path: "/charges-fixes", icon: FileText },
  { name: "Stats", path: "/statistics", icon: BarChart3 },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border shadow-glow">
      <div className="max-w-md mx-auto px-2 py-3">
        <div className="flex justify-around items-center">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all",
                    isActive && "drop-shadow-glow"
                  )}
                />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
