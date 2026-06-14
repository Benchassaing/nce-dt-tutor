import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/db';
import { RAGQuery, RAGResult, RAGSource, ContentChunk, ChunkMetadata } from '@/types';

// Initialize AI clients
// Support both Anthropic and OpenRouter
const useOpenRouter = !!process.env.OPENROUTER_API_KEY;
const anthropic = (!useOpenRouter && process.env.ANTHROPIC_API_KEY) 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) 
  : null;

// OpenRouter client (uses OpenAI-compatible API)
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

// Supabase client for vector search
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

// Embedding configuration
const EMBEDDING_DIMENSIONS = 1024;
const TOP_K_RESULTS = 5;
const SIMILARITY_THRESHOLD = 0.7;

// Fallback embedding for development (when no embedding API available)
function fallbackEmbedding(text: string): number[] {
  const embedding = new Array(EMBEDDING_DIMENSIONS).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  words.forEach((word, i) => {
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % EMBEDDING_DIMENSIONS;
    embedding[index] += 1 / (i + 1);
  });
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // For free tier, we'll use a simple approach:
  // Option 1: Use Supabase's built-in embedding (if available via edge functions)
  // Option 2: Use a free embedding API like Hugging Face Inference API
  // Option 3: Fallback to deterministic hash-based embedding for dev
  
  if (!supabase) {
    return fallbackEmbedding(text);
  }

  try {
    // Try to use Supabase Edge Function for embeddings (if deployed)
    // For now, use fallback - in production, deploy an edge function
    return fallbackEmbedding(text);
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return fallbackEmbedding(text);
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Search using Supabase pgvector
export async function searchSimilarChunks(
  queryEmbedding: number[],
  options: {
    topicId?: string;
    unitId?: string;
    type?: ChunkMetadata['type'];
    limit?: number;
    threshold?: number;
  } = {}
): Promise<{ chunk: ContentChunk; similarity: number }[]> {
  const { topicId, type, limit = TOP_K_RESULTS, threshold = SIMILARITY_THRESHOLD } = options;

  // If Supabase is configured with pgvector, use RPC
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('match_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_topic: topicId || null
      });

      if (!error && data) {
        return data.map((row: any) => ({
          chunk: {
            id: row.id,
            topicId: row.topic_id,
            content: row.content,
            embedding: JSON.stringify(queryEmbedding), // placeholder
            metadata: row.metadata,
            chunkIndex: row.metadata?.chunkIndex || 0,
            tokenCount: row.metadata?.tokenCount || 0,
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          } as ContentChunk,
          similarity: row.similarity
        }));
      }
    } catch (e) {
      console.log('Supabase vector search not available, falling back to Prisma');
    }
  }

  // Fallback: Search in PostgreSQL via Prisma (slower but works on free tier)
  const chunks = await prisma.contentChunk.findMany({
    where: {
      ...(topicId && { topicId }),
      ...(type && { metadata: { path: ['type'], equals: type } })
    },
    include: { topic: { include: { unit: true } } },
    take: 500, // Limit for performance
  });

  const results = chunks
    .map(chunk => {
      const embedding = JSON.parse(chunk.embedding) as number[];
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return { chunk, similarity };
    })
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return results;
}

export async function queryRAG(query: RAGQuery): Promise<RAGResult> {
  const queryEmbedding = await generateEmbedding(query.query);
  let results = await searchSimilarChunks(queryEmbedding, {
    topicId: query.topicId,
    type: query.type,
    limit: query.topK || TOP_K_RESULTS,
  });

  const sources: RAGSource[] = results.map(r => ({
    chunkId: r.chunk.id,
    topicTitle: r.chunk.topic?.title || 'Unknown',
    unitTitle: r.chunk.topic?.unit?.title || 'Unknown',
    pageNum: r.chunk.metadata.pageNum as number | undefined,
    relevanceScore: r.similarity,
    content: r.chunk.content.substring(0, 500),
  }));

  const context = results.map(r => r.chunk.content).join('\n\n---\n\n');
  const answer = await generateAnswer(query.query, context);

  return {
    chunks: results.map(r => r.chunk),
    answer,
    sources,
    confidence: results.length > 0 ? results[0].similarity : 0,
  };
}

