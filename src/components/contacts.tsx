"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useContacts } from '@/hooks/use-contacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, User } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  alias: z.string().min(9, { message: "L'alias doit être un numéro de téléphone ou un identifiant valide." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contacts() {
  const { contacts, addContact, removeContact } = useContacts();
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", alias: "" },
  });

  const onSubmit = (values: ContactFormValues) => {
    addContact({name: values.name, alias: values.alias});
    toast({ title: "Contact ajouté", description: `${values.name} a été ajouté à votre liste de contacts.` });
    form.reset();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-primary">Gérer les contacts</h2>
      <p className="text-muted-foreground mb-6">Ajoutez ou supprimez des bénéficiaires pour des paiements rapides.</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle size={20}/> Ajouter un nouveau contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Maman" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alias (Téléphone/ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="+221771234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="sm:col-start-3 bg-primary hover:bg-primary/90">Ajouter</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <h3 className="text-xl font-bold mb-4">Votre liste de contacts</h3>
      <div className="space-y-3">
        {contacts.length > 0 ? (
          contacts.map(contact => (
            <Card key={contact.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-2 rounded-full">
                    <User className="text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.alias}</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 size={18} />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer {contact.name} ?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Cette action est irréversible. Voulez-vous vraiment supprimer ce contact ?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeContact(contact.id)} className="bg-destructive hover:bg-destructive/90">
                        Supprimer
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">Votre liste de contacts est vide.</p>
        )}
      </div>
    </div>
  );
}
