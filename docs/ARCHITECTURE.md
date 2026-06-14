# NCE Design & Technology Virtual Tutor - Architecture Documentation

## Project Overview

**Target**: 15-year-old students in Mauritius preparing for NCE Design & Technology examinations
**Role**: 24/7 AI-powered personal Design & Technology teacher
**Stack**: Next.js 14+, TypeScript, Tailwind CSS, ShadCN UI, PostgreSQL, Prisma, Clerk, Claude API, Vector DB

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  Dashboard  │ │  Learning   │ │    Exam     │ │  Revision   │            │
│  │   Layout    │ │    Mode     │ │ Preparation │ │    Mode     │            │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘            │
│         │               │               │               │                     │
│         └───────────────┼───────────────┼───────────────┘                     │
│                         ▼                                               │
│              ┌─────────────────────┐                                     │
│              │   React Query /     │                                     │
│              │   SWR (State)       │                                     │
│              └──────────┬──────────┘                                     │
└─────────────────────────┼─────────────────────────────────────────────────┘
                          │ HTTPS/WS
┌─────────────────────────┼─────────────────────────────────────────────────┐
│                         ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    NEXT.JS 14+ APP ROUTER                        │     │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │     │
│  │  │  API Routes│ │  Server    │ │  Middleware│ │  Auth      │   │     │
│  │  │  (REST)    │ │  Components│ │  (Clerk)   │ │  Guards    │   │     │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │     │
│  └──────────────────────────┬──────────────────────────────────────┘     │
└─────────────────────────────┼─────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  PostgreSQL   │    │  Vector DB    │    │  Claude API   │
│  (Prisma)     │    │  (Pinecone/   │    │  (AI Tutor)   │
│               │    │   Supabase)   │    │               │
│ • Users       │    │               │    │ • RAG Queries │
│ • Progress    │    │ • Embeddings  │    │ • Explanations│
│ • Quizzes     │    │ • Chunks      │    │ • Grading     │
│ • Exams       │    │ • Metadata    │    │ • Hints       │
│ • Badges      │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## Database Schema (Prisma)

### Core Models

