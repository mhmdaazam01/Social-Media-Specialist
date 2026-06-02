# Deploy Instructions

## Current Status
✅ Auth flow working (login/logout)
✅ Local dev stable
⚠️ Hardcoded Supabase credentials (Turbopack bug workaround)

## Deploy to Vercel

### 1. Push to GitHub
```powershell
git add .
git commit -m "feat: complete auth setup with Google OAuth"
git push
```

### 2. Vercel Environment Variables
Make sure these are set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://xrqjwzucvaiuznghswem.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWp3enVjdmFpdXpuZ2hzd2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTU0ODEsImV4cCI6MjA5NTg5MTQ4MX0.3BGFihNM8J-2xV76uqxqbCR8UJGnzjmgBhR_xvnjS80`

### 3. Update Google OAuth Redirect URI
In Google Cloud Console → Credentials → OAuth 2.0 Client:
Add your Vercel production URL to **Authorized redirect URIs**:
- `https://your-app.vercel.app/auth/callback`

### 4. Update Supabase Redirect URL
In Supabase dashboard → Authentication → URL Configuration:
Add your Vercel production URL to **Site URL** and **Redirect URLs**:
- `https://your-app.vercel.app`
- `https://your-app.vercel.app/auth/callback`

### 5. Deploy
Vercel will auto-deploy after push. Wait ~2 minutes.

### 6. Test Production
- Open your Vercel URL
- Should redirect to `/login`
- Click "Masuk dengan Google"
- Should redirect to dashboard after auth

---

## Known Issues

### Turbopack Bug
- `process.env.NEXT_PUBLIC_*` not working in local dev with Turbopack
- **Workaround**: Hardcoded values in `lib/supabase/client.ts` and `server.ts`
- **Production**: Env vars work fine (Vercel doesn't use Turbopack)

### Future Fix
When Next.js fixes Turbopack env bug, replace hardcoded values with env vars:
```ts
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```

---

## Next Steps After Deploy

1. **Test auth flow in production**
2. **Migrate all pages to use Supabase hooks** (currently still using Zustand/localStorage)
3. **Add default platforms/pillars for new users**
4. **Setup analytics/monitoring** (optional)
