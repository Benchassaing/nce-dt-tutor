"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  BookOpen,
  HelpCircle,
  Award,
  Target,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Trophy,
  Flame,
  Star,
  Brain,
  Zap,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Learning", href: "/learning", icon: BookOpen },
  { name: "Quiz Practice", href: "/quiz", icon: HelpCircle },
  { name: "Exam Prep", href: "/exam", icon: Target },
  { name: "Revision", href: "/revision", icon: Award },
  { name: "Study Planner", href: "/planner", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
];

const userNavigation = [
  { name: "Profile", href: "/profile", icon: Settings },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse: () => setIsCollapsed(!isCollapsed) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={toggleCollapse}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 lg:relative lg:z-auto",
          isCollapsed ? "w-20" : "w-64"
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("flex items-center justify-between h-16 px-4 border-b border-gray-200", isCollapsed && "justify-center")}>
            <Link href="/dashboard" className="flex items-center gap-2" aria-label="NCE DT Tutor Home">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">NCE</span>
              </div>
              {!isCollapsed && <span className="font-semibold text-xl text-gray-900">DT Tutor</span>}
            </Link>
            <Button
              onClick={toggleCollapse}
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed && "justify-center"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src="/avatar-placeholder.png" alt="" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Student</p>
                  <p className="text-xs text-gray-500 truncate">student@example.com</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="mt-4 space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => window.location.href = "/api/auth/signout"}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 lg:pl-0",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <Button
              onClick={toggleCollapse}
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <span className="h-5 w-5">☀️</span>
                ) : (
                  <span className="h-5 w-5">🌙</span>
                )}
              </Button>

              {/* XP Bar */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-100">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500" style={{ width: "65%" }} />
                </div>
                <span className="text-xs font-medium text-gray-700">1,250 / 1,900 XP</span>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">Level 3</Badge>
              </div>

              {/* Streak */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">7</span>
                <span className="text-xs text-orange-600">day streak</span>
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar-placeholder.png" alt="" />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Need to create Separator component