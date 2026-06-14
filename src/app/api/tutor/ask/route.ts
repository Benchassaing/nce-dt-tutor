import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getTutorResponse } from "@/lib/ai";
import { askTutorSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = askTutorSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { topicId, question, context, previousMessages } = validation.data;

    // Get user from database
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get tutor response using RAG
    const response = await getTutorResponse(
      topicId,
      question,
      context || "learn",
      previousMessages || []
    );

    // Log the interaction for analytics
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "tutor_interaction",
        title: "Tutor Question",
        message: question.substring(0, 100),
        data: { topicId, step: context },
      },
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Tutor API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}