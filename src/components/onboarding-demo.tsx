
"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, DollarSign, UserPlus, ShieldAlert } from "lucide-react";

type OnboardingDemoProps = {
  onStart: () => void;
  onLogin: () => void;
  onAdmin: () => void;
};

export default function OnboardingDemo({ onStart, onLogin, onAdmin }: OnboardingDemoProps) {
  const features = [
    {
      icon: <Zap className="h-12 w-12 text-primary" />,
      title: "Transactions Instantanées",
      description: "Profitez d'un traitement des paiements ultra-rapide pour tous vos besoins.",
    },
    {
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      title: "Toujours Disponible",
      description: "Notre plateforme interopérable est disponible 24/7, vous assurant de pouvoir effectuer des transactions à tout moment.",
    },
    {
      icon: <DollarSign className="h-12 w-12 text-primary" />,
      title: "Coûts Abordables",
      description: "Profitez de frais de transaction compétitifs et transparents avec PAYTIK.",
    },
    {
      icon: <UserPlus className="h-12 w-12 text-primary" />,
      title: "Autorisations Requises",
      description: "Pour améliorer votre expérience, PAYTIK nécessite l'accès à vos contacts et notifications. Vos données sont en sécurité avec nous.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">Bienvenue sur PAYTIK</h1>
        <p className="text-center text-muted-foreground mb-8">Votre solution de paiement simplifiée et sécurisée.</p>
        <Carousel className="w-full">
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="shadow-lg">
                    <CardContent className="flex flex-col aspect-[4/3] items-center justify-center p-6 text-center">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={onLogin} variant="outline">
            Se connecter
          </Button>
          <Button onClick={onStart} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Créer un compte
          </Button>
        </div>
        <div className="mt-4 text-center">
            <Button onClick={onAdmin} variant="link" size="sm" className="text-muted-foreground">
                <ShieldAlert className="mr-2 h-4 w-4" /> Accès Admin (Démo)
            </Button>
        </div>
      </div>
    </div>
  );
}
