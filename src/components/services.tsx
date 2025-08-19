
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Handshake, CreditCard, ShoppingCart, Receipt, PiggyBank } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Button } from "./ui/button";

export type Service = {
    name: string;
    icon: JSX.Element;
    action: string;
    description: string;
};


const servicesList: Service[] = [
    { name: "Marchands", icon: <ShoppingCart className="h-8 w-8 text-primary" />, action: "marchands", description: "Payez, retirez du cash (PICO) ou financez vos achats (BNPL) chez nos partenaires." },
    { name: "Factures", icon: <Receipt className="h-8 w-8 text-primary" />, action: "factures", description: "Réglez vos factures SENELEC, SDE, Orange et autres services rapidement." },
];


export default function Services({ onServiceClick }: { onServiceClick: (service: Service) => void }) {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary">Services disponibles</h2>
                <p className="text-muted-foreground">Découvrez tous les outils financiers à votre disposition.</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {servicesList.map(service => (
                     <AccordionItem value={service.name} key={service.name} className="border rounded-lg bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 hover:no-underline">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent/20 rounded-full">
                                    {service.icon}
                                </div>
                                <span className="font-semibold text-lg">{service.name}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <p className="text-muted-foreground mb-4">{service.description}</p>
                            <Button variant="outline" className="w-full" onClick={() => onServiceClick(service)}>Commencer</Button>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
