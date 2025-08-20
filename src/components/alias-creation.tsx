
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Sparkles, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { aliasSuggestion } from '@/ai/flows/alias-suggestion-flow';

type AliasCreationProps = {
  onAliasCreated: (alias: string) => void;
  userInfo: { name: string; email: string } | null;
};

export default function AliasCreation({ onAliasCreated, userInfo }: AliasCreationProps) {
  const [phoneValue, setPhoneValue] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);


  useEffect(() => {
    const fetchSuggestions = async () => {
        if (!userInfo) return;
        setIsLoadingSuggestions(true);
        try {
            const result = await aliasSuggestion({
                name: userInfo.name,
                email: userInfo.email,
                existingAliases: ['paytikmaster', 'sunupay', 'senegali']
            });
            setSuggestions(result.suggestions);
        } catch (error) {
            console.error("Failed to fetch alias suggestions:", error);
            toast({
                title: "Erreur de suggestion",
                description: "Impossible de générer des suggestions d'alias pour le moment.",
                variant: "destructive"
            });
        } finally {
            setIsLoadingSuggestions(false);
        }
    }
    fetchSuggestions();
  }, [userInfo, toast]);


  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneValue.length < 9) { // Simple validation
        toast({
            title: "Numéro Invalide",
            description: "Veuillez entrer un numéro de téléphone valide.",
            variant: "destructive",
        });
        return;
    }
    // Simulate sending OTP
    setOtpSent(true);
    toast({
        title: "Code envoyé!",
        description: `Un code de vérification a été envoyé au ${phoneValue}. (Simulation)`,
    });
  }

  const handlePhoneAliasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
        toast({
          title: "Code Invalide",
          description: "Le code de vérification doit comporter 6 chiffres.",
          variant: "destructive",
        });
        return;
      }
    
    toast({
      title: "Numéro vérifié!",
      description: `Votre alias sera "${phoneValue}". Prochaine étape : sécurisez votre compte avec un code PIN.`,
    });
    onAliasCreated(phoneValue);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    toast({
        title: "Alias choisi !",
        description: `Vous avez choisi "${suggestion}" comme alias. Prochaine étape : sécurisez votre compte avec un code PIN.`,
    });
    onAliasCreated(suggestion);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Créer un alias PAYTIK</h1>
            <p className="text-muted-foreground mt-2">Choisissez votre identifiant unique pour envoyer et recevoir de l'argent.</p>
        </div>
        <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone"><Smartphone className="mr-2 h-4 w-4"/> Numéro Tel.</TabsTrigger>
                <TabsTrigger value="custom"><Sparkles className="mr-2 h-4 w-4"/> Personnalisé</TabsTrigger>
            </TabsList>
            <TabsContent value="phone">
                <Card>
                    <CardHeader>
                        <CardTitle>Revendiquer un numéro</CardTitle>
                        <CardDescription>Utilisez votre numéro de téléphone comme alias sécurisé après vérification par code OTP.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <Label htmlFor="phone">Numéro de téléphone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+221 77 123 45 67"
                                        value={phoneValue}
                                        onChange={(e) => setPhoneValue(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                    Envoyer le code
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handlePhoneAliasSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="otp">Code de vérification</Label>
                                    <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Entrez le code à 6 chiffres"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value)}
                                    required
                                    maxLength={6}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    Vérifier et continuer
                                </Button>
                                <Button variant="link" size="sm" onClick={() => setOtpSent(false)}>Changer de numéro</Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="custom">
                <Card>
                     <CardHeader>
                        <CardTitle>Suggestions d'alias</CardTitle>
                        <CardDescription>Choisissez un alias unique et créatif suggéré par notre IA.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         {isLoadingSuggestions ? (
                           <div className="flex items-center justify-center p-8">
                               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                           </div>
                         ) : (
                            suggestions.map(s => (
                                <Button key={s} variant="outline" className="w-full justify-start py-6" onClick={() => handleSuggestionClick(s)}>
                                    {s}
                                </Button>
                            ))
                         )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
