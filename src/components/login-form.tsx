
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginFormProps = {
    onLogin: (alias: string, pin: string) => void;
    onBack: () => void;
};

export default function LoginForm({ onLogin, onBack }: LoginFormProps) {
    const [alias, setAlias] = useState('');
    const [pin, setPin] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!alias || !pin) return;
      onLogin(alias, pin);
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <Card className="w-full max-w-md">
              <CardHeader>
                  <CardTitle>Se Connecter</CardTitle>
                  <CardDescription>Entrez votre alias et votre code PIN pour accéder à votre compte.</CardDescription>
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
                       <div>
                          <Label htmlFor="pin-login">Code PIN</Label>
                          <Input
                              id="pin-login"
                              type="password"
                              placeholder="••••"
                              value={pin}
                              onChange={(e) => setPin(e.target.value)}
                              required
                              maxLength={4}
                              inputMode="numeric"
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
