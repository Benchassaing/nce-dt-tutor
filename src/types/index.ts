// ============================================
// CURRICULUM TYPES
// ============================================

export interface Unit {
  id: string;
  code: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  color: string;
  topics?: Topic[];
  _count?: { topics: number };
}

export interface Topic {
  id: string;
  unitId: string;
  code: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  order: number;
  estimatedMinutes: number;
  learningObjectives: string[];
  keyTerms: string[];
  unit?: Unit;
  contentChunks?: ContentChunk[];
  quizQuestions?: QuizQuestion[];
  flashcards?: Flashcard[];
  formulas?: Formula[];
  progress?: StudentProgress;
  _count?: { quizQuestions: number; flashcards: number };
}

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface ContentChunk {
  id: string;
  topicId: string;
  content: string;
  embedding: number[];
  metadata: ChunkMetadata;
  chunkIndex: number;
  tokenCount: number;
}

export interface ChunkMetadata {
  pageNum?: number;
  source: 'textbook' | 'exam_paper' | 'marking_scheme' | 'teacher_notes';
  type: 'explanation' | 'example' | 'diagram_caption' | 'exercise' | 'definition' | 'formula' | 'question' | 'answer';
  difficulty?: Difficulty;
  examRelevance?: number;
  tags?: string[];
}

// ============================================
// QUIZ TYPES
// ============================================

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'MATCH_THE_FOLLOWING'
  | 'FILL_IN_BLANKS'
  | 'DIAGRAM_LABELING'
  | 'SHORT_ANSWER'
  | 'EXAM_STYLE';

export interface QuizQuestion {
  id: string;
  topicId: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options?: QuizOptions;
  correctAnswer: QuizAnswer;
  explanation: string;
  hints: string[];
  marks: number;
  examRelevance: number;
  tags: string[];
  sourcePaperId?: string;
  topic?: Topic;
}

export interface QuizOptions {
  // MULTIPLE_CHOICE
  choices?: string[];
  // MATCH_THE_FOLLOWING
  leftColumn?: { id: string; content: string }[];
  rightColumn?: { id: string; content: string }[];
  // FILL_IN_BLANKS
  blanks?: number;
  wordBank?: string[];
  // DIAGRAM_LABELING
  diagramUrl?: string;
  labels?: { id: string; x: number; y: number; correctLabel: string }[];
  // EXAM_STYLE
  figureUrls?: string[];
  markAllocation?: { part: string; marks: number }[];
}

export type QuizAnswer =
  | string // MCQ, TRUE_FALSE, FILL_IN_BLANKS, SHORT_ANSWER
  | Record<string, string> // MATCH_THE_FOLLOWING, DIAGRAM_LABELING
  | string[]; // Multiple select

export interface QuizAttempt {
  id: string;
  userId: string;
  questionId: string;
  userAnswer: QuizAnswer;
  isCorrect: boolean;
  timeSpentMs: number;
  hintsUsed: number;
  attemptNumber: number;
  xpEarned: number;
  createdAt: Date;
  question?: QuizQuestion;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentMs: number;
  xpEarned: number;
  questionResults: QuestionResult[];
  topicBreakdown: TopicBreakdown[];
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: QuizAnswer;
  correctAnswer: QuizAnswer;
  explanation: string;
  timeSpentMs: number;
  marks: number;
}

export interface TopicBreakdown {
  topicId: string;
  topicTitle: string;
  correct: number;
  total: number;
  percentage: number;
}

// ============================================
// EXAM TYPES
// ============================================

export interface ExamPaper {
  id: string;
  year: number;
  component: string;
  title: string;
  totalMarks: number;
  durationMins: number;
  pdfUrl?: string;
  isActive: boolean;
  questions?: ExamQuestion[];
  _count?: { questions: number };
}

export interface ExamQuestion {
  id: string;
  paperId: string;
  number: number;
  section: string;
  type: QuestionType;
  marks: number;
  question: string;
  correctAnswer: QuizAnswer;
  markingScheme?: MarkingScheme;
  topics: string[];
  figureUrls: string[];
  paper?: ExamPaper;
}

export interface MarkingScheme {
  criteria: MarkingCriterion[];
  totalMarks: number;
}

export interface MarkingCriterion {
  id: string;
  description: string;
  marks: number;
  keywords?: string[];
  alternativeAnswers?: string[];
}

export interface ExamAttempt {
  id: string;
  userId: string;
  paperId: string;
  status: AttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  timeSpentMs?: number;
  totalScore?: number;
  percentage?: number;
  topicScores?: Record<string, number>;
  xpEarned: number;
  paper?: ExamPaper;
  questionAttempts?: ExamQuestionAttempt[];
}

export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT' | 'ABANDONED';

