import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { calculateLevel, xpForLevel } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        progress: { include: { topic: { include: { unit: true } } } },
        badges: { include: { badge: true }, orderBy: { earnedAt: "desc" }, take: 5 },
        streak: true,
        quizAttempts: { orderBy: { createdAt: "desc" }, take: 50 },
        examAttempts: { where: { status: "COMPLETED" }, take: 10 },
        sessions: { where: { completedAt: { not: null } }, orderBy: { scheduledAt: "desc" }, take: 5 },
        studyPlan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate overall progress
    const totalTopics = await prisma.topic.count();
    const completedTopics = user.progress.filter((p) => p.status === "COMPLETED" || p.status === "MASTERED").length;
    const inProgressTopics = user.progress.filter((p) => p.status === "IN_PROGRESS").length;
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // XP and Level
    const { currentLevel, currentLevelXp, nextLevelXp, progress: levelProgress } = calculateLevel(user.xp);

    // Streak
    const streakData = user.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalActiveDays: 0,
      freezesRemaining: 1,
    };

    // Topic progress for dashboard
    const topicProgress = user.progress.map((p) => ({
      topicId: p.topicId,
      topicTitle: p.topic.title,
      unitCode: p.topic.unit.code,
      unitTitle: p.topic.unit.title,
      status: p.status,
      completionPct: p.completionPct,
      masteryScore: p.masteryScore,
      lastAccessedAt: p.lastAccessedAt,
    }));

    // Weak areas (lowest mastery scores)
    const weakAreas = user.progress
      .filter((p) => p.status !== "MASTERED" && p.masteryScore < 60)
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .slice(0, 5)
      .map((p) => ({
        topicId: p.topicId,
        topicTitle: p.topic.title,
        unitCode: p.topic.unit.code,
        masteryScore: p.masteryScore,
        recentQuizScore: 0, // Would calculate from recent attempts
        recommendedAction: p.masteryScore < 30 ? "Review lesson and retake quizzes" : "Practice more questions",
      }));

    // Quiz stats
    const quizAttempts = user.quizAttempts;
    const totalQuizAttempts = quizAttempts.length;
    const correctQuizAttempts = quizAttempts.filter((a) => a.isCorrect).length;
    const avgQuizScore = totalQuizAttempts > 0 ? Math.round((correctQuizAttempts / totalQuizAttempts) * 100) : 0;
    const bestQuizScore = quizAttempts.length > 0 ? Math.max(...quizAttempts.map((a) => a.isCorrect ? 100 : 0)) : 0;

    // Current quiz streak
    let currentQuizStreak = 0;
    for (const attempt of quizAttempts) {
      if (attempt.isCorrect) currentQuizStreak++;
      else break;
    }

    // Exam stats
    const completedExams = user.examAttempts.filter((a) => a.status === "COMPLETED");
    const avgExamPercentage = completedExams.length > 0
      ? Math.round(completedExams.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedExams.length)
      : 0;
    const bestExamPercentage = completedExams.length > 0
      ? Math.max(...completedExams.map((a) => a.percentage || 0))
      : 0;

    // Weekly goal
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyXp = user.quizAttempts
      .filter((a) => a.createdAt >= weekStart)
      .reduce((sum, a) => sum + a.xpEarned, 0);
    const weeklySessions = user.sessions.filter((s) => s.completedAt && s.completedAt >= weekStart).length;

    // Upcoming sessions
    const upcomingSessions = user.sessions
      .filter((s) => !s.completedAt && s.scheduledAt > new Date())
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        title: s.topic?.title || "Study Session",
        time: s.scheduledAt.toISOString(),
        durationMins: s.durationMins,
        type: s.type,
      }));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          xp: user.xp,
          level: currentLevel,
        },
        overallProgress,
        xp: user.xp,
        level: currentLevel,
        xpToNextLevel: nextLevelXp - user.xp,
        levelProgress,
        streak: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastActiveDate: streakData.lastActiveDate,
          totalActiveDays: streakData.totalActiveDays,
          freezesRemaining: streakData.freezesRemaining,
        },
        topicProgress,
        weakAreas,
        upcomingSessions,
        recentBadges: user.badges.map((ub) => ({
          id: ub.id,
          name: ub.badge.name,
          icon: ub.badge.icon,
          color: ub.badge.color,
          earnedAt: ub.earnedAt,
        })),
        weeklyGoal: {
          targetXp: 500,
          currentXp: weeklyXp,
          targetTopics: 3,
          completedTopics: user.progress.filter((p) => p.lastAccessedAt >= weekStart && (p.status === "COMPLETED" || p.status === "MASTERED")).length,
          targetMinutes: 180,
          completedMinutes: user.sessions.filter((s) => s.completedAt && s.completedAt >= weekStart).reduce((sum, s) => sum + s.durationMins, 0),
        },
        quizStats: {
          totalAttempts: totalQuizAttempts,
          averageScore: avgQuizScore,
          bestScore: bestQuizScore,
          questionsAnswered: quizAttempts.length,
          correctAnswers: correctQuizAttempts,
          currentStreak: currentQuizStreak,
        },
        examStats: {
          totalAttempts: completedExams.length,
          averagePercentage: avgExamPercentage,
          bestPercentage: bestExamPercentage,
          papersCompleted: completedExams.length,
          readinessScore: Math.min(100, avgExamPercentage + (overallProgress * 0.3)),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}