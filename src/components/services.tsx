
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Zap, Wifi, Smartphone, Tv, ShoppingCart, Plus, Handshake, CreditCard } from "lucide-react";

type Service = {
    name: string;
    icon: JSX.Element;
    provider?: string;
    action: string;
};

const servicesList: Service[] = [
    { name: "Tontine", icon: <Handshake className="h-8 w-8 text-primary" />, action: "tontine" },
    { name: "Ma Carte", icon: <CreditCard className="h-8 w-8 text-primary" />, action: "ma-carte" },
    { name: "Eau", icon: <Droplets className="h-8 w-8 text-primary" />, provider: "SDE", action: "eau" },
    { name: "Électricité", icon: <Zap className="h-8 w-8 text-primary" />, provider: "SENELEC", action: "electricite" },
    { name: "Internet", icon: <Wifi className="h-8 w-8 text-primary" />, provider: "Orange", action: "internet" },
    { name: "Crédit Tel.", icon: <Smartphone className="h-8 w-8 text-primary" />, provider: "Multi-opérateur", action: "credit" },
    { name: "Abonnement TV", icon: <Tv className="h-8 w-8 text-primary" />, provider: "Canal+", action: "tv" },
    { name: "Marchands", icon: <ShoppingCart className="h-8 w-8 text-primary" />, provider: "Partenaires", action: "marchands" },
    { name: "Autre", icon: <Plus className="h-8 w-8 text-primary" />, provider: "Divers", action: "autre" },
];


export default function Services({ onServiceClick }: { onServiceClick: (action: string) => void }) {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary">Services disponibles</h2>
                <p className="text-muted-foreground">Payez vos factures et accédez à d'autres services rapidement.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {servicesList.map(service => (
                    <Card 
                        key={service.name} 
                        className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent/50 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => onServiceClick(service.action)}
                    >
                        <div className="p-3 bg-accent/20 rounded-full mb-3">
                           {service.icon}
                        </div>
                        <p className="font-semibold text-sm">{service.name}</p>
                        {service.provider && <p className="text-xs text-muted-foreground">{service.provider}</p>}
                    </Card>
                ))}
            </div>
        </div>
    )
}
