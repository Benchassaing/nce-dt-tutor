import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { onboardingSchema } from "@/lib/validations";
import { generateStudyPlan } from "@/lib/planner";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = onboardingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, examDate, hoursPerWeek, preferredDays } = validation.data;

    // Get or create user
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: "", // Will be filled by webhook
          name,
          role: "STUDENT",
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Create study plan if exam date provided
    if (examDate) {
      const plan = await generateStudyPlan({
        userId: user.id,
        examDate: new Date(examDate),
        hoursPerWeek,
        preferredDays,
      });

      await prisma.studyPlan.upsert({
        where: { userId: user.id },
        update: {
          examDate: new Date(examDate),
          hoursPerWeek,
          preferredDays,
          startDate: new Date(),
          generatedPlan: plan,
        },
        create: {
          userId: user.id,
          examDate: new Date(examDate),
          hoursPerWeek,
          preferredDays,
          startDate: new Date(),
          generatedPlan: plan,
        },
      });

      // Create initial sessions
      const sessions = [];
      for (const week of plan.weeks) {
        for (const day of week.days) {
          for (const session of day.sessions) {
            if (session.topicId) {
              sessions.push({
                userId: user.id,
                planId: (await prisma.studyPlan.findUnique({ where: { userId: user.id } }))?.id,
                topicId: session.topicId,
                scheduledAt: new Date(day.date),
                durationMins: session.duration,
                type: session.type,
              });
            }
          }
        }
      }

      if (sessions.length > 0) {
        await prisma.studySession.createMany({ data: sessions });
      }
    }

    // Create initial streak
    await prisma.streak.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding complete",
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}