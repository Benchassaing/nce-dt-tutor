"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFUploader } from "@/components/admin/pdf-uploader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Upload, FileText, Download, Trash2, Edit, Eye, Settings, BarChart2,
  Users, BookOpen, Zap, AlertCircle, CheckCircle, XCircle, Loader2,
  Plus, Search, Filter, RotateCcw, Clock
} from "lucide-react";

const mockDocuments = [
  { id: "1", title: "Technology Studies Grade 9 DnT.pdf", type: "TEXTBOOK", year: 2023, status: "COMPLETED", chunks: 1250, uploadDate: "2024-01-15" },
  { id: "2", title: "NCE-2023-Technology-Studies-Component-1.pdf", type: "EXAM_PAPER", year: 2023, status: "COMPLETED", chunks: 45, uploadDate: "2024-01-20" },
  { id: "3", title: "NCE-2024-Technology-Studies-Design-Tech.pdf", type: "EXAM_PAPER", year: 2024, status: "COMPLETED", chunks: 42, uploadDate: "2024-02-10" },
  { id: "4", title: "NCE-2025-Tech-Studies-Component-1-QP.pdf", type: "EXAM_PAPER", year: 2025, status: "COMPLETED", chunks: 48, uploadDate: "2024-03-01" },
  { id: "5", title: "Teacher Notes Unit 1-3.pdf", type: "TEACHER_NOTES", year: 2024, status: "PROCESSING", chunks: 0, uploadDate: "2024-06-15" },
];

const mockTopics = [
  { id: "1", code: "U1-T1", title: "Renewable Energy Sources", unit: "U1", difficulty: "BEGINNER", questions: 15, flashcards: 8 },
  { id: "2", code: "U1-T2", title: "Solar Power Systems", unit: "U1", difficulty: "BEGINNER", questions: 12, flashcards: 6 },
  { id: "3", code: "U2-T1", title: "Isometric Drawing Basics", unit: "U2", difficulty: "INTERMEDIATE", questions: 18, flashcards: 10 },
  { id: "4", code: "U2-T2", title: "Circles in Isometric", unit: "U2", difficulty: "INTERMEDIATE", questions: 14, flashcards: 5 },
];

