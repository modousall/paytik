
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Droplets, Zap, Wifi, Smartphone, Tv, Plus, ArrowLeft } from "lucide-react";
import type { BillService } from './services';


const billServicesList: BillService[] = [
    { name: "Eau", icon: <Droplets className="h-8 w-8 text-primary" />, provider: "SDE" },
    { name: "Électricité", icon: <Zap className="h-8 w-8 text-primary" />, provider: "SENELEC" },
    { name: "Internet", icon: <Wifi className="h-8 w-8 text-primary" />, provider: "Orange" },
    { name: "Crédit Tel.", icon: <Smartphone className="h-8 w-8 text-primary" />, provider: "Multi-opérateur" },
    { name: "Abonnement TV", icon: <Tv className="h-8 w-8 text-primary" />, provider: "Canal+" },
    { name: "Autre", icon: <Plus className="h-8 w-8 text-primary" />, provider: "Divers" },
];

type BillSelectionProps = {
    onSelect: (service: BillService) => void;
    onBack: () => void;
}

export default function BillSelection({ onSelect, onBack }: BillSelectionProps) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-primary">Payer une facture</h2>
                    <p className="text-muted-foreground">Sélectionnez le type de facture que vous souhaitez régler.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {billServicesList.map(service => (
                    <Card 
                        key={service.name} 
                        className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent/50 hover:shadow-lg transition-all cursor-pointer aspect-square"
                        onClick={() => onSelect(service)}
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
