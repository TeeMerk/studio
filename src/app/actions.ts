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

// This function now simulates a successful submission without any external calls.
export async function submitRequest(data: SubmissionData): Promise<SubmitRequestResult> {
  console.log("New estimate request received (simulation):", {
    Timestamp: new Date().toISOString(),
    Name: data.contact.name,
    Email: data.contact.email,
    Phone: data.contact.phone,
    Description: data.description,
    LaborCost: data.estimate?.laborCost,
    MaterialCost: data.estimate?.materialCost,
    TotalCost: data.estimate?.totalCost,
    TimeEstimate: data.estimate?.timeEstimate,
    ImageUrl: data.imageDataUri ? 'Image included' : 'No image',
  });

  // We'll just return success immediately to simulate a successful submission.
  return { success: true, message: "Request submitted successfully." };
}
