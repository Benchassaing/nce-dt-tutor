"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Key,
  Calculator,
  Target,
  Lightbulb,
  Download,
  Copy,
  CheckCircle,
  Sparkles,
} from "lucide-react";

interface SummaryData {
  keyPoints: string[];
  keyTerms: { term: string; definition: string }[];
  formulas: { name: string; formula: string; description: string }[];
  examTips: string[];
}

interface SummaryPanelProps {
  summary: SummaryData;
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateRevisionNotes = () => {
    let notes = "# Revision Notes: Green Design - Renewable Energy\n\n";
    notes += "## Key Points\n";
    summary.keyPoints.forEach((p) => { notes += `- ${p}\n`; });
    notes += "\n## Key Terms\n";
    summary.keyTerms.forEach((t) => { notes += `- **${t.term}**: ${t.definition}\n`; });
    notes += "\n## Formulas\n";
    summary.formulas.forEach((f) => { notes += `- **${f.name}**: ${f.formula} — ${f.description}\n`; });
    notes += "\n## Exam Tips\n";
    summary.examTips.forEach((t) => { notes += `- ${t}\n`; });
    return notes;
  };

  const handleDownload = () => {
    const notes = generateRevisionNotes();
    const blob = new Blob([notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revision-notes-green-design.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="w-12 h-12 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Revision Summary</h3>
          <p className="text-sm text-gray-600">Key points, formulas, and exam tips for quick review</p>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download Notes
        </Button>
      </div>

      <Tabs defaultValue="keypoints" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keypoints"><BookOpen className="h-4 w-4 mr-2" /> Key Points</TabsTrigger>
          <TabsTrigger value="terms"><Key className="h-4 w-4 mr-2" /> Key Terms</TabsTrigger>
          <TabsTrigger value="formulas"><Calculator className="h-4 w-4 mr-2" /> Formulas</TabsTrigger>
          <TabsTrigger value="tips"><Target className="h-4 w-4 mr-2" /> Exam Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="keypoints" className="space-y-3">
          {summary.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-gray-800">{point}</p>
              <Button variant="ghost" size="icon" className="ml-auto text-gray-400 hover:text-green-600" onClick={() => handleCopy(point)}>
                <Copy className={cn("h-4 w-4", copied === point && "text-green-600")} />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="terms" className="space-y-3">
          {summary.keyTerms.map((term, i) => (
            <Card key={i} className="border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{term.term}</p>
                    <p className="text-gray-600 text-sm mt-1">{term.definition}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(`${term.term}: ${term.definition}`)}>
                    <Copy className={cn("h-4 w-4", copied === term.term && "text-blue-600")} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="formulas" className="space-y-3">
          {summary.formulas.map((formula, i) => (
            <Card key={i} className="border-gray-200 hover:border-purple-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{formula.name}</p>
                    <div className="bg-gray-100 rounded-lg p-3 mt-2 font-mono text-sm overflow-x-auto">
                      {formula.formula}
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{formula.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(formula.formula)}>
                    <Copy className={cn("h-4 w-4", copied === formula.formula && "text-purple-600")} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tips" className="space-y-3">
          {summary.examTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-yellow-800">{tip}</p>
              <Button variant="ghost" size="icon" className="ml-auto text-yellow-400 hover:text-yellow-600" onClick={() => handleCopy(tip)}>
                <Copy className={cn("h-4 w-4", copied === tip && "text-yellow-600")} />
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={handleDownload} className="flex-1 min-w-[150px]">
          <Download className="h-4 w-4 mr-2" />
          Download as Markdown
        </Button>
        <Button variant="outline" className="flex-1 min-w-[150px]">
          <BookOpen className="h-4 w-4 mr-2" />
          Add to Flashcards
        </Button>
        <Button variant="secondary" className="flex-1 min-w-[150px] bg-gradient-to-r from-green-500 to-blue-500">
          <Sparkles className="h-4 w-4 mr-2" />
          Mark Topic Complete
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";