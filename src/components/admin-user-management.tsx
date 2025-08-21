

"use client";

import { useUserManagement, type ManagedUserWithDetails } from "@/hooks/use-user-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Search, PlusCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "./ui/input";
import AdminUserDetail from "./admin-user-detail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import AdminCreateUserForm from "./admin-create-user-form";
import { TransactionsProvider } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";

const roleVariantMap: {[key: string]: 'default' | 'secondary' | 'destructive' | 'outline'} = {
    superadmin: 'destructive',
    admin: 'destructive',
    support: 'secondary',
    merchant: 'default',
    agent: 'default',
    user: 'outline'
};


export default function AdminUserManagement() {
    const { users, refreshUsers } = useUserManagement();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<ManagedUserWithDetails | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            (user.role === 'user' || user.role === 'support' || user.role === 'admin' || user.role === 'superadmin') &&
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.alias.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);
    
    const handleUserSelect = (user: ManagedUserWithDetails) => {
        setSelectedUser(user);
    }
    
    const handleBackToList = () => {
        setSelectedUser(null);
        refreshUsers(); // Refresh data when going back to the list
    }
    
    const handleUserCreated = () => {
        setIsCreateDialogOpen(false);
        refreshUsers();
    }

    if (selectedUser) {
        return <AdminUserDetail user={selectedUser} onBack={handleBackToList} onUpdate={refreshUsers} />
    }

    const adminAlias = "+221775478575";

    return (
        <TransactionsProvider alias={adminAlias}>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Gestion des Utilisateurs ({filteredUsers.length})</CardTitle>
                            <CardDescription>Consultez la liste des clients et du personnel interne. Cliquez pour voir les détails.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Rechercher..." 
                                    className="pl-8 w-48"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2"/> Créer un utilisateur
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Créer un nouvel utilisateur interne</DialogTitle>
                                    </DialogHeader>
                                    <AdminCreateUserForm onUserCreated={handleUserCreated} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Alias</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Solde Principal</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredUsers.map(user => (
                                <TableRow key={user.alias} onClick={() => handleUserSelect(user)} className="cursor-pointer">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.alias}</TableCell>
                                    <TableCell>
                                        <Badge variant={roleVariantMap[user.role || 'user'] || 'outline'}>{user.role || 'user'}</Badge>
                                    </TableCell>
                                    <TableCell>{formatCurrency(user.balance)}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.isSuspended ? "destructive" : "default"} className={!user.isSuspended ? "bg-green-100 text-green-800" : ""}>
                                            {user.isSuspended ? "Suspendu" : "Actif"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    {filteredUsers.length === 0 && (
                        <div className="text-center p-8">
                            <p>Aucun utilisateur ne correspond à votre recherche.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TransactionsProvider>
    )
}

