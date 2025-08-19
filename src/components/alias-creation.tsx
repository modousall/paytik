"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Smartphone, QrCode, Loader2, Sparkles } from 'lucide-react';
import { aliasSuggestion } from '@/ai/flows/alias-suggestion-flow';

type AliasCreationProps = {
  onAliasCreated: (alias: string) => void;
};

export default function AliasCreation({ onAliasCreated }: AliasCreationProps) {
  const [aliasValue, setAliasValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function getSuggestions() {
      setIsLoading(true);
      try {
        const result = await aliasSuggestion({
            existingAliases: ["testuser", "johndoe"],
            name: 'Utilisateur Anonyme',
            email: 'user@example.com'
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
  }, []);


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
            <p className="text-muted-foreground mt-2">Il vous suffira de communiquer votre alias pour vous faire envoyer de l'argent sur votre compte.</p>
        </div>

        <div className="space-y-4">
            <Card className="cursor-not-allowed opacity-50">
                <CardContent className="p-4 flex items-center gap-4">
                    <QrCode className="h-6 w-6 text-primary" />
                    <div>
                        <h3 className="font-semibold">Choisir l'adresse de paiement</h3>
                        <p className="text-sm text-muted-foreground">Cet alias est créé par PI-SPI (bientôt disponible)</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Smartphone size={20}/> Choisir le numéro de téléphone</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAliasSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="alias" className="sr-only">Alias</Label>
                            <Input
                            id="alias"
                            type="text"
                            placeholder="Entrez votre alias"
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
                                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Sparkles size={16} className="text-accent"/> Suggestions d'alias</h4>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((s) => (
                                        <Button key={s} type="button" variant="outline" size="sm" onClick={() => handleSuggestionClick(s)}>{s}</Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg">
                            Créer mon alias
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
