
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ManageAlias from "./manage-alias";
import Contacts from "./contacts";
import { User, KeyRound } from "lucide-react";

type ProfileProps = {
  alias: string;
  onLogout: () => void;
};

export default function Profile({ alias, onLogout }: ProfileProps) {
  return (
    <div>
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">Profil et Paramètres</h2>
            <p className="text-muted-foreground">Gérez vos informations, contacts et alias.</p>
        </div>

        <Accordion type="single" collapsible defaultValue="contacts" className="w-full">
            <AccordionItem value="contacts">
                <AccordionTrigger>
                    <div className="flex items-center gap-3">
                        <User className="text-primary"/>
                        <span>Gérer les contacts</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <Contacts />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="alias">
                <AccordionTrigger>
                    <div className="flex items-center gap-3">
                        <KeyRound className="text-primary"/>
                        <span>Gérer votre alias</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <ManageAlias alias={alias} onLogout={onLogout} noTitle />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
}
