import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-MU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('en-MU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateLevel(xp: number): number {
  // XP = 100 * (level - 1) * level / 2
  // Solve for level: level^2 - level - 2*XP/100 = 0
  const discriminant = 1 + 8 * xp / 100;
  return Math.floor((1 + Math.sqrt(discriminant)) / 2);
}

export function xpForLevel(level: number): number {
  return 100 * (level - 1) * level / 2;
}

export function xpToNextLevel(xp: number): { currentLevel: number; currentLevelXp: number; nextLevelXp: number; progress: number } {
  const currentLevel = calculateLevel(xp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const progress = (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  return { currentLevel, currentLevelXp, nextLevelXp, progress: Math.max(0, Math.min(1, progress)) };
}

export function calculateStreak(lastActiveDate: Date | null): number {
  if (!lastActiveDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = new Date(lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 1 ? 1 : 0; // Simplified - actual streak tracked in DB
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'BEGINNER': return 'text-green-600 bg-green-50 border-green-200';
    case 'INTERMEDIATE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'ADVANCED': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getProgressStatusColor(status: string): string {
  switch (status) {
    case 'NOT_STARTED': return 'text-gray-500 bg-gray-100';
    case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
    case 'COMPLETED': return 'text-green-600 bg-green-50';
    case 'MASTERED': return 'text-purple-600 bg-purple-50';
    default: return 'text-gray-500 bg-gray-100';
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function parseJsonSafe<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}