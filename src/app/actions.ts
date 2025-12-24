"use server";

import { generateEstimateFromImageAndDescription, GenerateEstimateInput, GenerateEstimateOutput } from "@/ai/flows/generate-estimate-from-image-and-description";

type GenerateEstimateResult = {
  success: boolean;
  data?: GenerateEstimateOutput;
  message?: string;
};

export async function generateEstimate(input: GenerateEstimateInput): Promise<GenerateEstimateResult> {
  try {
    const output = await generateEstimateFromImageAnd-description(input);
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

  const webAppUrl = "https://script.google.com/macros/s/AKfycbzb66Sg_ZUid8mUvDsNKt9ldz3_V_QM5wWKYDCoFiM-iAd5wm6hBBZ14mJMghYMpw0i4g/exec";
  
  if (!webAppUrl) {
    console.error("Google Sheet Web App URL is not configured. Submission failed.");
    return { success: false, message: "Application is not configured for submissions." };
  }

  // Explicitly map the data to ensure the keys EXACTLY match what the Apps Script expects (case-sensitive).
  const payload = {
      Timestamp: new Date().toISOString(),
      Name: data.contact.name,
      Email: data.contact.email,
      Phone: data.contact.phone,
      Description: data.description,
      LaborCost: data.estimate?.laborCost,
      MaterialCost: data.estimate?.materialCost,
      TotalCost: data.estimate?.totalCost,
      TimeEstimate: data.estimate?.timeEstimate,
      ImageUrl: data.imageDataUri,
  };

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // We remove 'no-cors' to be able to read the response from the script.
    });

    // The script returns JSON, so we parse it.
    const result = await response.json();

    if (result.result === 'success') {
      console.log("Successfully submitted to Google Sheet.");
      return { success: true, message: "Request submitted successfully." };
    } else {
      // If the script returns an error, log it.
      console.error("Google Sheet submission failed:", result.error);
      return { success: false, message: `Failed to save request: ${result.error}` };
    }
 
  } catch (error) {
    console.error("Fetch error during Google Sheet submission:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to save request: ${message}` };
  }
}
