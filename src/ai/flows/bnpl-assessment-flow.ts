
'use server';
/**
 * @fileOverview An AI flow for assessing BNPL (Buy Now, Pay Later) applications.
 *
 * - assessBnplApplication - A function that handles the BNPL assessment process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { BnplAssessmentInputSchema, BnplAssessmentOutputSchema, type BnplAssessmentInput, type BnplAssessmentOutput } from '@/lib/types';


export async function assessBnplApplication(
  input: BnplAssessmentInput
): Promise<BnplAssessmentOutput> {
  const prompt = ai.definePrompt({
    name: 'bnplAssessmentPrompt',
    input: { schema: BnplAssessmentInputSchema },
    output: { schema: BnplAssessmentOutputSchema },
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `Vous êtes un expert en évaluation de crédit pour un service financier en Afrique de l'Ouest.
Analysez la demande de "Credit Marchands" (BNPL) suivante et décidez si elle doit être approuvée, rejetée, ou mise en attente d'un examen manuel.

Critères d'évaluation :
1.  **Montant de l'achat** : Si le montant est très élevé (ex: > 150 000 Fcfa), soyez prudent.
2.  **Historique des transactions** : Un utilisateur avec un historique de transactions régulier et des revenus (received) est un bon candidat. Un utilisateur sans historique est à haut risque.
3.  **Solde actuel** : Un solde actuel très bas peut indiquer un risque.
4.  **Conditions du crédit** : Un taux de marge élevé ou une périodicité de remboursement très courte pour un montant élevé peuvent augmenter le risque.

Règles de décision :
- **Approuver** : Pour les montants raisonnables (< 100 000 Fcfa) avec un bon historique de transactions et des conditions de crédit standard.
- **Rejeter** : Pour les nouveaux utilisateurs sans historique ou pour des montants clairement excessifs sans historique pour le justifier.
- **Mettre en examen (review)** : Pour les cas limites, comme un montant élevé mais un bon historique, ou un utilisateur relativement nouveau avec un montant modéré, ou des conditions de crédit inhabituelles (taux élevé, etc.).

Informations sur le demandeur :
Alias: {{{alias}}}
Montant de l'achat : {{{purchaseAmount}}} Fcfa
Solde actuel : {{{currentBalance}}} Fcfa
Nombre d'échéances: {{{installmentsCount}}}
Périodicité de remboursement: {{{repaymentFrequency}}}
Date de première échéance: {{{firstInstallmentDate}}}
Taux de marge: {{{marginRate}}}%

Historique des transactions:
{{#each transactionHistory}}
- {{this.type}} de {{this.amount}} Fcfa le {{this.date}}
{{/each}}

Fournissez un statut ('approved', 'rejected', 'review'), une raison claire et concise pour votre décision, et si approuvé, un plan de remboursement simple (ex: "{{{installmentsCount}}} versements de X Fcfa").
`,
  });

  const bnplAssessmentFlow = ai.defineFlow(
    {
      name: 'bnplAssessmentFlow',
      inputSchema: BnplAssessmentInputSchema,
      outputSchema: BnplAssessmentOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      return output!;
    }
  );

  return bnplAssessmentFlow(input);
}

    