async function generateAnswer(query: string, context: string): Promise<string> {
  if (!anthropic && !openRouterApiKey) {
    return `Based on the curriculum materials:\n\n${context.substring(0, 1000)}...\n\nFor more details, refer to the textbook sections related to your question.`;
  }

  try {
    const systemPrompt = `You are an expert Design & Technology teacher for 15-year-old students in Mauritius preparing for NCE examinations.
You have access to the official curriculum textbook and past exam papers through RAG.

PERSONALITY:
- Encouraging, patient, never condescending
- Celebrate correct answers enthusiastically
- Gently correct mistakes with hints
- Use Mauritian context and examples (local places, materials, climate)
- Break complex concepts into small steps
- Always provide reasoning, not just answers

CONSTRAINTS:
- ONLY use the provided context from curriculum materials
- NEVER invent syllabus content outside the provided curriculum
- Adapt language to 15-year-old level
- Use simple, clear explanations
- Give hints before direct answers when appropriate

FORMAT YOUR RESPONSE AS:
### Learn
Simple explanation with real-life Mauritius examples

### Understand
Interactive questions to check comprehension

### Practice
Hands-on exercises or problems

### Check
Mini-quiz with immediate feedback

### Summary
Key revision notes (bullet points)`;

    let response: string;

    if (useOpenRouter && openRouterApiKey) {
      // Use OpenRouter (OpenAI-compatible API)
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nce-dt-tutor.vercel.app',
          'X-Title': 'NCE DT Tutor',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Context from curriculum materials:\n${context}\n\nStudent Question: ${query}\n\nPlease respond following the format above.`,
            },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      response = data.choices?.[0]?.message?.content || 'Unable to generate response.';
    } else if (anthropic) {
      // Use Anthropic
      const anthropicResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Context from curriculum materials:\n${context}\n\nStudent Question: ${query}\n\nPlease respond following the format above.`,
          },
        ],
      });

      response = anthropicResponse.content[0].type === 'text' 
        ? anthropicResponse.content[0].text 
        : 'Unable to generate response.';
    } else {
      response = `Based on the curriculum materials:\n\n${context.substring(0, 1000)}...\n\nFor more details, refer to the textbook sections related to your question.`;
    }

    return response;
  } catch (error) {
    console.error('Answer generation failed:', error);
    return 'I apologize, but I encountered an error generating a response. Please try asking your question again.';
  }
}

// Tutor-specific RAG functions
export async function getTutorResponse(
  topicId: string,
  question: string,
  step: 'learn' | 'understand' | 'practice' | 'check' | 'summary',
  previousMessages: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{
  message: string;
  step: 'learn' | 'understand' | 'practice' | 'check' | 'summary';
  interactiveQuestions?: Array<{ question: string; type: string; correctAnswer: unknown; hint: string; explanation: string }>;
  practiceExercises?: Array<{ title: string; description: string; type: string; difficulty: string; expectedTimeMins: number }>;
  quiz?: string;
  summary?: Array<{ title: string; points: string[]; keyTerms: string[]; formulas?: unknown[]; diagrams?: unknown[] }>;
}> {
  const ragQuery: RAGQuery = {
    query: question,
    topicId,
    type: step === 'learn' ? 'explanation' : step === 'understand' ? 'exercise' : undefined,
    topK: 8,
  };

  const result = await queryRAG(ragQuery);

  if (!result.chunks.length) {
    return {
      message: "I couldn't find specific curriculum content for this topic. Let me help you with a general explanation based on Design & Technology principles.",
      step,
    };
  }

  if (!anthropic && !openRouterApiKey) {
    return { message: result.answer, step };
  }

  const stepPrompts = {
    learn: 'Provide a simple, engaging explanation for a 15-year-old. Use Mauritius examples (beaches, sugar cane, tropical climate, local materials). Include 2-3 "Did you know?" facts.',
    understand: 'Create 3-4 interactive questions to check understanding. Mix question types (MCQ, true/false, fill-in-blank). Provide hints for each.',
    practice: 'Design 2-3 hands-on practice exercises. Include drawing, calculation, or design tasks relevant to Mauritius context.',
    check: 'Create a mini-quiz of 5 questions with immediate feedback. Match NCE exam style.',
    summary: 'Provide concise revision notes: key points, formulas, definitions, and exam tips.',
  };

  try {
    let responseText: string;

    if (useOpenRouter && openRouterApiKey) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nce-dt-tutor.vercel.app',
          'X-Title': 'NCE DT Tutor',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: 'system', content: `You are a Design & Technology tutor for Mauritian NCE students. ${stepPrompts[step]}` },
            ...previousMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
            {
              role: 'user',
              content: `Curriculum Context:\n${result.chunks.map(c => c.content).join('\n\n')}\n\nStudent Question: ${question}\n\nRespond in the required format.`,
            },
          ],
          max_tokens: 4000,
          temperature: 0.4,
        }),
      });

      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || result.answer;
    } else if (anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.4,
        system: `You are a Design & Technology tutor for Mauritian NCE students. ${stepPrompts[step]}`,
        messages: [
          ...previousMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          {
            role: 'user',
            content: `Curriculum Context:\n${result.chunks.map(c => c.content).join('\n\n')}\n\nStudent Question: ${question}\n\nRespond in the required format.`,
          },
        ],
      });

      responseText = response.content[0].type === 'text' ? response.content[0].text : result.answer;
    } else {
      responseText = result.answer;
    }

    // Parse structured response
    return parseTutorResponse(responseText, step);
  } catch (error) {
    console.error('Tutor response failed:', error);
    return { message: result.answer, step };
  }
}