export interface ExamQuestionAttempt {
  id: string;
  attemptId: string;
  questionId: string;
  userAnswer: QuizAnswer;
  score?: number;
  maxScore: number;
  feedback?: string;
  timeSpentMs: number;
  question?: ExamQuestion;
}

export interface ExamAnalysis {
  attempt: ExamAttempt;
  score: number;
  percentage: number;
  topicBreakdown: TopicBreakdown[];
  mistakesAnalysis: MistakeAnalysis[];
  improvementRecommendations: ImprovementRecommendation[];
  readinessScore: number;
  charts: ChartData;
}

export interface MistakeAnalysis {
  questionId: string;
  questionNumber: number;
  topicId: string;
  topicTitle: string;
  userAnswer: QuizAnswer;
  correctAnswer: QuizAnswer;
  errorType: 'knowledge_gap' | 'misreading' | 'calculation' | 'terminology' | 'diagram';
  explanation: string;
}

export interface ImprovementRecommendation {
  topicId: string;
  topicTitle: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedActions: string[];
  estimatedStudyTime: number; // minutes
}

export interface ChartData {
  topicPerformance: { name: string; score: number; color: string }[];
  progressOverTime: { date: string; score: number }[];
  readinessGauge: { value: number; label: string };
}

export interface MockExamConfig {
  topicIds?: string[];
  totalMarks: number;
  durationMins: number;
  difficultyMix: Record<Difficulty, number>; // percentage
  questionTypeMix: Record<QuestionType, number>;
  sections: MockExamSection[];
}

export interface MockExamSection {
  name: string;
  marks: number;
  questionCount: number;
  typesAllowed: QuestionType[];
}

// ============================================
// PROGRESS TYPES
// ============================================

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

export interface StudentProgress {
  id: string;
  userId: string;
  topicId: string;
  status: ProgressStatus;
  completionPct: number;
  learnCompleted: boolean;
  understandCompleted: boolean;
  practiceCompleted: boolean;
  checkCompleted: boolean;
  lastAccessedAt: Date;
  timeSpentMs: number;
  masteryScore: number;
  topic?: Topic;
}

export interface DashboardData {
  user: UserProfile;
  overallProgress: number;
  xp: number;
  level: number;
  xpToNextLevel: number;
  streak: StreakData;
  topicProgress: TopicProgress[];
  weakAreas: WeakArea[];
  upcomingSessions: StudySession[];
  recentBadges: UserBadge[];
  weeklyGoal: WeeklyGoal;
  quizStats: QuizStats;
  examStats: ExamStats;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  xp: number;
  level: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  totalActiveDays: number;
  freezesRemaining: number;
}

export interface TopicProgress {
  topicId: string;
  topicTitle: string;
  unitCode: string;
  unitTitle: string;
  status: ProgressStatus;
  completionPct: number;
  masteryScore: number;
  lastAccessedAt?: Date;
}

export interface WeakArea {
  topicId: string;
  topicTitle: string;
  unitCode: string;
  masteryScore: number;
  recentQuizScore: number;
  recommendedAction: string;
}

export interface WeeklyGoal {
  targetXp: number;
  currentXp: number;
  targetTopics: number;
  completedTopics: number;
  targetMinutes: number;
  completedMinutes: number;
}

export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
}

export interface ExamStats {
  totalAttempts: number;
  averagePercentage: number;
  bestPercentage: number;
  papersCompleted: number;
  readinessScore: number;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: BadgeCategory;
  criteria: BadgeCriteria;
  xpReward: number;
  isSecret: boolean;
}

export type BadgeCategory = 'LEARNING' | 'QUIZ' | 'EXAM' | 'STREAK' | 'MASTERY' | 'SPECIAL';

export interface BadgeCriteria {
  type: string;
  value: number;
  topicId?: string;
  unitId?: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge?: Badge;
}

// ============================================
// REVISION TYPES
// ============================================

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  difficulty: Difficulty;
  tags: string[];
  topic?: Topic;
  nextReview?: Date;
  interval?: number;
  easeFactor?: number;
}

export interface FlashcardReview {
  id: string;
  userId: string;
  flashcardId: string;
  rating: number; // 1-5 (SM-2)
  interval: number;
  easeFactor: number;
  nextReview: Date;
}

export interface Formula {
  id: string;
  topicId: string;
  name: string;
  formula: string; // LaTeX
  description: string;
  variables: Record<string, string>;
  unit?: string;
}

export interface Diagram {
  id: string;
  topicId: string;
  title: string;
  description?: string;
  type: 'svg' | 'canvas' | 'image';
  content: string; // SVG string, canvas JSON, or image URL
  labels?: DiagramLabel[];
  isKeyDiagram: boolean;
}

export interface DiagramLabel {
  id: string;
  x: number; // 0-1 relative
  y: number;
  label: string;
  correctLabel: string;
}

