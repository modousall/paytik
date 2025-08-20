
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
import { cn } from '@/lib/utils';


type PayerTransfererState = 'menu' | 'send' | 'bills' | 'merchants';
type MerchantSubService = 'pico' | 'bnpl' | 'my-requests';

type PayerTransfererProps = {
    onBack: () => void;
}

const ActionCard = ({ title, description, icon, onClick, color }: { title: string, description: string, icon: JSX.Element, onClick: () => void, color: string }) => (
    <Card 
        onClick={onClick}
        className={cn(
            "text-white shadow-lg p-4 flex flex-col justify-between border-none cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out",
            color
        )}
    >
        <div className="flex justify-between items-start">
             <div className="p-2 bg-white/20 rounded-lg">
                {icon}
            </div>
        </div>
        <div className="mt-4">
            <p className="font-bold text-lg">{title}</p>
            <p className="text-xs opacity-90">{description}</p>
        </div>
    </Card>
);

export default function PayerTransferer({ onBack }: PayerTransfererProps) {
    const [state, setState] = useState<PayerTransfererState>('menu');
    const [merchantService, setMerchantService] = useState<MerchantSubService | null>(null);
    const { flags } = useFeatureFlags();

    const menuItems = [
        { id: 'send', title: "Envoyer de l'argent", description: "À un alias, un contact ou un QR code.", icon: <ArrowUp className="h-6 w-6" />, color: "bg-gradient-to-br from-blue-500 to-cyan-400" },
        { id: 'bills', title: "Payer une facture", description: "Réglez vos factures SENELEC, SDE, etc.", icon: <Receipt className="h-6 w-6"/>, color: "bg-gradient-to-br from-green-500 to-emerald-400" },
        { id: 'split', title: "Partager une dépense", description: "Divisez une facture avec vos contacts.", icon: <Users className="h-6 w-6"/>, color: "bg-gradient-to-br from-purple-500 to-violet-400" },
        { id: 'merchants', title: "Services Marchands", description: "PICO, BNPL et plus.", icon: <ShoppingCart className="h-6 w-6"/>, color: "bg-gradient-to-br from-amber-500 to-yellow-400" },
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
            <div className='grid grid-cols-2 gap-4'>
                <ActionCard 
                    {...menuItems[0]}
                    onClick={() => setState('send')}
                />
                <ActionCard 
                    {...menuItems[1]}
                    onClick={() => setState('bills')}
                />
                
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                            <ActionCard 
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

                <ActionCard 
                    {...menuItems[3]}
                    onClick={() => setState('merchants')}
                />
            </div>
        </div>
    )
}
