
"use client";

import { Button } from "./ui/button";
import { ArrowLeft, ShoppingBag, Clock, History, ChevronRight } from "lucide-react";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import React from "react";
import { cn } from "@/lib/utils";

type MerchantServicesProps = {
    onBack: () => void;
    onServiceClick: (service: 'pico' | 'bnpl' | 'my-requests') => void;
}

const ServiceCard = ({ 
    icon, 
    title, 
    description, 
    onClick, 
    colorClass 
}: { 
    icon: React.ReactNode, 
    title: string, 
    description: string, 
    onClick: () => void, 
    colorClass: string 
}) => (
    <Card 
        onClick={onClick}
        className={cn(
            "w-full cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 text-white border-none",
            colorClass
        )}
    >
        <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
                <div className="mb-4">
                    {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 text-white/90"})}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-white/80 mt-1 text-sm">{description}</p>
            </div>
            <div className="mt-4 text-right">
                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white h-auto p-2 rounded-full">
                    <ChevronRight className="h-6 w-6"/>
                </Button>
            </div>
        </CardContent>
    </Card>
);

export default function MerchantServices({ onBack, onServiceClick }: MerchantServicesProps) {
    const { flags } = useFeatureFlags();

    const allServices = [
        {
            id: 'pico',
            icon: <ShoppingBag />,
            title: "PICO (Achat + Retrait)",
            description: "Payez vos achats et retirez du cash en même temps chez un marchand partenaire.",
            enabled: true,
            colorClass: "bg-gradient-to-br from-blue-500 to-cyan-400"
        },
        {
            id: 'bnpl',
            icon: <Clock />,
            title: "Credit Marchands",
            description: "Achetez maintenant, payez plus tard. Flexible et rapide chez les commerçants participants.",
            enabled: flags.bnpl,
            colorClass: "bg-gradient-to-br from-purple-500 to-violet-400"
        },
        {
            id: 'my-requests',
            icon: <History />,
            title: "Mes Demandes de Crédit",
            description: "Consultez l'historique et le statut de toutes vos demandes de paiement échelonné.",
            enabled: flags.bnpl,
            colorClass: "bg-gradient-to-br from-slate-600 to-gray-500"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {merchantServicesList.map(service => (
                    <ServiceCard
                        key={service.id}
                        icon={service.icon}
                        title={service.title}
                        description={service.description}
                        onClick={() => onServiceClick(service.id)}
                        colorClass={service.colorClass}
                    />
                ))}
            </div>
        </div>
    )
}