```prisma
// User & Authentication
model User {
  id            String    @id @default(cuid())
  clerkId       String    @unique
  email         String    @unique
  name          String
  role          Role      @default(STUDENT)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  progress      StudentProgress[]
  quizAttempts  QuizAttempt[]
  examAttempts  ExamAttempt[]
  badges        UserBadge[]
  streaks       Streak?
  studyPlan     StudyPlan?
  parentLinks   ParentLink[] @relation("StudentLinks")
  teacherLinks  TeacherLink[] @relation("TeacherLinks")
}

enum Role {
  STUDENT
  PARENT
  TEACHER
  ADMIN
}

// Curriculum Structure
model Unit {
  id          String   @id @default(cuid())
  code        String   @unique // "U1", "U2", etc.
  title       String   // "Green Design", "Pictorial Projection"
  description String
  order       Int
  icon        String   // Lucide icon name
  color       String   // Tailwind color class
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  topics      Topic[]
}

model Topic {
  id          String   @id @default(cuid())
  unitId      String
  code        String   // "U1-T1", "U1-T2"
  title       String
  description String
  difficulty  Difficulty @default(BEGINNER)
  order       Int
  estimatedMinutes Int  @default(30)
  learningObjectives String[] // JSON array
  keyTerms    String[]       // JSON array
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  unit        Unit     @relation(fields: [unitId], references: [id], onDelete: Cascade)
  contentChunks ContentChunk[]
  quizQuestions QuizQuestion[]
  flashcards   Flashcard[]
  formulas     Formula[]
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

// RAG Content Chunks
model ContentChunk {
  id        String   @id @default(cuid())
  topicId   String
  content   String   // Markdown/text content
  embedding String   @db.Text // Vector embedding as JSON string or separate vector column
  metadata  Json     // { pageNum, source, type: "explanation|example|diagram|exercise" }
  chunkIndex Int
  createdAt DateTime @default(now())
  
  topic     Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  
  @@index([topicId])
}

// Quiz System
model QuizQuestion {
  id            String       @id @default(cuid())
  topicId       String
  type          QuestionType
  difficulty    Difficulty   @default(BEGINNER)
  question      String       // Markdown
  options       Json?        // For MCQ, Match, etc.
  correctAnswer Json         // Structure varies by type
  explanation   String       // Why answer is correct
  hints         String[]     // Progressive hints
  marks         Int          @default(1)
  examRelevance Float        @default(0.5) // 0-1 score
  tags          String[]     // ["tools", "materials", "drawing"]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  topic         Topic        @relation(fields: [topicId], references: [id], onDelete: Cascade)
  attempts      QuizAttempt[]
  
  @@index([topicId])
}

enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  MATCH_THE_FOLLOWING
  FILL_IN_BLANKS
  DIAGRAM_LABELING
  SHORT_ANSWER
  EXAM_STYLE
}

model QuizAttempt {
  id            String   @id @default(cuid())
  userId        String
  questionId    String
  userAnswer    Json
  isCorrect     Boolean
  timeSpentMs   Int
  hintsUsed     Int      @default(0)
  attemptNumber Int      @default(1)
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question      QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([questionId])
}

// Exam System
model ExamPaper {
  id           String   @id @default(cuid())
  year         Int
  component    String   // "Component 1"
  title        String
  totalMarks   Int
  durationMins Int
  pdfUrl       String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  
  questions    ExamQuestion[]
  attempts     ExamAttempt[]
}

model ExamQuestion {
  id          String   @id @default(cuid())
  paperId     String
  number      Int      // Question number in paper
  section     String   // "A", "B"
  type        QuestionType
  marks       Int
  question    String   // Full question text with figures referenced
  correctAnswer Json
  markingScheme Json?  // Detailed marking criteria
  topics      String[] // Related topic codes
  figureUrls  String[] // Diagrams/images
  createdAt   DateTime @default(now())
  
  paper       ExamPaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  attempts    ExamQuestionAttempt[]
}

model ExamAttempt {
  id           String   @id @default(cuid())
  userId       String
  paperId      String
  status       AttemptStatus @default(IN_PROGRESS)
  startedAt    DateTime @default(now())
  completedAt  DateTime?
  timeSpentMs  Int?
  totalScore   Float?
  percentage   Float?
  topicScores  Json?    // { "U1": 80, "U2": 60 }
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  paper        ExamPaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  questionAttempts ExamQuestionAttempt[]
  
  @@index([userId])
  @@index([paperId])
}

model ExamQuestionAttempt {
  id            String   @id @default(cuid())
  attemptId     String
  questionId    String
  userAnswer    Json
  score         Float?
  maxScore      Int
  feedback      String?
  timeSpentMs   Int
  createdAt     DateTime @default(now())
  
  attempt       ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question      ExamQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
}

enum AttemptStatus {
  IN_PROGRESS
  COMPLETED
  TIMED_OUT
  ABANDONED
}

// Progress Tracking
model StudentProgress {
  id              String   @id @default(cuid())
  userId          String
  topicId         String
  status          ProgressStatus @default(NOT_STARTED)
  completionPct   Float    @default(0)
  learnCompleted  Boolean  @default(false)
  understandCompleted Boolean @default(false)
  practiceCompleted Boolean @default(false)
  checkCompleted  Boolean  @default(false)
  lastAccessedAt  DateTime @default(now())
  timeSpentMs     Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic           Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  
  @@unique([userId, topicId])
  @@index([userId])
}

enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  MASTERED
}

// Gamification
model UserBadge {
  id          String   @id @default(cuid())
  userId      String
  badgeId     String
  earnedAt    DateTime @default(now++)
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([userId, badgeId])
}

model Badge {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String
  icon        String
  color       String
  category    BadgeCategory
  criteria    Json     // { type: "topic_complete", topicCount: 5 }
  xpReward    Int      @default(0)
  createdAt   DateTime @default(now())
  
  users       UserBadge[]
}

enum BadgeCategory {
  LEARNING
  QUIZ
  EXAM
  STREAK
  MASTERY
  SPECIAL
}

model Streak {
  id            String   @id @default(cuid())
  userId        String   @unique
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  lastActiveDate DateTime?
  totalActiveDays Int    @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Study Planner
model StudyPlan {
  id            String   @id @default(cuid())
  userId        String   @unique
  examDate      DateTime
  hoursPerWeek  Int
  preferredDays Int[]    // [1,3,5] = Mon, Wed, Fri
  startDate     DateTime
  generatedPlan Json     // Daily schedule
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model StudySession {
  id            String   @id @default(cuid())
  userId        String
  planId        String?
  topicId       String?
  scheduledAt   DateTime
  completedAt   DateTime?
  durationMins  Int
  type          SessionType
  notes         String?
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic         Topic?   @relation(fields: [topicId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([scheduledAt])
}

enum SessionType {
  LEARN
  PRACTICE
  QUIZ
  MOCK_EXAM
  REVISION
  FLASHCARDS
}

// Revision Content
model Flashcard {
  id          String   @id @default(cuid())
  topicId     String
  front       String   // Question/term
  back        String   // Answer/definition
  difficulty  Difficulty @default(BEGINNER)
  tags        String[]
  createdAt   DateTime @default(now())
  
  topic       Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  reviews     FlashcardReview[]
}

model FlashcardReview {
  id          String   @id @default(cuid())
  userId      String
  flashcardId String
  rating      Int      // 1-5 (SM-2 algorithm)
  interval    Int      // Days until next review
  easeFactor  Float
  nextReview  DateTime
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  flashcard   Flashcard @relation(fields: [flashcardId], references: [id], onDelete: Cascade)
  
  @@index([userId, nextReview])
}

model Formula {
  id          String   @id @default(cuid())
  topicId     String
  name        String
  formula     String   // LaTeX or plain text
  description String
  variables   Json     // { "V": "Voltage (volts)", "I": "Current (amps)" }
  createdAt   DateTime @default(now())
  
  topic       Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
}

// Parent/Teacher Links
model ParentLink {
  id          String   @id @default(cuid())
  parentId    String
  studentId   String
  status      LinkStatus @default(PENDING)
  createdAt   DateTime @default(now())
  
  parent      User     @relation("ParentLinks", fields: [parentId], references: [id], onDelete: Cascade)
  student     User     @relation("StudentLinks", fields: [studentId], references: [id], onDelete: Cascade)
  
  @@unique([parentId, studentId])
}

model TeacherLink {
  id          String   @id @default(cuid())
  teacherId   String
  studentId   String
  status      LinkStatus @default(PENDING)
  createdAt   DateTime @default(now())
  
  teacher     User     @relation("TeacherLinks", fields: [teacherId], references: [id], onDelete: Cascade)
  student     User     @relation("StudentLinks", fields: [studentId], references: [id], onDelete: Cascade)
  
  @@unique([teacherId, studentId])
}

enum LinkStatus {
  PENDING
  ACCEPTED
  REJECTED
}

// Admin Content Management
model UploadedDocument {
  id          String   @id @default(cuid())
  title       String
  type        DocType
  year        Int?
  fileUrl     String
  status      ProcessStatus @default(PENDING)
  processedAt DateTime?
  chunksCount Int      @default(0)
  errorMessage String?
  uploadedBy  String
  createdAt   DateTime @default(now())
  
  admin       User     @relation(fields: [uploadedBy], references: [id])
}

enum DocType {
  TEXTBOOK
  EXAM_PAPER
  MARKING_SCHEME
  TEACHER_NOTES
}

enum ProcessStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## API Design

### REST Endpoints

#### Authentication
```
GET    /api/auth/me              - Get current user
POST   /api/auth/onboard         - Complete onboarding
PUT    /api/auth/profile         - Update profile
```

#### Curriculum
```
GET    /api/curriculum/units                    - List all units
GET    /api/curriculum/units/:unitId            - Get unit with topics
GET    /api/curriculum/topics/:topicId          - Get topic content (RAG)
GET    /api/curriculum/topics/:topicId/learn    - Get structured lesson
```

#### Learning Mode
```
POST   /api/learning/start-session    - Start learning session
POST   /api/learning/ask              - Ask AI tutor (RAG)
POST   /api/learning/check-understanding - Submit mini-quiz answers
GET    /api/learning/progress/:topicId - Get progress for topic
```

#### Quiz System
```
GET    /api/quiz/questions?topicId=&type=&difficulty=  - Get quiz questions
POST   /api/quiz/attempt            - Submit quiz answer
GET    /api/quiz/results/:attemptId - Get quiz results
GET    /api/quiz/adaptive/:topicId  - Get adaptive questions
```

#### Exam Preparation
```
GET    /api/exam/papers             - List past papers
GET    /api/exam/papers/:paperId    - Get paper with questions
POST   /api/exam/start/:paperId     - Start exam attempt
POST   /api/exam/submit/:attemptId  - Submit exam
GET    /api/exam/results/:attemptId - Get exam analysis
POST   /api/exam/mock/generate      - Generate mock exam
```

#### Progress & Analytics
```
GET    /api/progress/dashboard      - Dashboard data
GET    /api/progress/analytics      - Detailed analytics
GET    /api/progress/weak-areas     - Identify weak topics
GET    /api/progress/readiness      - Exam readiness score
```

#### Revision
```
GET    /api/revision/flashcards?topicId=  - Get flashcards (spaced repetition)
POST   /api/revision/review              - Submit flashcard review
GET    /api/revision/formulas?topicId=   - Get formula sheet
GET    /api/revision/diagrams?topicId=   - Get key diagrams
```

#### Study Planner
```
POST   /api/planner/create            - Create study plan
GET    /api/planner/schedule          - Get daily/weekly schedule
POST   /api/planner/session/complete  - Complete study session
PUT    /api/planner/adjust            - Adjust plan based on performance
```

#### Gamification
```
GET    /api/gamification/badges       - Get all badges
GET    /api/gamification/streak       - Get streak info
POST   /api/gamification/xp/award     - Award XP (internal)
```

#### Admin
```
POST   /api/admin/upload              - Upload document
GET    /api/admin/documents           - List uploaded documents
POST   /api/admin/process/:docId      - Process document (RAG)
GET    /api/admin/analytics           - Student analytics
PUT    /api/admin/topics/:topicId     - Manage topic
```

---

## RAG Architecture

### Ingestion Pipeline

```
PDF Upload → Text Extraction → Chunking → Embedding → Vector Store
                │              │          │            │
                ▼              ▼          ▼            ▼
           pdf-parse      Recursive    text-       Pinecone/
                          Character    embedding   Supabase
                          Splitter    -3-small    Vector
