import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/db';
import { RAGQuery, RAGResult, RAGSource, ContentChunk, ChunkMetadata } from '@/types';

const useOpenRouter = !!process.env.OPENROUTER_API_KEY;
const anthropic = (!process.env.OPENROUTER_API_KEY && process.env.ANTHROPIC_API_KEY) 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) 
  : null;

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const EMBEDDING_DIMENSIONS = 1024;
const TOP_K_RESULTS = 5;
const SIMILARITY_THRESHOLD = 0.7;

function fallbackEmbedding(text: string): number[] {
  const embedding = new Array(1024).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  words.forEach((word, i) => {
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % 1024;
    embedding[index] += 1 / (i + 1);
  }
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

export async function searchSimilarChunks(
  queryEmbedding: number[],
  options: { topicId?: string; type?: any; limit?: number; threshold?: number } = {}
): Promise<{ chunk: any; similarity: number }[]> {
  const { topicId, limit = 5, threshold = 0.7 } = options;

  if (typeof supabase !== 'undefined' && supabase) {
    try {
      const { data, error } = await supabase.rpc('match_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5,
        filter_topic: null
      });
      if (!error && data) {
        return data.map((row: any) => ({
          chunk: { id: row.id, topicId: row.topic_id, content: row.content, embedding: [], metadata: row.metadata, chunkIndex: 0, tokenCount: 0, createdAt: new Date() },
          similarity: row.similarity
        }));
      }
    } catch (e) {
      console.log('Supabase vector search not available, falling back to Prisma');
    }
  }

  const chunks = await prisma.contentChunk.findMany({
    where: { ...(topicId && { topicId }) },
    include: { topic: { include: { unit: true } } },
    take: 500,
  );

  return chunks
    .map(chunk => {
      const embedding = JSON.parse(chunk.embedding) as number[];
      return { chunk, similarity: cosineSimilarity(queryEmbedding, embedding) };
    })
    .filter(r => r.similarity >= 0.7)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

export async function queryRAG(query: { query: string; topicId?: string; topK?: number }): Promise<any> {
  const queryEmbedding = await generateEmbedding(query.query);
  const results = await searchSimilarChunks(queryEmbedding, { topicId: query.topicId, limit: query.topK || 5 });

  const sources = results.map(r => ({
    chunkId: r.chunk.id,
    topicTitle: r.chunk.topic?.title || 'Unknown',
    unitTitle: r.chunk.topic?.unit?.title || 'Unknown',
    pageNum: r.chunk.metadata?.pageNum,
    relevanceScore: r.similarity,
    content: r.chunk.content.substring(0, 500),
  });

  const context = results.map(r => r.chunk.content).join('\n\n---\n\n');
  const answer = await generateAnswer(query.query, context);

  return { chunks: results.map(r => r.chunk), answer, sources, confidence: results.length > 0 ? results[0].similarity : 0 };
}

async function generateAnswer(query: string, context: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return `Based on the curriculum materials:\n\n${context.substring(0, 1000)}...\n\nFor more details, refer to the textbook sections related to your question.`;
  }

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
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: 'You are an expert Design & Technology teacher for 15-year-old students in Mauritius preparing for NCE examinations.' },
            { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Unable to generate response.';
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
  step: string,
  previousMessages: any[] = []
): Promise<any> {
  const result = await queryRAG({ query: question, topicId, topK: 8 });

  if (!result.chunks.length) {
    return { message: "I couldn't find specific curriculum content for this topic.", step: 'learn' };
  }

  return { message: result.answer, step: 'learn', sources: result.sources };
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

function fallbackEmbedding(text: string): number[] {
  const embedding = new Array(1024).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  words.forEach((word, i) => {
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % 1024;
    embedding[index] += 1 / (i + 1);
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embedding = new Array(1024).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  words.forEach((word, i) => {
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % 1024;
    embedding[index] += 1 / (i + 1);
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  options: { topicId?: string; type?: any; limit?: number; threshold?: number } = {}
): Promise<any[]> {
  const { topicId, limit = 5, threshold = 0.7 } = options;

  const chunks = await prisma.contentChunk.findMany({
    where: { ...(topicId && { topicId }) },
    include: { topic: { include: { unit: true } } },
    take: 500,
  );

  return chunks
    .map(chunk => {
      const embedding = JSON.parse(chunk.embedding) as number[];
      return { chunk, similarity: cosineSimilarity(queryEmbedding, embedding) };
    })
    .filter(r => r.similarity >= 0.7)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export async function queryRAG(query: any): Promise<any> {
  const queryEmbedding = await generateEmbedding(query.query);
  const results = await searchSimilarChunks([], { topicId: query.topicId, limit: query.topK || 5 });

  const sources = results.map(r => ({
    chunkId: r.chunk.id,
    topicTitle: r.chunk.topic?.title || 'Unknown',
    unitTitle: r.chunk.topic?.unit?.title || 'Unknown',
    pageNum: r.chunk.metadata?.pageNum,
    relevanceScore: r.similarity,
    content: r.chunk.content.substring(0, 500),
  });

  const context = results.map(r => r.chunk.content).join('\n\n---\n\n');
  const answer = await generateAnswer(query.query, context);

  return { chunks: results.map(r => r.chunk), answer, sources, confidence: results.length > 0 ? results[0].similarity : 0 };
}

async function generateAnswer(query: string, context: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return `Based on the curriculum materials:\n\n${context.substring(0, 1000)}...\n\nFor more details, refer to the textbook sections related to your question.`;
  }

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
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: 'You are an expert Design & Technology teacher for 15-year-old students in Mauritius preparing for NCE examinations.' },
            { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Unable to generate response.';
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
  step: string,
  previousMessages: any[] = []
): Promise<any> {
  const result = await queryRAG({ query: question, topicId, topK: 8 });

  if (!result.chunks.length) {
    return { message: "I couldn't find specific curriculum content for this topic.", step: 'learn' };
  }

  return { message: result.answer, step: 'learn', sources: result.sources };
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

export async function generateQuizFromContent(topicId: string, count: number = 10, types: string[] = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANKS'], difficulty: string = 'BEGINNER'): Promise<any[]> {
  return [];
}

function fallbackEmbedding(text: string): number[] {
  const embedding = new Array(1024).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  words.forEach((word, i) => {
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % 1024;
    embedding[index] += 1 / (i + 1);
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  return fallbackEmbedding(text);
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  options: { topicId?: string; type?: any; limit?: number; threshold?: number } = {}
): Promise<any[]> {
  const { topicId, limit = 5, threshold = 0.7 } = options;

  const chunks = await prisma.contentChunk.findMany({
    where: { ...(topicId && { topicId }) },
    include: { topic: { include: { unit: true } } },
    take: 500,
  });

  return chunks
    .map(chunk => {
      const embedding = JSON.parse(chunk.embedding) as number[];
      return { chunk, similarity: cosineSimilarity(queryEmbedding, embedding) };
    })
    .filter(r => r.similarity >= 0.7)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export async function queryRAG(query: any): Promise<any> {
  const queryEmbedding = await generateEmbedding(query.query);
  const results = await searchSimilarChunks([], { topicId: query.topicId, limit: query.topK || 5 });

  const sources = results.map(r => ({
    chunkId: r.chunk.id,
    topicTitle: r.chunk.topic?.title || 'Unknown',
    unitTitle: r.chunk.topic?.unit?.title || 'Unknown',
    pageNum: r.chunk.metadata?.pageNum,
    relevanceScore: r.similarity,
    content: r.chunk.content.substring(0, 500),
  });

  const context = results.map(r => r.chunk.content).join('\n\n---\n\n');
  const answer = await generateAnswer(query.query, context);

  return { chunks: results.map(r => r.chunk), answer, sources, confidence: results.length > 0 ? results[0].similarity : 0 };
}

async function generateAnswer(query: string, context: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return `Based on the curriculum materials:\n\n${context.substring(0, 1000)}...\n\nFor more details, refer to the textbook sections related to your question.`;
  }

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
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: 'You are an expert Design & Technology teacher for 15-year-old students in Mauritius preparing for NCE examinations.' },
            { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Unable to generate response.';
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
  step: string,
  previousMessages: any[] = []
): Promise<any> {
  const result = await queryRAG({ query: question, topicId, topK: 8 });

  if (!result.chunks.length) {
    return { message: "I couldn't find specific curriculum content for this topic.", step: 'learn' };
  }

  return { message: result.answer, step: 'learn', sources: result.sources };
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