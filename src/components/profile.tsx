
"use client";

import ManageAlias from "./manage-alias";
import Contacts from "./contacts";
import { Separator } from "./ui/separator";

type ProfileProps = {
  alias: string;
  onLogout: () => void;
};

export default function Profile({ alias, onLogout }: ProfileProps) {
  return (
    <div className="space-y-8">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">Profil et Paramètres</h2>
            <p className="text-muted-foreground">Gérez vos informations, contacts et alias.</p>
        </div>

        <div>
            <ManageAlias alias={alias} onLogout={onLogout} />
        </div>
        
        <Separator />

        <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Gérer les contacts</h2>
            <p className="text-muted-foreground mb-6">Ajoutez, modifiez ou supprimez vos contacts enregistrés pour des transactions plus rapides.</p>
            <Contacts />
        </div>
    </div>
  );
}
