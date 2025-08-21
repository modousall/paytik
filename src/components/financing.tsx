
"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UnifiedFinancingForm from './unified-financing-form';

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
          <h2 className="text-2xl font-bold text-primary">Demande de Financement</h2>
          <p className="text-muted-foreground">Financez vos achats et projets en quelques étapes.</p>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <UnifiedFinancingForm onBack={onBack} />
      </div>
    </div>
  );
}
