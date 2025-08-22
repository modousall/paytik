
"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Building, Store, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import ClientWithdrawalForm from './client-withdrawal-form';
import PICASH from './picash';

type WithdrawOptionsProps = {
    onBack: () => void;
    alias: string;
    userInfo: { name: string; email: string };
};

type View = 'menu' | 'GAB' | 'Marchand' | 'compense';

const FeatureCard = ({ title, description, icon, onClick, colorClass }: { title: string, description: string, icon: JSX.Element, onClick: () => void, colorClass: string }) => (
    <Card 
        onClick={onClick}
        className="w-full cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
    >
        <CardContent className="p-4 flex items-center gap-4">
            <div className={cn("p-3 rounded-full", colorClass)}>
                {React.cloneElement(icon, { className: "h-6 w-6 text-white"})}
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
    </Card>
);

export default function WithdrawOptions({ onBack, alias, userInfo }: WithdrawOptionsProps) {
    const [view, setView] = useState<View>('menu');

    const menuItems = [
        { id: 'GAB', title: "Retrait au GAB", description: "Générez un code pour retirer à un distributeur.", icon: <Building />, colorClass: "bg-blue-500" },
        { id: 'Marchand', title: "Retrait chez un Marchand", description: "Payez et retirez du cash en une seule opération.", icon: <Store />, colorClass: "bg-green-500" },
    ];
    
    if (view !== 'menu') {
        return <ClientWithdrawalForm onBack={() => setView('menu')} withdrawalType={view} alias={alias} />;
    }

    return (
         <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                     <h2 className="text-2xl font-bold text-primary">Retrait d'Argent</h2>
                     <p className="text-muted-foreground">Où souhaitez-vous effectuer votre retrait ?</p>
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto'>
                {menuItems.map(item => (
                    <FeatureCard 
                        key={item.id}
                        {...item}
                        onClick={() => setView(item.id as View)}
                    />
                ))}
            </div>
        </div>
    )
}
