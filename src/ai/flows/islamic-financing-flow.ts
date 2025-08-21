
'use server';
/**
 * @fileOverview An AI flow for assessing Islamic Financing applications.
 *
 * - islamicFinancingAssessment - A function that handles the financing assessment process.
 */

import { ai } from '@/ai/genkit';
import { IslamicFinancingInputSchema, IslamicFinancingOutputSchema, type IslamicFinancingInput, type IslamicFinancingOutput } from '@/lib/types';

export async function islamicFinancingAssessment(
  input: IslamicFinancingInput
): Promise<IslamicFinancingOutput> {
  const prompt = ai.definePrompt({
    name: 'islamicFinancingAssessmentPrompt',
    input: { schema: IslamicFinancingInputSchema },
    output: { schema: IslamicFinancingOutputSchema },
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `Vous êtes un expert en financement islamique (Mourabaha).
Analysez la demande de financement suivante et décidez si elle doit être approuvée, rejetée, ou mise en attente d'un examen manuel.

Critères d'évaluation :
1.  **Montant du financement** : Soyez prudent avec les montants très élevés (ex: > 500 000 F).
2.  **Objet du financement** : Les biens de consommation durables (voiture, équipement) sont préférables. Les projets d'entreprise sont bons s'ils sont bien décrits.
3.  **Historique des transactions** : Un utilisateur avec un historique de transactions régulier et des revenus (received) est un bon candidat.
4.  **Solde actuel** : Un solde actuel très bas peut indiquer un risque.
5.  **Durée** : Une durée plus courte est moins risquée.

Règles de décision :
- **Approuver** : Pour les montants raisonnables (< 300 000 F) avec un bon historique de transactions et un objet clair.
- **Rejeter** : Pour les nouveaux utilisateurs sans historique ou pour des montants excessifs.
- **Mettre en examen (review)** : Pour les cas limites, comme un montant élevé mais un bon historique, ou un but de financement flou.

Informations sur le demandeur :
Alias: {{{alias}}}
Montant du financement demandé : {{{amount}}} F
Type de financement: {{{financingType}}}
Durée : {{{durationMonths}}} mois
Objet du financement: {{{purpose}}}
Solde actuel : {{{currentBalance}}} F

Calcul du plan de remboursement (si approuvé) :
Le taux de profit annuel est de 23.5%.
1. Calculez le **profit total** : Montant du financement * (23.5 / 100) * (Durée en mois / 12).
2. Calculez le **montant total à rembourser** : Montant du financement + Profit total.
3. Calculez le **montant par échéance mensuelle** : Montant total à rembourser / Durée en mois. Arrondir au chiffre supérieur.
4. Formulez le plan de remboursement : "{{{durationMonths}}} versements de [Montant par échéance] F".

Fournissez un statut ('approved', 'rejected', 'review'), une raison claire et concise pour votre décision, et si approuvé, le plan de remboursement calculé.
`,
  });

  const financingFlow = ai.defineFlow(
    {
      name: 'islamicFinancingAssessmentFlow',
      inputSchema: IslamicFinancingInputSchema,
      outputSchema: IslamicFinancingOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      return output!;
    }
  );

  return financingFlow(input);
}
