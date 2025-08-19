
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, Wifi, Smartphone, Tv, ShoppingCart, Plus } from "lucide-react";

const services = [
    { name: "Eau", icon: <Droplets className="h-8 w-8 text-primary" />, provider: "SDE" },
    { name: "Électricité", icon: <Zap className="h-8 w-8 text-primary" />, provider: "SENELEC" },
    { name: "Internet", icon: <Wifi className="h-8 w-8 text-primary" />, provider: "Orange" },
    { name: "Crédit Téléphonique", icon: <Smartphone className="h-8 w-8 text-primary" />, provider: "Multi-opérateur" },
    { name: "Abonnement TV", icon: <Tv className="h-8 w-8 text-primary" />, provider: "Canal+" },
    { name: "Marchands", icon: <ShoppingCart className="h-8 w-8 text-primary" />, provider: "Partenaires" },
    { name: "Autre", icon: <Plus className="h-8 w-8 text-primary" />, provider: "Divers" },
];


export default function Services() {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary">Paiement de services</h2>
                <p className="text-muted-foreground">Payez vos factures et services rapidement et en toute sécurité.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {services.map(service => (
                    <Card key={service.name} className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent/50 hover:shadow-lg transition-all cursor-pointer">
                        <div className="p-3 bg-accent/20 rounded-full mb-3">
                           {service.icon}
                        </div>
                        <p className="font-semibold text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.provider}</p>
                    </Card>
                ))}
            </div>
        </div>
    )
}
