"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.firstName || "",
    examDate: "",
    hoursPerWeek: 10,
    preferredDays: [1, 3, 5], // Mon, Wed, Fri
  });

  if (!isLoaded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit to API
    try {
      await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Onboarding failed:", error);
    }
  };

  const steps = [
    { number: 1, title: "Your Name", icon: Sparkles },
    { number: 2, title: "Exam Date", icon: Calendar },
    { number: 3, title: "Study Schedule", icon: Clock },
    { number: 4, title: "Ready!", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">NCE</span>
          </div>
          <CardTitle className="text-2xl">Welcome to NCE DT Tutor! 🎓</CardTitle>
          <p className="text-gray-600 mt-2">Let's set up your personalized learning experience</p>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s.number} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  i < step - 1 ? "bg-green-500 text-white" :
                  i === step - 1 ? "bg-primary text-white ring-4 ring-primary/20" :
                  "bg-gray-100 text-gray-400"
                )}>
                  {i < step - 1 ? <CheckCircle className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={cn("text-xs font-medium", i <= step - 1 ? "text-gray-900" : "text-gray-400")}>
                  {s.title}
                </span>
              </div>
            ))}
            <div className="hidden md:block flex-1 h-1 bg-gray-200 mx-4 relative">
              <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-300" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Benoit"
                  required
                  autoFocus
                />
                <p className="text-sm text-gray-500">This will be used throughout your learning journey</p>
              </div>
            )}

            {/* Step 2: Exam Date */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <Label htmlFor="examDate">When is your NCE exam?</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <p className="text-sm text-gray-500">We'll create a personalized study plan leading up to this date</p>
              </div>
            )}

            {/* Step 3: Study Schedule */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <Label>How many hours can you study per week?</Label>
                <Select
                  value={formData.hoursPerWeek.toString()}
                  onValueChange={(v) => setFormData({ ...formData, hoursPerWeek: parseInt(v) })}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[3, 5, 8, 10, 12, 15, 20].map((h) => (
                      <SelectItem key={h} value={h.toString()}>{h} hours/week</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Preferred study days</Label>
                <div className="flex gap-2 flex-wrap">
                  {dayNames.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        preferredDays: formData.preferredDays.includes(i)
                          ? formData.preferredDays.filter((d) => d !== i)
                          : [...formData.preferredDays, i]
                      })}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm border-2 transition-colors font-medium",
                        formData.preferredDays.includes(i)
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Select at least 2 days. We'll schedule sessions on these days.</p>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">You're all set, {formData.name}! 🎉</h3>
                <p className="text-gray-600">Your personalized study plan is ready. Let's start learning!</p>
                <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                  <p><strong>Exam Date:</strong> {formData.examDate ? new Date(formData.examDate).toLocaleDateString() : "Not set"}</p>
                  <p><strong>Weekly Hours:</strong> {formData.hoursPerWeek}h</p>
                  <p><strong>Study Days:</strong> {formData.preferredDays.map(d => dayNames[d].slice(0, 3)).join(", ")}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Back
              </Button>
              <div className="flex gap-3">
                {step < steps.length ? (
                  <Button type="button" onClick={() => setStep(step + 1)}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-gradient-to-r from-green-500 to-blue-500">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}