const mockAnalytics = {
  totalStudents: 247, activeThisWeek: 189, totalStudyHours: 1250, avgProgress: 42,
  completionRates: [
    { topic: "Renewable Energy", rate: 78 }, { topic: "Solar Power", rate: 65 },
    { topic: "Isometric Drawing", rate: 45 }, { topic: "Material Properties", rate: 38 },
    { topic: "Electronics", rate: 22 },
  ],
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("documents");
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);

  const handleProcess = async (docId: string) => {
    setProcessingDoc(docId);
    try { await fetch(`/api/admin/documents/${docId}/process`, { method: "POST" }); }
    catch (e) { console.error("Processing error:", e); }
    finally { setProcessingDoc(null); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return <Badge variant="success">{status}</Badge>;
      case "PROCESSING": return <Badge variant="warning">{status}</Badge>;
      case "FAILED": return <Badge variant="destructive">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TEXTBOOK": return "bg-blue-100 text-blue-700";
      case "EXAM_PAPER": return "bg-green-100 text-green-700";
      case "MARKING_SCHEME": return "bg-purple-100 text-purple-700";
      case "TEACHER_NOTES": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage content, monitor students, and configure the platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Add Topic</Button>
            <Button variant="outline"><Settings className="h-4 w-4 mr-2" />Settings</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Documents" value="4" icon={<FileText className="h-5 w-5 text-blue-600" />} subtitle="3 completed, 1 processing" />
          <StatCard title="Total Students" value="247" icon={<Users className="h-5 w-5 text-green-600" />} subtitle="189 active this week" />
          <StatCard title="Study Hours" value="1,250h" icon={<Clock className="h-5 w-5 text-purple-600" />} subtitle="Avg 5h per student" />
          <StatCard title="Avg Progress" value="42%" icon={<BarChart2 className="h-5 w-5 text-orange-600" />} subtitle="Target: 80%+" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-2" />Documents</TabsTrigger>
            <TabsTrigger value="topics"><BookOpen className="h-4 w-4 mr-2" />Topics</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart2 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Students</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <PDFUploader />
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Uploaded Documents</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-500">Document</th>
                      <th className="text-left p-3 font-medium text-gray-500">Type</th>
                      <th className="text-left p-3 font-medium text-gray-500">Year</th>
                      <th className="text-left p-3 font-medium text-gray-500">Status</th>
                      <th className="text-left p-3 font-medium text-gray-500">Chunks</th>
                      <th className="text-left p-3 font-medium text-gray-500">Uploaded</th>
                      <th className="text-right p-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDocuments.map(doc => (
                      <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3"><div className="font-medium text-gray-900">{doc.title}</div></td>
                        <td className="p-3"><Badge variant="outline" className={doc.type === "TEXTBOOK" ? "bg-blue-100 text-blue-700" : doc.type === "EXAM_PAPER" ? "bg-green-100 text-green-700" : doc.type === "MARKING_SCHEME" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}>{doc.type}</Badge></td>
                        <td className="p-3 text-gray-600">{doc.year || "—"}</td>
                        <td className="p-3"><Badge variant={doc.status === "COMPLETED" ? "success" : doc.status === "PROCESSING" ? "warning" : doc.status === "FAILED" ? "destructive" : "secondary"}>{doc.status}</Badge></td>
                        <td className="p-3 text-gray-600">{doc.chunks.toLocaleString()}</td>
                        <td className="p-3 text-gray-600">{doc.uploadDate}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleProcess(doc.id)} disabled={processingDoc === doc.id || doc.status === "PROCESSING"}>{processingDoc === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}</Button>
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Manage Curriculum Topics</h3>
              <Button><Plus className="h-4 w-4 mr-2" />Add Topic</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-500">Code</th>
                    <th className="text-left p-3 font-medium text-gray-500">Title</th>
                    <th className="text-left p-3 font-medium text-gray-500">Unit</th>
                    <th className="text-left p-3 font-medium text-gray-500">Difficulty</th>
                    <th className="text-left p-3 font-medium text-gray-500">Questions</th>
                    <th className="text-left p-3 font-medium text-gray-500">Flashcards</th>
                    <th className="text-right p-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTopics.map(topic => (
                    <tr key={topic.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm text-gray-900">{topic.code}</td>
                      <td className="p-3 font-medium text-gray-900">{topic.title}</td>
                      <td className="p-3"><Badge variant="outline">{topic.unit}</Badge></td>
                      <td className="p-3"><Badge variant="outline" className={topic.difficulty === "BEGINNER" ? "bg-green-100 text-green-700" : topic.difficulty === "INTERMEDIATE" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>{topic.difficulty}</Badge></td>
                      <td className="p-3 text-gray-600">{topic.questions}</td>
                      <td className="p-3 text-gray-600">{topic.flashcards}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnalyticsCard title="Completion Rate" subtitle="By topic">
                <div className="space-y-3">
                  {mockAnalytics.completionRates.map(item => (
                    <div key={item.topic} className="space-y-1">
                      <div className="flex justify-between text-sm"><span>{item.topic}</span><span className="font-medium">{item.rate}%</span></div>
                      <Progress value={item.rate} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Student Activity" subtitle="This week">
                <div className="space-y-4">
                  <div className="flex justify-between"><span className="text-gray-500">Active Students</span><span className="text-2xl font-bold">{mockAnalytics.activeThisWeek}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total Study Hours</span><span className="text-2xl font-bold">{mockAnalytics.totalStudyHours.toLocaleString()}h</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Avg Progress</span><span className="text-2xl font-bold">{mockAnalytics.avgProgress}%</span></div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Weakest Topics" subtitle="Need attention">
                <div className="space-y-2">
                  {mockAnalytics.completionRates.sort((a, b) => a.rate - b.rate).slice(0, 5).map(item => (
                    <div key={item.topic} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm">{item.topic}</span>
                      <Badge variant="destructive" className="text-xs">{item.rate}%</Badge>
                    </div>
                  ))}
                </div>
              </AnalyticsCard>
            </div>

            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Button variant="outline"><BarChart2 className="h-4 w-4 mr-2" />Export Analytics</Button>
                <Button variant="outline"><Users className="h-4 w-4 mr-2" />Student Report</Button>
                <Button variant="outline"><FileText className="h-4 w-4 mr-2" />Question Bank</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Student Management</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Level</th>
                        <th className="text-left p-3">Progress</th>
                        <th className="text-left p-3">Streak</th>
                        <th className="text-left p-3">Last Active</th>
                        <th className="text-left p-3">Weak Areas</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">S{i + 1}</div>
                              <div><p className="font-medium">Student {i + 1}</p><p className="text-sm text-gray-500">student{i + 1}@school.mu</p></div>
                            </div>
                          </td>
                          <td className="p-3"><Badge variant="secondary">Level {Math.floor(Math.random() * 5) + 1}</Badge></td>
                          <td className="p-3"><Progress value={Math.random() * 100} className="w-32 h-2" /></td>
                          <td className="p-3"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />{Math.floor(Math.random() * 14)} days</span></td>
                          <td className="p-3 text-sm text-gray-500">2h ago</td>
                          <td className="p-3"><div className="flex gap-1"><Badge variant="outline" className="text-xs">Materials</Badge><Badge variant="outline" className="text-xs">Electronics</Badge></div></td>
                          <td className="p-3 text-right"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

function AnalyticsCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline" className="text-xs">{subtitle}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
