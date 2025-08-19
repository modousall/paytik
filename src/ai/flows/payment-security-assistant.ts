'use server';

/**
 * @fileOverview A Smart Payment Security Assistant flow that analyzes recipient alias/account details and provides security suggestions.
 *
 * - paymentSecurityAssistant - A function that handles the security analysis process.
 * - PaymentSecurityAssistantInput - The input type for the paymentSecurityAssistant function.
 * - PaymentSecurityAssistantOutput - The return type for the paymentSecurityAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PaymentSecurityAssistantInputSchema = z.object({
  recipientAlias: z.string().describe('The alias of the payment recipient.'),
  recipientAccountDetails: z.string().describe('The account details of the payment recipient.'),
  amount: z.number().describe('The amount to be transferred.'),
  transactionType: z.string().describe('The type of transaction (e.g., payment, transfer).'),
});
export type PaymentSecurityAssistantInput = z.infer<typeof PaymentSecurityAssistantInputSchema>;

const PaymentSecurityAssistantOutputSchema = z.object({
  securitySuggestions: z.array(
    z.string().describe('A list of security suggestions or warnings.')
  ).describe('A list of security suggestions based on the recipient and transaction details.'),
  isHighRisk: z.boolean().describe('Indicates whether the transaction is considered high risk.'),
});
export type PaymentSecurityAssistantOutput = z.infer<typeof PaymentSecurityAssistantOutputSchema>;

export async function paymentSecurityAssistant(input: PaymentSecurityAssistantInput): Promise<PaymentSecurityAssistantOutput> {
  return paymentSecurityAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'paymentSecurityAssistantPrompt',
  input: {schema: PaymentSecurityAssistantInputSchema},
  output: {schema: PaymentSecurityAssistantOutputSchema},
  prompt: `You are a Smart Payment Security Assistant. Your role is to analyze the details of a payment transaction and provide security suggestions to the user to help them avoid scams or incorrect payments.

Analyze the following recipient and transaction details:

Recipient Alias: {{{recipientAlias}}}
Recipient Account Details: {{{recipientAccountDetails}}}
Amount: {{{amount}}}
Transaction Type: {{{transactionType}}}

Provide a list of security suggestions to the user. These suggestions should include warnings about potential scams, checks for incorrect information, and any other relevant security advice.  Also, based on the provided details, determine if the transaction is high risk, and set the "isHighRisk" field accordingly.

Consider factors such as the recipient's alias, account details, the transaction amount, and the transaction type when generating your suggestions.

Output MUST be a valid JSON conforming to the following schema:
${JSON.stringify(PaymentSecurityAssistantOutputSchema.describe(''))}`,
});

const paymentSecurityAssistantFlow = ai.defineFlow(
  {
    name: 'paymentSecurityAssistantFlow',
    inputSchema: PaymentSecurityAssistantInputSchema,
    outputSchema: PaymentSecurityAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
