"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label" 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Brain,
  BookOpen,
  Target,
  Award,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, isSameDay, isBefore, isAfter } from "date-fns";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const sessionTypes = [
  { id: "LEARN", label: "Learn", icon: BookOpen, color: "blue" },
  { id: "PRACTICE", label: "Practice", icon: Brain, color: "purple" },
  { id: "QUIZ", label: "Quiz", icon: Award, color: "orange" },
  { id: "MOCK_EXAM", label: "Mock Exam", icon: Target, color: "red" },
  { id: "REVISION", label: "Revision", icon: Sparkles, color: "green" },
  { id: "FLASHCARDS", label: "Flashcards", icon: BookOpen, color: "cyan" },
];

const mockTopics = [
  { id: "1", title: "Renewable Energy Sources", unit: "U1", estimatedMins: 30 },
  { id: "2", title: "Solar Power Systems", unit: "U1", estimatedMins: 25 },
  { id: "3", title: "Wind & Hydro Power", unit: "U1", estimatedMins: 25 },
  { id: "4", title: "Isometric Drawing Basics", unit: "U2", estimatedMins: 35 },
  { id: "5", title: "Circles in Isometric", unit: "U2", estimatedMins: 30 },
  { id: "6", title: "Material Properties", unit: "U3", estimatedMins: 40 },
  { id: "7", title: "Tools & Equipment", unit: "U3", estimatedMins: 30 },
];

