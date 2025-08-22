

"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { DialogClose } from './ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { useContacts } from '@/hooks/use-contacts';
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

const participantSchema = z.object({
  alias: z.string().min(1, "L'alias est requis."),
  amount: z.coerce.number().positive("Le montant doit être positif."),
  saveContact: z.boolean().default(false),
});

const splitBillSchema = z.object({
  reason: z.string().min(1, { message: "Une raison est requise." }),
  participants: z.array(participantSchema).min(1, "Ajoutez au moins un participant."),
});

type SplitBillFormValues = z.infer<typeof splitBillSchema>;

export default function SplitBill() {
  const { toast } = useToast();
  const { addContact } = useContacts();
  const [totalAmount, setTotalAmount] = useState(0);

  const form = useForm<SplitBillFormValues>({
    resolver: zodResolver(splitBillSchema),
    defaultValues: {
      reason: "",
      participants: [{ alias: '', amount: '' as any, saveContact: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });
  
  const watchedParticipants = form.watch('participants');

  useEffect(() => {
    const newTotal = watchedParticipants.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    setTotalAmount(newTotal);
  }, [watchedParticipants]);


  const onSubmit = (values: SplitBillFormValues) => {
    let newContactsCount = 0;
    values.participants.forEach(p => {
        if(p.saveContact) {
            addContact({ name: p.alias, alias: p.alias });
            newContactsCount++;
        }
    });

    toast({
      title: "Demandes envoyées !",
      description: `Des demandes de paiement ont été envoyées à ${values.participants.length} personne(s).`,
    });

    if (newContactsCount > 0) {
        toast({
            title: "Contacts sauvegardés",
            description: `${newContactsCount} nouveau(x) contact(s) ont été ajoutés à votre liste.`
        })
    }
    form.reset();
  };

  return (
    <div className="pt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Participants et montants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                        <FormField
                            control={form.control}
                            name={`participants.${index}.alias`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Alias</FormLabel>
                                    <FormControl><Input placeholder="Alias ou N° du participant" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`participants.${index}.amount`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Montant</FormLabel>
                                    <FormControl><Input type="number" placeholder="Montant" className="w-28" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button type="button" variant="ghost" size="icon" className="text-destructive" disabled={fields.length <= 1}>
                                    <Trash2 size={16} />
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce participant ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action retirera cette ligne du partage.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => remove(index)} className="bg-destructive hover:bg-destructive/90">
                                    Supprimer
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <div className="col-span-3">
                             <FormField
                                control={form.control}
                                name={`participants.${index}.saveContact`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-1">
                                        <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="form-checkbox h-4 w-4 text-primary rounded" /></FormControl>
                                        <FormLabel className="text-xs font-normal text-muted-foreground">
                                            Ajouter cet alias aux contacts
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}
                <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={() => append({ alias: '', amount: '' as any, saveContact: false })}
                >
                    <PlusCircle className="mr-2"/> Ajouter un autre participant
                </Button>
            </CardContent>
            <CardFooter className="bg-secondary p-4 rounded-b-lg">
                 <div className="flex justify-between items-baseline w-full">
                  <span className="text-muted-foreground">Total de la dépense:</span>
                  <span className="font-bold text-xl text-primary">{formatCurrency(totalAmount)}</span>
                </div>
            </CardFooter>
        </Card>
          
          <DialogClose asChild>
            <Button type="submit" className="w-full bg-accent text-accent-foreground py-6 text-lg hover:bg-accent/90" disabled={totalAmount <= 0}>
                Envoyer les demandes ({formatCurrency(totalAmount)})
            </Button>
          </DialogClose>
        </form>
      </Form>
    </div>
  );
}
