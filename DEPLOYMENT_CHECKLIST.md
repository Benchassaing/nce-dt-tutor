# 🚀 NCE DT Tutor - Deployment Checklist

## Pre-Deployment Setup

### 1. Accounts & Services (All Free)
- [ ] **GitHub** - Repository created and code pushed
- [ ] **Vercel** - Account connected to GitHub
- [ ] **Neon** - PostgreSQL database created (0.5 GB free)
- [ ] **Clerk** - Authentication app configured (10k MAU free)
- [ ] **Supabase** - Project created with pgvector (500 MB free)
- [ ] **Anthropic** or **OpenRouter** - AI API key

### 2. Database Setup (Neon)
- [ ] Connection string copied (pooled)
- [ ] Run migrations: `pnpm db:migrate deploy`
- [ ] Seed database: `pnpm db:seed`

### 3. Supabase Configuration
- [ ] pgvector extension enabled
- [ ] `content_embeddings` table created
- [ ] `match_chunks` RPC function created
- [ ] Storage bucket `nce-uploads` created (50 MB, public, PDF only)
- [ ] Storage policies configured (upload, read, delete)

### 4. Environment Variables (Vercel)
```env
# Database
DATABASE_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_..."

# AI (Choose One)
ANTHROPIC_API_KEY="sk-..."  # OR
OPENROUTER_API_KEY="sk-..."
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"

# Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_KEY="eyJ..."  # Service role!

# App
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

### 5. Clerk Configuration
- [ ] Allowed redirect URLs: `https://your-app.vercel.app/*`
- [ ] Sign-in/Sign-up pages configured
- [ ] Webhook endpoint for user sync (optional)

---

## Post-Deployment Verification

### 1. Health Check
- [ ] `https://your-app.vercel.app/api/health` returns 200 OK
- [ ] Database connection works

### 2. Authentication Flow
- [ ] Sign up with email works
- [ ] Sign in works
- [ ] Onboarding page appears for new users
- [ ] Dashboard loads after onboarding

### 3. Core Features
- [ ] **Learning Mode** - Navigate through all 5 steps (Learn→Understand→Practice→Check→Summary)
- [ ] **AI Tutor** - Ask questions, get RAG-based responses
- [ ] **Quiz Practice** - All 7 question types render and submit
- [ ] **Exam Prep** - Past papers load, timer works, submission works
- [ ] **Revision** - Flashcards (SM-2), formulas, diagrams, tips
- [ ] **Study Planner** - Calendar view, session creation, AI generator
- [ ] **Gamification** - XP, badges, streaks display correctly

### 4. Admin Panel
- [ ] PDF upload works (drag & drop)
- [ ] Document processing triggers RAG indexing
- [ ] Topics management accessible
- [ ] Analytics display

### 4. Vector Search (RAG)
- [ ] Ask tutor a question → gets context from embeddings
- [ ] Generate quiz from topic content works

---

## Free Tier Monitoring

### Monthly Checks
- [ ] **Vercel** - Bandwidth < 100 GB, Function execs < 100 GB-hours
- [ ] **Neon** - Storage < 0.5 GB, compute hours reasonable
- [ ] **Supabase** - DB < 500 MB, bandwidth < 2 GB, vectors < limit
- [ ] **Clerk** - MAU < 10,000
- [ ] **Anthropic/OpenRouter** - API credits remaining

### Auto-Suspend Awareness
- Neon auto-suspends after 5 min idle → First request after wake takes 2-3s
- Consider adding a "warm-up" cron job if needed

---

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check DATABASE_URL format, ensure Neon allows Vercel IPs |
| "Clerk redirect loop" | Verify `NEXT_PUBLIC_APP_URL` matches Vercel domain exactly |
| "RAG returns no results" | Check Supabase `content_embeddings` table has data, pgvector enabled |
| "PDF upload fails" | Verify Supabase storage bucket exists, policies allow authenticated upload |
| "Quiz generation fails" | Check Anthropic/OpenRouter API key and credits |
| "CORS error" | Ensure `NEXT_PUBLIC_APP_URL` is in Clerk allowed origins |

---

## Rollback Plan

If deployment breaks:
1. Vercel → Deployments → Click "..." on previous working deploy → "Promote to Production"
2. Or: `git revert HEAD && git push` → Auto-deploys previous version

---

## Performance Optimization (Post-Launch)

### Database
- [ ] Add indexes on frequently queried columns
- [ ] Enable Neon read replicas if needed

### RAG/Vector
- [ ] Monitor embedding quality, adjust chunk size if needed
- [ ] Consider HyDE (Hypothetical Document Embeddings) for better retrieval

### Frontend
- [ ] Enable Vercel Analytics
- [ ] Add React Query caching for dashboard data
- [ ] Implement infinite scroll for large lists

---

## Security Checklist

- [ ] All API routes have auth checks
- [ ] Admin routes check for `role === 'ADMIN'`
- [ ] File uploads validated (type, size)
- [ ] Supabase RLS policies enabled
- [ ] No secrets in client-side code
- [ ] CSP headers configured (Vercel defaults)

---

## Support & Maintenance

### Weekly
- [ ] Check error logs in Vercel Functions
- [ ] Monitor Neon query performance
- [ ] Verify Supabase vector index health

### Monthly
- [ ] Rotate API keys (Clerk, Anthropic, Supabase)
- [ ] Update dependencies (`pnpm update`)
- [ ] Review and prune old embeddings

---

## 🎉 Success Criteria

The deployment is successful when:
- ✅ Student can sign up, complete onboarding, and reach dashboard
- ✅ Learning mode works for at least 3 topics
- ✅ AI tutor answers curriculum-based questions
- ✅ Quiz practice submits and shows results
- ✅ Exam prep loads past papers
- ✅ Flashcards use spaced repetition
- ✅ Admin can upload PDF and process it
- ✅ All pages load under 3s (first load may be slower due to Neon cold start)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Supabase Docs: https://supabase.com/docs
- Clerk Docs: https://clerk.com/docs