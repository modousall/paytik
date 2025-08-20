
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useContacts } from '@/hooks/use-contacts';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTontine } from '@/hooks/use-tontine';
import type { TontineFrequency } from '@/hooks/use-tontine';
import { cn } from '@/lib/utils';

const createTontineSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères." }),
  amount: z.coerce.number().positive({ message: "La contribution doit être positive." }),
  frequency: z.enum(['daily', 'weekly', 'monthly'], { required_error: "La fréquence est requise." }),
  participants: z.array(z.string()).min(1, { message: "Sélectionnez au moins un participant." }),
});

type CreateTontineFormValues = z.infer<typeof createTontineSchema>;

type CreateTontineFormProps = {
    onTontineCreated: () => void;
}

const ParticipantsLabel = () => {
    const { error } = useFormField();
    return (
        <FormLabel className={cn(error && "text-destructive")}>Inviter des participants</FormLabel>
    );
};


export default function CreateTontineForm({ onTontineCreated }: CreateTontineFormProps) {
  const { contacts } = useContacts();
  const { addTontine } = useTontine();
  const { toast } = useToast();

  const form = useForm<CreateTontineFormValues>({
    resolver: zodResolver(createTontineSchema),
    defaultValues: {
      name: "",
      amount: '' as any,
      participants: [],
      frequency: "monthly",
    },
  });

  const onSubmit = (values: CreateTontineFormValues) => {
    addTontine({
        name: values.name,
        amount: values.amount,
        frequency: values.frequency as TontineFrequency,
        participants: values.participants,
    });
    toast({
      title: "Tontine Créée !",
      description: `Le groupe "${values.name}" a été créé avec succès.`,
    });
    onTontineCreated();
  };

  return (
    <div className="pt-4">
      <p className="text-muted-foreground mb-6">
        Remplissez les détails pour créer votre groupe de tontine. Les invitations seront envoyées aux participants sélectionnés.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du groupe</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Tontine des entrepreneurs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Fréquence des cotisations</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                      <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une fréquence" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="daily">Journalière</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage />
                  </FormItem>
              )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant de la contribution (par personne, par cycle)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="participants"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <ParticipantsLabel />
                </div>
                <ScrollArea className="h-48 rounded-md border">
                  <div className="p-4">
                  {contacts.length > 0 ? contacts.map((contact) => (
                    <FormField
                      key={contact.id}
                      control={form.control}
                      name="participants"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={contact.id}
                            className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-secondary"
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
                            <FormLabel className="font-normal flex-grow cursor-pointer">
                              {contact.name} <span className="text-muted-foreground">({contact.alias})</span>
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun contact trouvé. Veuillez en ajouter depuis l'onglet Profil.</p>
                  )}
                  </div>
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />
            
          <Button type="submit" className="w-full bg-accent text-accent-foreground py-6 text-lg hover:bg-accent/90">
            Créer le groupe et envoyer les invitations
          </Button>
        </form>
      </Form>
    </div>
  );
}
