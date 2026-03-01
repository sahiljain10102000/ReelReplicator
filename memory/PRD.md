# AI Reel Replicator - PRD

## Original Problem Statement
Build a lean, production-ready SaaS that replicates Instagram reels using AI, optimized for profitability and low infrastructure cost. Credit-based pricing model with Free (3 watermarked), Starter ($29/50), Pro ($79/200), Agency ($199/1000) tiers.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI (CRA with Craco)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (Motor async driver)
- **Auth**: Emergent Google OAuth
- **AI Generation**: MOCKED (background task simulating video processing)
- **Payments**: MOCKED (credit addition without real Stripe)

## User Personas
1. **D2C Founders** - Running Instagram ads, need quick reel variations
2. **UGC Ad Agencies** - Bulk content creation for clients
3. **Dropshippers** - Testing creatives at scale

## Core Requirements
- Google OAuth login via Emergent Auth
- Credit-based system (deduct 1 credit per generation)
- Multi-step reel creation wizard (upload video → upload face → prompt → review)
- Job queue with status tracking (queued → processing → completed)
- Video preview and download
- Watermark for free-tier users
- 4-tier pricing display

## What's Been Implemented (March 1, 2026)
### Backend
- Emergent Google OAuth (session exchange, /auth/me, logout)
- User management (credits, plan tracking)
- Job CRUD (create with file upload, list, get detail)
- Mock job processor (async background task: queued → processing → completed)
- Pricing API
- Plan upgrade (mock)
- File upload handling (local storage)

### Frontend
- Landing page (hero, features grid, pricing cards, CTA)
- Auth flow (Google OAuth callback, protected routes)
- Dashboard (credits, completed count, in-progress count, quick create, recent jobs)
- Create Reel wizard (4-step: video upload → face upload → prompt → review)
- Job Detail page (status tracking, progress bar, video preview, download)
- Job History (filterable tabs: All/Completed/Processing/Queued/Failed)
- Pricing page (4 plans with upgrade mock)
- Settings page (profile, plan info, logout)
- Navbar with user avatar, credits display, dropdown menu
- Design: Outfit + DM Sans fonts, Electric Indigo (#4f46e5) primary, light theme

## Prioritized Backlog
### P0 (Critical for Production)
- [ ] Real AI video generation (Replicate API or similar)
- [ ] Real Stripe payment integration
- [ ] S3 file storage (instead of local uploads)
- [ ] Content moderation / NSFW filtering

### P1 (Important)
- [ ] Rate limiting (5 req/min per user)
- [ ] Job retry on failure
- [ ] Email notifications on job completion
- [ ] Watermark overlay for free-tier outputs
- [ ] Video duration validation (max 60s)

### P2 (Nice to Have)
- [ ] Batch processing for agency tier
- [ ] API access for agency tier
- [ ] Team seats management
- [ ] Usage analytics dashboard
- [ ] Face consent confirmation flow

## Next Tasks
1. Integrate real AI video generation API (Replicate)
2. Add Stripe payment processing
3. Move file storage to S3
4. Add content moderation
5. Implement rate limiting
