
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Smartphone, QrCode, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { aliasSuggestion } from '@/ai/flows/alias-suggestion-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


type AliasCreationProps = {
  onAliasCreated: (alias: string) => void;
  userInfo: { name: string; email: string } | null;
};

export default function AliasCreation({ onAliasCreated, userInfo }: AliasCreationProps) {
  const [aliasValue, setAliasValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function getSuggestions() {
      setIsLoading(true);
      try {
        const result = await aliasSuggestion({
            existingAliases: ["testuser", "johndoe"],
            name: userInfo?.name || 'Utilisateur Anonyme',
            email: userInfo?.email || 'user@example.com'
        });
        setSuggestions(result.suggestions);
      } catch (error) {
        console.error("Failed to get alias suggestions:", error);
        // Fallback suggestions
        setSuggestions(["MonAlias789", "UserPay", "PayMeNow"]);
      } finally {
        setIsLoading(false);
      }
    }
    getSuggestions();
  }, [userInfo]);

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
      title: "Succès!",
      description: `Votre alias "${phoneValue}" a été créé et vérifié.`,
    });
    onAliasCreated(phoneValue);
  };


  const handleAliasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aliasValue.length < 3) {
      toast({
        title: "Alias Invalide",
        description: "L'alias doit contenir au moins 3 caractères.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Succès!",
      description: `Votre alias "${aliasValue}" a été créé.`,
    });
    onAliasCreated(aliasValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAliasValue(suggestion);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Créer un alias</h1>
            <p className="text-muted-foreground mt-2">Revendiquez votre numéro ou choisissez un alias unique pour recevoir des paiements.</p>
        </div>

        <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone"><Smartphone className="mr-2"/> Par téléphone</TabsTrigger>
                <TabsTrigger value="custom"><KeyRound className="mr-2"/> Personnalisé</TabsTrigger>
            </TabsList>
            <TabsContent value="phone">
                <Card>
                    <CardHeader>
                        <CardTitle>Revendiquer un numéro</CardTitle>
                        <CardDescription>Utilisez votre numéro de téléphone comme alias sécurisé après vérification.</CardDescription>
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
                                    Vérifier et créer l'alias
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
                        <CardTitle>Choisir un alias personnalisé</CardTitle>
                        <CardDescription>Choisissez un alias unique ou utilisez nos suggestions intelligentes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAliasSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="alias" className="sr-only">Alias</Label>
                                <Input
                                id="alias"
                                type="text"
                                placeholder="Entrez votre alias personnalisé"
                                value={aliasValue}
                                onChange={(e) => setAliasValue(e.target.value)}
                                required
                                />
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center p-4">
                                    <Loader2 className="animate-spin h-6 w-6 text-primary" />
                                    <span className="ml-2">Recherche de suggestions...</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Sparkles size={16} className="text-accent"/> Suggestions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((s) => (
                                            <Button key={s} type="button" variant="outline" size="sm" onClick={() => handleSuggestionClick(s)}>{s}</Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                Créer l'alias
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <div className="mt-8 space-y-4">
            <Card className="cursor-not-allowed opacity-50">
                <CardContent className="p-4 flex items-center gap-4">
                    <QrCode className="h-6 w-6 text-primary" />
                    <div>
                        <h3 className="font-semibold">Choisir l'adresse de paiement</h3>
                        <p className="text-sm text-muted-foreground">Cette fonctionnalité sera bientôt disponible.</p>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
