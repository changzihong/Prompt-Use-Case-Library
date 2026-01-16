# PRD — Prompt & Use‑Case Library (Photo‑Proof Edition)

## 1) One‑page summary
- **Concept**: Internal library where employees share prompts + use‑case scenarios + proof photos (max 2). Posts auto‑delete after 2 weeks. Users comment, rate 1–5⭐, view analytics dashboard.
- **Who**: All employees (post, comment, rate, view).
- **Outcome**: Time‑boxed knowledge sharing with visual proof; high‑quality feedback loop; discover top performers via dashboard.
- **Tech stack**: Supabase (database, storage, auth), GPT‑4o‑mini (safety check, tags).
- **MVP**: Post Card (2 photos), Browse/Search, Comment, Rate (1–5⭐), Dashboard, Auto‑delete after 14 days.

---

## 2) Users & roles
- **Contributor** — posts cards with photos; updates; responds to comments.
- **Explorer** — browses, comments, rates cards.
- **Admin** — removes flagged content; monitors dashboard.

---

## 3) Pages / screens
- **Home/Feed** — discover cards; filters (dept, tags, top‑rated) → open Card.
- **Card Detail** — prompt, use‑case, photos (max 2), comments, rate 1–5⭐, days remaining.
- **Post Card** — create/edit; upload 2 photos; AI safety check → submit.
- **Dashboard** — top‑rated cards this week/all‑time; view count leaders; comment activity; dept breakdown.
- **Profile** — user's cards, avg rating, total views, comments received.
- **My Library** — saved/copied cards (optional).

---

## 4) Flows
- **Contributor**: New → Post Card → upload photos (max 2) → AI safety check → submit → visible 14 days → auto‑delete → optional re‑post.
- **Explorer**: Browse → open Card → view photos → read comments → rate 1–5⭐ → comment feedback → share.
- **Admin**: Review reports → remove card/comment → check dashboard trends.

---

## 5) Card submission — required fields
- **Title** (60 char max).
- **Use‑case scenario** (2–3 sentences: problem solved).
- **Prompt** (copy‑paste block; 2000 char max).
- **Proof photos** (1–2 images; PNG/JPG; max 5MB each; screenshots of results).
- **Tags** (auto‑suggested by GPT‑4o‑mini + manual; dept, function).
- **Metadata**: author, createdAt, expiresAt (createdAt + 14 days).

---

## 6) Rating & comments — rules
- **Rate ⭐**: 1–5 stars; one rating per user per card (can update); no self‑rating.
- **Comments**: threaded replies; max 500 char/comment; edit within 5 min.
- **Daily limit**: max 10 ratings + 20 comments per user.
- **Auto‑delete**: Card + photos + comments removed after 14 days; ratings archived for dashboard stats.

---

## 7) Dashboard — metrics
- **Top‑Rated This Week**: cards posted in last 7 days, sorted by avg rating.
- **Most Viewed**: total views (last 7/30 days).
- **Most Commented**: engagement count.
- **By Department**: which teams post/rate most.
- **Trending Tags**: top 10 tags this week.
- **Expiring Soon**: cards with <3 days left.

---

## 8) Safety & moderation (GPT‑4o‑mini)
- **AI safety check** on submit:
  - Block secrets (API keys, emails, phone, passwords).
  - Flag inappropriate content (profanity, PII).
  - Suggest tags based on prompt text.
- **Photo scan**: OCR check for visible PII in screenshots (warn user).
- **Report button**: users flag cards/comments → admin queue.
- **Rate limits**: max 3 posts/day; max 10 ratings/day; max 20 comments/day.

---

## 9) Data model (Supabase)

### Tables
#### users
```sql
{
  id: UUID (PK),
  name: TEXT,
  email: TEXT,
  dept: TEXT,
  role: TEXT,
  createdAt: TIMESTAMP
}
```

#### cards
```sql
{
  id: UUID (PK),
  title: TEXT,
  useCase: TEXT,
  prompt: TEXT,
  tags: TEXT[],
  authorId: UUID (FK → users),
  createdAt: TIMESTAMP,
  expiresAt: TIMESTAMP (createdAt + 14 days),
  viewCount: INTEGER
}
```

#### photos
```sql
{
  id: UUID (PK),
  cardId: UUID (FK → cards),
  url: TEXT (storage bucket path),
  order: INTEGER (1 or 2),
  uploadedAt: TIMESTAMP
}
```

#### ratings
```sql
{
  id: UUID (PK),
  userId: UUID (FK → users),
  cardId: UUID (FK → cards),
  stars: INTEGER (1–5),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  UNIQUE(userId, cardId)
}
```

