"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Lightbulb,
  Download,
  Edit,
  Image,
  Calculator,
  Palette,
  Sparkles,
  Target,
  ChevronRight,
} from "lucide-react";

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: "drawing" | "calculation" | "design" | "labeling" | "explanation";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  expectedTimeMins: number;
  hints: string[];
  solution?: string;
}

interface PracticeExerciseProps {
  exercise: Exercise;
}

export function PracticeExercise({ exercise }: PracticeExerciseProps) {
  const [showHint, setShowHint] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getTypeIcon = () => {
    switch (exercise.type) {
      case "drawing": return <Image className="h-5 w-5" />;
      case "calculation": return <Calculator className="h-5 w-5" />;
      case "design": return <Palette className="h-5 w-5" />;
      case "labeling": return <Target className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (exercise.type) {
      case "drawing": return "blue";
      case "calculation": return "green";
      case "design": return "purple";
      case "labeling": return "orange";
      default: return "gray";
    }
  };

  const difficultyColors = {
    BEGINNER: "bg-green-100 text-green-700",
    INTERMEDIATE: "bg-yellow-100 text-yellow-700",
    ADVANCED: "bg-red-100 text-red-700",
  };

  const handleComplete = () => {
    setCompleted(true);
    // Award XP
  };

  return (
    <Card className={cn("border-2", completed ? "border-green-500" : "border-gray-200")}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", {
            "bg-blue-100 text-blue-600": exercise.type === "drawing",
            "bg-green-100 text-green-600": exercise.type === "calculation",
            "bg-purple-100 text-purple-600": exercise.type === "design",
            "bg-orange-100 text-orange-600": exercise.type === "labeling",
          })}>
            {getTypeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs capitalize">{exercise.type}</Badge>
              <Badge variant="secondary" className={difficultyColors[exercise.difficulty] + " text-xs"}>
                {exercise.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs"><Target className="h-3 w-3 mr-1" /> {exercise.expectedTimeMins} min</Badge>
            </div>
            <h4 className="font-semibold text-gray-900">{exercise.title}</h4>
          </div>
          {completed && <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none text-gray-700">
          {exercise.description}
        </div>

        {/* Workspace based on exercise type */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {exercise.type === "drawing" && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Sketch your design here:</p>
              <canvas
                ref={canvasRef}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-white cursor-crosshair"
                width={600}
                height={400}
              />
              <p className="text-xs text-gray-500 mt-2">Click and drag to draw. Use for rough sketches.</p>
            </div>
          )}

          {exercise.type === "calculation" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Work through your calculations:</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Show your working..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary"
                rows={6}
              />
            </div>
          )}

          {exercise.type === "design" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Describe your design solution:</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Materials, dimensions, features, sustainability considerations..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                rows={6}
              />
            </div>
          )}

          {exercise.type === "labeling" && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Label the diagram (visualize in your mind or draw on paper):</p>
              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Diagram would appear here</p>
                <p className="text-xs mt-1">Practice labeling on paper, then check solution</p>
              </div>
            </div>
          )}

          {exercise.type === "explanation" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Write your explanation:</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain in your own words..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                rows={6}
              />
            </div>
          )}
        </div>

        {/* Hints */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">Hints ({showHint}/{exercise.hints.length})</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(Math.min(showHint + 1, exercise.hints.length))}
              disabled={showHint >= exercise.hints.length}
            >
              {showHint === 0 ? "Show First Hint" : showHint < exercise.hints.length ? "Next Hint" : "All Shown"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {showHint > 0 && (
            <div className="space-y-2">
              {exercise.hints.slice(0, showHint).map((hint, i) => (
                <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 animate-slide-in-from-top">
                  <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 text-sm">Hint {i + 1}</p>
                    <p className="text-sm text-yellow-700">{hint}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solution */}
        {exercise.solution && showHint >= exercise.hints.length && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-800">Solution</p>
            </div>
            <p className="text-sm text-green-700">{exercise.solution}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
          {!completed ? (
            <Button onClick={handleComplete} className="flex-1 bg-gradient-to-r from-green-500 to-blue-500">
              <Sparkles className="h-4 w-4 mr-2" />
              Mark Complete +25 XP
            </Button>
          ) : (
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Completed! +25 XP earned</span>
            </div>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Save Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}