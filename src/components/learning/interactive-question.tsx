"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  ChevronDown,
  Check,
  X,
  Sparkles,
  Target,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MATCH_THE_FOLLOWING" | "FILL_IN_BLANKS";
  options?: {
    choices?: string[];
    leftColumn?: { id: string; content: string }[];
    rightColumn?: { id: string; content: string }[];
    blanks?: number;
    wordBank?: string[];
  };
  correctAnswer: string | Record<string, string>;
  hint: string;
  explanation: string;
}

interface InteractiveQuestionProps {
  question: Question;
}

export function InteractiveQuestion({ question }: InteractiveQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | Record<string, string>>("");
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!selectedAnswer && selectedAnswer !== "") return;
    setSubmitted(true);
    const correct = checkAnswer(selectedAnswer, question.correctAnswer);
    setIsCorrect(correct);
  };

  const checkAnswer = (user: string | Record<string, string>, correct: string | Record<string, string>): boolean => {
    if (typeof user === "string" && typeof correct === "string") {
      return user.trim().toLowerCase() === correct.trim().toLowerCase();
    }
    if (typeof user === "object" && typeof correct === "object") {
      return JSON.stringify(user) === JSON.stringify(correct);
    }
    return false;
  };

  const handleReset = () => {
    setSelectedAnswer("");
    setSubmitted(false);
    setShowHint(false);
    setIsCorrect(false);
  };

  const renderOptions = () => {
    switch (question.type) {
      case "MULTIPLE_CHOICE":
        return (
          <RadioGroup value={selectedAnswer as string} onValueChange={setSelectedAnswer} className="space-y-2">
            {question.options?.choices?.map((choice, i) => (
              <div
                key={i}
                className={cn(
                  "relative flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer",
                  selectedAnswer === choice
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300",
                  submitted &&
                    choice === question.correctAnswer &&
                    "border-green-500 bg-green-50",
                  submitted &&
                    selectedAnswer === choice &&
                    selectedAnswer !== question.correctAnswer &&
                    "border-red-500 bg-red-50"
                )}
              >
                <RadioGroupItem value={choice} className="sr-only" />
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0",
                  selectedAnswer === choice
                    ? "border-primary bg-primary"
                    : "border-gray-300",
                  submitted &&
                    choice === question.correctAnswer &&
                    "border-green-500 bg-green-500",
                  submitted &&
                    selectedAnswer === choice &&
                    selectedAnswer !== question.correctAnswer &&
                    "border-red-500 bg-red-500"
                )}>
                  {selectedAnswer === choice && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm">{choice}</span>
                {submitted && choice === question.correctAnswer && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                )}
                {submitted && selectedAnswer === choice && selectedAnswer !== question.correctAnswer && (
                  <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                )}
              </div>
            ))}
          </RadioGroup>
        );

      case "TRUE_FALSE":
        return (
          <RadioGroup value={selectedAnswer as string} onValueChange={setSelectedAnswer} className="flex gap-4">
            {["True", "False"].map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedAnswer(opt)}
                disabled={submitted}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all",
                  selectedAnswer === opt
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 hover:border-gray-300",
                  submitted &&
                    opt === question.correctAnswer &&
                    "border-green-500 bg-green-50 text-green-700",
                  submitted &&
                    selectedAnswer === opt &&
                    selectedAnswer !== question.correctAnswer &&
                    "border-red-500 bg-red-50 text-red-700"
                )}
              >
                {opt}
                {submitted && opt === question.correctAnswer && <CheckCircle className="h-4 w-4 ml-2 text-green-600" />}
                {submitted && selectedAnswer === opt && selectedAnswer !== question.correctAnswer && <XCircle className="h-4 w-4 ml-2 text-red-600" />}
              </button>
            ))}
          </RadioGroup>
        );

      case "FILL_IN_BLANKS":
        return (
          <div className="space-y-2">
            {question.options?.wordBank && question.options.wordBank.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-gray-500 mr-2">Word bank:</span>
                {question.options.wordBank.map((word) => (
                  <Badge key={word} variant="outline" className="text-xs">{word}</Badge>
                ))}
              </div>
            )}
            <Input
              value={selectedAnswer as string}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={submitted}
              className={cn(
                submitted && selectedAnswer === question.correctAnswer && "border-green-500 bg-green-50",
                submitted && selectedAnswer !== question.correctAnswer && "border-red-500 bg-red-50"
              )}
            />
          </div>
        );

      case "MATCH_THE_FOLLOWING":
        return (
          <div className="space-y-3">
            {question.options?.leftColumn?.map((left) => (
              <div key={left.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900 min-w-[150px]">{left.content}</span>
                <Select
                  value={(selectedAnswer as Record<string, string>)[left.id] || ""}
                  onValueChange={(val) => setSelectedAnswer({ ...(selectedAnswer as Record<string, string>), [left.id]: val })}
                  disabled={submitted}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Match..." />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options?.rightColumn?.map((right) => (
                      <SelectItem key={right.id} value={right.id}>
                        {right.content}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {submitted && (selectedAnswer as Record<string, string>)[left.id] === question.correctAnswer[left.id] && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                )}
                {submitted && (selectedAnswer as Record<string, string>)[left.id] !== question.correctAnswer[left.id] && (
                  <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("border-2", submitted && isCorrect ? "border-green-500" : submitted && !isCorrect ? "border-red-500" : "border-gray-200")}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", {
            "bg-primary/10 text-primary": question.type === "MULTIPLE_CHOICE",
            "bg-blue/10 text-blue": question.type === "TRUE_FALSE",
            "bg-purple/10 text-purple": question.type === "MATCH_THE_FOLLOWING",
            "bg-orange/10 text-orange": question.type === "FILL_IN_BLANKS",
          })}>
            <Target className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="text-xs mb-1">{question.type.replace("_", " ")}</Badge>
            <p className="font-medium text-gray-900">{question.question}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="pt-2">{renderOptions()}</div>

        <div className="flex items-center gap-3">
          <Button
            variant={submitted ? "secondary" : "outline"}
            onClick={handleSubmit}
            disabled={submitted || !selectedAnswer && selectedAnswer !== ""}
            className="flex-1 sm:flex-none"
          >
            {submitted ? "Submitted" : "Submit Answer"}
          </Button>
          {!submitted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHint(!showHint)}
              className={showHint ? "text-primary" : "text-gray-400"}
            >
              <Lightbulb className="h-5 w-5" />
            </Button>
          )}
          {submitted && (
            <Button variant="ghost" onClick={handleReset} className="text-gray-500">
              Try Again
            </Button>
          )}
        </div>

        {showHint && !submitted && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Hint</p>
              <p className="text-sm text-yellow-700">{question.hint}</p>
            </div>
          </div>
        )}

        {submitted && (
          <div className={cn("p-4 rounded-lg", isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200")}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <div>
                <p className={cn("font-medium", isCorrect ? "text-green-800" : "text-red-800")}>
                  {isCorrect ? "Correct! Well done! 🎉" : "Not quite right. Let's learn from this."}
                </p>
                <p className="text-sm mt-1 text-gray-700">{question.explanation}</p>
                {!isCorrect && (
                  <p className="text-xs text-gray-500 mt-2">The correct answer: <strong>{typeof question.correctAnswer === "string" ? question.correctAnswer : JSON.stringify(question.correctAnswer)}</strong></p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}