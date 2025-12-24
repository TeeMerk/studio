"use client";

import { useState, useTransition, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UploadCloud,
  Wrench,
  Shapes,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { GenerateEstimateOutput } from "@/ai/flows/generate-estimate-from-image-and-description";
import { generateEstimate, submitRequest } from "./actions";
import Header from "@/components/header";

type Step = "input" | "estimating" | "result" | "contact" | "submitting" | "submitted";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [description, setDescription] = useState("");
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [estimateResult, setEstimateResult] = useState<GenerateEstimateOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const placeholderImage = PlaceHolderImages.find(p => p.id === 'image-upload-placeholder');
  
  useEffect(() => {
    // Prefetch placeholder image
    if (placeholderImage?.imageUrl) {
        const img = new window.Image();
        img.src = placeholderImage.imageUrl;
    }
  }, [placeholderImage]);

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
        toast({
          variant: "destructive",
          title: "Image too large",
          description: "Please upload an image smaller than 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetEstimate = async () => {
    if (!imageDataUri || !description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please upload an image and provide a description.",
      });
      return;
    }

    setStep("estimating");
    startTransition(async () => {
      const result = await generateEstimate({ photoDataUri: imageDataUri, description });
      if (result.success && result.data) {
        setEstimateResult(result.data);
        setStep("result");
      } else {
        toast({
          variant: "destructive",
          title: "Estimation Failed",
          description: result.message || "An unexpected error occurred.",
        });
        setStep("input");
      }
    });
  };
  
  const handleContactSubmit = (data: ContactFormData) => {
    setStep("submitting");
    startTransition(async () => {
      const submissionData = {
        contact: data,
        description,
        estimate: estimateResult,
        // In a real app, you would upload the image to a storage service
        // and save the URL instead of the data URI.
        // For this example, we will not send the large data URI.
      };
      const result = await submitRequest(submissionData);
      if (result.success) {
        setStep("submitted");
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: result.message || "Could not submit your request. Please try again.",
        });
        setStep("contact");
      }
    });
  };

  const startOver = () => {
    setStep("input");
    setDescription("");
    setImageDataUri(null);
    setEstimateResult(null);
    contactForm.reset();
  };

  const renderInputStep = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Get an Instant AI Estimate</CardTitle>
        <CardDescription>Upload a photo and describe the work you need done.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="project-image">Project Image</Label>
          <div className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
            <Input id="project-image" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
            {imageDataUri ? (
              <Image src={imageDataUri} alt="Project preview" fill style={{ objectFit: 'contain' }} className="rounded-lg p-2" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="w-10 h-10" />
                <span>Click to upload or drag & drop</span>
                <span className="text-xs">Max file size: 4MB</span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Describe the work needed</Label>
          <Textarea id="description" placeholder="e.g., 'Repair the drywall in the living room and paint the entire wall.'" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full" onClick={handleGetEstimate} disabled={!imageDataUri || !description}>
          Get My Estimate
        </Button>
      </CardFooter>
    </Card>
  );

  const renderLoadingStep = (text: string) => (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-8 h-[550px]">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <h2 className="text-2xl font-headline font-semibold">{text}</h2>
      <p className="text-muted-foreground">This may take a moment. Please don't close this page.</p>
    </div>
  );

  const renderResultStep = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your AI-Powered Estimate</CardTitle>
        <CardDescription>Here is a preliminary cost breakdown for your project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Total Estimated Cost</p>
          <p className="text-5xl font-bold font-headline text-primary">
            ${estimateResult?.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="p-3 bg-secondary rounded-full">
              <Wrench className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Labor Cost</p>
              <p className="text-xl font-semibold">
                ${estimateResult?.laborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="p-3 bg-secondary rounded-full">
              <Shapes className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Material Cost</p>
              <p className="text-xl font-semibold">
                ${estimateResult?.materialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">
            This is a preliminary estimate based on AI analysis. A formal quote will be provided after an in-person inspection by our team.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button size="lg" className="w-full" onClick={() => setStep("contact")}>
          Schedule Formal Estimate
        </Button>
        <Button size="lg" variant="outline" className="w-full" onClick={startOver}>
          Start Over
        </Button>
      </CardFooter>
    </Card>
  );

  const renderContactStep = () => (
    <Card className="w-full">
      <CardHeader>
         <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={() => setStep('result')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        <CardTitle className="font-headline text-2xl text-center pt-8">Schedule a Formal Estimate</CardTitle>
        <CardDescription className="text-center">Provide your details, and we'll contact you to schedule an in-person quote.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...contactForm}>
          <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4">
            <FormField
              control={contactForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={contactForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={contactForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full !mt-6" disabled={isPending}>
              Submit Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderSubmittedStep = () => (
    <Card className="w-full text-center">
      <CardHeader>
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-accent">
          <CheckCircle className="w-10 h-10 text-accent-foreground" />
        </div>
        <CardTitle className="font-headline text-2xl !mt-4">Request Submitted!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Thank you for your request. A member of our team at Radley LLC will contact you shortly to schedule a formal, in-person estimate.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="lg" variant="outline" className="w-full" onClick={startOver}>
          Create Another Estimate
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStep = () => {
    switch (step) {
      case "input":
        return renderInputStep();
      case "estimating":
        return renderLoadingStep("Generating your estimate...");
      case "result":
        return renderResultStep();
      case "contact":
        return renderContactStep();
      case "submitting":
        return renderLoadingStep("Submitting your request...");
      case "submitted":
        return renderSubmittedStep();
      default:
        return renderInputStep();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {renderStep()}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Radley LLC. Powered by EstimateAI.</p>
      </footer>
    </div>
  );
}
