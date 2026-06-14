import { z } from 'zod';

// Auth schemas
export const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  examDate: z.string().optional(),
  hoursPerWeek: z.number().min(1).max(40).optional(),
  preferredDays: z.array(z.number().min(0).max(6)).optional(),
});

// Quiz schemas
export const quizAnswerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.union([
    z.string(), // MCQ, True/False, Fill in blank
    z.array(z.string()), // Match the following, Multiple select
    z.record(z.string()), // Diagram labeling
  ]),
  timeSpentMs: z.number().int().positive(),
  hintsUsed: z.number().int().min(0).default(0),
});

export const quizSubmitSchema = z.object({
  topicId: z.string().optional(),
  questionIds: z.array(z.string()).min(1),
  answers: z.array(quizAnswerSchema),
  mode: z.enum(['practice', 'exam', 'adaptive']).default('practice'),
});

// Exam schemas
export const startExamSchema = z.object({
  paperId: z.string(),
  mode: z.enum(['timed', 'practice', 'review']).default('timed'),
});

export const submitExamAnswerSchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  userAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.string()),
  ]),
  timeSpentMs: z.number().int().positive(),
});

export const submitExamSchema = z.object({
  attemptId: z.string(),
  answers: z.array(submitExamAnswerSchema.omit({ attemptId: true })),
});

// Progress schemas
export const updateProgressSchema = z.object({
  topicId: z.string(),
  step: z.enum(['learn', 'understand', 'practice', 'check']),
  completed: z.boolean(),
  timeSpentMs: z.number().int().positive().optional(),
});

// Tutor schemas
export const askTutorSchema = z.object({
  topicId: z.string(),
  question: z.string().min(1).max(2000),
  context: z.enum(['learn', 'understand', 'practice', 'check', 'revision']).optional(),
  previousMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(10).optional(),
});

// Flashcard schemas
export const flashcardReviewSchema = z.object({
  flashcardId: z.string(),
  rating: z.number().int().min(1).max(5), // SM-2: 1=Again, 2=Hard, 3=Good, 4=Easy, 5=Perfect
});

export const flashcardCreateSchema = z.object({
  topicId: z.string(),
  front: z.string().min(1).max(1000),
  back: z.string().min(1).max(2000),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  tags: z.array(z.string()).optional(),
});

// Study Plan schemas
export const createStudyPlanSchema = z.object({
  examDate: z.string().datetime(),
  hoursPerWeek: z.number().int().min(1).max(40),
  preferredDays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
});

export const completeSessionSchema = z.object({
  sessionId: z.string(),
  completedAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

// Admin schemas
export const uploadDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['TEXTBOOK', 'EXAM_PAPER', 'MARKING_SCHEME', 'TEACHER_NOTES']),
  year: z.number().int().min(2020).max(2030).optional(),
});

export const createTopicSchema = z.object({
  unitId: z.string(),
  code: z.string().min(1).max(20),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  order: z.number().int().positive(),
  estimatedMinutes: z.number().int().positive().default(30),
  learningObjectives: z.array(z.string()).optional(),
  keyTerms: z.array(z.string()).optional(),
});

export const updateTopicSchema = createTopicSchema.partial();

export const createQuizQuestionSchema = z.object({
  topicId: z.string(),
  type: z.enum([
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'MATCH_THE_FOLLOWING',
    'FILL_IN_BLANKS',
    'DIAGRAM_LABELING',
    'SHORT_ANSWER',
    'EXAM_STYLE',
  ]),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  question: z.string().min(1),
  options: z.any().optional(),
  correctAnswer: z.any(),
  explanation: z.string().min(1),
  hints: z.array(z.string()).optional(),
  marks: z.number().int().positive().default(1),
  examRelevance: z.number().min(0).max(1).default(0.5),
  tags: z.array(z.string()).optional(),
  sourcePaperId: z.string().optional(),
});

// Parent/Teacher link schemas
export const createLinkSchema = z.object({
  studentEmail: z.string().email(),
});

export const respondToLinkSchema = z.object({
  linkId: z.string(),
  accept: z.boolean(),
});

// Search/Filter schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const quizFilterSchema = z.object({
  topicId: z.string().optional(),
  type: z.enum([
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'MATCH_THE_FOLLOWING',
    'FILL_IN_BLANKS',
    'DIAGRAM_LABELING',
    'SHORT_ANSWER',
    'EXAM_STYLE',
  ]).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  limit: z.number().int().positive().max(50).default(10),
});

// Export types
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;
export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;
export type StartExamInput = z.infer<typeof startExamSchema>;
export type SubmitExamAnswerInput = z.infer<typeof submitExamAnswerSchema>;
export type SubmitExamInput = z.infer<typeof submitExamSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type AskTutorInput = z.infer<typeof askTutorSchema>;
export type FlashcardReviewInput = z.infer<typeof flashcardReviewSchema>;
export type FlashcardCreateInput = z.infer<typeof flashcardCreateSchema>;
export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreateQuizQuestionInput = z.infer<typeof createQuizQuestionSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type RespondToLinkInput = z.infer<typeof respondToLinkSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type QuizFilterInput = z.infer<typeof quizFilterSchema>;