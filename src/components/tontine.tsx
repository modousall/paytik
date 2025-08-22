

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, PlusCircle, UserPlus, Eye, ArrowLeft } from "lucide-react";
import { useTontine } from "@/hooks/use-tontine";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import CreateTontineForm from "./create-tontine-form";
import { useState } from "react";
import TontineDetails from "./tontine-details";
import type { Tontine as TontineType } from "@/hooks/use-tontine";
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { formatCurrency } from "@/lib/utils";

type TontineProps = {
    onBack: () => void;
    standalone?: boolean;
};

export default function Tontine({ onBack, standalone = true }: TontineProps) {
  const { tontines } = useTontine();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTontine, setSelectedTontine] = useState<TontineType | null>(null);
  const { flags } = useFeatureFlags();

  if (!flags.tontine) {
      return (
          <div className="text-center p-8">
              <h2 className="text-xl font-bold">Fonctionnalité désactivée</h2>
              <p className="text-muted-foreground">La gestion des tontines est actuellement désactivée par l'administrateur.</p>
              <Button onClick={onBack} className="mt-4">Retour</Button>
          </div>
      )
  }

  if (selectedTontine) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={() => setSelectedTontine(null)} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-primary">{selectedTontine.name}</h2>
                    <p className="text-muted-foreground">Détails du groupe et historique.</p>
                </div>
            </div>
            <TontineDetails tontine={selectedTontine} />
        </div>
    )
  }

  return (
    <div>
      {standalone && (
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-primary">Tontines</h2>
                <p className="text-muted-foreground">Gérer les contributions.</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Créer un groupe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Lancer une nouvelle tontine / tirelire</DialogTitle>
                </DialogHeader>
                <CreateTontineForm onTontineCreated={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
      )}


      {tontines.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tontines.map((tontine) => (
            <Card key={tontine.id} className={`flex flex-col ${tontine.isMyTurn ? 'border-primary border-2 shadow-primary/20' : ''}`}>
              {tontine.isMyTurn && <div className="text-center py-1 bg-primary text-primary-foreground font-semibold text-sm">C'est votre tour de recevoir !</div>}
              <CardHeader>
                <CardTitle>{tontine.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Users size={16} /> {tontine.participants.length} participants
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium">Montant total</span>
                    <span className="font-bold text-base text-primary">{formatCurrency(tontine.amount * tontine.participants.length)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Votre part</span>
                    <span>{formatCurrency(tontine.amount)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span>{tontine.progress}%</span>
                  </div>
                  <Progress value={tontine.progress} />
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" onClick={() => setSelectedTontine(tontine)}>
                    <Eye className="mr-2 h-4 w-4" /> Voir les détails
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
            <UserPlus className="mx-auto h-16 w-16 text-muted-foreground" />
            <h4 className="mt-4 text-xl font-semibold">Aucun groupe d'épargne</h4>
            <p className="mt-2 text-muted-foreground">Vous n'êtes membre d'aucune tontine pour le moment.</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-6">
                    <PlusCircle className="mr-2 h-4 w-4" /> Démarrer mon premier groupe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Lancer une nouvelle tontine</DialogTitle>
                </DialogHeader>
                <CreateTontineForm onTontineCreated={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
        </div>
      )}
       {!standalone && (
         <div className="mt-6">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Créer un groupe</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                    <DialogTitle>Lancer une nouvelle tontine</DialogTitle>
                    </DialogHeader>
                    <CreateTontineForm onTontineCreated={() => setIsCreateDialogOpen(false)} />
                </DialogContent>
            </Dialog>
         </div>
       )}
    </div>
  );
}
