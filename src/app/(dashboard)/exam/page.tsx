"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  Target,
  Award,
  Play,
  Pause,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Settings,
  Brain,
  Zap,
} from "lucide-react";
import Link from "next/link";

const pastPapers = [
  { id: "2025", year: 2025, title: "NCE 2025 Technology Studies Component 1", duration: 90, marks: 80, questions: 8, status: "available" },
  { id: "2024", year: 2024, title: "NCE 2024 Technology Studies Design & Tech", duration: 90, marks: 80, questions: 8, status: "available" },
  { id: "2023", year: 2023, title: "NCE 2023 Technology Studies Component 1", duration: 90, marks: 80, questions: 8, status: "available" },
];

const mockExams = [
  { id: "mock-1", title: "Full Mock Exam #1", description: "Complete NCE-style paper with all sections", duration: 90, marks: 100, questions: 15, difficulty: "Mixed" },
  { id: "mock-2", title: "Topic-Focused Mock: Materials", description: "Questions from Units 1-3 only", duration: 45, marks: 50, questions: 8, difficulty: "INTERMEDIATE" },
  { id: "mock-3", title: "Quick Practice Mock", description: "Short version for quick revision", duration: 30, marks: 30, questions: 5, difficulty: "BEGINNER" },
];

export default function ExamPage() {
  const [activeTab, setActiveTab] = useState("past-papers");
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(90 * 60);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const mockQuestions = [
    {
      id: "q1",
      number: 1,
      section: "A",
      marks: 5,
      type: "MULTIPLE_CHOICE",
      question: "Which one of the following tools is a coping saw?",
      options: { choices: ["Tool A (image)", "Tool B (image)", "Tool C (image)", "Tool D (image)"] },
    },
    {
      id: "q2",
      number: 2,
      section: "A",
      marks: 5,
      type: "TRUE_FALSE",
      question: "Put a tick in the appropriate column to indicate whether the statements are True or False.",
      statements: [
        { id: "a", text: "Compasses are used to draw circles." },
        { id: "b", text: "A try square is used to draw perpendicular lines on metals." },
        { id: "c", text: "Bamboo stems and fibres are examples of eco materials." },
        { id: "d", text: "Hardwood trees have needle-like leaves." },
        { id: "e", text: "Copper is a good conductor of electricity." },
      ],
    },
    {
      id: "q3",
      number: 3,
      section: "A",
      marks: 5,
      type: "FILL_IN_BLANKS",
      question: "Fill in the blanks with the appropriate word(s) from the list given below.",
      blanks: [
        "_______ decay naturally.",
        "_______ is used to make cooking foil.",
        "_______ is an expensive timber.",
        "_______ rusts easily.",
        "_______ are used to cut sheet metals.",
      ],
      wordBank: ["Biodegradable materials", "Aluminium", "Teak", "Mild steel", "Snips"],
    },
  ];

  useEffect(() => {
    if (examStarted && !submitted && timeRemaining > 0) {
      const interval = setInterval(() => setTimeRemaining((t) => t - 1), 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
    if (timeRemaining === 0 && examStarted && !submitted) {
      handleSubmit();
    }
    return () => timer && clearInterval(timer);
  }, [examStarted, submitted, timeRemaining]);

  const handleStartExam = (paperId: string) => {
    setSelectedPaper(paperId);
    setExamStarted(true);
    setTimeRemaining(pastPapers.find(p => p.id === paperId)?.duration * 60 || 90 * 60);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
    timer && clearInterval(timer);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setTimeRemaining(selectedPaper ? pastPapers.find(p => p.id === selectedPaper)?.duration * 60 || 90 * 60 : 90 * 60);
  };

  const handleExit = () => {
    setExamStarted(false);
    setSelectedPaper(null);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    timer && clearInterval(timer);
  };

  if (examStarted) {
    const question = mockQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Exam Header */}
          <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleExit}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <p className="font-semibold text-gray-900">{selectedPaper ? pastPapers.find(p => p.id === selectedPaper)?.title : "Mock Exam"}</p>
                <p className="text-sm text-gray-500">Section {question.section} • Question {question.number} of {mockQuestions.length}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-4 px-4 py-2 rounded-lg text-xl font-mono font-bold", timeRemaining < 60 ? "bg-red-100 text-red-700 animate-pulse" : "bg-primary/10 text-primary")}>
              <Clock className="h-5 w-5" /> {formatTime(timeRemaining)}
            </div>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-40 h-2" />
              <span className="text-sm text-gray-500">{answeredCount}/{mockQuestions.length} answered</span>
            </div>
          </div>

          {/* Question */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">Section {question.section}</Badge>
                <Badge variant="secondary" className="text-xs">{question.marks} marks</Badge>
                <Badge variant="outline" className="text-xs">{question.type.replace("_", " ")}</Badge>
              </div>
              <p className="text-lg font-medium text-gray-900">{question.question}</p>
            </CardHeader>
            <CardContent>
              {question.type === "MULTIPLE_CHOICE" && question.options?.choices && (
                <div className="space-y-2">
                  {question.options.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(question.id, choice)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border-2 transition-all",
                        answers[question.id] === choice
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                      {choice}
                      {answers[question.id] === choice && <CheckCircle className="h-5 w-5 text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              )}

              {question.type === "TRUE_FALSE" && question.statements && (
                <div className="space-y-3">
                  {question.statements.map((stmt, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2">{stmt.text}</p>
                      <div className="flex gap-4">
                        {["True", "False"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleAnswer(`${question.id}-${stmt.id}`, opt)}
                            className={cn(
                              "flex-1 py-2 px-4 rounded-lg border-2 font-medium",
                              answers[`${question.id}-${stmt.id}`] === opt
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "FILL_IN_BLANKS" && question.blanks && (
                <div className="space-y-3">
                  {question.wordBank && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800 mr-2">Word Bank:</span>
                      {question.wordBank.map((word) => (
                        <Badge key={word} variant="secondary" className="text-xs">{word}</Badge>
                      ))}
                    </div>
                  )}
                  {question.blanks.map((blank, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-gray-500 w-8 text-right">{i + 1}.</span>
                      <span className="flex-1 text-gray-700">{blank.replace("_______", "").trim()}</span>
                      <Input
                        value={answers[`${question.id}-${i}`] || ""}
                        onChange={(e) => handleAnswer(`${question.id}-${i}`, e.target.value)}
                        placeholder="Your answer..."
                        className="w-64"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentQuestion === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-2">
              {mockQuestions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                    i === currentQuestion
                      ? "bg-primary text-white"
                      : answers[`q${i + 1}`] || (i < currentQuestion ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              onClick={currentQuestion < mockQuestions.length - 1 ? handleNext : handleSubmit}
              disabled={!answers[question.id] && question.type !== "FILL_IN_BLANKS"}
              className={currentQuestion === mockQuestions.length - 1 ? "bg-gradient-to-r from-green-500 to-blue-500" : ""}
            >
              {currentQuestion === mockQuestions.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Exam
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {showResults && (
            <ExamResults
              questions={mockQuestions}
              answers={answers}
              onRetake={handleRetake}
              onExit={handleExit}
              timeSpent={selectedPaper ? (pastPapers.find(p => p.id === selectedPaper)?.duration * 60 || 5400) - timeRemaining : 0}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam Preparation</h1>
            <p className="text-gray-600">Practice with past papers and mock exams</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Exam Settings
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Past Papers" value="3" icon={<FileText className="h-5 w-5 text-blue-600" />} subtitle="2023, 2024, 2025" />
          <StatCard title="Mock Exams" value="3" icon={<Brain className="h-5 w-5 text-purple-600" />} subtitle="AI-generated" />
          <StatCard title="Completed" value="0" icon={<CheckCircle className="h-5 w-5 text-green-600" />} subtitle="Start your first!" />
          <StatCard title="Avg Score" value="—" icon={<Target className="h-5 w-5 text-orange-600" />} subtitle="No attempts yet" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="past-papers">
              <FileText className="h-4 w-4 mr-2" />
              Past Papers
            </TabsTrigger>
            <TabsTrigger value="mock-exams">
              <Zap className="h-4 w-4 mr-2" />
              Mock Exams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="past-papers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastPapers.map((paper) => (
                <ExamPaperCard paper={paper} onStart={handleStartExam} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mock-exams" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockExams.map((exam) => (
                <MockExamCard exam={exam} onStart={handleStartExam} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Exam Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <TipCard title="Read Questions Carefully", description="NCE questions often have multiple parts. Underline key words like 'sketch', 'explain', 'calculate'.", icon={<FileText className="h-5 w-5" />} />
              <TipCard title="Time Management", description="90 minutes for ~80 marks = ~1 min/mark. Don't spend 10 minutes on a 3-mark question!", icon={<Clock className="h-5 w-5" />} />
              <TipCard title="Show Working", description="For calculations, always show steps. Partial marks are awarded for correct method even if final answer is wrong.", icon={<Brain className="h-5 w-5" />} />
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

function ExamPaperCard({ paper, onStart }: { paper: typeof pastPapers[0]; onStart: (id: string) => void }) {
  return (
    <Card className="card-hover h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">Component 1</Badge>
          <Badge variant={paper.status === "available" ? "success" : "secondary"} className="text-xs">
            {paper.status}
          </Badge>
        </div>
        <CardTitle>{paper.year}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{paper.title}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {paper.duration} min</span>
          <span className="flex items-center gap-1"><Target className="h-4 w-4" /> {paper.marks} marks</span>
          <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {paper.questions} Qs</span>
        </div>
        <Button className="w-full" onClick={() => onStart(paper.id)}>
          <Play className="h-4 w-4 mr-2" />
          Start Practice
        </Button>
      </CardContent>
    </Card>
  );
}

function MockExamCard({ exam, onStart }: { exam: typeof mockExams[0]; onStart: (id: string) => void }) {
  return (
    <Card className="card-hover h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{exam.difficulty}</Badge>
          <Badge variant="secondary" className="text-xs">AI Generated</Badge>
        </div>
        <CardTitle>{exam.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{exam.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {exam.duration} min</span>
          <span className="flex items-center gap-1"><Target className="h-4 w-4" /> {exam.marks} marks</span>
          <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {exam.questions} Qs</span>
        </div>
        <Button className="w-full" onClick={() => onStart(exam.id)}>
          <Play className="h-4 w-4 mr-2" />
          Start Mock Exam
        </Button>
      </CardContent>
    </Card>
  );
}

function TipCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary">
        {icon}
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function ExamResults({
  questions,
  answers,
  onRetake,
  onExit,
  timeSpent,
}: {
  questions: typeof mockQuestions;
  answers: Record<string, string>;
  onRetake: () => void;
  onExit: () => void;
  timeSpent: number;
}) {
  // Simplified results calculation
  let correct = 0;
  let totalMarks = 0;
  let earnedMarks = 0;

  questions.forEach((q) => {
    totalMarks += q.marks;
    // Simplified grading
    if (answers[q.id]) {
      correct++;
      earnedMarks += q.marks;
    }
  });

  const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Exam Complete!</h2>
            <Button variant="ghost" size="icon" onClick={onExit}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-4 text-center">
            <div className={cn("text-5xl font-bold mx-auto mb-2", percentage >= 70 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600")}>
              {earnedMarks} / {totalMarks} ({percentage}%)
            </div>
            <p className="text-gray-600">Time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</p>
            <p className="text-green-600 font-medium mt-1">+{earnedMarks * 10} XP earned!</p>
          </div>
        </div>
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isCorrect = !!userAnswer; // Simplified
            return (
              <div key={q.id} className={cn("p-4 rounded-lg", isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200")}>
                <div className="flex items-start gap-3">
                  {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Q{q.number} ({q.marks} marks)</p>
                    <p className="text-sm text-gray-700 mt-1">{q.question}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Badge variant={isCorrect ? "success" : "destructive"}>
                        {isCorrect ? "Correct" : "Missed"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-6 border-t flex gap-3">
          <Button variant="outline" onClick={onRetake} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retake Exam
          </Button>
          <Button onClick={onExit} className="flex-1 bg-gradient-to-r from-green-500 to-blue-500">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}