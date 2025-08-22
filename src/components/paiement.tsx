
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Receipt, Store } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import PaymentForm from './payment-form';
import BillPaymentForm from './bill-payment-form';

type PaiementProps = {
    onBack: () => void;
}

type View = 'menu' | 'marchand' | 'facture';

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

export default function Paiement({ onBack }: PaiementProps) {
    const [view, setView] = useState<View>('menu');

    const menuItems = [
        { id: 'marchand', title: "Paiement Marchand", description: "Payez un commerçant avec son alias ou QR code.", icon: <Store />, colorClass: "bg-orange-500" },
        { id: 'facture', title: "Paiement de Facture", description: "Réglez vos factures (Senelec, SDE, etc.).", icon: <Receipt />, colorClass: "bg-blue-500" },
    ];

    if (view === 'marchand') {
        return (
            <div>
                 <div className="flex items-center gap-4 mb-4">
                    <Button onClick={() => setView('menu')} variant="ghost" size="icon">
                        <ArrowLeft />
                    </Button>
                    <h2 className="text-2xl font-bold text-primary">Paiement Marchand</h2>
                </div>
                <PaymentForm />
            </div>
        )
    }

    if (view === 'facture') {
        return <BillPaymentForm onBack={() => setView('menu')} />
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                     <h2 className="text-2xl font-bold text-primary">Effectuer un Paiement</h2>
                     <p className="text-muted-foreground">Comment souhaitez-vous payer ?</p>
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
    );
}
