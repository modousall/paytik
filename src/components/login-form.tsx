
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";

type LoginFormProps = {
    onLoginSuccess: (alias: string) => void;
    onBack: () => void;
};

export default function LoginForm({ onLoginSuccess, onBack }: LoginFormProps) {
    const [alias, setAlias] = useState('');
    const { toast } = useToast();
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate checking if alias exists in localStorage
      const storedAlias = localStorage.getItem('paytik_alias');
      const storedName = localStorage.getItem('paytik_username') || "l'utilisateur";
  
      if (storedAlias && alias === storedAlias) {
        toast({
          title: `Bienvenue, ${storedName} !`,
          description: "Connexion réussie.",
        });
        onLoginSuccess(alias);
      } else {
        toast({
          title: "Alias non trouvé",
          description: "Cet alias n'existe pas. Veuillez vérifier l'alias ou créer un nouveau compte.",
          variant: "destructive",
        });
      }
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <Card className="w-full max-w-md">
              <CardHeader>
                  <CardTitle>Se Connecter</CardTitle>
                  <CardDescription>Entrez votre alias pour accéder à votre compte.</CardDescription>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <Label htmlFor="alias-login">Votre Alias</Label>
                          <Input
                              id="alias-login"
                              type="text"
                              placeholder="Entrez votre alias ou numéro"
                              value={alias}
                              onChange={(e) => setAlias(e.target.value)}
                              required
                          />
                      </div>
                      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                         Se Connecter
                      </Button>
                  </form>
              </CardContent>
              <CardFooter>
                 <Button variant="link" onClick={onBack} className="w-full text-muted-foreground">
                    Retour à l'accueil
                 </Button>
              </CardFooter>
          </Card>
      </div>
    );
  };