export interface ExamTip {
  id: string;
  topicId?: string;
  title: string;
  content: string;
  priority: number;
}

// ============================================
// STUDY PLANNER TYPES
// ============================================

export type SessionType = 'LEARN' | 'PRACTICE' | 'QUIZ' | 'MOCK_EXAM' | 'REVISION' | 'FLASHCARDS';

export interface StudyPlan {
  id: string;
  userId: string;
  examDate: Date;
  hoursPerWeek: number;
  preferredDays: number[]; // 0=Sun, 6=Sat
  startDate: Date;
  generatedPlan: GeneratedPlan;
}

export interface GeneratedPlan {
  weeks: PlanWeek[];
  totalHours: number;
  topicsCovered: string[];
}

export interface PlanWeek {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  days: PlanDay[];
  totalHours: number;
}

export interface PlanDay {
  date: Date;
  dayOfWeek: number;
  sessions: PlanSession[];
  totalMinutes: number;
}

export interface PlanSession {
  topicId?: string;
  topicTitle?: string;
  type: SessionType;
  durationMins: number;
  order: number;
  completed: boolean;
  completedAt?: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  planId?: string;
  topicId?: string;
  scheduledAt: Date;
  completedAt?: Date;
  durationMins: number;
  type: SessionType;
  notes?: string;
  xpEarned: number;
  topic?: Topic;
}

// ============================================
// AI TUTOR TYPES
// ============================================

export interface TutorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    step?: 'learn' | 'understand' | 'practice' | 'check' | 'summary';
    topicId?: string;
    questionId?: string;
  };
}

export interface TutorResponse {
  message: string;
  step: 'learn' | 'understand' | 'practice' | 'check' | 'summary';
  interactiveQuestions?: InteractiveQuestion[];
  practiceExercises?: PracticeExercise[];
  quiz?: QuizQuestion[];
  summary?: SummaryPoint[];
  hints?: string[];
  encouragements?: string[];
}

export interface InteractiveQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: QuizOptions;
  correctAnswer: QuizAnswer;
  hint: string;
  explanation: string;
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  type: 'drawing' | 'calculation' | 'design' | 'labeling' | 'explanation';
  difficulty: Difficulty;
  expectedTimeMins: number;
  solution?: string;
  hints: string[];
}

export interface SummaryPoint {
  title: string;
  points: string[];
  keyTerms: string[];
  formulas?: Formula[];
  diagrams?: Diagram[];
}

// ============================================
// RAG TYPES
// ============================================

export interface RAGQuery {
  query: string;
  topicId?: string;
  unitId?: string;
  type?: ChunkMetadata['type'];
  filters?: Record<string, unknown>;
  topK?: number;
}

export interface RAGResult {
  chunks: ContentChunk[];
  answer: string;
  sources: RAGSource[];
  confidence: number;
}

export interface RAGSource {
  chunkId: string;
  topicTitle: string;
  unitTitle: string;
  pageNum?: number;
  relevanceScore: number;
  content: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: { page: number; limit: number; total: number };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export type ViewMode = 'dashboard' | 'learning' | 'quiz' | 'exam' | 'revision' | 'planner' | 'profile' | 'admin';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement';
  title: string;
  message: string;
  duration?: number;
  action?: { label: string; href: string };
}

// ============================================
// ADMIN TYPES
// ============================================

export interface UploadedDocument {
  id: string;
  title: string;
  type: 'TEXTBOOK' | 'EXAM_PAPER' | 'MARKING_SCHEME' | 'TEACHER_NOTES';
  year?: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processedAt?: Date;
  chunksCount: number;
  errorMessage?: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface AdminAnalytics {
  totalStudents: number;
  activeStudents: number;
  totalStudyHours: number;
  averageProgress: number;
  topicCompletionRates: { topicId: string; topicTitle: string; completionRate: number }[];
  quizPerformance: { topicId: string; averageScore: number; attempts: number }[];
  examPerformance: { paperId: string; averagePercentage: number; attempts: number }[];
  weakestTopics: { topicId: string; topicTitle: string; averageMastery: number }[];
  strongestTopics: { topicId: string; topicTitle: string; averageMastery: number }[];
}

// ============================================
// PARENT/TEACHER TYPES
// ============================================

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  currentStreak: number;
  overallProgress: number;
  weakAreas: WeakArea[];
  recentActivity: ActivityLog[];
  upcomingSessions: StudySession[];
}

export interface ActivityLog {
  id: string;
  type: 'lesson' | 'quiz' | 'exam' | 'flashcard' | 'session';
  description: string;
  topicTitle?: string;
  score?: number;
  durationMins?: number;
  createdAt: Date;
}

export interface TeacherClassSummary {
  students: StudentSummary[];
  classAverageProgress: number;
  classWeakAreas: WeakArea[];
  upcomingExams: ExamPaper[];
}