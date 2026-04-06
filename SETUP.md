# ImmerseTrain Setup Guide

## Step 1 — Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com) → Create account → Create new application
2. Name it "ImmerseTrain"
3. Enable **Email/Password** sign-in
4. Go to **API Keys** → copy **Publishable Key** and **Secret Key**
5. Paste into `.env.local`

## Step 2 — Set Yourself as Admin
1. Clerk Dashboard → **Users** → find your user → click
2. **Metadata** tab → **Public metadata**
3. Add: `{ "role": "admin" }`
4. Save — this unlocks the `/admin` dashboard

## Step 3 — Supabase (Database)
1. Go to [supabase.com](https://supabase.com) → Create account → New project
2. Choose **us-east-1** region (closest to NYC)
3. Wait ~2 minutes for provisioning
4. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → Run
5. Go to **Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
6. Paste all three into `.env.local`

## Step 4 — Seed the Database
```bash
npx ts-node supabase/seed.ts
```
Verify data appears in Supabase Table Editor.

## Creator Platform — Storage Bucket (Required)
In Supabase Dashboard → Storage → New bucket:
  Name: scenario-videos
  Public: YES
  File size limit: 500 MB
  Allowed MIME types: video/mp4, video/quicktime, video/webm, video/*

## Step 5 — Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Demo flow:**
1. Sign up → land on dashboard
2. Click "Start Training" on the scenario card
3. Watch the 360° video, answer questions as they appear
4. See your score card at the end
5. Visit `/admin` (after setting admin role) to see all sessions

## Step 6 — Push to GitHub
1. Create an empty repo at [github.com/new](https://github.com/new) (or use an existing empty repo).
2. From the project folder:
   ```bash
   git remote add origin https://github.com/YOUR_USER/immersetrain.git
   git add -A && git commit -m "Initial ImmerseTrain MVP"
   git push -u origin main
   ```
3. If the remote already exists, use `git remote set-url origin ...` instead.

## Step 7 — Deploy to Vercel (avoid common errors)
1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → Import the GitHub repo.
2. **Framework:** Next.js (auto-detected). **Node:** default (20.x) is fine for Next 16.
3. **Environment variables** — add every variable from `.env.local.example` (copy real values from your local `.env.local` or from Clerk / Supabase dashboards). Do **not** commit `.env.local` to git.
   - **Required for full auth:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and all `NEXT_PUBLIC_CLERK_*` URLs.
   - **Required for DB + APIs:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - **Set after first deploy:** `NEXT_PUBLIC_APP_URL` = your production URL (e.g. `https://immersetrain.vercel.app`). Redeploy after changing it.
   - **Video:** `NEXT_PUBLIC_VIDEO_URL` — placeholder or your CDN URL.
4. **Clerk** — In [Clerk Dashboard](https://dashboard.clerk.com) → **Domains** (or **Paths / URLs**): add your Vercel deployment URL so sign-in works. Add production and preview URLs if you use preview deployments.
5. **Supabase** — If you use Supabase Auth with redirects, add your Vercel URL under **Authentication → URL Configuration**. This app uses Clerk for auth; only Supabase REST needs the keys above.
6. Click **Deploy**. If the build fails, open the build log: usually missing env vars or TypeScript errors.

## Step 8 — After deploy
1. Test sign-in on the live URL; if Clerk shows an error, double-check domain allowlist and env vars on Vercel.
2. Run `npm run lint` locally before pushing (warnings are OK; fix **errors** before relying on CI).

## Step 9 — Swap in Real 360° Video (when ready)
1. Create account at [bunny.net](https://bunny.net) → Stream
2. Create Library → Upload your 360° MP4
3. Copy CDN URL: `https://vz-xxxxx.b-cdn.net/video-id/playlist.m3u8`
4. Update `NEXT_PUBLIC_VIDEO_URL` in Vercel → Redeploy

## Step 10 — Test on Meta Quest
1. Open Quest Browser
2. Navigate to your Vercel URL
3. Tap the **VR goggles icon** in the A-Frame player
4. Use **gaze cursor** (look at answer for 1.5 seconds) to select answers

---

## Enable Google Sign-In (5 minutes)
1. Go to console.cloud.google.com
2. Create new project → "ImmerseTrain"
3. APIs & Services → Credentials → Create OAuth Client ID
4. Application type: Web application
5. Authorized redirect URIs:
   https://accounts.clerk.dev/v1/oauth_callback
6. Copy Client ID and Client Secret

7. Go to Clerk Dashboard → User & Authentication →
   Social Connections → Google → Enable
8. Paste Client ID and Client Secret
9. Save

Google sign-in now appears automatically on sign-in/sign-up pages.
No code changes needed.

---

## Pricing Positioning
| | ImmerseTrain | Uptale |
|---|---|---|
| 10 users | $1,000/yr | ~$17,000/yr |
| Savings | — | **94% cheaper** |
| Browser | ✓ | ✓ |
| Meta Quest | ✓ | ✓ |

---

*Questions? Open an issue on GitHub.*
