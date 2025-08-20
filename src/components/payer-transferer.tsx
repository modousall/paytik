
"use client"

import { useState } from 'react';
import PaymentForm from './payment-form';
import SplitBill from './split-bill';
import BillPaymentForm from './bill-payment-form';
import MerchantServices from './merchant-services';
import PICO from './pico';
import BNPL from './bnpl';
import { Button } from './ui/button';
import { ArrowLeft, ArrowUp, Handshake, Receipt, ShoppingCart, Users, Clock, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import MyBnplRequests from './my-bnpl-requests';

type PayerTransfererState = 'menu' | 'send' | 'bills' | 'merchants';
type MerchantSubService = 'pico' | 'bnpl' | 'my-requests';

type PayerTransfererProps = {
    onBack: () => void;
}

export default function PayerTransferer({ onBack }: PayerTransfererProps) {
    const [state, setState] = useState<PayerTransfererState>('menu');
    const [merchantService, setMerchantService] = useState<MerchantSubService | null>(null);
    const { flags } = useFeatureFlags();

    const menuItems = [
        { id: 'send', title: "Envoyer de l'argent", description: "À un alias, un contact ou un QR code.", icon: <ArrowUp /> },
        { id: 'bills', title: "Payer une facture", description: "Réglez vos factures SENELEC, SDE, etc.", icon: <Receipt /> },
    ];
    
    if (merchantService) {
        const onMerchantBack = () => setMerchantService(null);
        if (merchantService === 'pico') return <PICO onBack={onMerchantBack} />;
        if (merchantService === 'bnpl' && flags.bnpl) return <BNPL onBack={onMerchantBack} />;
        if (merchantService === 'my-requests' && flags.bnpl) return <MyBnplRequests onBack={onMerchantBack} />;
    }

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
            case 'merchants':
                return <MerchantServices onBack={onSubMenuBack} onServiceClick={(service) => setMerchantService(service)}/>;
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
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {menuItems.map(item => (
                    <Card 
                        key={item.id} 
                        className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                        onClick={() => setState(item.id as PayerTransfererState)}
                    >
                        <div className='p-6 h-full flex flex-col'>
                            <div className="p-3 bg-primary/10 rounded-full text-primary w-fit">{item.icon}</div>
                            <div className="flex-grow mt-4">
                                <CardTitle className='text-lg'>{item.title}</CardTitle>
                                <CardDescription className="mt-1">{item.description}</CardDescription>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
                             <div className='p-6 flex items-center gap-4'>
                                <div className="p-3 bg-primary/10 rounded-full text-primary w-fit"><Users/></div>
                                <div>
                                    <CardTitle className='text-lg'>Partager une dépense</CardTitle>
                                    <CardDescription>Divisez une facture avec vos contacts.</CardDescription>
                                </div>
                             </div>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Partager une dépense</DialogTitle>
                        </DialogHeader>
                        <SplitBill />
                    </DialogContent>
                </Dialog>
                <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group" onClick={() => setState('merchants')}>
                    <div className='p-6 flex items-center gap-4'>
                        <div className="p-3 bg-primary/10 rounded-full text-primary w-fit"><ShoppingCart/></div>
                        <div>
                            <CardTitle className='text-lg'>Services Marchands</CardTitle>
                            <CardDescription>PICO, BNPL et plus.</CardDescription>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
