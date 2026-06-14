import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/db';
import { RAGQuery, RAGResult, RAGSource, ContentChunk, ChunkMetadata } from '@/types';

// Initialize AI clients
const useOpenRouter = !!process.env.OPENROUTER_API_KEY;
const anthropic = (!useOpenRouter && process.env.ANTHROPIC_API_KEY) 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) 
  : null;

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const EMBEDDING_DIMENSIONS = 1024;
const TOP_K_RESULTS = 5;
const SIMILARITY_THRESHOLD = 0.7;

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
  if (!supabase) return fallbackEmbedding(text);
  try {
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

export async function searchSimilarChunks(
  queryEmbedding: number[],
  options: { topicId?: string; type?: ChunkMetadata['type']; limit?: number; threshold?: number } = {}
): Promise<{ chunk: ContentChunk; similarity: number }[]> {
  const { topicId, type, limit = TOP_K_RESULTS, threshold = SIMILARITY_THRESHOLD } = options;

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
            embedding: JSON.stringify(queryEmbedding),
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

  const chunks = await prisma.contentChunk.findMany({
    where: {
      ...(topicId && { topicId }),
      ...(type && { metadata: { path: ['type'], equals: type } })
    },
    include: { topic: { include: { unit: true } } },
    take: 500,
  });

  return chunks
    .map(chunk => {
      const embedding = JSON.parse(chunk.embedding) as number[];
      return { chunk, similarity: cosineSimilarity(queryEmbedding, embedding) };
    })
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export async function queryRAG(query: RAGQuery): Promise<RAGResult> {
  const queryEmbedding = await generateEmbedding(query.query);
  const results = await searchSimilarChunks(queryEmbedding, {
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

  return { chunks: results.map(r => r.chunk), answer, sources, confidence: results.length > 0 ? results[0].similarity : 0 };
}

async function generateAnswer(query: string, context: string): Promise<string> {
  if (!anthropic && !process.env.OPENROUTER_API_KEY) {
    return `Based on the curriculum materials:\n\n${context.substring(0, 1000)}...\n\nFor more details, refer to the textbook sections related to your question.`;
  }

  const systemPrompt = `You are an expert Design & Technology teacher for 15-year-old students in Mauritius preparing for NCE examinations.`;

  try {
    if (process.env.OPENROUTER_API_KEY) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nce-dt-tutor.vercel.app',
          'X-Title': 'NCE DT Tutor',
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Unable to generate response.';
    } else if (anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response.';
    }
    return 'No AI provider configured.';
  } catch (error) {
    console.error('Answer generation failed:', error);
    return 'I apologize, but I encountered an error generating a response.';
  }
}

export async function getTutorResponse(
  topicId: string,
  question: string,
  step: 'learn' | 'understand' | 'practice' | 'check' | 'summary',
  previousMessages: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<any> {
  const ragQuery: RAGQuery = {
    query: question,
    topicId,
    type: step === 'learn' ? 'explanation' : step === 'understand' ? 'exercise' : undefined,
    topK: 8,
  };

  const result = await queryRAG(ragQuery);

  if (!result.chunks.length) {
    return { message: "I couldn't find specific curriculum content for this topic.", step };
  }

  return { message: result.answer, step, sources: result.sources };
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function processPDF(
  fileBuffer: Buffer,
  fileName: string,
  topicId: string,
  metadata: Partial<ChunkMetadata>
): Promise<{ chunks: ContentChunk[]; count: number }> {
  const pdfParse = await import('pdf-parse');
  const data = await pdfParse.default(fileBuffer);
  const chunks = chunkText(data.text, { chunkSize: 800, chunkOverlap: 100, topicId, metadata: { ...metadata, source: 'textbook', fileName } });
  const chunksWithEmbeddings = await Promise.all(chunks.map(async (chunk, index) => ({
    ...chunk, embedding: await generateEmbedding(chunk.content), chunkIndex: index, tokenCount: estimateTokens(chunk.content)
  })));
  return { chunks: chunksWithEmbeddings, count: chunksWithEmbeddings.length };
}

function chunkText(text: string, options: { chunkSize: number; chunkOverlap: number; topicId: string; metadata: Partial<ChunkMetadata> }): ContentChunk[] {
  const { chunkSize, chunkOverlap, topicId, metadata } = options;
  const words = text.split(/\s+/);
  const chunks: ContentChunk[] = [];
  for (let i = 0; i < words.length; i += chunkSize - chunkOverlap) {
    const chunkWords = words.slice(i, i + chunkSize);
    if (chunkWords.length < 50) break;
    chunks.push({ id: `chunk_${topicId}_${chunks.length}`, topicId, content: chunkWords.join(' '), embedding: [], metadata: { ...metadata, chunkIndex: chunks.length, wordCount: chunkWords.length } as ChunkMetadata, chunkIndex: chunks.length, tokenCount: estimateTokens(chunkWords.join(' ')) });
  }
  return chunks;
}

function estimateTokens(text: string): number { return Math.ceil(text.length / 4); }

export async function generateQuizFromContent(topicId: string, count: number = 10, types: string[] = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANKS'], difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER'): Promise<any[]> {
  const chunks = await prisma.contentChunk.findMany({ where: { topicId }, take: 20, orderBy: { chunkIndex: 'asc' } });
  if (!chunks.length) return [];
  const content = chunks.map(c => c.content).join('\n\n');
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { unit: true } });
  if (!process.env.OPENROUTER_API_KEY && !anthropic) return generateFallbackQuiz(topicId, topic?.title || '', count, types, difficulty);
  try {
    const prompt = `Create ${count} NCE quiz questions (${types.join(', ')}) at ${difficulty} difficulty. Return JSON array with: id, type, difficulty, question, options, correctAnswer, explanation, hints, marks, tags.`;
    let responseText = '';
    if (process.env.OPENROUTER_API_KEY) {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST', headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free', messages: [{role: 'system', content: prompt}, {role: 'user', content: `Content:\n${content}\nTopic: ${topic?.title}`}], max_tokens: 4000, temperature: 0.5 })
      });
      const data = await r.json();
      responseText = data.choices?.[0]?.message?.content || '[]';
    } else {
      const r = await anthropic!.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 4000, temperature: 0.5, system: prompt, messages: [{role: 'user', content: `Content:\n${content}\nTopic: ${topic?.title}`}] });
      responseText = r.content[0].type === 'text' ? r.content[0].text : '[]';
    }
    const questions = JSON.parse(responseText);
    return questions.map((q: any, i: number) => ({ id: `gen_${topicId}_${Date.now()}_${i}`, topicId, ...q }));
  } catch (e) { console.error('Quiz generation failed:', e); return generateFallbackQuiz(topicId, topic?.title || '', count, types, difficulty); }
}

function generateFallbackQuiz(topicId: string, topicTitle: string, count: number, types: string[], difficulty: string): any[] {
  return Array.from({length: count}, (_, i) => ({
    id: `fallback_${topicId}_${i}`, topicId, type: types[i % types.length] as any, difficulty: difficulty as any,
    question: `Sample question about ${topicTitle}`, options: { choices: ['A', 'B', 'C', 'D'] }, correctAnswer: 'A',
    explanation: 'Sample question.', hints: ['Review the textbook.'], marks: 1, examRelevance: 0.5, tags: [topicTitle]
  }));
}