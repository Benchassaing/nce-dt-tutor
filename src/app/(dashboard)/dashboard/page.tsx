"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress, CircularProgress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Award,
  Target,
  Flame,
  TrendingUp,
  Brain,
  Zap,
  Star,
  Clock,
  Trophy,
  AlertTriangle,
  ChevronRight,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
, Calendar } from "lucide-react";
import Link from "next/link";

const units = [
  { code: "U1", title: "Green Design", color: "green", progress: 85, status: "completed" },
  { code: "U2", title: "Pictorial Projection", color: "blue", progress: 60, status: "in_progress" },
  { code: "U3", title: "Material Technology", color: "orange", progress: 40, status: "in_progress" },
  { code: "U4", title: "Electricity & Electronics", color: "yellow", progress: 20, status: "not_started" },
  { code: "U5", title: "Orthographic Projection", color: "red", progress: 0, status: "not_started" },
  { code: "U6", title: "Mechanisms", color: "purple", progress: 0, status: "not_started" },
  { code: "U7", title: "Pneumatics & Hydraulics", color: "cyan", progress: 0, status: "not_started" },
  { code: "U8", title: "Design Process", color: "pink", progress: 0, status: "not_started" },
];

const weakAreas = [
  { topic: "Isometric Drawing", unit: "U2", mastery: 35, lastScore: 45 },
  { topic: "Material Properties", unit: "U3", mastery: 42, lastScore: 50 },
  { topic: "Circuit Diagrams", unit: "U4", mastery: 28, lastScore: 35 },
  { topic: "Orthographic Views", unit: "U5", mastery: 15, lastScore: 20 },
];

const recentBadges = [
  { name: "First Steps", icon: "🌱", color: "green", earned: "2 days ago" },
  { name: "Green Designer", icon: "🌿", color: "green", earned: "1 day ago" },
  { name: "Week Warrior", icon: "🔥", color: "orange", earned: "Today" },
];

const upcomingSessions = [
  { title: "Pictorial Projection - Circles in Isometric", time: "Today, 4:00 PM", duration: "30 min", type: "LEARN" },
  { title: "Quiz: Material Properties", time: "Tomorrow, 10:00 AM", duration: "15 min", type: "QUIZ" },
  { title: "Mock Exam: Paper 2024", time: "Friday, 2:00 PM", duration: "90 min", type: "MOCK_EXAM" },
];

const quizStats = {
  totalAttempts: 24,
  averageScore: 78,
  bestScore: 95,
  questionsAnswered: 180,
  correctAnswers: 142,
  currentStreak: 5,
};

