"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calculator,
  Image,
  Lightbulb,
  Target,
  RotateCcw,
  Volume2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Brain,
  Sparkles,
  Clock,
} from "lucide-react";

const flashcards = [
  {
    id: "fc1",
    front: "What is Green Design?",
    back: "Creating products/systems that are environmentally friendly - meeting present needs without compromising future generations.",
    topic: "U1",
    difficulty: "BEGINNER",
  },
  {
    id: "fc2",
    front: "Name 4 renewable energy sources used in Mauritius",
    back: "1. Solar 2. Wind 3. Hydroelectric 4. Bagasse (sugar cane waste)",
    topic: "U1",
    difficulty: "BEGINNER",
  },
  {
    id: "fc3",
    front: "What is bagasse?",
    back: "Fibrous residue left after crushing sugar cane, burned as biomass fuel to generate electricity and heat.",
    topic: "U1",
    difficulty: "BEGINNER",
  },
  {
    id: "fc4",
    front: "What percentage of Mauritius' electricity comes from bagasse?",
    back: "Approximately 15%",
    topic: "U1",
    difficulty: "INTERMEDIATE",
  },
  {
    id: "fc5",
    front: "Mauritius renewable energy target for 2030",
    back: "60% renewable energy by 2030",
    topic: "U1",
    difficulty: "BEGINNER",
  },
  {
    id: "fc6",
    front: "What does CEB stand for?",
    back: "Central Electricity Board - manages Mauritius power grid",
    topic: "U1",
    difficulty: "BEGINNER",
  },
  {
    id: "fc7",
    front: "Define carbon footprint",
    back: "Total greenhouse gas emissions caused directly and indirectly by an activity, measured in kg CO₂ equivalent.",
    topic: "U1",
    difficulty: "INTERMEDIATE",
  },
  {
    id: "fc8",
    front: "Formula: Carbon footprint from electricity",
    back: "CO₂ (kg) = kWh × 0.85 (Mauritius grid emission factor)",
    topic: "U1",
    difficulty: "INTERMEDIATE",
  },
];

const formulas = [
  {
    id: "f1",
    name: "Carbon Footprint (Electricity)",
    formula: "CO₂ (kg) = kWh × 0.85",
    description: "Mauritius grid emission factor (kg CO₂ per kWh)",
    variables: { kWh: "Electricity consumed (kilowatt-hours)", "0.85": "Emission factor (kg CO₂/kWh)" },
    unit: "kg CO₂",
  },
  {
    id: "f2",
    name: "Energy Consumption",
    formula: "Wh = Watts × Hours",
    description: "Daily energy use per appliance",
    variables: { Watts: "Power rating of appliance", Hours: "Hours used per day" },
    unit: "Wh (watt-hours)",
  },
  {
    id: "f3",
    name: "Solar Panel Daily Output",
    formula: "kWh/day = Panel kW × Sun Hours × 0.75",
    description: "With 75% system efficiency",
    variables: { "Panel kW": "Rated panel power in kW", "Sun Hours": "Peak sun hours per day", "0.75": "System efficiency (75%)" },
    unit: "kWh",
  },
  {
    id: "f4",
    name: "Ohm's Law",
    formula: "V = I × R",
    description: "Voltage = Current × Resistance",
    variables: { V: "Voltage (volts)", I: "Current (amperes)", R: "Resistance (ohms)" },
    unit: "volts",
  },
  {
    id: "f5",
    name: "Electrical Power",
    formula: "P = V × I",
    description: "Power = Voltage × Current",
    variables: { P: "Power (watts)", V: "Voltage (volts)", I: "Current (amperes)" },
    unit: "watts",
  },
  {
    id: "f6",
    name: "Mechanical Advantage (Lever)",
    formula: "MA = Effort Arm / Load Arm",
    description: "Ratio of effort distance to load distance from fulcrum",
    variables: { "Effort Arm": "Distance from fulcrum to effort", "Load Arm": "Distance from fulcrum to load" },
    unit: "ratio (no units)",
  },
  {
    id: "f6b",
    name: "Velocity Ratio (Pulley)",
    formula: "VR = Number of Supporting Ropes",
    description: "Number of rope segments supporting the load",
    variables: { "Supporting Ropes": "Count of rope segments holding the load" },
    unit: "ratio (no units)",
  },
];

const keyDiagrams = [
  {
    id: "d1",
    title: "Solar Water Heater System",
    topic: "U1",
    description: "Shows collector, storage tank, circulation pump, and piping",
    type: "system",
  },
  {
    id: "d2",
    title: "Hydroelectric Power Station",
    topic: "U1",
    description: "Dam, penstock, turbine, generator, transformer",
    type: "system",
  },
  {
    id: "d3",
    title: "Isometric Circle Construction",
    topic: "U2",
    description: "Four-centre method for drawing circles in isometric",
    type: "construction",
  },
  {
    id: "d4",
    title: "Orthographic Projection - 3rd Angle",
    topic: "U5",
    description: "Front, top, and side views arrangement",
    type: "projection",
  },
  {
    id: "d5",
    title: "Simple Lever (1st Class)",
    topic: "U6",
    description: "Fulcrum between effort and load (e.g., seesaw)",
    type: "mechanism",
  },
  {
    id: "d6",
    title: "Pneumatic System Components",
    topic: "U7",
    description: "Compressor, reservoir, valve, cylinder, piping",
    type: "system",
  },
];

