import { Transaction, formatAmount } from "@/lib/storage";
import { Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export const TransactionCard = ({ transaction, onDelete }: TransactionCardProps) => {
  const isIncome = transaction.type === "income";
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-card border border-border/50 hover:shadow-soft transition-all animate-fade-in">
      <div className={`p-3 rounded-xl ${isIncome ? "bg-success/10" : "bg-destructive/10"}`}>
        {isIncome ? (
          <ArrowUpCircle className="w-5 h-5 text-success" />
        ) : (
          <ArrowDownCircle className="w-5 h-5 text-destructive" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{transaction.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{transaction.category}</span>
          <span>•</span>
          <span>{format(new Date(transaction.date), "d MMM", { locale: fr })}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold ${isIncome ? "text-success" : "text-destructive"}`}>
          {isIncome ? "+" : "-"}{formatAmount(transaction.amount)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(transaction.id)}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
