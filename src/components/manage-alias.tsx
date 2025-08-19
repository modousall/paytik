
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

type ManageAliasProps = {
  alias: string;
  onLogout: () => void;
};

export default function ManageAlias({ alias, onLogout }: ManageAliasProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAlias = () => {
    setIsDeleting(true);
    // Simulate API call to delete alias
    setTimeout(() => {
        toast({
            title: "Alias supprimé",
            description: "Votre alias a été supprimé avec succès.",
        });
        onLogout(); // This will clear local storage and reset the app state
        setIsDeleting(false);
    }, 1500);
  };

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(alias);
    toast({
        title: "Copié !",
        description: "Votre alias a été copié dans le presse-papiers.",
    });
  }

  return (
    <div>
        <h2 className="text-2xl font-bold mb-4 text-primary">Gérer votre alias</h2>
        <p className="text-muted-foreground mb-6">Affichez, copiez ou supprimez votre alias PAYTIK existant.</p>
      
      <Card className="max-w-lg mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="text-primary"/>
            Votre Alias Actif
          </CardTitle>
          <CardDescription>
            C'est l'identifiant que les autres peuvent utiliser pour vous envoyer de l'argent.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Label htmlFor="current-alias">Alias</Label>
                <div className="flex gap-2">
                    <Input id="current-alias" value={alias} readOnly />
                    <Button onClick={handleCopyAlias} variant="outline">Copier</Button>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 border-t pt-6 mt-6">
            <h3 className="font-semibold text-destructive">Zone de Danger</h3>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer l'alias
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. La suppression de votre alias réinitialisera l'application et vous devrez créer un nouvel alias pour continuer.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAlias} disabled={isDeleting}>
                        {isDeleting ? "Suppression..." : "Oui, supprimer l'alias"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground">
                La suppression de votre alias vous déconnectera. Vous pourrez en créer un nouveau par la suite.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
