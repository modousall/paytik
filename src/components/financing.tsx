
"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, FileText } from 'lucide-react';
import IslamicFinancingRequestForm from './islamic-financing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type FinancingProps = {
  onBack: () => void;
};

export default function Financing({ onBack }: FinancingProps) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">Financement</h2>
          <p className="text-muted-foreground">Initiez une demande de financement.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard />Crédit Achat (BNPL)</CardTitle>
            <CardDescription>Financez un achat spécifique chez un marchand partenaire.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Ce type de crédit est initié directement lors d'un paiement. Scannez le QR code d'un marchand proposant un plan de paiement échelonné pour commencer.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText />Financement Islamique</CardTitle>
            <CardDescription>Financez vos projets en accord avec vos valeurs.</CardDescription>
          </CardHeader>
          <CardContent>
            <IslamicFinancingRequestForm onBack={() => {}} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
