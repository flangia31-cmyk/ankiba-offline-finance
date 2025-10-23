import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { TransactionCard } from "@/components/TransactionCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getData, deleteTransaction, addTransaction, Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const data = getData();
    setTransactions(data.transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    loadTransactions();
    toast({
      title: "Transaction supprimée",
      description: "La transaction a été supprimée avec succès.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    addTransaction({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    });

    loadTransactions();
    setIsOpen(false);
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });

    toast({
      title: "Transaction ajoutée",
      description: "Votre transaction a été enregistrée avec succès.",
    });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-sm text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "income" | "expense") =>
                      setFormData({ ...formData, type: value, category: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">💰 Revenu</SelectItem>
                      <SelectItem value="expense">💸 Dépense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Montant (F CFA)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === 'Alimentation' && '🍽️ '} 
                          {cat === 'Transport' && '🚗 '} 
                          {cat === 'Shopping' && '🛍️ '} 
                          {cat === 'Santé' && '💊 '} 
                          {cat === 'Loisirs' && '🎮 '} 
                          {cat === 'Logement' && '🏠 '} 
                          {cat === 'Factures' && '📄 '} 
                          {cat === 'Éducation' && '📚 '} 
                          {cat === 'Salaire' && '💰 '} 
                          {cat === 'Freelance' && '💼 '} 
                          {cat === 'Vente' && '🏷️ '} 
                          {cat === 'Investissement' && '📈 '} 
                          {cat === 'Cadeau' && '🎁 '} 
                          {cat === 'Remboursement' && '💸 '} 
                          {cat === 'Prime' && '🎯 '} 
                          {cat === 'Autre' && '📦 '}
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Courses du mois"
                  />
                </div>

                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary">
                  Enregistrer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune transaction enregistrée</p>
              <p className="text-sm mt-2">Cliquez sur le bouton "Ajouter" pour commencer</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
