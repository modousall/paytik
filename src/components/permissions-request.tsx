
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bell } from "lucide-react";

type PermissionsRequestProps = {
  onPermissionsGranted: () => void;
};

export default function PermissionsRequest({ onPermissionsGranted }: PermissionsRequestProps) {
    const handleGrantPermissions = () => {
        // In a real mobile app, you would trigger the native permission prompts here.
        // For this web demo, we'll simulate granting them.
        console.log("Permissions for Contacts and Notifications granted (simulation).");
        onPermissionsGranted();
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Autorisations Requises</CardTitle>
                <CardDescription>
                Pour vous offrir la meilleure expérience, PAYTIK a besoin d'accéder à certaines fonctionnalités de votre téléphone.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Accès aux contacts</h3>
                        <p className="text-sm text-muted-foreground">
                            Permet de sélectionner facilement des destinataires pour vos paiements, partages de dépenses et invitations.
                        </p>
                    </div>
               </div>
               <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                            Vous alerte pour les transactions reçues, les demandes de paiement, les rappels de tontine et les mises à jour importantes du système.
                        </p>
                    </div>
               </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button onClick={handleGrantPermissions} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    J'accepte et je continue
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                    Vos données sont traitées en toute sécurité et ne sont jamais partagées sans votre consentement.
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
