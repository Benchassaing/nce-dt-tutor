"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Brain,
  Zap,
  CheckCircle,
  ChevronRight,
  Send,
  Mic,
  Volume2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Lightbulb,
  Target,
  Award,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { TutorChat } from "@/components/learning/tutor-chat";
import { InteractiveQuestion } from "@/components/learning/interactive-question";
import { PracticeExercise } from "@/components/learning/practice-exercise";
import { MiniQuiz } from "@/components/learning/mini-quiz";
import { SummaryPanel } from "@/components/learning/summary-panel";

const learningSteps = [
  { id: "learn", label: "Learn", icon: BookOpen, description: "Simple explanation with examples" },
  { id: "understand", label: "Understand", icon: Brain, description: "Interactive questions to check comprehension" },
  { id: "practice", label: "Practice", icon: Zap, description: "Hands-on exercises and problems" },
  { id: "check", label: "Check", icon: Target, description: "Mini-quiz with immediate feedback" },
  { id: "summary", label: "Summary", icon: Award, description: "Key revision notes for exams" },
];

const mockLessonContent = {
  learn: {
    title: "Green Design - Renewable Energy in Mauritius",
    content: `### Learn: Renewable Energy Sources in Mauritius 🌴

Mauritius is a beautiful island nation in the Indian Ocean. Like many islands, we face unique challenges with energy. **Let's explore how we can power our future sustainably!**

#### What is Green Design? 🌱
Green Design means creating products, buildings, and systems that are environmentally friendly. It's about **meeting our needs today without compromising the ability of future generations to meet theirs.**

#### Renewable Energy in Mauritius ☀️💨🌊

**1. Solar Energy** - Mauritius gets plenty of sunshine! ☀️
- Solar panels convert sunlight into electricity
- Many hotels and homes now use solar water heaters
- Our tropical climate makes solar very effective

**2. Wind Energy** - The trade winds blow steadily 💨
- Wind turbines generate electricity from wind motion
- Best locations: coastal areas and high ground
- Example: The Curepipe wind farm project

**3. Hydroelectric Power** - Using our rivers 🌊
- Dams store water and release it through turbines
- Mauritius has several hydroelectric stations:
  - Tamarind Falls (Tamarin)
  - Cascade Cébaud (Central Plateau)
  - Ferney (East)

**4. Bagasse (Sugar Cane Waste)** - Our local biomass! 🎋
- After crushing sugar cane, the fibrous residue (bagasse) is burned
- Produces both electricity and heat for sugar factories
- Supplies ~15% of Mauritius' electricity!

#### Did You Know? 💡
- Mauritius aims for **60% renewable energy by 2030**
- The **Central Electricity Board (CEB)** manages our power grid
- **Energy efficiency** is just as important as renewable generation!

#### Key Terms to Remember 📝
- **Renewable**: Naturally replenished (sun, wind, water)
- **Non-renewable**: Finite resources (coal, oil, gas)
- **Carbon footprint**: CO₂ emissions from energy use
- **Sustainability**: Meeting present needs without harming future`,
    keyPoints: [
      "Mauritius has 4 main renewable sources: Solar, Wind, Hydro, Bagasse",
      "Bagasse from sugar cane provides ~15% of electricity",
      "Target: 60% renewable by 2030",
      "Green Design = Sustainable + Efficient + Eco-friendly",
    ],
  },
  understand: {
    questions: [
      {
        id: "q1",
        question: "Which of the following is NOT a renewable energy source used in Mauritius?",
        type: "MULTIPLE_CHOICE",
        options: ["Solar panels", "Bagasse (sugar cane waste)", "Coal power plant", "Wind turbines"],
        correctAnswer: "Coal power plant",
        hint: "Think about which source cannot be naturally replenished.",
        explanation: "Coal is a fossil fuel - it's finite and non-renewable. Mauritius uses solar, wind, hydro, and bagasse (biomass) as renewable sources.",
      },
      {
        id: "q2",
        question: "True or False: Bagasse is the fibrous waste left after crushing sugar cane.",
        type: "TRUE_FALSE",
        correctAnswer: true,
        hint: "Remember what happens to sugar cane after juice extraction.",
        explanation: "Correct! Bagasse is the dry pulpy residue left after extracting juice from sugar cane. It's burned to generate electricity and heat.",
      },
      {
        id: "q3",
        question: "Match the renewable source to its Mauritius example:",
        type: "MATCH_THE_FOLLOWING",
        leftColumn: [
          { id: "a", content: "Solar" },
          { id: "b", content: "Wind" },
          { id: "c", content: "Hydro" },
          { id: "d", content: "Bagasse" },
        ],
        rightColumn: [
          { id: "1", content: "Tamarind Falls power station" },
          { id: "2", content: "Solar water heaters on roofs" },
          { id: "3", content: "Curepipe wind farm" },
          { id: "4", content: "Sugar factory power generation" },
        ],
        correctAnswer: { a: "2", b: "3", c: "1", d: "4" },
        hint: "Match each energy type to its local application.",
        explanation: "Solar→water heaters, Wind→Curepipe farm, Hydro→Tamarind Falls, Bagasse→sugar factories.",
      },
    ],
  },
  practice: {
    exercises: [
      {
        id: "ex1",
        title: "Calculate Your Carbon Footprint",
        description: "Estimate the CO₂ emissions from your household electricity use. Use the formula: kWh × 0.85 kg CO₂/kWh (Mauritius grid average).",
        type: "calculation",
        difficulty: "BEGINNER",
        expectedTimeMins: 10,
        hints: ["Check your latest electricity bill for kWh usage", "Multiply by 0.85", "Compare to Mauritius average of ~150 kWh/month"],
        solution: "Example: 200 kWh × 0.85 = 170 kg CO₂/month",
      },
      {
        id: "ex2",
        title: "Design a Solar-Powered Phone Charger",
        description: "Sketch a simple circuit diagram for a solar phone charger. Include: solar panel, voltage regulator, battery, USB output.",
        type: "drawing",
        difficulty: "INTERMEDIATE",
        expectedTimeMins: 15,
        hints: ["Solar panel → 5V regulator → Battery → USB", "Add a blocking diode to prevent reverse current", "Consider Mauritius sunlight hours (6-8 hrs/day)"],
      },
      {
        id: "ex3",
        title: "Energy Audit: Your Home",
        description: "Walk through your home and list 5 appliances. For each, note: power rating (Watts), hours used daily, and whether it could use renewable energy.",
        type: "design",
        difficulty: "BEGINNER",
        expectedTimeMins: 20,
        hints: ["Check appliance labels for Watts", "Calculate daily Wh = Watts × Hours", "Think: Solar water heater? Solar lights?"],
      },
    ],
  },
  check: {
    quiz: [
      {
        id: "cq1",
        question: "What percentage of Mauritius' electricity comes from bagasse?",
        type: "MULTIPLE_CHOICE",
        options: ["5%", "15%", "25%", "35%"],
        correctAnswer: "15%",
        marks: 1,
      },
      {
        id: "cq2",
        question: "Which renewable source relies on Mauritius' trade winds?",
        type: "MULTIPLE_CHOICE",
        options: ["Solar", "Wind", "Hydro", "Bagasse"],
        correctAnswer: "Wind",
        marks: 1,
      },
      {
        id: "cq3",
        question: "TRUE or FALSE: Hydroelectric power stations convert potential energy of stored water into electrical energy.",
        type: "TRUE_FALSE",
        correctAnswer: true,
        marks: 1,
      },
      {
        id: "cq4",
        question: "Fill in the blank: The ________ is the fibrous residue left after crushing sugar cane, used as biomass fuel.",
        type: "FILL_IN_BLANKS",
        correctAnswer: "bagasse",
        marks: 1,
      },
      {
        id: "cq5",
        question: "Mauritius' target for renewable energy by 2030 is ______%.",
        type: "FILL_IN_BLANKS",
        correctAnswer: "60",
        marks: 1,
      },
    ],
  },
  summary: {
    keyPoints: [
      "Green Design focuses on sustainability and environmental responsibility",
      "Mauritius has 4 main renewable energy sources: Solar, Wind, Hydro, Bagasse",
      "Bagasse (sugar cane waste) provides ~15% of Mauritius' electricity",
      "Solar water heaters are widely used across the island",
      "Hydroelectric stations: Tamarind Falls, Cascade Cébaud, Ferney",
      "Wind energy potential at Curepipe and coastal areas",
      "National target: 60% renewable energy by 2030",
      "Energy efficiency is as important as renewable generation",
    ],
    keyTerms: [
      { term: "Renewable Energy", definition: "Energy from sources that naturally replenish (sun, wind, water, biomass)" },
      { term: "Bagasse", definition: "Fibrous sugar cane residue used as biomass fuel" },
      { term: "Carbon Footprint", definition: "Total greenhouse gas emissions caused by an activity" },
      { term: "Sustainability", definition: "Meeting present needs without compromising future generations" },
      { term: "CEB", definition: "Central Electricity Board - manages Mauritius power grid" },
    ],
    formulas: [
      { name: "Carbon Footprint (Electricity)", formula: "CO₂ (kg) = kWh × 0.85", description: "Mauritius grid emission factor" },
      { name: "Energy Consumption", formula: "Wh = Watts × Hours", description: "Daily energy use per appliance" },
      { name: "Solar Panel Output", formula: "kWh/day = Panel kW × Sun Hours × 0.75", description: "With 75% system efficiency" },
    ],
    examTips: [
      "Know the 4 renewable sources and one Mauritius example for each",
      "Bagasse = sugar cane waste = biomass = renewable",
      "Distinguish renewable vs non-renewable with local examples",
      "Exam often asks: 'Name a renewable source used in Mauritius'",
      "Remember: 60% target by 2030, CEB manages grid",
    ],
  },
};

