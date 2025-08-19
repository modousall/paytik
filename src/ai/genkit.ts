'use server';
/**
 * @file This file initializes and configures the Genkit AI capabilities for the application.
 * It sets up the Gemini 1.5 Flash model as the default generative model.
 * This centralized configuration ensures that all AI flows across the app use the same,
 * consistent model settings.
 *
 * The `ai` object exported from this file is the main entry point for defining and using
 * AI flows, prompts, and tools within the application.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The default model is set to Gemini 1.5 Flash, which provides a balance of
// performance and cost-effectiveness for the application's AI features.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});
