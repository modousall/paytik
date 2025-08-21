
"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Vaults from './vaults';
import Tontine from './tontine';

type EpargneProps = {
    onBack: () => void;
};

export default function Epargne({ onBack }: EpargneProps) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">Épargne</h2>
          <p className="text-muted-foreground">Gérez vos coffres et vos tontines.</p>
        </div>
      </div>
      
      <Tabs defaultValue="coffres" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="coffres">Mes Coffres</TabsTrigger>
                <TabsTrigger value="tontines">Mes Tontines</TabsTrigger>
            </TabsList>
            <TabsContent value="coffres" className="mt-4">
                <Vaults onBack={() => {}} standalone={false} />
            </TabsContent>
            <TabsContent value="tontines" className="mt-4">
                <Tontine onBack={() => {}} standalone={false} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
