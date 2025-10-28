import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, className }: StatCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 sm:p-6 bg-gradient-card backdrop-blur-sm border border-border/50 shadow-soft transition-all hover:shadow-glow hover:scale-[1.02] animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">{value}</p>
        </div>
        <div className={cn(
          "p-2 sm:p-3 rounded-xl flex-shrink-0",
          trend === "up" && "bg-success/10",
          trend === "down" && "bg-destructive/10",
          !trend && "bg-primary/10"
        )}>
          <Icon className={cn(
            "w-5 h-5 sm:w-6 sm:h-6",
            trend === "up" && "text-success",
            trend === "down" && "text-destructive",
            !trend && "text-primary"
          )} />
        </div>
      </div>
    </div>
  );
};
