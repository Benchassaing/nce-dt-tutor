-- ============================================
-- SUPABASE pgVECTOR SETUP FOR NCE DT TUTOR
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create embeddings table for RAG
CREATE TABLE IF NOT EXISTS content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1024) NOT NULL,
  metadata JSONB DEFAULT '{}',
  chunk_index INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for fast similarity search
-- IVFFlat index for approximate nearest neighbor (good for 100K+ vectors)
CREATE INDEX IF NOT EXISTS content_embeddings_embedding_idx 
ON content_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Standard B-tree indexes for filtering
CREATE INDEX IF NOT EXISTS content_embeddings_topic_id_idx 
ON content_embeddings (topic_id);

CREATE INDEX IF NOT EXISTS content_embeddings_metadata_type_idx 
ON content_embeddings ((metadata->>'type'));

-- 4. Create the match_chunks RPC function for vector similarity search
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_topic TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  topic_id TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    ce.id,
    ce.topic_id,
    ce.content,
    ce.metadata,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM content_embeddings ce
  WHERE 1 - (ce.embedding <=> query_embedding) > match_threshold
    AND (filter_topic IS NULL OR ce.topic_id = filter_topic)
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 5. Grant permissions for the authenticated role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON content_embeddings TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION match_chunks TO anon, authenticated, service_role;

-- 6. Enable Row Level Security (optional - for production)
ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to all (adjust for production)
CREATE POLICY "Allow read access for all" ON content_embeddings
  FOR SELECT USING (true);

-- Policy: Only service_role can insert/update/delete
CREATE POLICY "Allow write for service role only" ON content_embeddings
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test the extension
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Test the function (run after inserting some data)
-- SELECT * FROM match_chunks(
--   (SELECT embedding FROM content_embeddings LIMIT 1)::vector(1024),
--   0.5, 5, NULL
-- );

-- Check table structure
-- \d content_embeddings

-- Check indexes
-- \di content_embeddings*