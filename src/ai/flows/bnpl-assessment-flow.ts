
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
2.  **Avance (Down Payment)**: Une avance significative réduit le risque. Si une avance est versée, le montant à financer est réduit.
3.  **Historique des transactions** : Un utilisateur avec un historique de transactions régulier et des revenus (received) est un bon candidat. Un utilisateur sans historique est à haut risque.
4.  **Solde actuel** : Un solde actuel très bas peut indiquer un risque.
5.  **Conditions du crédit** : Un taux de marge élevé ou une périodicité de remboursement très courte pour un montant élevé peuvent augmenter le risque.

Règles de décision :
- **Approuver** : Pour les montants raisonnables (< 100 000 Fcfa) avec un bon historique de transactions et des conditions de crédit standard.
- **Rejeter** : Pour les nouveaux utilisateurs sans historique ou pour des montants clairement excessifs sans historique pour le justifier.
- **Mettre en examen (review)** : Pour les cas limites, comme un montant élevé mais un bon historique, ou un utilisateur relativement nouveau avec un montant modéré, ou des conditions de crédit inhabituelles (taux élevé, etc.).

Informations sur le demandeur :
Alias: {{{alias}}}
Montant de l'achat : {{{purchaseAmount}}} Fcfa
Avance versée : {{#if downPayment}}{{{downPayment}}} Fcfa{{else}}0 Fcfa{{/if}}
Solde actuel : {{{currentBalance}}} Fcfa
Nombre d'échéances: {{{installmentsCount}}}
Périodicité de remboursement: {{{repaymentFrequency}}}
Date de première échéance: {{{firstInstallmentDate}}}
Taux de marge: {{{marginRate}}}% par période

Calcul du plan de remboursement (si approuvé) :
1. Calculez le **montant à financer** : Montant de l'achat - Avance versée.
2. Calculez le **montant par échéance** en utilisant la formule d'amortissement standard : (Montant financé * Taux de marge) / (1 - (1 + Taux de marge)^(-Nombre d'échéances)). Arrondir au chiffre supérieur.
3. Calculez le **montant total à rembourser** : Montant par échéance * Nombre d'échéances.
4. Formulez le plan de remboursement : "{{{installmentsCount}}} versements de [Montant par échéance] Fcfa".

Fournissez un statut ('approved', 'rejected', 'review'), une raison claire et concise pour votre décision, et si approuvé, le plan de remboursement calculé.
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
    
