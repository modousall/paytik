
"use client";

import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, HandCoins, Users } from "lucide-react";
import React from "react";

type OnboardingDemoProps = {
  onStart: () => void;
  onLogin: () => void;
};

const features = [
    {
      icon: <HandCoins className="h-8 w-8 text-primary" />,
      title: "Financement Conforme",
      description: "Financez vos projets et achats (Mourabaha) en accord avec les principes éthiques.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Épargne & Tontine",
      description: "Constituez votre épargne dans des coffres ou participez à des tontines collaboratives.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Paiements Éthiques",
      description: "Envoyez et recevez de l'argent instantanément, avec des frais justes et transparents.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Sécurité & Conformité",
      description: "Vos transactions sont protégées et conformes aux plus hauts standards de sécurité.",
    },
];

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-background/50 backdrop-blur-sm border border-border/20 p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
    </div>
);


export default function OnboardingDemo({ onStart, onLogin }: OnboardingDemoProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Midi
            </h1>
            <p className="mt-4 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Microfinance Islamique Digitale et Inclusive.
            </p>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Gérez votre argent, financez vos projets et épargnez en toute sérénité.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={onStart} size="lg" className="w-full sm:w-auto h-12 text-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-shadow">
                    Créer un compte
                </Button>
                <Button onClick={onLogin} variant="outline" size="lg" className="w-full sm:w-auto h-12 text-base">
                    Se connecter
                </Button>
            </div>
        </div>

        <div className="mt-16 sm:mt-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                ))}
            </div>
        </div>
      </main>

      <footer className="text-center p-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Midi. Tous droits réservés.
      </footer>
    </div>
  );
}
