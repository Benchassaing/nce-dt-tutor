import { prisma } from "@/lib/db";
import { addDays, addWeeks, startOfWeek, endOfWeek, format, isSameDay } from "date-fns";

interface PlannerInput {
  userId: string;
  examDate: Date;
  hoursPerWeek: number;
  preferredDays: number[];
}

interface GeneratedPlan {
  weeks: PlanWeek[];
  totalHours: number;
  topicsCovered: string[];
}

interface PlanWeek {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  days: PlanDay[];
  totalHours: number;
}

interface PlanDay {
  date: Date;
  dayOfWeek: number;
  sessions: PlanSession[];
  totalMinutes: number;
}

interface PlanSession {
  topicId?: string;
  topicTitle?: string;
  type: "LEARN" | "PRACTICE" | "QUIZ" | "MOCK_EXAM" | "REVISION" | "FLASHCARDS";
  durationMins: number;
  order: number;
  completed: boolean;
  completedAt?: Date;
}

const topicSequence = [
  { unit: "U1", topics: ["U1-T1", "U1-T2", "U1-T3", "U1-T4"], estimatedMins: [30, 25, 25, 20] },
  { unit: "U2", topics: ["U2-T1", "U2-T2", "U2-T3", "U2-T4", "U2-T5"], estimatedMins: [35, 30, 25, 30, 25] },
  { unit: "U3", topics: ["U3-T1", "U3-T2", "U3-T3", "U3-T4", "U3-T5", "U3-T6"], estimatedMins: [30, 25, 35, 30, 30, 25] },
  { unit: "U4", topics: ["U4-T1", "U4-T2", "U4-T3", "U4-T4"], estimatedMins: [30, 25, 30, 20] },
  { unit: "U5", topics: ["U5-T1", "U5-T2", "U5-T3", "U5-T4"], estimatedMins: [30, 35, 30, 35] },
  { unit: "U6", topics: ["U6-T1", "U6-T2", "U6-T3", "U6-T4", "U6-T5"], estimatedMins: [25, 30, 30, 30, 30] },
  { unit: "U7", topics: ["U7-T1", "U7-T2", "U7-T3", "U7-T4"], estimatedMins: [30, 35, 35, 25] },
  { unit: "U8", topics: ["U8-T1", "U8-T2", "U8-T3", "U8-T4", "U8-T5"], estimatedMins: [30, 30, 35, 30, 30] },
];

const sessionTypes: PlanSession["type"][] = ["LEARN", "PRACTICE", "QUIZ", "REVISION"];

export async function generateStudyPlan(input: PlannerInput): Promise<GeneratedPlan> {
  const { examDate, hoursPerWeek, preferredDays } = input;
  const startDate = new Date();
  const endDate = new Date(examDate);

  if (startDate >= endDate) {
    throw new Error("Exam date must be in the future");
  }

  // Calculate weeks
  const weeksDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const totalMinutes = hoursPerWeek * 60 * weeksDiff;

  // Get topic details
  const allTopics = await prisma.topic.findMany({
    where: { code: { in: topicSequence.flatMap((u) => u.topics) } },
    include: { unit: true },
  });

  const topicMap = new Map(allTopics.map((t) => [t.code, t]));

  // Build sequence
  let topicIndex = 0;
  const weeks: PlanWeek[] = [];

  for (let weekNum = 1; weekNum <= weeksDiff; weekNum++) {
    const weekStart = addWeeks(startOfWeek(startDate), weekNum - 1);
    const weekEnd = endOfWeek(weekStart);

    const days: PlanDay[] = [];
    let weekTotalMinutes = 0;

    for (const dayOffset of preferredDays) {
      const dayDate = addDays(weekStart, dayOffset);
      if (dayDate > endDate) break;

      const dayTotalMinutes = Math.floor((hoursPerWeek * 60) / preferredDays.length);
      const sessions: PlanSession[] = [];
      let remainingMinutes = dayTotalMinutes;

      // Distribute minutes across sessions (max 60 min per session)
      while (remainingMinutes > 0 && topicIndex < topicSequence.flatMap((u) => u.topics).length) {
        const flatTopics = topicSequence.flatMap((u) => u.topics);
        const flatEstimated = topicSequence.flatMap((u) => u.estimatedMins);

        if (topicIndex >= flatTopics.length) break;

        const topicCode = flatTopics[topicIndex];
        const estimatedMins = flatEstimated[topicIndex];
        const topic = topicMap.get(topicCode);

        if (!topic) {
          topicIndex++;
          continue;
        }

        const sessionDuration = Math.min(60, estimatedMins, remainingMinutes);
        const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];

        sessions.push({
          topicId: topic.id,
          topicTitle: topic.title,
          type: sessionType,
          durationMins: sessionDuration,
          order: sessions.length + 1,
          completed: false,
        });

        remainingMinutes -= sessionDuration;
        weekTotalMinutes += sessionDuration;
        topicIndex++;
      }

      // Add revision session if time permits
      if (remainingMinutes >= 15 && sessions.length > 0) {
        sessions.push({
          topicId: sessions[sessions.length - 1].topicId,
          topicTitle: `Revision: ${sessions[sessions.length - 1].topicTitle}`,
          type: "REVISION",
          durationMins: Math.min(15, remainingMinutes),
          order: sessions.length + 1,
          completed: false,
        });
        weekTotalMinutes += Math.min(15, remainingMinutes);
      }

      days.push({
        date: dayDate,
        dayOfWeek: dayOffset,
        sessions,
        totalMinutes: dayTotalMinutes - remainingMinutes,
      });
    }

    weeks.push({
      weekNumber: weekNum,
      startDate: weekStart,
      endDate: weekEnd,
      days,
      totalHours: Math.round(weekTotalMinutes / 60 * 10) / 10,
    });
  }

  const topicsCovered = topicSequence.flatMap((u) => u.topics).slice(0, topicIndex);

  return {
    weeks,
    totalHours: Math.round(totalMinutes / 60),
    topicsCovered,
  };
}

export function getUpcomingSessions(userId: string, days: number = 7) {
  // This would be called from a server component
  return prisma.studySession.findMany({
    where: {
      userId,
      completedAt: null,
      scheduledAt: {
        gte: new Date(),
        lte: addDays(new Date(), days),
      },
    },
    include: { topic: true },
    orderBy: { scheduledAt: "asc" },
    take: 20,
  });
}

export function formatPlanForCalendar(plan: GeneratedPlan) {
  return plan.weeks.flatMap((week) =>
    week.days.flatMap((day) =>
      day.sessions.map((session) => ({
        title: session.topicTitle || session.type,
        start: day.date.toISOString(),
        duration: session.durationMins,
        type: session.type,
        topicId: session.topicId,
      }))
    )
  );
}