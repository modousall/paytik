
"use client"

import { useState } from 'react';
import PaymentForm from './payment-form';
import SplitBill from './split-bill';
import BillPaymentForm from './bill-payment-form';
import MerchantServices from './merchant-services';
import PICO from './pico';
import BNPL from './bnpl';
import { Button } from './ui/button';
import { ArrowLeft, ArrowUp, Handshake, Receipt, ShoppingCart, Users, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import MyBnplRequests from './my-bnpl-requests';

type PayerTransfererState = 'menu' | 'send' | 'split' | 'bills' | 'merchants';
type MerchantSubService = 'pico' | 'bnpl' | 'my-requests';

type PayerTransfererProps = {
    onBack: () => void;
}

export default function PayerTransferer({ onBack }: PayerTransfererProps) {
    const [state, setState] = useState<PayerTransfererState>('menu');
    const [merchantService, setMerchantService] = useState<MerchantSubService | null>(null);
    const { flags } = useFeatureFlags();

    const allMenuItems = [
        { id: 'send', title: "Envoyer de l'argent", description: "À un alias, un numéro ou un marchand.", icon: <ArrowUp />, enabled: true },
        { id: 'split', title: "Partager une dépense", description: "Divisez une facture avec vos contacts.", icon: <Users />, enabled: true },
        { id: 'bills', title: "Payer une facture", description: "Réglez vos factures SENELEC, SDE, etc.", icon: <Receipt />, enabled: true },
        { id: 'merchants', title: "Services Marchands", description: "PICO, BNPL et plus.", icon: <ShoppingCart />, enabled: true }, // Enable the menu item itself
    ];
    
    const menuItems = allMenuItems.filter(item => item.enabled);

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
            // Split bill is handled in a dialog now, so this case might not be used
            case 'split':
                title = "Partager une dépense";
                content = <SplitBill />;
                break;
            case 'bills':
                title = "Payer une facture";
                content = <BillPaymentForm onBack={onSubMenuBack} />;
                break;
            case 'merchants':
                title = "Services Marchands";
                content = <MerchantServices onBack={onSubMenuBack} onServiceClick={(service) => setMerchantService(service)}/>;
                break;
        }

        const renderHeader = state !== 'bills' && state !== 'merchants';

        return (
            <div>
                 {renderHeader && (
                    <div className="flex items-center gap-4 mb-4">
                        <Button onClick={onSubMenuBack} variant="ghost" size="icon">
                            <ArrowLeft />
                        </Button>
                        <h2 className="text-2xl font-bold text-primary">{title}</h2>
                    </div>
                 )}
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
                        className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => {
                            if(item.id === 'split') {
                                // Split bill works best in a dialog, so we do nothing here to let the DialogTrigger handle it
                                return;
                            }
                            setState(item.id as PayerTransfererState)
                        }}
                    >
                         {item.id === 'split' ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className='p-6'>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-3 bg-primary/10 rounded-full text-primary">{item.icon}</div>
                                            <CardTitle className='text-lg'>{item.title}</CardTitle>
                                        </div>
                                        <CardDescription>{item.description}</CardDescription>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Partager une dépense</DialogTitle>
                                    </DialogHeader>
                                    <SplitBill />
                                </DialogContent>
                            </Dialog>
                         ) : (
                             <div className='p-6'>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">{item.icon}</div>
                                    <CardTitle className='text-lg'>{item.title}</CardTitle>
                                </div>
                                <CardDescription>{item.description}</CardDescription>
                            </div>
                         )}
                    </Card>
                ))}
            </div>
        </div>
    )
}
