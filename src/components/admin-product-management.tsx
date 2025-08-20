
"use client";

import { useState } from 'react';
import { useProductManagement } from '@/hooks/use-product-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';

const newItemSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
});
type NewItemFormValues = z.infer<typeof newItemSchema>;

export default function AdminProductManagement() {
  const { billers, addBiller, removeBiller, mobileMoneyOperators, addMobileMoneyOperator, removeMobileMoneyOperator } = useProductManagement();

  const billerForm = useForm<NewItemFormValues>({ resolver: zodResolver(newItemSchema), defaultValues: { name: "" } });
  const operatorForm = useForm<NewItemFormValues>({ resolver: zodResolver(newItemSchema), defaultValues: { name: "" } });

  const onAddBiller = (values: NewItemFormValues) => {
    addBiller({ name: values.name });
    billerForm.reset();
  };

  const onAddOperator = (values: NewItemFormValues) => {
    addMobileMoneyOperator({ name: values.name });
    operatorForm.reset();
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Facturiers</CardTitle>
          <CardDescription>Ajoutez ou supprimez les services de paiement de factures disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-6">
            {billers.map(biller => (
              <div key={biller.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <span>{biller.name}</span>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeBiller(biller.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Form {...billerForm}>
            <form onSubmit={billerForm.handleSubmit(onAddBiller)} className="flex items-start gap-2">
              <FormField
                control={billerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="Nom du nouveau facturier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Ajouter</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Opérateurs Mobile Money</CardTitle>
          <CardDescription>Ajoutez ou supprimez les opérateurs pour les rechargements.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-6">
            {mobileMoneyOperators.map(op => (
              <div key={op.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <span>{op.name}</span>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeMobileMoneyOperator(op.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Form {...operatorForm}>
            <form onSubmit={operatorForm.handleSubmit(onAddOperator)} className="flex items-start gap-2">
              <FormField
                control={operatorForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="Nom du nouvel opérateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Ajouter</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
