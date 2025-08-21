

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
  DialogFooter as ModalFooter
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowDown, PiggyBank, PlusCircle, Target, Edit, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useVirtualCard } from '@/hooks/use-virtual-card';
import { useBalance } from '@/hooks/use-balance';
import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrency } from '@/lib/utils';

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
    const { toast } = useToast();
    const form = useForm<VaultFormValues>({
        resolver: zodResolver(vaultFormSchema),
        defaultValues: { name: "", targetAmount: '' as any },
    });
    
    const onSubmit = (values: VaultFormValues) => {
        addVault({
            name: values.name,
            balance: 0,
            targetAmount: values.targetAmount || null,
        });
        toast({ title: "Tirelire créée !", description: `La tirelire "${values.name}" est prête.`})
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
                            <FormLabel>Objectif de montant (optionnel)</FormLabel>
                            <FormControl><Input type="number" placeholder="ex: 500000" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <ModalFooter className="pt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">Annuler</Button>
                    </DialogClose>
                    <Button type="submit">Créer la tirelire</Button>
                </ModalFooter>
            </form>
        </Form>
    )
}

const ManageVaultDialog = ({ vaultId, currentBalance, vaultName }: { vaultId: string, currentBalance: number, vaultName: string }) => {
    const { deposit, withdraw } = useVaults();
    const { card, withdrawFromCard: withdrawFromVirtualCard } = useVirtualCard();
    const { balance: mainBalance, debit, credit } = useBalance();
    const { addTransaction } = useTransactions();
    const { toast } = useToast();
    const [amount, setAmount] = useState(0);
    const [action, setAction] = useState<'deposit' | 'withdraw' | null>(null);
    const [source, setSource] = useState('main'); // 'main' or 'card'

    const handleDeposit = () => {
        if(amount <= 0) return;
        
        if (source === 'main') {
            if (amount > mainBalance) {
                toast({ title: "Solde principal insuffisant", variant: "destructive"});
                return;
            }
            debit(amount);
            addTransaction({
                type: 'sent',
                counterparty: `Coffre "${vaultName}"`,
                reason: 'Approvisionnement',
                date: new Date().toISOString(),
                amount: amount,
                status: 'Terminé',
            });
        } else if (source === 'card') {
            if (!card || amount > card.balance) {
                toast({ title: "Solde de la carte insuffisant", variant: "destructive"});
                return;
            }
            withdrawFromVirtualCard(amount);
        }
        
        deposit(vaultId, amount);
        toast({ title: "Dépôt effectué", description: `${formatCurrency(amount)} ont été ajoutés à votre tirelire "${vaultName}".`});
        setAction(null);
        setAmount(0);
    }

    const handleWithdraw = () => {
        if(amount <= 0) return;
        if(amount > currentBalance) {
            toast({ title: "Solde de la tirelire insuffisant", variant: "destructive"});
            return;
        }
        withdraw(vaultId, amount);
        credit(amount);
        addTransaction({
            type: 'received',
            counterparty: `Coffre "${vaultName}"`,
            reason: 'Retrait',
            date: new Date().toISOString(),
            amount: amount,
            status: 'Terminé',
        });
        toast({ title: "Retrait effectué", description: `${formatCurrency(amount)} ont été retirés de la tirelire "${vaultName}".`});
        setAction(null);
        setAmount(0);
    }
    
    if (action === 'deposit') {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approvisionner "{vaultName}"</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Label htmlFor="deposit-amount">Montant</Label>
                    <Input id="deposit-amount" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} placeholder="ex: 10000" />

                    <Label>Depuis</Label>
                    <RadioGroup defaultValue="main" onValueChange={setSource}>
                        <div className="flex items-center space-x-2 rounded-md border p-3 has-[:checked]:border-primary">
                            <RadioGroupItem value="main" id="main" />
                            <Label htmlFor="main" className="flex-grow cursor-pointer">
                                Solde Principal
                                <span className='block text-xs text-muted-foreground'>Disponible: {formatCurrency(mainBalance)}</span>
                            </Label>
                        </div>
                        {card && (
                             <div className="flex items-center space-x-2 rounded-md border p-3 has-[:checked]:border-primary">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex-grow cursor-pointer">
                                    Carte Virtuelle
                                    <span className='block text-xs text-muted-foreground'>Disponible: {formatCurrency(card.balance)}</span>
                                </Label>
                            </div>
                        )}
                    </RadioGroup>
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setAction(null)}>Annuler</Button>
                    <DialogClose asChild><Button onClick={handleDeposit} disabled={amount <= 0}>Confirmer Dépôt</Button></DialogClose>
                </ModalFooter>
            </DialogContent>
        )
    }

    if (action === 'withdraw') {
         return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Retirer de "{vaultName}"</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className='text-sm text-muted-foreground'>Les fonds seront versés sur votre solde principal.</p>
                    <Label htmlFor="withdraw-amount">Montant</Label>
                    <Input id="withdraw-amount" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} placeholder="ex: 5000" />
                </div>
                <ModalFooter>
                     <Button variant="ghost" onClick={() => setAction(null)}>Annuler</Button>
                     <DialogClose asChild><Button onClick={handleWithdraw} disabled={amount <= 0}>Confirmer Retrait</Button></DialogClose>
                </ModalFooter>
            </DialogContent>
        )
    }

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Gérer "{vaultName}"</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <Button variant="outline" className="py-10 flex-col h-auto" onClick={() => setAction('withdraw')}>
                    <ArrowDown className="h-6 w-6 mb-2"/> Retirer de la tirelire
                </Button>
                <Button className="py-10 flex-col h-auto bg-primary hover:bg-primary/90" onClick={() => setAction('deposit')}>
                    <Wallet className="h-6 w-6 mb-2"/> Approvisionner
                </Button>
            </div>
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
            <h2 className="text-2xl font-bold text-primary">Mes Coffres</h2>
            <p className="text-muted-foreground">Votre tirelire mobile.</p>
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
                <Card key={vault.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <PiggyBank className="h-8 w-8 text-primary" />
                            <CardTitle>{vault.name}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-xl font-bold mb-2">{formatCurrency(vault.balance)}</div>
                        {vault.targetAmount && (
                            <div>
                                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                    <span>Objectif</span>
                                    <span>{formatCurrency(vault.targetAmount)}</span>
                                </div>
                                <Progress value={(vault.balance / vault.targetAmount) * 100} />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <Edit className="mr-2 h-4 w-4" /> Gérer
                                </Button>
                            </DialogTrigger>
                            <ManageVaultDialog vaultId={vault.id} currentBalance={vault.balance} vaultName={vault.name}/>
                        </Dialog>
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
            <Target className="mx-auto h-16 w-16 text-muted-foreground" />
            <h4 className="mt-4 text-xl font-semibold">Aucune tirelire</h4>
            <p className="mt-2 text-muted-foreground">Commencez à épargner en créant votre première tirelire.</p>
             <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button className="mt-6">
                        <PlusCircle className="mr-2 h-4 w-4" /> Créer une tirelire
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Créer une nouvelle tirelire</DialogTitle></DialogHeader>
                    <CreateVaultForm onVaultCreated={() => setIsCreateOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
      )}
    </div>
  );
}

