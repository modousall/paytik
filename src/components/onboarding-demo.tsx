
"use client";

import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, HandCoins, Users } from "lucide-react";
import React from "react";
import Link from 'next/link';
import { useCms } from "@/hooks/use-cms";

type OnboardingDemoProps = {
  onStart: () => void;
  onLogin: () => void;
};

const featureIcons: Record<string, JSX.Element> = {
    financing: <HandCoins className="h-8 w-8 text-primary" />,
    savings: <Users className="h-8 w-8 text-primary" />,
    payments: <Zap className="h-8 w-8 text-primary" />,
    security: <ShieldCheck className="h-8 w-8 text-primary" />,
};

const FeatureCard = ({ id, title, description, href }: { id: string; title: string; description: string; href: string }) => (
    <Link href={href} className="block group">
        <div className="bg-background/50 backdrop-blur-sm border border-border/20 p-6 rounded-xl shadow-lg h-full group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
            <div className="bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                {featureIcons[id] || <Zap className="h-8 w-8 text-primary" />}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    </Link>
);


export default function OnboardingDemo({ onStart, onLogin }: OnboardingDemoProps) {
  const { content } = useCms();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {content.hero.title}
            </h1>
            <p className="mt-4 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.hero.subtitle}
            </p>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {content.hero.description}
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
                {content.features.map((feature) => (
                    <FeatureCard key={feature.id} id={feature.id} title={feature.title} description={feature.description} href={feature.href} />
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
