
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
import { Avatar, AvatarFallback } from './ui/avatar';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  alias: z.string().min(3, { message: "L'alias doit contenir au moins 3 caractères." }),
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
    <div className="pt-4">
      <Card className="mb-8 shadow-none border-0 bg-transparent">
        <CardHeader className="px-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlusCircle size={20}/> Ajouter un nouveau contact
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
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
                    <FormLabel>Alias ou N°</FormLabel>
                    <FormControl>
                      <Input placeholder="VotreAlias ou +221..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90">Ajouter</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <h3 className="text-xl font-bold mb-4 px-2">Votre liste de contacts</h3>
      <div className="space-y-3">
        {contacts.length > 0 ? (
          contacts.map(contact => (
            <Card key={contact.id} className="flex items-center justify-between p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {contact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.alias}</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full">
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
          <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h4 className="mt-4 text-lg font-semibold">Aucun contact</h4>
            <p className="mt-1 text-sm text-muted-foreground">Commencez par ajouter votre premier contact ci-dessus.</p>
          </div>
        )}
      </div>
    </div>
  );
}
