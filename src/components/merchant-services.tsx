
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ShoppingBag, Landmark, Clock } from "lucide-react";

type MerchantServicesProps = {
    onBack: () => void;
}

const merchantServices = [
    {
        icon: <ShoppingBag className="h-8 w-8 text-primary" />,
        title: "PICO (Achat + Retrait)",
        description: "Payez vos achats et retirez du cash en même temps chez un marchand partenaire."
    },
    {
        icon: <Landmark className="h-8 w-8 text-primary" />,
        title: "PICASH (Retrait seul)",
        description: "Retirez de l'argent facilement depuis n'importe quel point marchand agréé."
    },
    {
        icon: <Clock className="h-8 w-8 text-primary" />,
        title: "BNPL (Payer plus tard)",
        description: "Achetez maintenant et payez plus tard grâce à nos solutions de paiement échelonné."
    }
];

export default function MerchantServices({ onBack }: MerchantServicesProps) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-primary">Services Marchands</h2>
                    <p className="text-muted-foreground">Découvrez nos solutions de paiement chez les commerçants.</p>
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {merchantServices.map(service => (
                    <Card key={service.title} className="cursor-not-allowed opacity-60">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                {service.icon}
                                <CardTitle>{service.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{service.description}</CardDescription>
                            <Button variant="outline" className="mt-4 w-full" disabled>Bientôt disponible</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