export default function LearningPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params.unitId as string;
  const topicId = params.topicId as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const step = learningSteps[currentStep];
  const content = mockLessonContent[step.id as keyof typeof mockLessonContent];

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));
    if (currentStep < learningSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Award XP, update progress
    router.refresh();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <Link href="/learning" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Units</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Live Tutor
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">Unit 1: Green Design</Badge>
          </div>
        </div>

        {/* Topic Header */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center text-3xl">
                🌱
              </div>
              <div className="flex-1">
                <Badge variant="outline" className="mb-2">Topic 1.1 • Renewable Energy Sources</Badge>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Green Design: Renewable Energy in Mauritius</h1>
                <p className="text-gray-600">Learn about solar, wind, hydro, and bagasse energy in our island context</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 25 min</span>
                  <span className="flex items-center gap-1"><Target className="h-4 w-4" /> Beginner</span>
                  <span className="flex items-center gap-1"><Award className="h-4 w-4" /> 50 XP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
              <div className="flex items-center justify-between relative z-10">
                {learningSteps.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(index)}
                    disabled={index > currentStep + 1 && !completedSteps.has(learningSteps[index - 1]?.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-all",
                      index < currentStep
                        ? "text-green-600"
                        : index === currentStep
                        ? "text-primary"
                        : "text-gray-400"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      index < currentStep
                        ? "bg-green-500 text-white"
                        : index === currentStep
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-gray-100 text-gray-400"
                    )}>
                      {index < currentStep ? <CheckCircle className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                    </div>
                    <span className="text-xs font-medium text-center max-w-[70px]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <step.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{step.label}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <ScrollArea className="h-[60vh] pr-2">
              {step.id === "learn" && (
                <div className="space-y-4 prose prose-sm max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
                    {content.title}
                  </div>
                  <TutorChat topicId={topicId} step="learn" initialContext={content.content} />
                </div>
              )}

              {step.id === "understand" && (
                <div className="space-y-6">
                  <p className="text-gray-600">Answer these questions to check your understanding. Click for hints!</p>
                  {content.questions.map((q) => (
                    <InteractiveQuestion key={q.id} question={q} />
                  ))}
                </div>
              )}

              {step.id === "practice" && (
                <div className="space-y-6">
                  <p className="text-gray-600">Try these hands-on exercises. Take your time!</p>
                  {content.exercises.map((ex) => (
                    <PracticeExercise key={ex.id} exercise={ex} />
                  ))}
                </div>
              )}

              {step.id === "check" && (
                <MiniQuiz questions={content.quiz} onComplete={handleNext} />
              )}

              {step.id === "summary" && (
                <SummaryPanel summary={content} />
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {currentStep < learningSteps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-gradient-to-r from-green-500 to-blue-500">
                <Sparkles className="h-4 w-4 mr-2" />
                Complete Topic +50 XP
              </Button>
            )}
          </div>
        </div>

        {/* Encouragement */}
        <div className="text-center text-sm text-gray-500">
          {currentStep === 0 && "💡 New to this? Don't worry - I'll guide you through step by step!"}
          {currentStep === 1 && "🤔 Take your time with these questions. Hints are there to help!"}
          {currentStep === 2 && "✏️ Learning by doing is the best way. Try the exercises!"}
          {currentStep === 3 && "🎯 This mini-quiz checks what you've learned. No pressure!"}
          {currentStep === 4 && "📝 Perfect for revision before exams. Save these notes!"}
        </div>
      </div>
    </DashboardLayout>
  );
}