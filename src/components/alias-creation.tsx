"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Mail } from 'lucide-react';

type AliasCreationProps = {
  onAliasCreated: (alias: string) => void;
};

export default function AliasCreation({ onAliasCreated }: AliasCreationProps) {
  const [step, setStep] = useState(1);
  const [aliasType, setAliasType] = useState<'phone' | 'email'>('phone');
  const [aliasValue, setAliasValue] = useState('');
  const [otp, setOtp] = useState('');
  const { toast } = useToast();

  const handleAliasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aliasValue.length < 9) {
      toast({
        title: "Alias Invalide",
        description: "Veuillez entrer un numéro de téléphone valide.",
        variant: "destructive",
      });
      return;
    }
    // Simulate API call to send OTP
    if (aliasValue === '+221771234567') { // Simulate used alias
      toast({
        title: "Alias déjà utilisé",
        description: "Cet alias est déjà pris. Vous pouvez le réclamer ou en choisir un autre.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Envoi de l'OTP à", aliasValue);
    setStep(2);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') { // Simulate correct OTP
      toast({
        title: "Succès!",
        description: "Votre alias a été vérifié.",
      });
      onAliasCreated(aliasValue);
    } else {
      toast({
        title: "OTP Invalide",
        description: "Le code que vous avez entré est incorrect. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary text-2xl">Créez votre alias PAYTIK</CardTitle>
          <CardDescription>Ce sera votre identifiant unique pour envoyer et recevoir de l'argent.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleAliasSubmit} className="space-y-6">
              <RadioGroup defaultValue="phone" onValueChange={(value) => setAliasType(value as 'phone' | 'email')}>
                <Label>Type d'alias</Label>
                <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <Label htmlFor="phone" className="flex items-center gap-2 cursor-pointer"><Smartphone size={16}/> Téléphone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" disabled />
                        <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground"><Mail size={16}/> Adresse de paiement (bientôt)</Label>
                    </div>
                </div>
              </RadioGroup>
              
              <div>
                <Label htmlFor="alias">{aliasType === 'phone' ? 'Numéro de téléphone' : 'Adresse de paiement'}</Label>
                <Input
                  id="alias"
                  type={aliasType === 'phone' ? 'tel' : 'text'}
                  placeholder={aliasType === 'phone' ? '+221771234567' : 'Généré automatiquement'}
                  value={aliasValue}
                  onChange={(e) => setAliasValue(e.target.value)}
                  disabled={aliasType !== 'phone'}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Continuer</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <Label htmlFor="otp">Code de vérification</Label>
                <p className="text-sm text-muted-foreground mb-2">Entrez le code à 6 chiffres envoyé à {aliasValue}.</p>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="tracking-[1em] text-center"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Vérifier l'alias</Button>
              <Button variant="link" onClick={() => setStep(1)} className="w-full text-primary">Changer d'alias</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
