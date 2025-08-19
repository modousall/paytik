
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Handshake, CreditCard, ShoppingCart, Receipt, PiggyBank } from "lucide-react";

export type Service = {
    name: string;
    icon: JSX.Element;
    action: string;
};

export type BillService = {
    name: string;
    icon: JSX.Element;
    provider?: string;
};


const servicesList: Service[] = [
    { name: "Tontine", icon: <Handshake className="h-8 w-8 text-primary" />, action: "tontine" },
    { name: "Ma Carte", icon: <CreditCard className="h-8 w-8 text-primary" />, action: "ma-carte" },
    { name: "Marchands", icon: <ShoppingCart className="h-8 w-8 text-primary" />, action: "marchands" },
    { name: "Factures", icon: <Receipt className="h-8 w-8 text-primary" />, action: "factures" },
    { name: "Coffres", icon: <PiggyBank className="h-8 w-8 text-primary" />, action: "coffres" },
];


export default function Services({ onServiceClick }: { onServiceClick: (service: Service) => void }) {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary">Services disponibles</h2>
                <p className="text-muted-foreground">Accédez à tous nos services en un seul clic.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {servicesList.map(service => (
                    <Card 
                        key={service.name} 
                        className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent/50 hover:shadow-lg transition-all cursor-pointer aspect-square"
                        onClick={() => onServiceClick(service)}
                    >
                        <div className="p-3 bg-accent/20 rounded-full mb-3">
                           {service.icon}
                        </div>
                        <p className="font-semibold text-sm">{service.name}</p>
                    </Card>
                ))}
            </div>
        </div>
    )
}
