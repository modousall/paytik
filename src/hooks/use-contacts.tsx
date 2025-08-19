
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Contact = {
  id: string;
  name: string;
  alias: string;
};

type ContactsContextType = {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  removeContact: (id: string) => void;
};

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

const initialContacts: Contact[] = [
    {id: '1', name: 'Maman', alias: '+221771112233'},
    {id: '2', name: 'Boutique du coin', alias: 'boutiqueCoin'},
    {id: '3', name: 'Papa', alias: '+221774445566'},
];

type ContactsProviderProps = {
    children: ReactNode;
};

export const ContactsProvider = ({ children }: ContactsProviderProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedContacts = localStorage.getItem('paytik_contacts');
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      } else {
        setContacts(initialContacts);
      }
    } catch (error) {
        console.error("Failed to parse contacts from localStorage", error);
        setContacts(initialContacts);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem('paytik_contacts', JSON.stringify(contacts));
    }
  }, [contacts, isInitialized]);

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: Date.now().toString() };
    setContacts(prevContacts => [...prevContacts, newContact]);
  };

  const removeContact = (id: string) => {
    setContacts(prevContacts => prevContacts.filter(c => c.id !== id));
  };

  const value = { contacts, addContact, removeContact };

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
};
