import { Goal } from "@/lib/storage";
import { Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface GoalCardProps {
  goal: Goal;
  onDelete: (id: string) => void;
  onAddAmount: (id: string) => void;
}

export const GoalCard = ({ goal, onDelete, onAddAmount }: GoalCardProps) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  
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
            <p className="text-2xl font-bold text-primary">{goal.currentAmount.toFixed(2)} F</p>
            <p className="text-sm text-muted-foreground">sur {goal.targetAmount.toFixed(2)} F</p>
          </div>
          <Button
            onClick={() => onAddAmount(goal.id)}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Ajouter
          </Button>
        </div>
        
        {remaining > 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2 border-t border-border/50">
            Plus que {remaining.toFixed(2)} F à économiser !
          </p>
        )}
      </div>
    </div>
  );
};
