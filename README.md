# NCE Design & Technology Virtual Tutor

An AI-powered learning platform for Mauritian students preparing for the National Certificate of Education (NCE) Design & Technology examinations.

## 🎯 Project Overview

**Target Users:** 15-year-old students in Mauritius  
**Purpose:** Personal 24/7 AI Design & Technology tutor aligned with the official NCE curriculum  
**Stack:** Next.js 14+, TypeScript, Tailwind CSS, ShadCN UI, PostgreSQL, Prisma, Clerk, Anthropic Claude API

## ✨ Features

### 🎓 Learning Mode (5-Step Pedagogy)
- **Learn** - Simple explanations with Mauritius-specific examples
- **Understand** - Interactive questions with progressive hints
- **Practice** - Hands-on exercises (drawing, calculation, design)
- **Check** - Mini-quiz with immediate feedback
- **Summary** - Key revision notes, formulas, and exam tips

### 🧠 AI Tutor (RAG-Powered)
- Responses grounded in official curriculum (Technology Studies Grade 9 DnT textbook)
- Past paper analysis (2023-2025 NCE papers)
- Never invents syllabus content outside provided materials
- Adapts language to 15-year-old level

### 📝 Quiz System (7 Question Types)
- Multiple Choice, True/False, Match the Following
- Fill in Blanks, Diagram Labeling
- Short Answer (AI-assisted grading), Exam-Style
- Adaptive difficulty based on performance

### 📊 Exam Preparation
- Past paper practice (2023, 2024, 2025)
- Timed mock exams with auto-grading
- Detailed analysis: topic breakdown, mistake analysis, readiness score
- AI-generated mock exams matching NCE structure

### 🎮 Gamification
- XP points, levels (1-15+)
- 16+ achievement badges
- Learning streaks with freeze protection
- Weekly goals and progress milestones

### 📈 Progress Analytics
- Real-time dashboard with charts (Recharts)
- Weak area identification with recommendations
- Spaced repetition flashcards (SM-2 algorithm)
- Study planner with auto-scheduling

### 👨‍👩‍👧 Parent/Teacher View
- Student progress summaries
- Time spent studying
- Scores and weak areas
- Upcoming study sessions

### 🛠 Admin Panel
- PDF upload with automatic RAG processing
- Topic/curriculum management
- Student analytics
- Badge and content management

## 📚 Curriculum Coverage

Based on **Technology Studies Grade 9 Design and Technology** textbook:

| Unit | Title | Topics |
|------|-------|--------|
| U1 | Green Design | Renewable energy, eco-materials, sustainability |
| U2 | Pictorial Projection | Isometric, oblique, perspective, shading |
| U3 | Material Technology | Wood, metals, plastics, manufactured boards, tools |
| U4 | Electricity & Electronics | Circuits, components, Ohm's Law, safety |
| U5 | Orthographic Projection | 1st/3rd angle, dimensions, sections, assemblies |
| U6 | Mechanisms | Levers, linkages, cams, gears, pulleys |
| U7 | Pneumatics & Hydraulics | Air/oil systems, components, circuits |
| U8 | Design Process | Brief, research, ideas, development, evaluation |

**Total: 39 topics, 400+ minutes of content**

---

## 🚀 Free Tier Deployment (Vercel + Neon + Supabase)

### Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│    Neon     │     │  Supabase   │
│  (Frontend) │     │ (PostgreSQL)│     │ (pgvector)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
   Next.js 14          0.5 GB DB          Vectors + Storage
   Serverless          Auto-suspend       500 MB free
