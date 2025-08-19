
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ShoppingBag, Landmark, Clock, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

type MerchantServicesProps = {
    onBack: () => void;
}

const merchantServicesList = [
    {
        icon: <ShoppingBag className="h-6 w-6 text-primary" />,
        title: "PICO (Achat + Retrait)",
        description: "Payez vos achats et retirez du cash en même temps chez un marchand partenaire. Idéal pour faire d'une pierre deux coups."
    },
    {
        icon: <Landmark className="h-6 w-6 text-primary" />,
        title: "PICASH (Retrait seul)",
        description: "Retirez de l'argent facilement depuis n'importe quel point marchand agréé, sans avoir à effectuer d'achat."
    },
    {
        icon: <Clock className="h-6 w-6 text-primary" />,
        title: "BNPL (Payer plus tard)",
        description: "Achetez maintenant et payez plus tard grâce à nos solutions de paiement échelonné flexibles chez les commerçants participants."
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
            <Accordion type="single" collapsible className="w-full space-y-4">
                {merchantServicesList.map(service => (
                    <AccordionItem value={service.title} key={service.title} className="border rounded-lg bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 hover:no-underline">
                            <div className="flex items-center gap-4">
                                {service.icon}
                                <span className="font-semibold text-lg">{service.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <p className="text-muted-foreground mb-4">{service.description}</p>
                            <Button variant="outline" className="w-full" disabled>Bientôt disponible</Button>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
