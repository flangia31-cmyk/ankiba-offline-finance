import { Goal, formatAmount } from "@/lib/storage";
import { Target, Trash2, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { calculateSavingsAdvice, getBestAdvice } from "@/lib/savingsAdvice";

interface GoalCardProps {
  goal: Goal;
  onDelete: (id: string) => void;
  onAddAmount: (id: string) => void;
}

export const GoalCard = ({ goal, onDelete, onAddAmount }: GoalCardProps) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const advice = calculateSavingsAdvice(goal.targetAmount, goal.currentAmount, goal.deadline);
  const bestAdvice = advice ? getBestAdvice(advice) : null;
  
  return (
    <div className="p-6 rounded-2xl bg-gradient-card border border-border/50 shadow-soft hover:shadow-glow transition-all animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{goal.name}</h3>
            <p className="text-sm text-muted-foreground">
              Échéance : {format(new Date(goal.deadline), "d MMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(goal.id)}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-semibold">{progress.toFixed(0)}%</span>
        </div>
        
        <Progress value={progress} className="h-3" />
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-2xl font-bold text-primary">{formatAmount(goal.currentAmount)}</p>
            <p className="text-sm text-muted-foreground">sur {formatAmount(goal.targetAmount)}</p>
          </div>
          <Button
            onClick={() => onAddAmount(goal.id)}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Ajouter
          </Button>
        </div>
        
        {remaining > 0 && advice && (
          <div className="pt-3 border-t border-border/50 space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Plus que {formatAmount(remaining)} à économiser !
            </p>
            
            {/* Conseil principal */}
            {bestAdvice && (
              <div className={`p-4 rounded-xl ${advice.isUrgent ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/10 border border-primary/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={`w-4 h-4 ${advice.isUrgent ? 'text-destructive' : 'text-primary'}`} />
                  <span className="text-sm font-semibold">{advice.message}</span>
                </div>
                <p className="text-lg font-bold">
                  {formatAmount(bestAdvice.amount)} {bestAdvice.period}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  pour atteindre votre objectif à temps
                </p>
              </div>
            )}
            
            {/* Détails des options */}
            {advice.daysLeft > 1 && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-background/50 text-center">
                  <Calendar className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-semibold">{formatAmount(advice.perDay)}</p>
                  <p className="text-muted-foreground">par jour</p>
                </div>
                {advice.daysLeft >= 7 && (
                  <div className="p-2 rounded-lg bg-background/50 text-center">
                    <Calendar className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-semibold">{formatAmount(advice.perWeek)}</p>
                    <p className="text-muted-foreground">par semaine</p>
                  </div>
                )}
                {advice.daysLeft >= 30 && (
                  <div className="p-2 rounded-lg bg-background/50 text-center">
                    <DollarSign className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-semibold">{formatAmount(advice.perMonth)}</p>
                    <p className="text-muted-foreground">par mois</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {remaining <= 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-center text-sm font-semibold text-green-600">
              🎉 Objectif atteint ! Félicitations !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