```

### Prerequisites
- GitHub account
- Node.js 20+ (for local development)

### Step 1: Push to GitHub
```bash
cd nce-dt-tutor
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/nce-dt-tutor.git
git push -u origin main
```

### Step 2: Set Up Free Services

#### 🗄️ Neon Database (PostgreSQL)
1. Go to **https://neon.tech** → Sign up with GitHub
2. Create Project → Name: `nce-dt-tutor`
3. Copy **Pooled Connection String**:
   ```
   postgresql://user:***@ep-xxx.us-east-1.aws.neon.tech/nce_dt_tutor?sslmode=require
   ```

#### 🔐 Clerk Authentication
1. Go to **https://clerk.com** → Create Application
2. Choose "Email/Password" + "Google" providers
3. Get API Keys from **Settings → API Keys**:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

#### 🤖 AI Provider (Choose One)

**Option A: Anthropic Direct** (best quality)
- Go to **https://console.anthropic.com** → Get API Key
- Free tier: $5 credit

**Option B: OpenRouter** (has free models)
- Go to **https://openrouter.ai** → Get API Key
- Try free model: `meta-llama/llama-3.1-8b-instruct:free`

#### 📦 Supabase (Vectors + Storage)
1. Go to **https://supabase.com** → New Project
2. **Settings → API** → Copy:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public)
   - `SUPABASE_SERVICE_KEY` (service_role - keep secret!)

3. **Run this SQL** in Supabase **SQL Editor**:
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1024) NOT NULL,
  metadata JSONB DEFAULT '{}',
  chunk_index INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX ON content_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON content_embeddings (topic_id);

-- Create match_chunks function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_topic TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, topic_id TEXT, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE sql STABLE AS $$
  SELECT ce.id, ce.topic_id, ce.content, ce.metadata,
         1 - (ce.embedding <=> query_embedding) AS similarity
  FROM content_embeddings ce
  WHERE 1 - (ce.embedding <=> query_embedding) > match_threshold
    AND (filter_topic IS NULL OR ce.topic_id = filter_topic)
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Permissions
GRANT ALL ON content_embeddings TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION match_chunks TO anon, authenticated, service_role;
```

### Step 3: Deploy to Vercel
1. Go to **https://vercel.com** → Import GitHub Repository
2. Select your `nce-dt-tutor` repo
3. **Environment Variables** → Add all from below:

```env
# Database (Neon)
DATABASE_URL="postgresql://user:***@ep-xxx.neon.tech/nce_dt_tutor?sslmode=require"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_t...n"

# AI Provider (ONE of these)
ANTHROPIC_API_KEY="sk-a...n"
# OR
# OPENROUTER_API_KEY="sk-o..."
# OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"

# Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_KEY="eyJ..."  # Service role!

# App
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

4. Click **Deploy** → Wait 2-3 minutes → Done! 🎉

### Step 4: Run Migrations (Post-Deploy)
In Vercel Dashboard → **Functions** tab, or locally:
```bash
# Run once after first deploy
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

---

## 💰 Free Tier Limits Summary

| Service | Free Limit | Notes |
|---------|------------|-------|
| **Vercel** | 100 GB bandwidth/mo | Perfect for Next.js |
| **Neon** | 0.5 GB storage | Auto-suspends after 5 min idle |
| **Supabase** | 500 MB DB + pgvector | 2 GB bandwidth, 1 GB storage |
| **Clerk** | 10,000 MAU | Plenty for student app |
| **Anthropic** | $5 credit | ~500K tokens |
| **OpenRouter** | Free models available | Check model pricing |

---

## 🛠 Alternative: Railway (All-in-One)

If you prefer a single platform:

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login & Deploy
railway login
railway init
railway up
```

Railway provides $5/month credit which covers:
- Web service + PostgreSQL + Redis
- No separate accounts needed
- Automatic deployments on push

**railway.json** is included in the repo.

---

## 📁 Project Structure

```
nce-dt-tutor/
├── prisma/
│   ├── schema.prisma      # 30+ models
│   └── seed.ts            # Full curriculum data
├── src/
│   ├── app/
│   │   ├── (dashboard)/   # Protected routes
│   │   ├── (auth)/        # Clerk auth pages
│   │   ├── api/           # REST endpoints
│   │   └── page.tsx       # Landing page
│   ├── components/        # UI + feature components
│   ├── lib/               # AI, DB, utilities
│   └── types/             # TypeScript definitions
├── supabase/
│   └── vector-setup.sql   # pgvector setup
├── .github/workflows/     # Auto-deploy CI/CD
└── railway.json           # Railway config
```

---

## 🧪 Local Development

```bash
# 1. Install
pnpm install

# 2. Configure environment
cp .env.example .env
# Fill in all values from your free services

# 3. Database setup
pnpm db:generate
pnpm db:push
pnpm db:seed

# 4. Start dev server
pnpm dev
# → http://localhost:3000
```

---

## 📖 Documentation

- [Architecture Docs](docs/ARCHITECTURE.md) - Full system design
- [Supabase Setup](supabase/vector-setup.sql) - Vector DB configuration
- [API Reference](docs/API.md) - Auto-generated from OpenAPI

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Open Pull Request → Auto-deploys preview on Vercel

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Mauritius Examinations Syndicate** - Past papers
- **Ministry of Education** - Curriculum framework
- **Anthropic** - Claude API for AI tutoring
- **Vercel/Neon/Supabase** - Generous free tiers
- **ShadCN** - Beautiful UI components

---

## 📞 Support

For issues and feature requests, please open a GitHub issue.

**Built with ❤️ for Mauritius students** 🇲🇺