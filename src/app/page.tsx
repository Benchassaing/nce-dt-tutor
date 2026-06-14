import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Award, Brain, Target, Zap, Shield, Users, BarChart2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tutor",
    description: "Get personalized explanations from an AI tutor trained on the official NCE Design & Technology curriculum.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: BookOpen,
    title: "Complete Curriculum",
    description: "All 8 units covered: Green Design, Pictorial Projection, Material Technology, Electricity & Electronics, Orthographic Projection, Mechanisms, Pneumatics & Hydraulics, Design Process.",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Target,
    title: "Exam Preparation",
    description: "Practice with past papers (2023-2025), take timed mock exams, and get detailed analysis with improvement recommendations.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: Award,
    title: "Gamified Learning",
    description: "Earn XP, unlock badges, maintain streaks, and track your progress with beautiful visualizations.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Zap,
    title: "Adaptive Quizzes",
    description: "7 question types including MCQ, True/False, Matching, Fill-in-blanks, Diagram labeling, and exam-style questions.",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    icon: BarChart2,
    title: "Progress Analytics",
    description: "Detailed charts showing topic mastery, weak areas, readiness score, and personalized study recommendations.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

const units = [
  { code: "U1", title: "Green Design", icon: "🌱", topics: 12, color: "green" },
  { code: "U2", title: "Pictorial Projection", icon: "📐", topics: 15, color: "blue" },
  { code: "U3", title: "Material Technology", icon: "🔧", topics: 18, color: "orange" },
  { code: "U4", title: "Electricity & Electronics", icon: "⚡", topics: 14, color: "yellow" },
  { code: "U5", title: "Orthographic Projection", icon: "📏", topics: 10, color: "red" },
  { code: "U6", title: "Mechanisms", icon: "⚙️", topics: 12, color: "purple" },
  { code: "U7", title: "Pneumatics & Hydraulics", icon: "💨", topics: 8, color: "cyan" },
  { code: "U8", title: "Design Process", icon: "✏️", topics: 10, color: "pink" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">NCE</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">DT Tutor</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="#curriculum" className="text-gray-600 hover:text-gray-900 transition-colors">Curriculum</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600">
                  Start Learning Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="success" className="mb-6 text-sm px-3 py-1">
            🇲🇺 Designed for Mauritius NCE Students
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master NCE Design & Technology
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 bg-clip-text text-transparent">
              with Your Personal AI Tutor
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            An intelligent learning platform that adapts to your pace, uses official curriculum materials,
            and prepares you for exam success with past papers, mock exams, and personalized feedback.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/sign-up">
              <Button size="xl" className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Official Curriculum Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>Past Papers 2023-2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>24/7 AI Tutor Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">8</div>
              <div className="text-gray-600">Curriculum Units</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600">99</div>
              <div className="text-gray-600">Topics Covered</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-orange-600">3</div>
              <div className="text-gray-600">Past Papers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600">AI Tutor Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Why Choose NCE DT Tutor?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Ace Your NCE Exam
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for 15-year-old Mauritian students with the official curriculum and real exam papers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover h-full">
                <CardHeader>
                  <div className={feature.bgColor + " w-12 h-12 rounded-lg flex items-center justify-center mb-4"}>
                    <feature.icon className={feature.color + " h-6 w-6"} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Complete NCE Syllabus</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              All 8 Units, Fully Covered
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Based on the official "Technology Studies Grade 9 Design and Technology" textbook and NCE examination papers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {units.map((unit) => (
              <Card key={unit.code} className="card-hover group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{unit.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{unit.code}</Badge>
                        <span className="text-xs text-gray-500">{unit.topics} topics</span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">{unit.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {unit.topics} topics covering all NCE learning objectives
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Your Learning Journey</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Learn, Practice, Succeed
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Learn",
                description: "Interactive lessons with simple explanations, Mauritius-specific examples, diagrams, and real-time AI tutor support.",
                icon: BookOpen,
              },
              {
                step: "02",
                title: "Practice",
                description: "Adaptive quizzes with 7 question types, instant feedback, hints, and explanations that adapt to your level.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Excel",
                description: "Timed mock exams with past papers, detailed analysis, weak area identification, and personalized study plans.",
                icon: Award,
              },
            ].map((item) => (
              <Card key={item.step} className="text-center card-hover">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-primary/20 mb-4">{item.step}</div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-green-500 to-orange-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Ace Your NCE Design & Technology Exam?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join hundreds of Mauritian students preparing with the most comprehensive NCE DT platform.
            Start your free trial today.
          </p>
          <Link href="/sign-up">
            <Button size="xl" variant="secondary" className="text-primary bg-white hover:bg-gray-100">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NCE</span>
                </div>
                <span className="font-semibold text-xl text-white">DT Tutor</span>
              </div>
              <p className="text-sm">AI-powered learning platform for Mauritius NCE Design & Technology students.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#curriculum" className="hover:text-white transition-colors">Curriculum</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 NCE DT Tutor. Built for Mauritius students. Not affiliated with MES.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}