
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";

type UserInfo = {
    name: string;
    email: string;
};

type KYCFormProps = { 
    onKycComplete: (info: UserInfo) => void 
};

export default function KYCForm({ onKycComplete }: KYCFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const { toast } = useToast();
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !email) {
        toast({
          title: "Champs requis",
          description: "Veuillez remplir votre nom et votre email.",
          variant: "destructive",
        });
        return;
      }
      onKycComplete({ name, email });
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <Card className="w-full max-w-md">
              <CardHeader>
                  <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <Label htmlFor="name">Nom complet</Label>
                          <Input
                              id="name"
                              type="text"
                              placeholder="ex: Fatoumata Diop"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                          />
                      </div>
                      <div>
                          <Label htmlFor="email">Adresse e-mail</Label>
                          <Input
                              id="email"
                              type="email"
                              placeholder="ex: fatoumata.diop@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                          />
                      </div>
                      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                         Continuer
                      </Button>
                  </form>
              </CardContent>
          </Card>
      </div>
    );
  };
