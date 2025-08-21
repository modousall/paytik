
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBnplManagement from "./admin-bnpl-management";
import AdminFinancingManagement from "./admin-financing-management";

export default function AdminFinancingHub() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="merchant" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="merchant">Financement Marchand</TabsTrigger>
                    <TabsTrigger value="internal">Financement Interne</TabsTrigger>
                </TabsList>
                <TabsContent value="merchant" className="mt-6">
                    <AdminBnplManagement />
                </TabsContent>
                <TabsContent value="internal" className="mt-6">
                    <AdminFinancingManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
