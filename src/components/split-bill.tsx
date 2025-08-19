
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useContacts } from '@/hooks/use-contacts';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

const splitBillSchema = z.object({
  totalAmount: z.coerce.number().positive({ message: "Le montant total doit être positif." }),
  participants: z.array(z.string()).min(1, { message: "Sélectionnez au moins un participant." }),
  reason: z.string().min(1, { message: "Une raison est requise." }),
});

type SplitBillFormValues = z.infer<typeof splitBillSchema>;

export default function SplitBill() {
  const { contacts } = useContacts();
  const { toast } = useToast();
  const [amountPerPerson, setAmountPerPerson] = useState(0);

  const form = useForm<SplitBillFormValues>({
    resolver: zodResolver(splitBillSchema),
    defaultValues: {
      totalAmount: '' as any,
      participants: [],
      reason: "",
    },
  });

  const participants = form.watch('participants');
  const totalAmount = form.watch('totalAmount');

  useEffect(() => {
    if (totalAmount > 0 && participants.length > 0) {
      setAmountPerPerson(totalAmount / participants.length);
    } else {
      setAmountPerPerson(0);
    }
  }, [totalAmount, participants]);


  const onSubmit = (values: SplitBillFormValues) => {
    // Simulate sending payment requests
    toast({
      title: "Demandes envoyées",
      description: `Des demandes de paiement de ${amountPerPerson.toLocaleString()} Fcfa ont été envoyées à ${participants.length} personne(s).`,
    });
    form.reset();
  };

  return (
    <div className="pt-4">
      <p className="text-muted-foreground mb-6">
        Divisez facilement une dépense avec vos contacts. Les demandes de paiement seront envoyées automatiquement.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant total à diviser</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison de la dépense</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Dîner d'équipe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="participants"
            render={() => (
              <FormItem>
                <FormLabel>Sélectionner les participants</FormLabel>
                <ScrollArea className="h-48 rounded-md border p-4">
                  {contacts.map((contact) => (
                    <FormField
                      key={contact.id}
                      control={form.control}
                      name="participants"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={contact.id}
                            className="flex flex-row items-center space-x-3 space-y-0 mb-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(contact.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), contact.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== contact.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {contact.name} ({contact.alias})
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />
            
          {amountPerPerson > 0 && (
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participants:</span>
                  <span className="font-medium">{participants.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Montant par personne:</span>
                  <span className="font-bold text-xl text-primary">{amountPerPerson.toLocaleString('fr-FR', {maximumFractionDigits: 2})} Fcfa</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full bg-accent text-accent-foreground" disabled={amountPerPerson <= 0}>
            Envoyer les demandes de paiement
          </Button>
        </form>
      </Form>
    </div>
  );
}
