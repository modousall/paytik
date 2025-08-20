
"use client";

import { QRCode } from "react-qrcode-logo";
import type { Transaction } from "@/hooks/use-transactions";
import { Badge } from "./ui/badge";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const TransactionDetailRow = ({ label, value, isAmount = false, type }: { label: string; value: string | number, isAmount?: boolean, type?: Transaction['type'] }) => {
    let valueClass = "font-medium text-right";
    let formattedValue: string;

    if (isAmount && typeof value === 'number') {
        const amountPrefix = type === 'sent' || type === 'versement' ? '- ' : '+ ';
        valueClass += type === 'sent' || type === 'versement' ? ' text-red-600' : ' text-green-600';
        formattedValue = `${amountPrefix}${value.toLocaleString()} Fcfa`;
    } else {
        formattedValue = value.toString();
    }
    
    return (
         <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ color: '#666' }}>{label}</span>
            <span style={{ fontWeight: 500, textAlign: 'right', color: isAmount ? (type === 'sent' || type === 'versement' ? '#dc2626' : '#16a34a') : 'black' }}>{formattedValue}</span>
        </div>
    )
};


const TransactionReceipt = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', fontSize: '14px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>
                PAYTIK
            </h1>
            <p style={{ color: '#666', marginTop: '4px' }}>Reçu de Transaction</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
            <TransactionDetailRow label="Montant" value={transaction.amount} isAmount type={transaction.type} />
            <TransactionDetailRow label="Statut" value={transaction.status} />
            <TransactionDetailRow label={transaction.type === 'sent' || transaction.type === 'versement' ? 'À' : 'De'} value={transaction.counterparty} />
            <TransactionDetailRow label="Raison" value={transaction.reason} />
            <TransactionDetailRow label="Date et Heure" value={formatDate(transaction.date)} />
            <TransactionDetailRow label="ID Transaction" value={transaction.id} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <QRCode
                value={transaction.id}
                size={80}
                quietZone={0}
                ecLevel="H"
            />
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#999' }}>
            <p>Merci d'utiliser PAYTIK.</p>
            <p>www.paytik.sn</p>
        </div>
    </div>
  );
};

export default TransactionReceipt;