#### comments
```sql
{
  id: UUID (PK),
  userId: UUID (FK → users),
  cardId: UUID (FK → cards),
  text: TEXT,
  parentId: UUID (FK → comments, nullable),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### reports
```sql
{
  id: UUID (PK),
  userId: UUID (FK → users),
  cardId: UUID (FK → cards, nullable),
  commentId: UUID (FK → comments, nullable),
  reason: TEXT,
  status: TEXT (pending/resolved),
  createdAt: TIMESTAMP
}
```

### Storage
- **Bucket: card_photos** (public read; auth write; max 5MB/file; PNG/JPG only).

### Functions
- **auto_delete_expired()**: Daily cron (00:00 UTC) → delete cards where expiresAt < NOW().
- **ai_safety_check(text, photoUrls)**: Call GPT‑4o‑mini API → return {safe: bool, issues: [], suggestedTags: []}.

---

## 10) Auto‑delete logic
- **Trigger**: Daily cron job (Supabase Edge Function or pg_cron).
- **Action**: 
  1. Find cards where `expiresAt < NOW()`.
  2. Delete related photos from storage bucket.
  3. Soft‑delete card row (or hard delete + archive ratings for dashboard stats).
  4. Send optional email: "Your card expired; re‑post if still relevant."
- **Ratings preservation**: Archive ratings data before deletion for historical dashboard metrics.

---

## 11) Acceptance criteria

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Post card | I create a card with 2 photos | I submit | Card appears in Feed with 14‑day countdown |
| Rate card | A card exists | I rate 1–5⭐ | Avg rating updates; I cannot rate again (can update) |
| Auto‑delete | 14 days pass | Cron runs | Card + photos auto‑delete; comments archive |
| Safety check | Card contains API key | I submit | GPT‑4o‑mini blocks with warning |
| Dashboard | I open Dashboard | I filter "Top‑Rated This Week" | See cards from last 7 days sorted by avg stars |
| Photo limit | I try to upload 3rd photo | I click add | UI blocks (max 2 photos) |
| Comment | I view a card | I post comment | Comment appears; can edit for 5 min |
| View count | I open a card | Page loads | viewCount increments by 1 |

---

## 12) Build plan (step order)

### Phase 1: Foundation (Days 1–2)
1. **Supabase setup**: Create tables (users, cards, photos, ratings, comments, reports).
2. **Storage bucket**: Create `card_photos` bucket with 5MB limit, PNG/JPG only.
3. **Auth**: Configure Supabase Auth (email/SSO).

### Phase 2: Core Features (Days 3–5)
4. **CRUD cards**: Build Post Card form → upload photos (max 2) → validate → submit.
5. **AI integration**: GPT‑4o‑mini safety check API → block secrets/PII → suggest tags.
6. **Feed & Card Detail**: List cards with filters → open card → display photos, prompt, use‑case.

### Phase 3: Engagement (Days 6–8)
7. **Rating system**: 1–5⭐ UI; one rating per user per card; compute avg rating.
8. **Comments**: Threaded replies; CRUD with 5‑min edit window; real‑time updates.
9. **View tracking**: Increment viewCount on card open.

### Phase 4: Analytics (Days 9–10)
10. **Dashboard**: Build SQL views for:
    - Top‑rated (last 7 days)
    - Most viewed (7/30 days)
    - Most commented
    - Trending tags
    - Expiring soon (<3 days)
    - Dept breakdown
11. **Profile page**: User's cards, avg rating, total views, comments received.

### Phase 5: Automation & Admin (Days 11–12)
12. **Auto‑delete cron**: Supabase Edge Function (daily 00:00 UTC) → delete expired cards + photos.
13. **Admin panel**: Reports queue; manual delete cards/comments.
14. **Rate limiting**: Enforce 3 posts/day, 10 ratings/day, 20 comments/day per user.

### Phase 6: Polish (Days 13–14)
15. **UI/UX**: Photo preview/gallery, countdown timer, responsive design, loading states.
16. **Testing**: End‑to‑end tests for all flows.
17. **Documentation**: User guide, admin guide, API docs.

---

## 13) Non‑goals (later)
- Email notifications for comments/ratings
- Badges and gamification
- Card collections/folders
- Export cards to PDF
- AI‑generated prompt summaries
- Versioning/edit history
- Dark mode
- Mobile app

---

## 14) Risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Low‑quality posts | Medium | AI safety check + require 2 proof photos |
| Abuse (spam ratings/comments) | High | Daily limits (10 ratings, 20 comments); report button |
| Storage bloat | Medium | Auto‑delete after 14 days; max 5MB/photo; 2 photo limit |
| GPT‑4o‑mini API cost | Medium | Cache common checks; rate‑limit to 3 posts/day/user |
| PII in screenshots | High | OCR scan warnings; manual admin review |
| Inappropriate content | High | AI content filter + user reports + admin moderation |
| Database performance | Low | Index on expiresAt, createdAt, authorId; paginate feeds |

---

## 15) Demo checklist

### Pre‑demo setup
- [ ] Seed 10 sample cards with photos
- [ ] Create 3 test users (contributor, explorer, admin)
- [ ] Add sample comments and ratings

### Demo flow
- [ ] **Post card**: Upload 2 photos → AI safety check passes → submit → see 14‑day countdown
- [ ] **Browse**: Filter by dept/tags → open card → view photos
- [ ] **Engage**: Comment on card → reply in thread → rate 1–5⭐
- [ ] **Dashboard**: Show top‑rated cards this week → most viewed → trending tags → expiring soon
- [ ] **Profile**: View user's cards, avg rating, total views
- [ ] **Safety**: Try to submit card with API key → GPT‑4o‑mini blocks it with warning
- [ ] **Auto‑delete**: Manually trigger cron → card + photos disappear from feed
- [ ] **Admin**: View reports queue → remove flagged comment

---

## 16) Success metrics (30 days post‑launch)

- **Engagement**: 
  - 80%+ of employees post ≥1 card
  - Avg 5 comments per card
  - Avg 10 ratings per card
  
- **Quality**:
  - <5% cards flagged for safety issues
  - Avg rating ≥3.5⭐
  
- **Retention**:
  - 50%+ of users return weekly
  - 30%+ of expired cards re‑posted

- **Dashboard usage**:
  - 60%+ of users check dashboard weekly

---

## 17) Tech stack summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | Supabase (PostgreSQL) | Store users, cards, ratings, comments |
| Storage | Supabase Storage | Host card photos (max 5MB) |
| Auth | Supabase Auth | Email/SSO authentication |
| AI Safety | GPT‑4o‑mini API | Content moderation, tag suggestions |
| Backend | Supabase Edge Functions | Auto‑delete cron, API endpoints |
| Frontend | React + Tailwind CSS | Responsive UI |
| Deployment | Vercel / Netlify | Hosting |

---

## 18) API endpoints (example)

### Cards
- `POST /api/cards` — Create card (with AI safety check)
- `GET /api/cards` — List cards (with filters: dept, tags, top‑rated)
- `GET /api/cards/:id` — Get card details
- `PUT /api/cards/:id` — Update card (author only)
- `DELETE /api/cards/:id` — Delete card (author/admin only)

### Ratings
- `POST /api/cards/:id/rate` — Rate card (1–5⭐; upsert)
- `GET /api/cards/:id/ratings` — Get card's ratings

### Comments
- `POST /api/cards/:id/comments` — Add comment
- `GET /api/cards/:id/comments` — Get card's comments (threaded)
- `PUT /api/comments/:id` — Edit comment (5‑min window)
- `DELETE /api/comments/:id` — Delete comment (author/admin)

### Dashboard
- `GET /api/dashboard/top-rated` — Top‑rated cards (last 7 days)
- `GET /api/dashboard/most-viewed` — Most viewed cards
- `GET /api/dashboard/trending-tags` — Top 10 tags this week
- `GET /api/dashboard/expiring-soon` — Cards expiring in <3 days

### Admin
- `GET /api/admin/reports` — Get reports queue
- `PUT /api/admin/reports/:id` — Resolve report
- `DELETE /api/admin/cards/:id` — Admin delete card

---

## Appendix A: GPT‑4o‑mini Safety Check

### Input
```json
{
  "title": "Customer Email Generator",
  "useCase": "Generate personalized emails for customers",
  "prompt": "Write an email to {customer_name} about {topic}...",
  "photoUrls": ["https://storage.../photo1.jpg", "https://storage.../photo2.jpg"]
}
```

### Response
```json
{
  "safe": true,
  "issues": [],
  "suggestedTags": ["email", "customer-service", "automation"],
  "piiDetected": false
}
```

### Blocked example
```json
{
  "safe": false,
  "issues": ["API key detected: sk-proj-...", "Email address found: user@company.com"],
  "suggestedTags": [],
  "piiDetected": true
}
```

---

## Appendix B: Sample SQL queries

### Auto‑delete expired cards
```sql
DELETE FROM cards 
WHERE expiresAt < NOW()
RETURNING id;
```

### Top‑rated cards this week
```sql
SELECT 
  c.id,
  c.title,
  c.useCase,
  AVG(r.stars) as avg_rating,
  COUNT(r.id) as rating_count
FROM cards c
LEFT JOIN ratings r ON c.id = r.cardId
WHERE c.createdAt >= NOW() - INTERVAL '7 days'
GROUP BY c.id
ORDER BY avg_rating DESC, rating_count DESC
LIMIT 10;
```

### User daily rating count
```sql
SELECT COUNT(*) 
FROM ratings 
WHERE userId = $1 
  AND createdAt::date = CURRENT_DATE;
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Owner**: Product Team