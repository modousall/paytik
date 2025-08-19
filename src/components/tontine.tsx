
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, PlusCircle } from "lucide-react";

const tontines = [
  {
    name: "Tontine Familiale Mensuelle",
    participants: 12,
    totalAmount: 1200000,
    myContribution: 100000,
    progress: 75,
    isMyTurn: false,
  },
  {
    name: "Groupe d'amis 'Projet Vacances'",
    participants: 8,
    totalAmount: 800000,
    myContribution: 100000,
    progress: 50,
    isMyTurn: true,
  },
  {
    name: "Collègues du bureau",
    participants: 20,
    totalAmount: 400000,
    myContribution: 20000,
    progress: 90,
    isMyTurn: false,
  }
];

export default function Tontine() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-primary">Mes Tontines</h2>
            <p className="text-muted-foreground">Gérez vos groupes de tontine et suivez vos contributions.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Créer une tontine
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tontines.map((tontine, index) => (
          <Card key={index} className={`flex flex-col ${tontine.isMyTurn ? 'border-primary border-2 shadow-primary/20' : ''}`}>
            {tontine.isMyTurn && <div className="text-center py-1 bg-primary text-primary-foreground font-semibold text-sm">C'est votre tour de recevoir !</div>}
            <CardHeader>
              <CardTitle>{tontine.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Users size={16} /> {tontine.participants} participants
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium">Montant total</span>
                  <span className="font-bold text-lg text-primary">{tontine.totalAmount.toLocaleString()} Fcfa</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Votre part</span>
                  <span>{tontine.myContribution.toLocaleString()} Fcfa</span>
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
              <Button variant="outline" className="w-full">Voir les détails</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