const examTips = [
  { id: "t1", title: "Read every word", content: "NCE questions often have multiple parts. Underline keywords: 'sketch', 'explain', 'calculate', 'state', 'describe'.", priority: 1 },
  { id: "t2", title: "Time per mark", content: "90 minutes for ~80 marks = ~1.1 min/mark. Don't spend 10 minutes on a 3-mark question!", priority: 1 },
  { id: "t3", title: "Show all working", content: "For calculations, always show steps. Partial marks awarded for correct method even if final answer is wrong.", priority: 1 },
  { id: "t4", title: "Sketch neatly", content: "Use sharp pencil, ruler for straight lines. Label clearly. Shading shows 3D form - light direction matters.", priority: 2 },
  { id: "t5", title: "Know your tools", content: "Identify: coping saw, tenon saw, hack saw, try square, engineer's square, G-clamp, bench hook, mallet.", priority: 2 },
  { id: "t6", title: "Materials: Ferrous vs Non-ferrous", content: "Ferrous = magnetic (mild steel, carbon steel). Non-ferrous = non-magnetic (aluminium, copper, brass).", priority: 2 },
  { id: "t7", title: "Thermoplastic vs Thermosetting", content: "Thermoplastic: softens on heating (PVC, acrylic, nylon). Thermosetting: sets permanently (epoxy, polyester resin).", priority: 2 },
  { id: "t8", title: "Mechanisms keywords", content: "Rotary, linear, reciprocating, oscillating. Lever classes: 1st (fulcrum middle), 2nd (load middle), 3rd (effort middle).", priority: 3 },
  { id: "t9", title: "Pneumatics vs Hydraulics", content: "Pneumatic = compressed air (fast, clean, low force). Hydraulic = oil (high force, precise, lubricating).", priority: 3 },
  { id: "t10", title: "Design Process steps", content: "1. Brief 2. Research 3. Specification 4. Ideas 5. Development 6. Planning 7. Making 8. Evaluation.", priority: 3 },
];

