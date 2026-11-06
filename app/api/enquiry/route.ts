import { NextResponse } from "next/server";
import { z } from "zod";

const enquirySchema = z.object({
  parentName: z.string().min(2, "Parent name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  childName: z.string().min(2, "Child's name must be at least 2 characters"),
  grade: z.string().min(1, "Please select a grade"),
  questions: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = enquirySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Simulate network processing delay for smooth UI feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry received successfully. Our admissions team will connect shortly.",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while processing the request." },
      { status: 500 }
    );
  }
}

