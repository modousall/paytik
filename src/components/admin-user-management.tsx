
"use client";

import { useUserManagement, type ManagedUserWithDetails } from "@/hooks/use-user-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Search, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import AdminUserDetail from "./admin-user-detail";


export default function AdminUserManagement() {
    const { users, refreshUsers } = useUserManagement();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<ManagedUserWithDetails | null>(null);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.alias.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleUserSelect = (user: ManagedUserWithDetails) => {
        setSelectedUser(user);
    }
    
    const handleBackToList = () => {
        setSelectedUser(null);
        refreshUsers(); // Refresh data when going back to the list
    }

    if (selectedUser) {
        return <AdminUserDetail user={selectedUser} onBack={handleBackToList} />
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Gestion des Utilisateurs ({users.length})</CardTitle>
                            <CardDescription>Consultez la liste des utilisateurs. Cliquez sur un utilisateur pour voir les détails.</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Rechercher par nom, email, alias..." 
                                className="pl-8 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                                        <Badge variant={user.role === 'superadmin' ? 'destructive' : 'secondary'}>{user.role || 'user'}</Badge>
                                    </TableCell>
                                    <TableCell>{user.balance.toLocaleString()} Fcfa</TableCell>
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
        </>
    )
}
