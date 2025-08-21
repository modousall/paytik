
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from './use-toast';

export type Role = {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isDeletable: boolean;
};

type RoleContextType = {
    roles: Role[];
    addRole: (role: Role) => void;
    updateRole: (id: string, data: Partial<Role>) => void;
    removeRole: (id: string) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const initialRoles: Role[] = [
    {
        id: "superadmin",
        name: "Super Admin",
        description: "Contrôle total sur la plateforme, y compris la gestion des autres administrateurs.",
        permissions: ["Toutes les permissions"],
        isDeletable: false,
    },
    {
        id: "admin",
        name: "Admin",
        description: "Gère les utilisateurs, supervise les transactions et configure les produits.",
        permissions: ["Gestion utilisateurs", "Analyse transactions", "Gestion produits"],
        isDeletable: false,
    },
    {
        id: "analyst",
        name: "Agent de Crédit",
        description: "Examine et valide les demandes de financement des clients.",
        permissions: ["Voir financements", "Approuver financements", "Rejeter financements"],
        isDeletable: true,
    },
     {
        id: "compliance",
        name: "Agent de Conformité",
        description: "Supervise la conformité des opérations et des produits avec les standards éthiques.",
        permissions: ["Voir transactions", "Rapports de conformité", "Auditer les produits"],
        isDeletable: true,
    },
    {
        id: "support",
        name: "Support",
        description: "Assiste les utilisateurs, consulte les transactions et peut suspendre des comptes.",
        permissions: ["Consultation utilisateurs", "Consultation transactions", "Suspension utilisateurs"],
        isDeletable: false,
    },
     {
        id: "teller",
        name: "Guichetier",
        description: "Gère les opérations cash en agence: dépôts, retraits, ouverture de comptes.",
        permissions: ["Dépôt cash", "Retrait cash", "Ouvrir compte", "Vérifier identité"],
        isDeletable: true,
    },
    {
        id: "branch_manager",
        name: "Responsable Agence",
        description: "Supervise les opérations d'un point de service ou d'une agence.",
        permissions: ["Voir transactions agence", "Gérer guichetiers", "Rapports agence"],
        isDeletable: true,
    },
    {
        id: "merchant",
        name: "Marchand",
        description: "Accepte les paiements, consulte son historique de ventes et demande des versements.",
        permissions: ["Recevoir paiements", "Voir ses transactions", "Demander versements"],
        isDeletable: false,
    },
    {
        id: "user",
        name: "Utilisateur",
        description: "Utilisateur standard de l'application avec accès aux fonctionnalités de base.",
        permissions: ["Payer", "Recharger", "Gérer ses produits (coffres, etc.)"],
        isDeletable: false,
    },
];

const rolesStorageKey = 'midi_roles';

type RoleProviderProps = { 
    children: ReactNode;
}

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedRoles = localStorage.getItem(rolesStorageKey);
      setRoles(storedRoles ? JSON.parse(storedRoles) : initialRoles);
    } catch (error) {
        console.error("Failed to parse roles from localStorage", error);
        setRoles(initialRoles);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        try {
            localStorage.setItem(rolesStorageKey, JSON.stringify(roles));
        } catch (error) {
            console.error("Failed to write roles to localStorage", error);
        }
    }
  }, [roles, isInitialized]);

  const addRole = (role: Role) => {
    setRoles(prev => [...prev, role]);
    toast({ title: "Rôle créé", description: `Le rôle "${role.name}" a été ajouté.` });
  };

  const updateRole = (id: string, data: Partial<Role>) => {
    setRoles(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
    toast({ title: "Rôle mis à jour", description: `Le rôle "${data.name}" a été mis à jour.` });
  };

  const removeRole = (id: string) => {
    const roleToRemove = roles.find(r => r.id === id);
    if(roleToRemove && !roleToRemove.isDeletable) {
        toast({ title: "Action non autorisée", description: "Ce rôle de base ne peut pas être supprimé.", variant: "destructive" });
        return;
    }
    setRoles(prev => prev.filter(b => b.id !== id));
    toast({ title: "Rôle supprimé" });
  };

  const value = { 
    roles,
    addRole,
    updateRole,
    removeRole,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleManagement = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoleManagement must be used within a RoleProvider');
  }
  return context;
};
