
"use client";

import React from 'react';
import { Button } from "./ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMonthlyBudget } from '@/hooks/use-monthly-budget';
import { Label } from './ui/label';


const BudgetDialog = () => {
    const { toast } = useToast();
    const { budget, setBudget } = useMonthlyBudget();
    const [localBudget, setLocalBudget] = React.useState<number | string>(budget === 0 ? '' : budget);

    const handleSave = () => {
        const newBudget = Number(localBudget);
        if (isNaN(newBudget) || newBudget < 0) {
            toast({
                title: "Montant invalide",
                description: "Veuillez entrer un nombre positif pour le budget.",
                variant: "destructive"
            });
            return;
        }
        setBudget(newBudget);
        toast({
            title: "Budget mis à jour",
            description: `Votre budget mensuel est maintenant de ${newBudget.toLocaleString()} Fcfa.`
        });
    }
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Définir votre budget de dépenses</DialogTitle>
                <DialogDescription>
                    Suivez vos dépenses mensuelles en définissant un budget. Mettez 0 pour ne pas suivre de budget.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="budget-input">Budget mensuel (Fcfa)</Label>
                <Input 
                    id="budget-input"
                    type="number" 
                    value={localBudget} 
                    onChange={(e) => setLocalBudget(e.target.value)} 
                    placeholder="ex: 500000" 
                />
            </div>
             <div className="flex justify-end gap-2 pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Annuler</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button type="submit" onClick={handleSave}>Enregistrer</Button>
                </DialogClose>
            </div>
        </DialogContent>
    )
}

export default BudgetDialog;