export default function DashboardPage() {
  const overallProgress = 38;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "in_progress": return "In Progress";
      default: return "Not Started";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Benoit! 👋</h1>
            <p className="text-gray-600 mt-1">You're 38% through the NCE Design & Technology curriculum. Keep going!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/learning">
              <Button className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600">
                <BookOpen className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Overall Progress"
            value={`${overallProgress}%`}
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
            trend={{ value: 12, label: "this week", positive: true }}
            progress={overallProgress}
          />
          <StatCard
            title="Current Level"
            value="Level 3"
            icon={<Star className="h-5 w-5 text-yellow-500" />}
            subtitle="1,250 / 1,900 XP"
            progress={65}
          />
          <StatCard
            title="Learning Streak"
            value="7 days"
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            trend={{ value: 7, label: "longest: 14 days", positive: false }}
          />
          <StatCard
            title="Quiz Average"
            value={`${quizStats.averageScore}%`}
            icon={<Brain className="h-5 w-5 text-purple-600" />}
            trend={{ value: 5, label: "improvement", positive: true }}
          />
          <StatCard
            title="Exam Readiness"
            value="42%"
            icon={<Target className="h-5 w-5 text-red-500" />}
            subtitle="Target: 80%+"
            progress={42}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Progress & Units */}
          <div className="lg:col-span-2 space-y-6">
            {/* Circular Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Overall Mastery</CardTitle>
                <Badge variant="outline" className="text-xs">Updated 2 hours ago</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center justify-center">
                    <CircularProgress
                      value={overallProgress}
                      size={160}
                      strokeWidth={12}
                      label={`${overallProgress}%`}
                    />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Level 3 • 1,250 XP</h3>
                    <p className="text-gray-600 mb-4">650 XP to Level 4</p>
                    <Progress value={65} className="w-full max-w-xs mx-auto md:mx-0" />
                    <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">8</div>
                        <div className="text-gray-500">Units</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">2</div>
                        <div className="text-gray-500">Completed</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">99</div>
                        <div className="text-gray-500">Topics Total</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unit Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Unit Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {units.map((unit, index) => (
                  <div key={unit.code} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("text-xs", {
                          "bg-green-50 text-green-700": unit.color === "green",
                          "bg-blue-50 text-blue-700": unit.color === "blue",
                          "bg-orange-50 text-orange-700": unit.color === "orange",
                          "bg-yellow-50 text-yellow-700": unit.color === "yellow",
                          "bg-red-50 text-red-700": unit.color === "red",
                          "bg-purple-50 text-purple-700": unit.color === "purple",
                          "bg-cyan-50 text-cyan-700": unit.color === "cyan",
                          "bg-pink-50 text-pink-700": unit.color === "pink",
                        })}>
                          {unit.code}
                        </Badge>
                        <span className="font-medium text-gray-900">{unit.title}</span>
                        {getStatusIcon(unit.status)}
                      </div>
                      <span className="text-sm font-medium text-gray-600">{unit.progress}%</span>
                    </div>
                    <Progress value={unit.progress} className="h-2" />
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>{getStatusLabel(unit.status)}</span>
                      <Link href={`/learning/${unit.code.toLowerCase()}`} className="text-primary hover:underline flex items-center gap-1">
                        Continue <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weak Areas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  <AlertTriangle className="h-5 w-5 inline mr-2 text-warning" />
                  Weak Areas - Focus Here!
                </CardTitle>
                <Badge variant="destructive">4 topics need attention</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weakAreas.map((area, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-warning/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Brain className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{area.topic}</p>
                            <p className="text-sm text-gray-500">{area.unit} • Last quiz: {area.lastScore}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-warning text-lg">{area.mastery}%</div>
                          <div className="text-xs text-gray-500">Mastery Score</div>
                        </div>
                      </div>
                      <Progress value={area.mastery} className="mt-3 h-1.5" />
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">Review recommended</Badge>
                        <Button variant="ghost" size="sm" className="text-primary">
                          Practice <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Badges, Sessions, Quick Actions */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Achievements</CardTitle>
                <Link href="/profile/badges" className="text-sm text-primary hover:underline">View all</Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentBadges.map((badge) => (
                  <div key={badge.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{badge.name}</p>
                      <p className="text-xs text-gray-500">Earned {badge.earned}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">New</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full justify-center">
                  View All 15 Badges <Trophy className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Study Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSessions.map((session, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", {
                      "bg-blue-100 text-blue-600": session.type === "LEARN",
                      "bg-purple-100 text-purple-600": session.type === "QUIZ",
                      "bg-red-100 text-red-600": session.type === "MOCK_EXAM",
                      "bg-green-100 text-green-600": session.type === "REVISION",
                    })}>
                      {session.type === "LEARN" && <BookOpen className="h-5 w-5" />}
                      {session.type === "QUIZ" && <Brain className="h-5 w-5" />}
                      {session.type === "MOCK_EXAM" && <Target className="h-5 w-5" />}
                      {session.type === "REVISION" && <Award className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{session.title}</p>
                      <p className="text-xs text-gray-500">{session.time} • {session.duration}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{session.type}</Badge>
                  </div>
                ))}
                <Button variant="ghost" className="w-full justify-center text-sm">
                  View Study Planner <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  icon={<BookOpen className="h-5 w-5" />}
                  label="Continue Learning"
                  href="/learning"
                  color="blue"
                />
                <QuickActionButton
                  icon={<Brain className="h-5 w-5" />}
                  label="Practice Quiz"
                  href="/quiz"
                  color="purple"
                />
                <QuickActionButton
                  icon={<Target className="h-5 w-5" />}
                  label="Mock Exam"
                  href="/exam/mock"
                  color="red"
                />
                <QuickActionButton
                  icon={<Award className="h-5 w-5" />}
                  label="Flashcards"
                  href="/revision/flashcards"
                  color="orange"
                />
                <QuickActionButton
                  icon={<Zap className="h-5 w-5" />}
                  label="Quick Revision"
                  href="/revision"
                  color="yellow"
                />
                <QuickActionButton
                  icon={<Calendar className="h-5 w-5" />}
                  label="Study Planner"
                  href="/planner"
                  color="green"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  progress,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string; positive: boolean };
  subtitle?: string;
  progress?: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.positive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span className={cn("text-xs font-medium", trend.positive ? "text-green-600" : "text-red-600")}>
                  +{trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-3 h-1.5" />
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  icon,
  label,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    red: "bg-red-50 text-red-700 hover:bg-red-100",
    orange: "bg-orange-50 text-orange-700 hover:bg-orange-100",
    yellow: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
    green: "bg-green-50 text-green-700 hover:bg-green-100",
  };

  return (
    <Link href={href}>
      <Button
        variant="outline"
        className={cn("h-20 flex-col gap-2 text-left p-4", colorClasses[color as keyof typeof colorClasses])}
      >
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClasses[color as keyof typeof colorClasses].replace("bg-", "bg-").replace("text-", "text-"))}>
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </Button>
    </Link>
  );
}