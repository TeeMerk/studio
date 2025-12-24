"use server";

import { generateEstimateFromImageAndDescription, GenerateEstimateInput, GenerateEstimateOutput } from "@/ai/flows/generate-estimate-from-image-and-description";

type GenerateEstimateResult = {
  success: boolean;
  data?: GenerateEstimateOutput;
  message?: string;
};

export async function generateEstimate(input: GenerateEstimateInput): Promise<GenerateEstimateResult> {
  try {
    const output = await generateEstimateFromImageAndDescription(input);
    return { success: true, data: output };
  } catch (error) {
    console.error("Error generating estimate:", error);
    // In a real app, you might want to inspect the error to provide a more specific message.
    return { success: false, message: "Failed to generate estimate due to an internal error." };
  }
}

type SubmissionData = {
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  description: string;
  imageDataUri: string | null;
  estimate: GenerateEstimateOutput | null;
}

type SubmitRequestResult = {
  success: boolean;
  message?: string;
}

export async function submitRequest(data: SubmissionData): Promise<SubmitRequestResult> {
  console.log("New estimate request received, preparing to submit...");

  const webAppUrl = process.env.GOOGLE_SHEET_WEB_APP_URL;
  
  if (!webAppUrl) {
    console.warn("Google Sheet Web App URL is not configured. Skipping submission.");
    // This provides a fallback for local development if the URL isn't set.
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, message: "Request submitted successfully (simulation)." };
  }

  // Explicitly map the data to ensure the keys match what the Apps Script expects.
  const payload = {
      timestamp: new Date().toISOString(),
      name: data.contact.name,
      email: data.contact.email,
      phone: data.contact.phone,
      description: data.description,
      laborCost: data.estimate?.laborCost,
      materialCost: data.estimate?.materialCost,
      totalCost: data.estimate?.totalCost,
      timeEstimate: data.estimate?.timeEstimate,
      imageUrl: data.imageDataUri,
  };

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.result === 'success') {
      console.log("Successfully submitted to Google Sheet.");
      return { success: true, message: "Request submitted successfully." };
    } else {
      console.error("Google Sheet submission failed:", result.error);
      return { success: false, message: `Failed to save request: ${result.error}` };
    }
 
  } catch (error) {
    console.error("Fetch error during Google Sheet submission:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to save request: ${message}` };
  }
}
