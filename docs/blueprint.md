# **App Name**: EstimateAI

## Core Features:

- Image Upload & Description: Allow users to upload an image of the project and describe the work needed.
- AI-Powered Estimate: Use the Gemini API to generate an estimate based on the image and description, broken down into labor and material costs.
- Cost Localization: The AI tool will use current average local costs for labor and materials for the 75601 zip code to inform its estimate.
- Contact Information Collection: Collect user contact information (name, email, phone number) for follow-up.
- Data Submission: Submit all collected data, including image link, description, estimate details, and contact information, to the Google Sheet located at https://docs.google.com/spreadsheets/d/1siTN_4HNajuE987yUHXFgyIp1dKsDJaps_kfG05oq84/edit?gid=0#gid=0.
- API Key Security: Securely store and utilize the Gemini API key to prevent public exposure.
- Submission Confirmation: Display a confirmation message to the user after submitting their request.

## Style Guidelines:

- Primary color: Strong blue (#2962FF) to communicate trustworthiness and expertise.
- Background color: Very light blue (#E8F0FE), providing a clean, neutral backdrop.
- Accent color: Soft green (#A5D6A7) for positive confirmations, call-to-actions and highlights, set apart from the primary color.
- Body and headline font: 'Inter' for a modern and neutral look. Note: currently only Google Fonts are supported.
- Use clear, simple icons to represent different aspects of the estimation process and project details.
- Employ a clean, organized layout with clear sections for image upload, description, estimate display, and contact information. Focus on mobile responsiveness.
- Use subtle animations to provide feedback during image upload, estimate generation, and data submission.