```

### Chunking Strategy
- **Size**: 500-1000 tokens per chunk
- **Overlap**: 100 tokens
- **Metadata**: { topicId, unitId, pageNum, type, difficulty, examRelevance }
- **Types**: explanation, example, diagram_caption, exercise, definition, formula

### Retrieval Strategy
1. **Hybrid Search**: Vector similarity + keyword matching
2. **Re-ranking**: Cross-encoder for top-10 results
3. **Context Window**: Top 5 chunks + topic summary
4. **Caching**: Redis cache for frequent queries

### Query Types
- **Explain Concept**: Retrieve explanations + examples
- **Answer Question**: Retrieve relevant chunks + past paper Q&A
- **Generate Quiz**: Retrieve content + question templates
- **Exam Analysis**: Retrieve marking schemes + similar questions

---

## AI Tutor System Prompt

```
You are an expert Design & Technology teacher for 15-year-old students in Mauritius
preparing for NCE examinations. You have access to the official curriculum textbook
and past exam papers through RAG.

PERSONALITY:
- Encouraging, patient, never condescending
- Celebrate correct answers enthusiastically
- Gently correct mistakes with hints
- Use Mauritian context and examples
- Break complex concepts into small steps
- Always provide reasoning, not just answers

RESPONSE FORMAT:
### Learn
Simple explanation with real-life Mauritius examples