export default function PlannerPage() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [examDate, setExamDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [preferredDays, setPreferredDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const weekLabel = `${format(currentWeek, "MMM d")} - ${format(endOfWeek(currentWeek), "MMM d, yyyy")}`;

  useEffect(() => {
    // Load from localStorage or generate default
    const saved = localStorage.getItem("study-sessions");
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("study-sessions", JSON.stringify(sessions));
  }, [sessions]);

  const sessionsForDay = (date: Date) => {
    return sessions
      .filter((s) => isSameDay(new Date(s.date), date))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const totalMinutesForDay = (date: Date) => {
    return sessionsForDay(date).reduce((sum, s) => sum + s.duration, 0);
  };

  const handleAddSession = (date: Date) => {
    setEditingSession({
      id: `new-${Date.now()}`,
      date: date.toISOString(),
      time: "16:00",
      duration: 30,
      type: "LEARN",
      topicId: "",
      completed: false,
    });
  };

  const handleSaveSession = () => {
    if (!editingSession) return;
    const newSession = { ...editingSession };
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== editingSession.id);
      return [...filtered, newSession];
    });
    setEditingSession(null);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleGeneratePlan = () => {
    if (!examDate) return;
    const start = new Date();
    const end = new Date(examDate);
    const weeksDiff = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const hoursWeek = hoursPerWeek;
    const totalMinutes = hoursWeek * 60 * weeksDiff;
    const minutesPerWeek = hoursWeek * 60;

    const newSessions: Session[] = [];
    let topicIndex = 0;

    for (let w = 0; w < weeksDiff; w++) {
      const weekStart = addWeeks(startOfWeek(start), w);
      preferredDays.forEach((dayOffset) => {
        const day = addDays(weekStart, dayOffset);
        if (isAfter(day, end)) return;

        const topic = mockTopics[topicIndex % mockTopics.length];
        newSessions.push({
          id: `gen-${Date.now()}-${newSessions.length}`,
          date: day.toISOString(),
          time: "16:00",
          duration: 60,
          type: ["LEARN", "PRACTICE", "QUIZ", "REVISION"][newSessions.length % 4] as SessionType,
          topicId: topic.id,
          topicTitle: topic.title,
          completed: false,
        });
        topicIndex++;
      });
    }

    setSessions((prev) => [...prev.filter((s) => !s.id.startsWith("gen-")), ...newSessions]);
    setShowGenerator(false);
  };

  const weeklyStats = {
    totalMinutes: weekDays.reduce((sum, d) => sum + totalMinutesForDay(d), 0),
    completedSessions: sessions.filter((s) => weekDays.some((d) => isSameDay(new Date(s.date), d)) && s.completed).length,
    totalSessions: sessions.filter((s) => weekDays.some((d) => isSameDay(new Date(s.date), d))).length,
    topicsCovered: new Set(
      sessions
        .filter((s) => weekDays.some((d) => isSameDay(new Date(s.date), d)))
        .map((s) => s.topicId)
        .filter(Boolean)
    ).size,
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
            <p className="text-gray-600">Plan your NCE preparation schedule</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowGenerator(!showGenerator)}>
              <Brain className="h-4 w-4 mr-2" />
              AI Planner
            </Button>
            <Button onClick={() => handleAddSession(new Date())}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </div>
        </div>

        {/* AI Planner Modal */}
        {showGenerator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className="w-full max-w-md p-6 animate-fade-in">
              <CardHeader>
                <CardTitle>Generate Study Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Exam Date</Label>
                  <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="mt-1" min={format(new Date(), "yyyy-MM-dd")} />
                </div>
                <div>
                  <Label>Hours per Week</Label>
                  <Select value={hoursPerWeek.toString()} onValueChange={(v) => setHoursPerWeek(parseInt(v))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 8, 10, 12, 15, 20].map((h) => <SelectItem key={h} value={h.toString()}>{h} hours</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preferred Days</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {dayNames.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setPreferredDays((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm border-2 transition-colors",
                          preferredDays.includes(i) ? "border-primary bg-primary text-white" : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowGenerator(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleGeneratePlan} className="flex-1">Generate Plan</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="This Week" value={`${weeklyStats.totalMinutes} min`} icon={<Clock className="h-5 w-5 text-blue-600" />} subtitle={`${weeklyStats.completedSessions}/${weeklyStats.totalSessions} sessions`} />
          <StatCard title="Topics" value={`${weeklyStats.topicsCovered}`} icon={<BookOpen className="h-5 w-5 text-green-600" />} subtitle="Covered this week" />
          <StatCard title="Target" value={`${hoursPerWeek}h/week`} icon={<Target className="h-5 w-5 text-orange-600" />} subtitle={examDate ? `Exam: ${format(new Date(examDate), "MMM d")}` : "No exam date set"} />
          <StatCard title="Progress" value={`${sessions.filter(s => s.completed).length} done`} icon={<CheckCircle className="h-5 w-5 text-green-600" />} subtitle={`${sessions.length} total sessions`} />
        </div>

        {/* Weekly Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}><ChevronLeft className="h-5 w-5" /></Button>
              <CardTitle className="text-lg">{weekLabel}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}><ChevronRight className="h-5 w-5" /></Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(startOfWeek(new Date()))}>This Week</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Headers */}
              {days.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
              ))}
              {/* Days */}
              {weekDays.map((day) => {
                const daySessions = sessionsForDay(day);
                const isToday = isSameDay(day, new Date());
                const dayTotal = totalMinutesForDay(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative min-h-[120px] p-2 border rounded-lg bg-white transition-colors",
                      isToday ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("text-sm font-medium", isToday ? "text-primary" : "text-gray-900")}>
                      {format(day, "d")}
                      {isToday && <span className="ml-1 text-xs bg-primary text-white px-1 rounded">Today</span>}
                    </div>
                    {dayTotal > 0 && (
                      <div className="mt-1 text-xs text-gray-500">{dayTotal} min planned</div>
                    )}
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {daySessions.map((session) => (
                        <SessionBlock key={session.id} session={session} onClick={() => setEditingSession(session)} />
                      ))}
                    </div>
                    {daySessions.length === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs py-1"
                        onClick={() => handleAddSession(day)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Session Editor Modal */}
        {editingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className="w-full max-w-md p-6 animate-fade-in">
              <CardHeader>
                <CardTitle>{editingSession.id.startsWith("new") ? "New Session" : "Edit Session"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={format(new Date(editingSession.date), "yyyy-MM-dd")} onChange={(e) => setEditingSession({...editingSession, date: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={editingSession.time} onChange={(e) => setEditingSession({...editingSession, time: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={editingSession.duration} onChange={(e) => setEditingSession({...editingSession, duration: parseInt(e.target.value)})} className="mt-1" min={15} max={180} step={15} />
                </div>
                <div>
                  <Label>Session Type</Label>
                  <Select value={editingSession.type} onValueChange={(v) => setEditingSession({...editingSession, type: v as SessionType})}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sessionTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Topic (optional)</Label>
                  <Select value={editingSession.topicId || ""} onValueChange={(v) => setEditingSession({...editingSession, topicId: v || undefined, topicTitle: mockTopics.find(t => t.id === v)?.title})}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select topic..." /></SelectTrigger>
                    <SelectContent>
                      {mockTopics.map((t) => <SelectItem key={t.id} value={t.id}>{t.title} ({t.unit})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingSession(null)} className="flex-1">Cancel</Button>
                  <Button onClick={handleSaveSession} className="flex-1">Save</Button>
                </div>
                {!editingSession.id.startsWith("new") && (
                  <Button variant="destructive" onClick={() => { handleDeleteSession(editingSession.id); setEditingSession(null); }} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sessions
                .filter((s) => !s.completed && new Date(s.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 10)
                .map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: getTypeColor(session.type) }}>
                      {getTypeIcon(session.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{session.topicTitle || "Study Session"}</p>
                      <p className="text-sm text-gray-500">{format(new Date(session.date), "EEE, MMM d")} at {session.time} • {session.duration} min</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{session.type.toLowerCase()}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => setEditingSession(session)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleComplete(session.id)}>
                      {session.completed ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                ))}
              {sessions.filter((s) => !s.completed && new Date(s.date) >= new Date()).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming sessions. Plan your week!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string; value: string; icon: React.ReactNode; subtitle: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionBlock({ session, onClick }: { session: Session; onClick: () => void }) {
  const typeColors = {
    LEARN: "bg-blue-100 text-blue-700",
    PRACTICE: "bg-purple-100 text-purple-700",
    QUIZ: "bg-orange-100 text-orange-700",
    MOCK_EXAM: "bg-red-100 text-red-700",
    REVISION: "bg-green-100 text-green-700",
    FLASHCARDS: "bg-cyan-100 text-cyan-700",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 rounded text-xs transition-colors",
        session.completed ? "opacity-50 line-through" : "hover:bg-gray-100",
        typeColors[session.type]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{session.topicTitle || session.type}</span>
        {session.completed && <CheckCircle className="h-3 w-3" />}
      </div>
      <div className="flex items-center gap-1 text-[10px]">
        <span>{session.time}</span>
        <span>•</span>
        <span>{session.duration}min</span>
      </div>
    </button>
  );
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    LEARN: "#3b82f6",
    PRACTICE: "#a855f7",
    QUIZ: "#f97316",
    MOCK_EXAM: "#ef4444",
    REVISION: "#10b981",
    FLASHCARDS: "#06b6d4",
  };
  return colors[type] || "#64748b";
}

function getTypeIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    LEARN: <BookOpen className="h-5 w-5" />,
    PRACTICE: <Brain className="h-5 w-5" />,
    QUIZ: <Award className="h-5 w-5" />,
    MOCK_EXAM: <Target className="h-5 w-5" />,
    REVISION: <Sparkles className="h-5 w-5" />,
    FLASHCARDS: <BookOpen className="h-5 w-5" />,
  };
  return icons[type] || <BookOpen className="h-5 w-5" />;
}

interface Session {
  id: string;
  date: string;
  time: string;
  duration: number;
  type: "LEARN" | "PRACTICE" | "QUIZ" | "MOCK_EXAM" | "REVISION" | "FLASHCARDS";
  topicId?: string;
  topicTitle?: string;
  completed: boolean;
}

type SessionType = Session["type"];