export default function RevisionPage() {
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("all");

  const filteredCards = flashcards.filter((c) => difficultyFilter === "all" || c.difficulty === difficultyFilter);
  const card = filteredCards[currentFlashcard];
  const progress = filteredCards.length > 0 ? ((mastered.size / filteredCards.length) * 100) : 0;

  const handleFlip = () => setFlipped(!flipped);
  const handleRate = (rating: 1 | 2 | 3 | 4) => {
    if (rating >= 3) setMastered((prev) => new Set([...prev, card.id]));
    if (currentFlashcard < filteredCards.length - 1) {
      setCurrentFlashcard(currentFlashcard + 1);
      setFlipped(false);
    }
  };
  const handleNext = () => {
    if (currentFlashcard < filteredCards.length - 1) {
      setCurrentFlashcard(currentFlashcard + 1);
      setFlipped(false);
    }
  };
  const handlePrev = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(currentFlashcard - 1);
      setFlipped(false);
    }
  };
  const handleShuffle = () => {
    // Shuffle logic
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quick Revision</h1>
            <p className="text-gray-600">Flashcards, formulas, diagrams & exam tips</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Notes
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Flashcards" value={flashcards.length} icon={<BookOpen className="h-5 w-5 text-blue-600" />} subtitle={`${mastered.size} mastered`} />
          <StatCard title="Formulas" value={formulas.length} icon={<Calculator className="h-5 w-5 text-green-600" />} subtitle="Key equations" />
          <StatCard title="Diagrams" value={keyDiagrams.length} icon={<Image className="h-5 w-5 text-purple-600" />} subtitle="Visual references" />
          <StatCard title="Exam Tips" value={examTips.length} icon={<Lightbulb className="h-5 w-5 text-yellow-600" />} subtitle="High-yield advice" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="flashcards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flashcards"><BookOpen className="h-4 w-4 mr-2" /> Flashcards</TabsTrigger>
            <TabsTrigger value="formulas"><Calculator className="h-4 w-4 mr-2" /> Formulas</TabsTrigger>
            <TabsTrigger value="diagrams"><Image className="h-4 w-4 mr-2" /> Diagrams</TabsTrigger>
            <TabsTrigger value="tips"><Target className="h-4 w-4 mr-2" /> Exam Tips</TabsTrigger>
          </TabsList>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="space-y-6">
            <FlashcardViewer
              card={card}
              flipped={flipped}
              onFlip={handleFlip}
              onRate={handleRate}
              onNext={handleNext}
              onPrev={handlePrev}
              current={currentFlashcard + 1}
              total={filteredCards.length}
              progress={progress}
              difficultyFilter={difficultyFilter}
              setDifficultyFilter={setDifficultyFilter as (v: string) => void}
              canPrev={currentFlashcard > 0}
              canNext={currentFlashcard < filteredCards.length - 1}
              mastered={mastered.has(card?.id || "")}
            />
          </TabsContent>

          {/* Formulas Tab */}
          <TabsContent value="formulas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {formulas.map((f) => (
                <FormulaCard key={f.id} formula={f} />
              ))}
            </div>
          </TabsContent>

          {/* Diagrams Tab */}
          <TabsContent value="diagrams" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {keyDiagrams.map((d) => (
                <DiagramCard key={d.id} diagram={d} />
              ))}
            </div>
          </TabsContent>

          {/* Exam Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            <div className="space-y-3">
              {examTips
                .sort((a, b) => a.priority - b.priority)
                .map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string; value: number; icon: React.ReactNode; subtitle: string }) {
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

function FlashcardViewer({
  card,
  flipped,
  onFlip,
  onRate,
  onNext,
  onPrev,
  current,
  total,
  progress,
  difficultyFilter,
  setDifficultyFilter,
  canPrev,
  canNext,
  mastered,
}: {
  card: typeof flashcards[0];
  flipped: boolean;
  onFlip: () => void;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
  onNext: () => void;
  onPrev: () => void;
  current: number;
  total: number;
  progress: number;
  difficultyFilter: string;
  setDifficultyFilter: (v: string) => void;
  canPrev: boolean;
  canNext: boolean;
  mastered: boolean;
}) {
  if (!card) return <div className="text-center py-12 text-gray-500">No flashcards match this filter</div>;

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "BEGINNER": return "bg-green-100 text-green-700";
      case "INTERMEDIATE": return "bg-yellow-100 text-yellow-700";
      case "ADVANCED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-48 h-2" />
          <span className="text-sm text-gray-500">{Math.round(progress)}% mastered</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getDifficultyColor(card.difficulty)}>{card.difficulty}</Badge>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative perspective-1000" onClick={onFlip}>
        <div
          className={cn(
            "relative w-full h-80 cursor-pointer transition-transform duration-700 transform-style-3d",
            flipped && "rotate-y-180"
          )}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden rounded-2xl bg-white border-2 border-gray-200 shadow-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">Click to flip</Badge>
              <p className="text-xl font-medium text-gray-900 leading-relaxed">{card.front}</p>
              <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
                <span className="flex items-center gap-1"><RotateCcw className="h-4 w-4" /> Tap to reveal</span>
                {mastered && <span className="flex items-center gap-1 text-green-500"><Check className="h-4 w-4" /> Mastered</span>}
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rounded-2xl bg-green-50 border-2 border-green-200 shadow-lg p-8 flex flex-col rotate-y-180">
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg text-gray-800 leading-relaxed text-center">{card.back}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-green-200">
              <span className="text-sm text-gray-500">Unit {card.topic}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onRate(1)}>Again</Button>
                <Button variant="outline" size="sm" onClick={() => onRate(2)}>Hard</Button>
                <Button variant="secondary" size="sm" onClick={() => onRate(3)}>Good</Button>
                <Button variant="default" size="sm" onClick={() => onRate(4)}>Easy</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} disabled={!canPrev}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-gray-500">Card {current} of {total}</span>
        <Button onClick={onNext} disabled={!canNext}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function FormulaCard({ formula }: { formula: typeof formulas[0] }) {
  return (
    <Card className="border-gray-200 hover:border-purple-300 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{formula.name}</CardTitle>
          <Badge variant="outline">{formula.unit}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-gray-100 rounded-lg p-4 font-mono text-lg overflow-x-auto">
          {formula.formula}
        </div>
        <p className="text-sm text-gray-600">{formula.description}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(formula.variables).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-2 rounded">
              <span className="font-medium text-gray-700">{key}</span>
              <span className="text-gray-500 ml-1">— {value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DiagramCard({ diagram }: { diagram: typeof keyDiagrams[0] }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "system": return <Image className="h-5 w-5" />;
      case "construction": return <RotateCcw className="h-5 w-5" />;
      case "projection": return <Image className="h-5 w-5" />;
      case "mechanism": return <Brain className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-gray-200 hover:border-blue-300 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            {getTypeIcon(diagram.type)}
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="mb-2">{diagram.topic}</Badge>
            <h4 className="font-medium text-gray-900 mb-1">{diagram.title}</h4>
            <p className="text-sm text-gray-600">{diagram.description}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">{diagram.type} diagram</span>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TipCard({ tip }: { tip: typeof examTips[0] }) {
  const priorityColors = {
    1: "bg-red-50 border-red-200 text-red-800",
    2: "bg-yellow-50 border-yellow-200 text-yellow-800",
    3: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <Card className={cn("border-2", priorityColors[tip.priority as keyof typeof priorityColors])}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", priorityColors[tip.priority as keyof typeof priorityColors])}>
            <Lightbulb className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{tip.title}</span>
              <Badge variant="outline" className="text-xs">Priority {tip.priority}</Badge>
            </div>
            <p className="text-sm text-gray-700">{tip.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}