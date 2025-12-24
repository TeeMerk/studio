'use server';
/**
 * @fileOverview An AI agent that generates an estimate based on an image and description of work needed.
 *
 * - generateEstimateFromImageAndDescription - A function that handles the estimate generation process.
 * - GenerateEstimateInput - The input type for the generateEstimateFromImageAndDescription function.
 * - GenerateEstimateOutput - The return type for the generateEstimateFromImageAndDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEstimateInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the project, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the work needed.'),
});
export type GenerateEstimateInput = z.infer<typeof GenerateEstimateInputSchema>;

const GenerateEstimateOutputSchema = z.object({
  laborCost: z.number().describe('The estimated labor cost for the project.'),
  materialCost: z.number().describe('The estimated material cost for the project.'),
  totalCost: z.number().describe('The total estimated cost for the project.'),
});
export type GenerateEstimateOutput = z.infer<typeof GenerateEstimateOutputSchema>;

export async function generateEstimateFromImageAndDescription(
  input: GenerateEstimateInput
): Promise<GenerateEstimateOutput> {
  return generateEstimateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEstimatePrompt',
  input: {schema: GenerateEstimateInputSchema},
  output: {schema: GenerateEstimateOutputSchema},
  prompt: `You are an expert estimator for construction and home repair projects. You are provided with an image and a description of the work needed.
  You will use this information, along with your knowledge of local labor and material costs for the 75601 zip code, to generate an estimate for the project.
  The estimate should be broken down into labor cost and material cost.

  Description: {{{description}}}
  Photo: {{media url=photoDataUri}}

  Respond with JSON that contains the laborCost, materialCost and totalCost.
`,
});

const generateEstimateFlow = ai.defineFlow(
  {
    name: 'generateEstimateFlow',
    inputSchema: GenerateEstimateInputSchema,
    outputSchema: GenerateEstimateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure that the totalCost reflects the sum of laborCost and materialCost for data integrity
    const totalCost = output!.laborCost + output!.materialCost;
    return {...output, totalCost};
  }
);
