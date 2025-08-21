
"use client"

import React, { useState } from 'react';
import PaymentForm from './payment-form';
import SplitBill from './split-bill';
import BillPaymentForm from './bill-payment-form';
import { Button } from './ui/button';
import { ArrowLeft, ArrowUp, Receipt, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from '@/lib/utils';


type PayerTransfererState = 'menu' | 'send' | 'bills';

type PayerTransfererProps = {
    onBack: () => void;
}

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

export default function PayerTransferer({ onBack }: PayerTransfererProps) {
    const [state, setState] = useState<PayerTransfererState>('menu');

    const menuItems = [
        { id: 'send', title: "Envoyer de l'argent", description: "Alias, contact ou QR code.", icon: <ArrowUp />, colorClass: "bg-blue-500" },
        { id: 'bills', title: "Payer une facture", description: "SENELEC, SDE, etc.", icon: <Receipt />, colorClass: "bg-green-500" },
        { id: 'split', title: "Partager une dépense", description: "Divisez avec des contacts.", icon: <Users />, colorClass: "bg-purple-500" },
    ];
    
    if (state !== 'menu') {
        const onSubMenuBack = () => setState('menu');
        let content;
        let title = '';

        switch(state) {
            case 'send':
                title = "Envoyer de l'argent";
                content = <PaymentForm />;
                break;
            case 'bills':
                return <BillPaymentForm onBack={onSubMenuBack} />;
        }

        return (
            <div>
                 <div className="flex items-center gap-4 mb-4">
                    <Button onClick={onSubMenuBack} variant="ghost" size="icon">
                        <ArrowLeft />
                    </Button>
                    <h2 className="text-2xl font-bold text-primary">{title}</h2>
                </div>
                 {content}
            </div>
        )
    }


    return (
         <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                     <h2 className="text-2xl font-bold text-primary">Payer & Transférer</h2>
                     <p className="text-muted-foreground">Choisissez une action pour commencer.</p>
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FeatureCard 
                    {...menuItems[0]}
                    onClick={() => setState('send')}
                />
                <FeatureCard 
                    {...menuItems[1]}
                    onClick={() => setState('bills')}
                />
                
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="w-full">
                             <FeatureCard 
                                {...menuItems[2]}
                                onClick={() => {}} // onClick is handled by DialogTrigger
                            />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Partager une dépense</DialogTitle>
                        </DialogHeader>
                        <SplitBill />
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}
