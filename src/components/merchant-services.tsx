
"use client";

import { Button } from "./ui/button";
import { ArrowLeft, ShoppingBag, Clock, History } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

type MerchantServicesProps = {
    onBack: () => void;
    onServiceClick: (service: 'pico' | 'bnpl' | 'my-requests') => void;
}



export default function MerchantServices({ onBack, onServiceClick }: MerchantServicesProps) {
    const { flags } = useFeatureFlags();

    const allServices = [
        {
            id: 'pico',
            icon: <ShoppingBag className="h-6 w-6 text-primary" />,
            title: "PICO (Achat + Retrait)",
            description: "Payez vos achats et retirez du cash en même temps chez un marchand partenaire. Idéal pour faire d'une pierre deux coups.",
            enabled: true,
        },
        {
            id: 'bnpl',
            icon: <Clock className="h-6 w-6 text-primary" />,
            title: "Credit Marchands (Payer plus tard)",
            description: "Achetez maintenant et payez plus tard grâce à nos solutions de paiement échelonné flexibles chez les commerçants participants.",
            enabled: flags.bnpl,
        },
        {
            id: 'my-requests',
            icon: <History className="h-6 w-6 text-primary" />,
            title: "Mes Demandes de Crédit",
            description: "Consultez l'historique et le statut de vos demandes de paiement échelonné.",
            enabled: flags.bnpl,
        }
    ] as const;

    const merchantServicesList = allServices.filter(s => s.enabled);


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
                            <Button variant="outline" className="w-full" onClick={() => onServiceClick(service.id)}>Commencer</Button>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
