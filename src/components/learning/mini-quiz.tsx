"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANKS";
  options?: { choices?: string[] };
  correctAnswer: string;
  marks: number;
}

interface MiniQuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export function MiniQuiz({ questions, onComplete }: MiniQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const earnedMarks = questions
    .filter((q) => answers[q.id] === q.correctAnswer)
    .reduce((sum, q) => sum + q.marks, 0);

  useEffect(() => {
    if (!submitted && !showResults) {
      const interval = setInterval(() => setTimeSpent((t) => t + 1), 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
    return () => timer && clearInterval(timer);
  }, [submitted, showResults, currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));
  };

  const handleSubmit = () => {
    if (!answers[question.id]) return;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setSubmitted(true);
      timer && clearInterval(timer);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setTimeSpent(0);
  };

  if (showResults) {
    const percentage = Math.round((earnedMarks / totalMarks) * 100);
    return (
      <Card className="border-2 border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Award className="h-6 w-6" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <div className="text-4xl font-bold text-green-600">{earnedMarks} / {totalMarks}</div>
            <div className="text-2xl font-bold text-green-700 mt-1">{percentage}%</div>
            <div className="text-gray-600 mt-2">Time: {formatTime(timeSpent)}</div>
            <div className="text-green-600 font-medium mt-1">+{earnedMarks * 10} XP earned!</div>
          </div>

          <div className="space-y-3">
            {questions.map((q) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={q.id} className={cn("p-4 rounded-lg", isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200")}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className={cn("px-2 py-0.5 rounded text-xs", isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                        {!isCorrect && (
                          <span className="text-gray-600">Correct: {q.correctAnswer}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRetake} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={onComplete} className="bg-gradient-to-r from-green-500 to-blue-500 flex-1">
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTime(timeSpent)}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Badge variant="secondary" className="text-xs">
          {earnedMarks} / {totalMarks} marks
        </Badge>
      </div>

      {/* Question */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{question.type.replace("_", " ")}</Badge>
            <Badge variant="secondary" className="text-xs">{question.marks} mark{question.marks > 1 ? "s" : ""}</Badge>
          </div>
          <p className="text-lg font-medium text-gray-900 mt-2">{question.question}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          {question.type === "MULTIPLE_CHOICE" && (
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={handleAnswer}
              className="space-y-2"
            >
              {question.options?.choices?.map((choice, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer",
                    answers[question.id] === choice
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <RadioGroupItem value={choice} className="sr-only" />
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0",
                    answers[question.id] === choice
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  )}>
                    {answers[question.id] === choice && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm">{choice}</span>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === "TRUE_FALSE" && (
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={handleAnswer}
              className="flex gap-4"
            >
              {["True", "False"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all",
                    answers[question.id] === opt
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {opt}
                </button>
              ))}
            </RadioGroup>
          )}

          {question.type === "FILL_IN_BLANKS" && (
            <div>
              <Label htmlFor={`fill-${question.id}`} className="text-sm font-medium">
                Your answer:
              </Label>
              <Input
                id={`fill-${question.id}`}
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="mt-1"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {currentQuestion < questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={!answers[question.id]}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={!answers[question.id]} className="bg-gradient-to-r from-green-500 to-blue-500">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Finish Quiz
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}