function parseTutorResponse(text: string, step: string) {
  const result: any = { message: text, step: step as any };

  const sections = text.split(/###\s+/);
  sections.forEach(section => {
    const [header, ...content] = section.split('\n');
    const cleanHeader = header.toLowerCase().trim();
    const cleanContent = content.join('\n').trim();

    if (cleanHeader.includes('learn')) result.message = cleanContent;
    if (cleanHeader.includes('understand')) result.interactiveQuestions = parseInteractiveQuestions(cleanContent);
    if (cleanHeader.includes('practice')) result.practiceExercises = parsePracticeExercises(cleanContent);
    if (cleanHeader.includes('check')) result.quiz = cleanContent;
    if (cleanHeader.includes('summary')) result.summary = parseSummary(cleanContent);
  });

  return result;
}

function parseInteractiveQuestions(content: string) {
  return content.split(/\d+\./).slice(1).map((q, i) => ({
    question: q.split('?')[0] + '?',
    type: 'MULTIPLE_CHOICE',
    correctAnswer: 'A',
    hint: 'Think about what you just learned.',
    explanation: 'This tests your understanding of the concept.',
  }));
}

function parsePracticeExercises(content: string) {
  return content.split(/\d+\./).slice(1).map((e, i) => ({
    title: `Exercise ${i + 1}`,
    description: e.trim(),
    type: 'explanation',
    difficulty: 'BEGINNER',
    expectedTimeMins: 10,
  }));
}

function parseSummary(content: string) {
  return content.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(p => ({
    title: 'Key Point',
    points: [p.replace(/^[-•]\s*/, '')],
    keyTerms: [],
  }));
}

interface SummaryPoint {
  title: string;
  points: string[];
  keyTerms: string[];
  formulas?: unknown[];
  diagrams?: unknown[];
}

// PDF Processing
export async function processPDF(
  fileBuffer: Buffer,
  fileName: string,
  topicId: string,
  metadata: Partial<ChunkMetadata>
): Promise<{ chunks: ContentChunk[]; count: number }> {
  const pdfParse = await import('pdf-parse');
  const data = await pdfParse.default(fileBuffer);

  const chunks = chunkText(data.text, {
    chunkSize: 800,
    chunkOverlap: 100,
    topicId,
    metadata: { ...metadata, source: 'textbook', fileName },
  });

  const chunksWithEmbeddings = await Promise.all(
    chunks.map(async (chunk, index) => {
      const embedding = await generateEmbedding(chunk.content);
      return {
        ...chunk,
        embedding,
        chunkIndex: index,
        tokenCount: estimateTokens(chunk.content),
      };
    })
  );

  return { chunks: chunksWithEmbeddings, count: chunksWithEmbeddings.length };
}

function chunkText(
  text: string,
  options: { chunkSize: number; chunkOverlap: number; topicId: string; metadata: Partial<ChunkMetadata> }
): ContentChunk[] {
  const { chunkSize, chunkOverlap, topicId, metadata } = options;
  const words = text.split(/\s+/);
  const chunks: ContentChunk[] = [];

  for (let i = 0; i < words.length; i += chunkSize - chunkOverlap) {
    const chunkWords = words.slice(i, i + chunkSize);
    if (chunkWords.length < 50) break;

    const content = chunkWords.join(' ');
    chunks.push({
      id: `chunk_${topicId}_${chunks.length}`,
      topicId,
      content,
      embedding: [],
      metadata: {
        ...metadata,
        chunkIndex: chunks.length,
        wordCount: chunkWords.length,
      } as ChunkMetadata,
      chunkIndex: chunks.length,
      tokenCount: estimateTokens(content),
    });
  }

  return chunks;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Quiz Generation from RAG
export async function generateQuizFromContent(
  topicId: string,
  count: number = 10,
  types: string[] = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANKS'],
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER'
): Promise<any[]> {
  const chunks = await prisma.contentChunk.findMany({
    where: { topicId },
    take: 20,
    orderBy: { chunkIndex: 'asc' },
  });

  if (!chunks.length) return [];

  const content = chunks.map(c => c.content).join('\n\n');
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { unit: true } });

  if (!anthropic && !openRouterApiKey) return generateFallbackQuiz(topicId, topic?.title || '', count, types, difficulty);

  try {
    const prompt = `You are an expert NCE Design & Technology examiner. Create quiz questions based on the Mauritian curriculum.
Generate ${count} questions of types: ${types.join(', ')} at ${difficulty} difficulty.
Format as JSON array with fields: id, type, difficulty, question, options, correctAnswer, explanation, hints, marks, tags.
Make questions relevant to Mauritius (local materials, climate, industries).`;

    let responseText: string;

    if (useOpenRouter && openRouterApiKey) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nce-dt-tutor.vercel.app',
          'X-Title': 'NCE DT Tutor',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Curriculum Content:\n${content}\n\nTopic: ${topic?.title} (Unit: ${topic?.unit?.title})\n\nGenerate ${count} quiz questions in JSON format.` },
          ],
          max_tokens: 4000,
          temperature: 0.5,
        }),
      });

      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || '[]';
    } else if (anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.5,
        system: prompt,
        messages: [
          {
            role: 'user',
            content: `Curriculum Content:\n${content}\n\nTopic: ${topic?.title} (Unit: ${topic?.unit?.title})\n\nGenerate ${count} quiz questions in JSON format.`,
          },
        ],
      });

      responseText = response.content[0].type === 'text' ? response.content[0].text : '[]';
    } else {
      responseText = '[]';
    }

    const text = responseText;
    const questions = JSON.parse(text);

    return questions.map((q: unknown, i: number) => ({
      id: `gen_${topicId}_${Date.now()}_${i}`,
      topicId,
      ...q,
    })) as any[];
  } catch (error) {
    console.error('Quiz generation failed:', error);
    return generateFallbackQuiz(topicId, topic?.title || '', count, types, difficulty);
  }
}

function generateFallbackQuiz(
  topicId: string,
  topicTitle: string,
  count: number,
  types: string[],
  difficulty: string
): any[] {
  const questions: any[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length] as any;
    questions.push({
      id: `fallback_${topicId}_${i}`,
      topicId,
      type,
      difficulty: difficulty as any,
      question: `Sample ${type} question about ${topicTitle}`,
      options: type === 'MULTIPLE_CHOICE' ? { choices: ['Option A', 'Option B', 'Option C', 'Option D'] } : undefined,
      correctAnswer: 'A',
      explanation: 'This is a sample question. Real questions are generated from curriculum content.',
      hints: ['Review the textbook section on this topic.'],
      marks: 1,
      examRelevance: 0.5,
      tags: [topicTitle],
    });
  }

  return questions;
}