### Understand
Interactive questions to check comprehension

### Practice
Hands-on exercises or problems

### Check
Mini-quiz with immediate feedback

### Summary
Key revision notes (bullet points)

CONSTRAINTS:
- Only use curriculum content (RAG)
- Never invent syllabus topics
- Adapt language to 15-year-old level
- Use diagrams when helpful (ASCII/description)
- Give hints before answers
```

---

## Frontend Architecture

### Route Structure (App Router)
```
/                          → Landing / Auth
/dashboard                 → Student Dashboard
/learning/:unitId/:topicId → Learning Mode
/quiz/:topicId             → Quiz Practice
/exam                      → Exam Preparation
/exam/:paperId             → Past Paper Practice
/exam/mock                 → Mock Exam
/exam/results/:attemptId   → Exam Analysis
/revision                  → Revision Hub
/revision/flashcards       → Spaced Repetition
/revision/formulas         → Formula Sheets
/revision/diagrams         → Key Diagrams
/planner                   → Study Planner
/profile                   → Profile & Settings
/admin                     → Admin Panel
/admin/upload              → Document Upload
/admin/analytics           → Student Analytics
/parent/:studentId         → Parent View
/teacher/:studentId        → Teacher View
```

### Component Hierarchy
```
AppLayout
├── Header (Navigation, User Menu, XP Bar)
├── Sidebar (Navigation, Progress)
└── Main
    ├── Dashboard
    │   ├── StatsCards (XP, Level, Streak, Progress)
    │   ├── ProgressRing (Overall)
    │   ├── TopicProgressGrid
    │   ├── WeakAreasAlert
    │   ├── UpcomingSessions
    │   ├── BadgeShowcase
    │   └── WeeklyGoal
    ├── LearningMode
    │   ├── LessonPlayer (Learn/Understand/Practice/Check/Summary)
    │   ├── ConceptCard
    │   ├── InteractiveQuestion
    │   ├── DiagramViewer
    │   └── TutorChat
    ├── QuizSystem
    │   ├── QuestionRenderer (7 types)
    │   ├── AnswerInput
    │   ├── FeedbackModal
    │   ├── ProgressBar
    │   └── ResultsSummary
    ├── ExamMode
    │   ├── PaperSelector
    │   ├── ExamInterface (Timer, Navigation, Mark Allocation)
    │   ├── DrawingCanvas (for sketching questions)
    │   └── SubmissionConfirm
    ├── ExamAnalysis
    │   ├── ScoreDisplay
    │   ├── TopicBreakdownChart (Recharts)
    │   ├── MistakeAnalysis
    │   ├── ImprovementPlan
    │   └── ReadinessGauge
    ├── RevisionHub
    │   ├── FlashcardDeck (SM-2 algorithm)
    │   ├── FormulaSheet
    │   ├── DiagramLibrary
    │   ├── ExamTips
    │   └── FrequentTopics
    ├── StudyPlanner
    │   ├── CalendarView
    │   ├── WeeklySchedule
    │   ├── SessionLogger
    │   └── PlanAdjuster
    └── AdminPanel
        ├── UploadZone
        ├── DocumentTable
        ├── TopicManager
        └── AnalyticsDashboard
