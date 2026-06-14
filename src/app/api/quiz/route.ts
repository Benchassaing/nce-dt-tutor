import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { quizSubmitSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
    const type = searchParams.get("type");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};
    if (topicId) where.topicId = topicId;
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;

    const questions = await prisma.quizQuestion.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        topic: { select: { title: true, unit: { select: { code: true, title: true } } } },
      },
    });

    // Shuffle options for MCQ
    const shuffledQuestions = questions.map((q) => {
      if (q.type === "MULTIPLE_CHOICE" && q.options?.choices) {
        const choices = [...q.options.choices];
        // Fisher-Yates shuffle
        for (let i = choices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [choices[i], choices[j]] = [choices[j], choices[i]];
        }
        return { ...q, options: { ...q.options, choices } };
      }
      return q;
    });

    return NextResponse.json({
      success: true,
      data: shuffledQuestions,
    });
  } catch (error) {
    console.error("Quiz questions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = quizSubmitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { topicId, questionIds, answers, mode } = validation.data;

    // Get user
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch questions
    const questions = await prisma.quizQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    // Grade answers
    const results = answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) {
        return { questionId: answer.questionId, error: "Question not found" };
      }

      const isCorrect = checkAnswer(answer.userAnswer, question.correctAnswer);
      const xpEarned = isCorrect ? question.marks * 10 : 0;

      return {
        questionId: question.id,
        questionType: question.type,
        isCorrect,
        userAnswer: answer.userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        marks: question.marks,
        earnedMarks: isCorrect ? question.marks : 0,
        xpEarned,
        timeSpentMs: answer.timeSpentMs,
        hintsUsed: answer.hintsUsed,
      };
    });

    // Save attempts
    const attemptsData = results.map((r, i) => ({
      userId: user.id,
      questionId: r.questionId,
      userAnswer: answers[i].userAnswer,
      isCorrect: r.isCorrect,
      timeSpentMs: answers[i].timeSpentMs,
      hintsUsed: answers[i].hintsUsed,
      attemptNumber: 1,
      xpEarned: r.xpEarned,
    }));

    await prisma.quizAttempt.createMany({ data: attemptsData });

    // Update user XP
    const totalXpEarned = results.reduce((sum, r) => sum + (r.xpEarned || 0), 0);
    if (totalXpEarned > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: totalXpEarned } },
      });
    }

    // Update topic progress
    if (topicId) {
      await updateTopicProgress(user.id, topicId, results);
    }

    // Check for badge achievements
    await checkBadgeAchievements(user.id);

    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
    const earnedMarks = results.reduce((sum, r) => sum + (r.earnedMarks || 0), 0);
    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        score: correctCount,
        totalQuestions: questions.length,
        percentage,
        totalMarks,
        earnedMarks,
        xpEarned: totalXpEarned,
        timeSpentMs: answers.reduce((sum, a) => sum + a.timeSpentMs, 0),
        questionResults: results,
        topicBreakdown: getTopicBreakdown(results, questions),
      },
    });
  } catch (error) {
    console.error("Quiz submit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function checkAnswer(userAnswer: unknown, correctAnswer: unknown): boolean {
  if (typeof userAnswer === "string" && typeof correctAnswer === "string") {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }
  if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
    return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
  }
  if (typeof userAnswer === "object" && typeof correctAnswer === "object" && userAnswer && correctAnswer) {
    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  }
  return false;
}

async function updateTopicProgress(userId: string, topicId: string, results: ReturnType<typeof checkAnswer>[]) {
  const topicResults = results.filter((r) => r.questionType);
  const correct = topicResults.filter((r) => r.isCorrect).length;
  const total = topicResults.length;
  const percentage = total > 0 ? (correct / total) * 100 : 0;

  await prisma.studentProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: {
      completionPct: { increment: Math.min(25, percentage / 4) },
      masteryScore: { increment: percentage / 10 },
      lastAccessedAt: new Date(),
    },
    create: {
      userId,
      topicId,
      completionPct: Math.min(25, percentage / 4),
      masteryScore: percentage / 10,
      status: percentage >= 80 ? "COMPLETED" : "IN_PROGRESS",
    },
  });
}

function getTopicBreakdown(results: ReturnType<typeof checkAnswer>[], questions: { id: string; topic: { id: string; title: string; unit: { code: string } } }[]) {
  const breakdown: Record<string, { correct: number; total: number; topicTitle: string; unitCode: string }> = {};
  
  results.forEach((r, i) => {
    const q = questions[i];
    if (!q) return;
    const key = q.topic.id;
    if (!breakdown[key]) {
      breakdown[key] = { correct: 0, total: 0, topicTitle: q.topic.title, unitCode: q.topic.unit.code };
    }
    breakdown[key].total++;
    if (r.isCorrect) breakdown[key].correct++;
  });

  return Object.entries(breakdown).map(([topicId, data]) => ({
    topicId,
    topicTitle: data.topicTitle,
    unitCode: data.unitCode,
    correct: data.correct,
    total: data.total,
    percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));
}

async function checkBadgeAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { badges: { include: { badge: true } }, progress: true, quizAttempts: true },
  });

  if (!user) return;

  const earnedBadgeIds = new Set(user.badges.map((b) => b.badgeId));
  const newBadges: string[] = [];

  // First Steps badge
  if (!earnedBadgeIds.has("first_steps") && user.progress.length > 0) {
    newBadges.push("first_steps");
  }

  // Quiz Champion badge
  const correctQuizzes = user.quizAttempts.filter((a) => a.isCorrect).length;
  if (!earnedBadgeIds.has("quiz_champion") && correctQuizzes >= 10) {
    newBadges.push("quiz_champion");
  }

  // Perfectionist badge
  const perfectQuizzes = user.quizAttempts.filter((a) => a.isCorrect && a.hintsUsed === 0).length;
  if (!earnedBadgeIds.has("perfectionist") && perfectQuizzes >= 5) {
    newBadges.push("perfectionist");
  }

  // Award new badges
  for (const badgeCode of newBadges) {
    const badge = await prisma.badge.findUnique({ where: { code: badgeCode } });
    if (badge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      // Award XP
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: badge.xpReward } },
      });
    }
  }
}