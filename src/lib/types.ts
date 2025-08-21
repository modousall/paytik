
import { z } from 'zod';

// BNPL (Buy Now, Pay Later) Schemas and Types
export const BnplAssessmentInputSchema = z.object({
  alias: z.string().describe('The user alias applying for BNPL.'),
  purchaseAmount: z.number().describe('The total amount of the purchase.'),
  downPayment: z.number().optional().describe('The down payment made by the user, if any.'),
  transactionHistory: z
    .array(
      z.object({
        amount: z.number(),
        type: z.string(),
        date: z.string(),
      })
    )
    .describe("A summary of the user's recent transaction history."),
  currentBalance: z.number().describe('The current main balance of the user.'),
  repaymentFrequency: z.string().describe('The frequency of repayments (e.g., weekly, monthly).'),
  installmentsCount: z.number().describe('The total number of installments.'),
  firstInstallmentDate: z.string().describe('The date of the first installment.'),
  marginRate: z.number().describe('The margin rate for the credit.'),
});
export type BnplAssessmentInput = z.infer<typeof BnplAssessmentInputSchema>;

export const BnplAssessmentOutputSchema = z.object({
  status: z
    .enum(['approved', 'rejected', 'review'])
    .describe(
      'The assessment status of the application. "review" means it requires manual admin approval.'
    ),
  reason: z.string().describe('A brief reason for the decision.'),
  repaymentPlan: z.string().optional().describe('A suggested repayment plan if approved.'),
});
export type BnplAssessmentOutput = z.infer<typeof BnplAssessmentOutputSchema>;

export type BnplStatus = 'review' | 'approved' | 'rejected';

export type BnplRequest = {
    id: string;
    alias: string;
    merchantAlias: string;
    amount: number;
    status: BnplStatus;
    reason: string;
    repaymentPlan?: string;
    requestDate: string;
    repaidAmount?: number;
};

    