```

---

## UI/UX Design System

### Color Palette
```css
/* Primary - Mauritius Ocean Blue */
--primary-50: #eef4fb;
--primary-100: #d9e8f6;
--primary-500: #2563eb;
--primary-600: #1d4ed8;
--primary-700: #1e40af;

/* Secondary - Tropical Green */
--secondary-50: #ecfdf5;
--secondary-500: #10b981;
--secondary-600: #059669;

/* Accent - Sunset Orange */
--accent-50: #fff7ed;
--accent-500: #f97316;
--accent-600: #ea580c;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Dark Mode Support */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #0f172a;
--text-secondary: #475569;
```

### Typography
- **Headings**: Inter, Variable font, weights 600-800
- **Body**: Inter, 400-500
- **Code**: JetBrains Mono
- **Scale**: clamp(1rem, 2.5vw, 1.25rem) base

### Spacing System
- Base unit: 4px (0.25rem)
- Scale: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24

### Component Library (ShadCN + Custom)
- Button, Card, Dialog, Sheet, Tabs, Accordion
- Progress (Ring, Bar, Steps)
- Badge, Avatar, Tooltip, Popover
- Chart (Recharts wrapper)
- Canvas (Fabric.js for drawing)
- Markdown Renderer (React Markdown + KaTeX)

---

## Gamification System

### XP & Levels
```
Level 1: 0 XP       Level 6: 2,500 XP     Level 11: 10,000 XP
Level 2: 100 XP     Level 7: 3,500 XP     Level 12: 15,000 XP
Level 3: 300 XP     Level 8: 5,000 XP     Level 13: 22,500 XP
Level 4: 700 XP     Level 9: 7,000 XP     Level 14: 32,500 XP
Level 5: 1,300 XP   Level 10: 10,000 XP   Level 15: 50,000 XP
Formula: XP = 100 * (level - 1) * level / 2
```

### Badges
| Code | Name | Category | Criteria | XP |
|------|------|----------|----------|-----|
| first_steps | First Steps | Learning | Complete first topic | 50 |
| green_designer | Green Designer | Mastery | Master Unit 1 | 100 |
| projection_pro | Projection Pro | Mastery | Master Unit 2 | 100 |
| material_master | Material Master | Mastery | Master Unit 3 | 100 |
| circuit_whiz | Circuit Whiz | Mastery | Master Unit 4 | 100 |
| ortho_expert | Orthographic Expert | Mastery | Master Unit 5 | 100 |
| mechanism_master | Mechanism Master | Mastery | Master Unit 6 | 100 |
| fluid_power | Fluid Power | Mastery | Master Unit 7 | 100 |
| design_thinker | Design Thinker | Mastery | Master Unit 8 | 100 |
| quiz_champion | Quiz Champion | Quiz | Score 90%+ on 10 quizzes | 200 |
| exam_ready | Exam Ready | Exam | Complete 3 mock exams | 300 |
| streak_7 | Week Warrior | Streak | 7-day streak | 100 |
| streak_30 | Month Master | Streak | 30-day streak | 500 |
| perfectionist | Perfectionist | Quiz | 100% on 5 quizzes | 150 |
| night_owl | Night Owl | Special | Study after 10pm 10 times | 50 |
| early_bird | Early Bird | Special | Study before 7am 10 times | 50 |

### Streaks
- **Daily**: Any learning activity counts
- **Grace period**: 24h from last activity
- **Freeze**: 1 per month (earned via badge)
- **Rewards**: XP bonus at 7, 14, 30, 60, 100 days

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Next.js project setup with all dependencies
- [ ] Database schema & Prisma setup
- [ ] Authentication (Clerk)
- [ ] Basic UI components & layout
- [ ] CI/CD pipeline

### Phase 2: Content Ingestion (Week 2-3)
- [ ] PDF text extraction pipeline
- [ ] Chunking & embedding generation
- [ ] Vector database setup & indexing
- [ ] Admin upload interface
- [ ] Process all 4 PDFs

### Phase 3: Core Learning (Week 3-4)
- [ ] Curriculum API & topic pages
- [ ] Learning mode (5-step lesson)
- [ ] AI Tutor with RAG
- [ ] Progress tracking

### Phase 4: Quiz & Exam (Week 4-5)
- [ ] 7 question type renderers
- [ ] Adaptive quiz engine
- [ ] Past paper interface
- [ ] Mock exam generator
- [ ] Auto-grading (MCQ + AI for short answer)

### Phase 5: Analytics & Revision (Week 5-6)
- [ ] Dashboard with charts
- [ ] Exam analysis & recommendations
- [ ] Flashcard system (SM-2)
- [ ] Formula sheets & diagrams
- [ ] Study planner

### Phase 6: Gamification & Polish (Week 6-7)
- [ ] XP, levels, badges
- [ ] Streaks & motivation
- [ ] Parent/Teacher views
- [ ] Mobile responsive polish
- [ ] Accessibility audit

### Phase 7: Testing & Launch (Week 7-8)
- [ ] E2E testing (Playwright)
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment

---

## Technical Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Framework | Next.js 14 App Router | Server components, streaming, best DX |
| Styling | Tailwind + ShadCN | Rapid UI, consistent design system |
| Database | PostgreSQL + Prisma | Type-safe, migrations, relations |
| Auth | Clerk | Managed auth, organizations, webhooks |
| Vector DB | Pinecone (or Supabase pgvector) | Managed, scalable, hybrid search |
| AI | Claude 3.5 Sonnet | Best reasoning, large context |
| Embeddings | text-embedding-3-small | Cost-effective, good quality |
| Charts | Recharts | React-native, composable |
| Drawing | Fabric.js | Canvas interaction, export |
| State | React Query + Zustand | Server state + client state |
| Forms | React Hook Form + Zod | Performance, validation |
| Markdown | React Markdown + KaTeX | Math formulas, safe rendering |
| Testing | Vitest + Playwright | Unit + E2E |
| Deployment | Vercel + Neon/Supabase | Edge-ready, managed services |

---

## Security Considerations

- **Authentication**: Clerk handles sessions, MFA, rate limiting
- **Authorization**: Role-based access control (RBAC) on all API routes
- **Data**: Row-level security via Prisma middleware
- **API**: Rate limiting (100 req/min), input validation (Zod)
- **File Upload**: Signed URLs, type validation, size limits (50MB)
- **AI**: Prompt injection prevention, output validation
- **Privacy**: GDPR-compliant, data export/deletion

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| API Response (p95) | < 500ms |
| RAG Query Latency | < 2s |
| Quiz Submission | < 300ms |
| Exam Auto-grade | < 5s |
| Lighthouse Score | > 90 |

---

## Monitoring & Observability

- **Error Tracking**: Sentry
- **Analytics**: PostHog (privacy-friendly)
- **Logs**: Vercel Logs + Custom
- **Uptime**: Better Uptime
- **Database**: Prisma Metrics

---

## Future Enhancements

1. **Voice Interface**: Whisper + TTS for voice interaction
2. **AR Diagrams**: WebXR for 3D mechanism visualization
3. **Collaborative Learning**: Study groups, peer review
4. **Parent App**: Native mobile with push notifications
5. **Offline Mode**: Service Worker + IndexedDB
6. **Multi-language**: English + French + Kreol
7. **Teacher Tools**: Class management, assignment creation
8. **Certificate**: NCE readiness certificate generation