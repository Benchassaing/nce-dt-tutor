import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");

    const where = unitId ? { unitId } : {};

    const units = await prisma.unit.findMany({
      where,
      include: {
        topics: {
          orderBy: { order: "asc" },
          include: {
            _count: { select: { quizQuestions: true, flashcards: true } },
          },
        },
        _count: { select: { topics: true } },
      },
      orderBy: { order: "asc" },
    });

    // If user is authenticated, add progress
    let userProgress: Record<string, { completionPct: number; status: string; masteryScore: number }> = {};
    if (userId) {
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (user) {
        const progress = await prisma.studentProgress.findMany({
          where: { userId: user.id },
        });
        userProgress = Object.fromEntries(
          progress.map((p) => [p.topicId, { completionPct: p.completionPct, status: p.status, masteryScore: p.masteryScore }])
        );
      }
    }

    const unitsWithProgress = units.map((unit) => ({
      ...unit,
      topics: unit.topics.map((topic) => ({
        ...topic,
        progress: userProgress[topic.id] || { completionPct: 0, status: "NOT_STARTED", masteryScore: 0 },
      })),
    }));

    return NextResponse.json({
      success: true,
      data: unitsWithProgress,
    });
  } catch (error) {
    console.error("Curriculum API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}