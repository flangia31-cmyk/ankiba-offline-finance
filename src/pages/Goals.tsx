import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getData, deleteGoal, addGoal, updateGoal, Goal, getCurrency, CURRENCIES, formatAmount } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddAmountOpen, setIsAddAmountOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [amountToAdd, setAmountToAdd] = useState("");
  const { toast } = useToast();
  
  const currencyCode = getCurrency() || 'KMF';
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const data = getData();
    setGoals(data.goals);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    loadGoals();
    toast({
      title: "Objectif supprimé",
      description: "L'objectif a été supprimé avec succès.",
    });
  };

  const handleAddAmount = (id: string) => {
    setSelectedGoalId(id);
    setIsAddAmountOpen(true);
  };

  const handleSubmitAmount = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide.",
        variant: "destructive",
      });
      return;
    }

    const goal = goals.find(g => g.id === selectedGoalId);
    if (goal) {
      updateGoal(selectedGoalId, {
        currentAmount: goal.currentAmount + amount,
      });
      loadGoals();
      setIsAddAmountOpen(false);
      setAmountToAdd("");
      toast({
        title: "Montant ajouté",
        description: `${formatAmount(amount)} ajouté à votre objectif.`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    addGoal({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      deadline: formData.deadline,
    });

    loadGoals();
    setIsOpen(false);
    setFormData({
      name: "",
      targetAmount: "",
      deadline: "",
    });

    toast({
      title: "Objectif créé",
      description: "Votre objectif a été créé avec succès.",
    });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Objectifs d'épargne</h1>
            <p className="text-sm text-muted-foreground">
              {goals.length} objectif{goals.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft">
                <Plus className="w-5 h-5 mr-2" />
                Créer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvel objectif</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nom de l'objectif</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Nouveau téléphone"
                  />
                </div>

                <div>
                  <Label>Montant cible ({currency.symbol})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Date limite</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary">
                  Créer l'objectif
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isAddAmountOpen} onOpenChange={setIsAddAmountOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un montant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAmount} className="space-y-4">
              <div>
                <Label>Montant à ajouter ({currency.symbol})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                Ajouter
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucun objectif défini</p>
              <p className="text-sm mt-2">Cliquez sur "Créer" pour définir un objectif d'épargne</p>
            </div>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDelete}
                onAddAmount={handleAddAmount}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
