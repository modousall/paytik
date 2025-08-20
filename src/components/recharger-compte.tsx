
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react';
import MobileMoneyRechargeForm from './mobile-money-recharge-form';
import BankCardRechargeForm from './bank-card-recharge-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type RechargerCompteProps = {
    onBack: () => void;
}

export default function RechargerCompte({ onBack }: RechargerCompteProps) {

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft />
        </Button>
         <div>
            <h2 className="text-2xl font-bold text-primary">Recharger le compte</h2>
             <p className="text-muted-foreground mb-6">Approvisionnez votre solde principal.</p>
        </div>
      </div>
      
        <Tabs defaultValue="mobile-money" className="w-full max-w-lg mx-auto">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mobile-money"><Smartphone className="mr-2 h-4 w-4"/> Mobile Money</TabsTrigger>
                <TabsTrigger value="bank-card"><CreditCard className="mr-2 h-4 w-4"/> Carte Bancaire</TabsTrigger>
            </TabsList>
            <TabsContent value="mobile-money">
                <MobileMoneyRechargeForm onRechargeSuccess={onBack} />
            </TabsContent>
            <TabsContent value="bank-card">
                <BankCardRechargeForm onRechargeSuccess={onBack} />
            </TabsContent>
        </Tabs>
    </>
  );
}
