# Thumbnail Auto-Fetch Update

## What Was Fixed

The thumbnail auto-fetch feature now properly handles **normal social media post URLs** in addition to embed URLs.

### Previous Issue
- Thumbnails only worked for embed URLs like `https://www.tiktok.com/oembed?url=...`
- Normal post URLs like `https://www.tiktok.com/@user/video/123456` failed to fetch thumbnails
- Instagram `/p/` and `/reel/` URLs weren't working properly

### What Changed

#### 1. **TikTok URL Handling**
- Now removes query parameters before calling oEmbed API
- Example: `https://www.tiktok.com/@tsukiiijat/video/7645284471247211794?is_from_webapp=1`
  - Cleaned to: `https://www.tiktok.com/@tsukiiijat/video/7645284471247211794`
  - Then fetched via: `https://www.tiktok.com/oembed?url=...`

#### 2. **Instagram URL Handling**
- Adds trailing slash to `/p/`, `/reel/`, and `/tv/` URLs for oEmbed compatibility
- Example: `https://www.instagram.com/p/DbsBZISgUsf`
  - Cleaned to: `https://www.instagram.com/p/DbsBZISgUsf/`
  - Then tries multiple strategies:
    1. Instagram oEmbed API (`https://api.instagram.com/oembed?url=...`)
    2. Scraping og:image meta tags from the page
    3. Direct media URL (`https://www.instagram.com/p/SHORTCODE/media/?size=l`)

#### 3. **Better Logging**
Added comprehensive console logging to debug issues:
- URL detection and cleaning
- API calls and responses
- Fallback strategies
- Error details

## How It Works

When you paste a social media link in the Content page:

1. **Link field is saved** → API call to `/api/thumbnail?url=...`
2. **Platform auto-detection** → TikTok, Instagram, YouTube, etc.
3. **URL cleaning** → Remove query params, add trailing slashes
4. **Fetch thumbnail** → Try multiple strategies:
   - Platform-specific oEmbed APIs
   - Web scraping for og:image meta tags
   - Direct media URLs
5. **Proxy through server** → `/api/thumbnail/proxy?url=...` (avoids CORS)
6. **Update post** → Thumbnail saved to database and displayed

## Supported Platforms

### ✅ TikTok
- Video URLs: `https://www.tiktok.com/@username/video/123456789`
- With query params: `https://www.tiktok.com/@username/video/123456789?is_from_webapp=1`

### ✅ Instagram
- Posts: `https://www.instagram.com/p/ABC123/`
- Reels: `https://www.instagram.com/reel/ABC123/`
- TV: `https://www.instagram.com/tv/ABC123/`

### ✅ YouTube
- Videos: `https://www.youtube.com/watch?v=ABC123`
- Shorts: `https://www.youtube.com/shorts/ABC123`
- Short URLs: `https://youtu.be/ABC123`

## Database Migration Required

⚠️ **IMPORTANT**: Run this SQL in Supabase SQL Editor:

```sql
-- Add thumbnail column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Add comment for documentation
COMMENT ON COLUMN posts.thumbnail IS 'URL to post thumbnail image (auto-fetched from link)';
```

See: `SUPABASE_MIGRATION_THUMBNAIL.sql`

## Testing

To test the feature:

1. Go to Content page (`/content`)
2. Add a new row or edit existing post
3. Click on the "Link Content" cell
4. Paste one of these test URLs:
   - TikTok: `https://www.tiktok.com/@tsukiiijat/video/7645284471247211794?is_from_webapp=1`
   - Instagram: `https://www.instagram.com/p/DbsBZISgUsf/`
5. Press Enter or click outside the cell
6. Wait for loading spinner → Thumbnail should appear next to the title

## Troubleshooting

### Check Browser Console
Open browser DevTools (F12) → Console tab to see:
- API calls and responses
- URL cleaning steps
- Thumbnail fetch results
- Any errors

### Check Server Logs
Run dev server and watch terminal for:
```
Thumbnail API called with URL: ...
Detected TikTok URL
TikTok URL cleaned: ...
TikTok oEmbed URL: ...
TikTok oEmbed response: { thumbnail_url: '...' }
Successfully fetched thumbnail: ...
```

### Common Issues

1. **No thumbnail appears**
   - Check if database migration was run
   - Check browser console for errors
   - Check server logs for API failures

2. **CORS errors**
   - Thumbnails should go through `/api/thumbnail/proxy` to avoid CORS
   - Check Content page code uses proxy URL

3. **Instagram not working**
   - Instagram restricts scraping and requires auth for some posts
   - Private posts won't work
   - Some business accounts may block access

4. **TikTok not working**
   - TikTok oEmbed may rate-limit requests
   - Some regional content may not be accessible
   - Try without query parameters

## Files Modified

- `app/api/thumbnail/route.ts` - Main API route with improved URL handling
- `app/api/thumbnail/proxy/route.ts` - CORS proxy (already existed)
- `app/content/page.tsx` - Frontend integration (already existed)
- `types/index.ts` - Added thumbnail field to Post type (already existed)
- `lib/utils/thumbnail.ts` - Helper functions (already existed)

## Next Steps

1. ✅ Run database migration
2. ✅ Test with various URLs
3. 🔄 Consider adding retry mechanism for failed fetches
4. 🔄 Consider caching thumbnails to reduce API calls
5. 🔄 Add user feedback for failed thumbnail fetches
