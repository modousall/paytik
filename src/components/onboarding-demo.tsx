
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, HandCoins, Users } from "lucide-react";
import { cn } from '@/lib/utils';
import Image from 'next/image';

type OnboardingDemoProps = {
  onStart: () => void;
  onLogin: () => void;
};

const features = [
    {
      icon: <HandCoins className="h-10 w-10 sm:h-12 sm:w-12 text-white" />,
      title: "Financement Conforme",
      description: "Financez vos projets et achats (Mourabaha) en accord avec les principes éthiques.",
    },
    {
      icon: <Users className="h-10 w-10 sm:h-12 sm:w-12 text-white" />,
      title: "Épargne & Tontine",
      description: "Constituez votre épargne dans des coffres ou participez à des tontines collaboratives.",
    },
    {
      icon: <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-white" />,
      title: "Paiements Éthiques",
      description: "Envoyez et recevez de l'argent instantanément, avec des frais justes et transparents.",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 text-white" />,
      title: "Sécurité & Conformité",
      description: "Vos transactions sont protégées et conformes aux plus hauts standards de sécurité.",
    },
];


export default function OnboardingDemo({ onStart, onLogin }: OnboardingDemoProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
 
    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)
 
    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index)
  }, [api]);

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="flex flex-col items-center justify-center flex-grow text-center">

        <div className="my-8">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Midi
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Microfinance Islamique Digitale et Inclusive.</p>
        </div>

        <Carousel setApi={setApi} className="w-full max-w-sm sm:max-w-md">
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                    <div className="flex flex-col aspect-[4/3.5] items-center justify-center p-6 text-center rounded-2xl bg-gradient-to-br from-primary to-blue-400 text-primary-foreground shadow-2xl">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="opacity-90 max-w-xs text-sm sm:text-base">{feature.description}</p>
                    </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="flex gap-2 py-4 mt-4">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                current === index ? 'w-6 bg-primary' : 'bg-primary/20'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      <div className="w-full max-w-md mx-auto pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={onLogin} variant="outline" size="lg" className="h-12">
            Se connecter
          </Button>
          <Button onClick={onStart} size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90">
            Créer un compte
          </Button>
        </div>
      </div>
    </div>
  );
}
