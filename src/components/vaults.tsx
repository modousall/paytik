
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useVaults } from '@/hooks/use-vaults';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, PiggyBank, PlusCircle, Target, DollarSign, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type VaultsProps = {
  onBack: () => void;
};

const vaultFormSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit faire au moins 3 caractères." }),
  targetAmount: z.coerce.number().optional(),
});

type VaultFormValues = z.infer<typeof vaultFormSchema>;

const CreateVaultForm = ({ onVaultCreated }: { onVaultCreated: () => void }) => {
    const { addVault } = useVaults();
    const form = useForm<VaultFormValues>({
        resolver: zodResolver(vaultFormSchema),
        defaultValues: { name: "", targetAmount: undefined },
    });
    
    const onSubmit = (values: VaultFormValues) => {
        addVault({
            name: values.name,
            balance: 0,
            targetAmount: values.targetAmount || null,
        });
        onVaultCreated();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom de la tirelire</FormLabel>
                            <FormControl><Input placeholder="ex: Économies pour les vacances" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Objectif de montant (Fcfa, optionnel)</FormLabel>
                            <FormControl><Input type="number" placeholder="ex: 500000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Créer la tirelire</Button>
            </form>
        </Form>
    )
}

const ManageVaultDialog = ({ vaultId, currentBalance }: { vaultId: string, currentBalance: number }) => {
    const { deposit, withdraw } = useVaults();
    const { toast } = useToast();
    const [amount, setAmount] = useState(0);

    const handleDeposit = () => {
        if(amount <= 0) return;
        deposit(vaultId, amount);
        toast({ title: "Dépôt effectué", description: `${amount.toLocaleString()} Fcfa ont été ajoutés à votre tirelire.`});
    }

    const handleWithdraw = () => {
        if(amount <= 0) return;
        if(amount > currentBalance) {
            toast({ title: "Solde insuffisant", variant: "destructive"});
            return;
        }
        withdraw(vaultId, amount);
        toast({ title: "Retrait effectué", description: `${amount.toLocaleString()} Fcfa ont été retirés de votre tirelire.`});
    }
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Gérer ma tirelire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Label htmlFor="manage-amount">Montant (Fcfa)</Label>
                <Input 
                    id="manage-amount"
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="ex: 10000"
                />
            </div>
            <DialogFooter className="grid grid-cols-2 gap-4">
                <DialogClose asChild>
                    <Button onClick={handleWithdraw} variant="outline" disabled={amount <= 0}>Retirer</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleDeposit} disabled={amount <= 0}>Déposer</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default function Vaults({ onBack }: VaultsProps) {
  const { vaults } = useVaults();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-primary">Mes Coffres / Tirelires</h2>
            <p className="text-muted-foreground">Épargnez pour vos projets, seul ou à plusieurs.</p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Créer</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Créer une nouvelle tirelire</DialogTitle></DialogHeader>
                <CreateVaultForm onVaultCreated={() => setIsCreateOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>

      {vaults.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vaults.map(vault => (
                <Card key={vault.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <PiggyBank className="h-8 w-8 text-primary" />
                                <CardTitle>{vault.name}</CardTitle>
                             </div>
                             <Dialog>
                                <DialogTrigger asChild><Button variant="ghost" size="icon"><Edit size={16}/></Button></DialogTrigger>
                                <ManageVaultDialog vaultId={vault.id} currentBalance={vault.balance}/>
                             </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-2">{vault.balance.toLocaleString()} Fcfa</div>
                        {vault.targetAmount && (
                            <div>
                                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                    <span>Objectif</span>
                                    <span>{vault.targetAmount.toLocaleString()} Fcfa</span>
                                </div>
                                <Progress value={(vault.balance / vault.targetAmount) * 100} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
            <Target className="mx-auto h-16 w-16 text-muted-foreground" />
            <h4 className="mt-4 text-xl font-semibold">Aucune tirelire</h4>
            <p className="mt-2 text-muted-foreground">Commencez à épargner en créant votre première tirelire.</p>
            <Button className="mt-6" onClick={() => setIsCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Créer une tirelire
            </Button>
        </div>
      )}
    </div>
  );
}
