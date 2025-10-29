import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  getData, 
  addChargeFixe, 
  updateChargeFixe, 
  deleteChargeFixe,
  formatAmount,
  getTotalChargesFixes,
  ChargeFixe 
} from "@/lib/storage";
import { toast } from "sonner";
import { getCurrency, CURRENCIES } from "@/lib/storage";

export default function ChargesFixes() {
  const [charges, setCharges] = useState<ChargeFixe[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<ChargeFixe | null>(null);
  const [formData, setFormData] = useState({
    nomCharge: "",
    montant: "",
    datePaiement: "",
  });

  const currencyCode = getCurrency();
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  const currencySymbol = currency?.symbol || 'F';

  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = () => {
    const data = getData();
    setCharges(data.chargesFixes || []);
  };

  const handleAdd = () => {
    if (!formData.nomCharge.trim() || !formData.montant) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    addChargeFixe({
      nomCharge: formData.nomCharge.trim(),
      montant: parseFloat(formData.montant),
      datePaiement: formData.datePaiement || undefined,
    });

    toast.success("Charge fixe ajoutée avec succès");
    setFormData({ nomCharge: "", montant: "", datePaiement: "" });
    setIsAddDialogOpen(false);
    loadCharges();
  };

  const handleEdit = () => {
    if (!editingCharge) return;

    if (!formData.nomCharge.trim() || !formData.montant) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    updateChargeFixe(editingCharge.id, {
      nomCharge: formData.nomCharge.trim(),
      montant: parseFloat(formData.montant),
      datePaiement: formData.datePaiement || undefined,
    });

    toast.success("Charge fixe modifiée avec succès");
    setFormData({ nomCharge: "", montant: "", datePaiement: "" });
    setIsEditDialogOpen(false);
    setEditingCharge(null);
    loadCharges();
  };

  const handleDelete = (id: string, nom: string) => {
    if (window.confirm(`Supprimer la charge "${nom}" ?`)) {
      deleteChargeFixe(id);
      toast.success("Charge fixe supprimée");
      loadCharges();
    }
  };

  const openEditDialog = (charge: ChargeFixe) => {
    setEditingCharge(charge);
    setFormData({
      nomCharge: charge.nomCharge,
      montant: charge.montant.toString(),
      datePaiement: charge.datePaiement || "",
    });
    setIsEditDialogOpen(true);
  };

  const totalCharges = getTotalChargesFixes();

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Charges fixes
          </h1>
          <p className="text-muted-foreground text-sm">
            Ajoutez vos dépenses mensuelles obligatoires. AKBWallet les déduira automatiquement de vos revenus chaque mois.
          </p>
        </div>

        {/* Total Card */}
        <Card className="p-6 bg-gradient-primary text-white border-0 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Total des charges fixes</p>
              <p className="text-3xl font-bold">{formatAmount(totalCharges)}</p>
              <p className="text-white/60 text-xs mt-1">Déduites automatiquement chaque mois</p>
            </div>
            <Receipt className="w-12 h-12 text-white/80" />
          </div>
        </Card>

        {/* Add Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Ajouter une charge fixe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle charge fixe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nomCharge">Nom de la charge *</Label>
                <Input
                  id="nomCharge"
                  placeholder="Ex: Loyer, Électricité, Internet..."
                  value={formData.nomCharge}
                  onChange={(e) => setFormData({ ...formData, nomCharge: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant">Montant ({currencySymbol}) *</Label>
                <Input
                  id="montant"
                  type="number"
                  placeholder="0"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="datePaiement">Date de paiement (optionnelle)</Label>
                <Input
                  id="datePaiement"
                  type="date"
                  value={formData.datePaiement}
                  onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la charge fixe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="editNomCharge">Nom de la charge *</Label>
                <Input
                  id="editNomCharge"
                  placeholder="Ex: Loyer, Électricité, Internet..."
                  value={formData.nomCharge}
                  onChange={(e) => setFormData({ ...formData, nomCharge: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMontant">Montant ({currencySymbol}) *</Label>
                <Input
                  id="editMontant"
                  type="number"
                  placeholder="0"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDatePaiement">Date de paiement (optionnelle)</Label>
                <Input
                  id="editDatePaiement"
                  type="date"
                  value={formData.datePaiement}
                  onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
                />
              </div>
              <Button onClick={handleEdit} className="w-full">
                Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Charges List */}
        {charges.length > 0 ? (
          <div className="space-y-3">
            {charges.map((charge) => (
              <Card key={charge.id} className="p-4 bg-gradient-card border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{charge.nomCharge}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatAmount(charge.montant)}
                    </p>
                    {charge.datePaiement && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Paiement le {new Date(charge.datePaiement).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(charge)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(charge.id, charge.nomCharge)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune charge fixe enregistrée</p>
            <p className="text-sm text-muted-foreground mt-2">
              Cliquez sur le bouton ci-dessus pour ajouter votre première charge
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
