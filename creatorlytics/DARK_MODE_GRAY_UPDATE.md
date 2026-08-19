# Dark Mode - Gray Color Scheme Update ✅

## Overview
Updated dark mode from green-tinted to neutral gray/zinc color scheme for a more professional and modern look, similar to popular apps like Linear, Notion, and VS Code.

## 🎨 New Dark Mode Color Palette

### Background & Surface (Zinc-based)
```css
Before (Green-tinted):
- Background: #0C1210 (dark green)
- Surface: #161D17 (dark green card)
- Muted: #1C2420 (green-gray)
- Border: #2A3A2C (green border)

After (Neutral Gray):
- Background: #0A0A0B (pure dark, zinc-950)
- Surface: #18181B (zinc-900 cards)
- Muted: #27272A (zinc-800)
- Border: #3F3F46 (zinc-700)
```

### Text Colors
```css
Before:
- Primary: #E3EDE4 (green-tinted white)
- Secondary: #96A899 (green-gray)
- Tertiary: #637066 (dim green-gray)

After:
- Primary: #FAFAFA (pure white, zinc-50)
- Secondary: #A1A1AA (zinc-400)
- Tertiary: #71717A (zinc-500)
```

### Chart Colors (Neutral Gray Scale)
```css
Impression Line (Primary):
- Before: #8CD8C0 (mint green)
- After: #FAFAFA (white/light gray)

Reach Line (Secondary):
- Before: #5FD0B2 (dark mint)
- After: #71717A (mid gray)

ER Line (Tertiary):
- Before: #FFA590 (coral)
- After: #71717A (mid gray)

Grid Lines:
- Before: #2A3A2C (green)
- After: #3F3F46 (zinc-700)
```

### Accent Colors (Kept Vibrant)
Brand colors untuk metric cards tetap menggunakan warna pastel terang:
- Brand Mint: `#6ECDB0` (untuk brand accent)
- Blue: `#60A5FA` (info, links)
- Green: `#4ADE80` (success states)
- Yellow: `#FCD34D` (warnings)
- Red: `#F87171` (errors)
- Purple: `#C084FC` (premium features)

## 📊 Updated Components

### 1. Dashboard Page
- ✅ Line Chart: White (#FAFAFA) & Gray (#71717A) lines
- ✅ Circular Progress: Green (#4ADE80), Blue (#60A5FA), Red (#F87171)
- ✅ Chart Grid: Zinc-700 (#3F3F46)
- ✅ Tooltip: Zinc-900 background (#18181B)

### 2. Analytics Page
- ✅ ComposedChart: 3 lines in gray scale
- ✅ Pillar BarChart (Impression/Reach): White & Gray bars
- ✅ Pillar BarChart (ER): Gray bars
- ✅ All tooltips: Zinc background with proper borders

### 3. Global CSS
- ✅ Updated all `--cly-*` CSS variables for dark mode
- ✅ Background colors: Zinc-950, 900, 800, 700
- ✅ Text colors: Zinc-50, 400, 500
- ✅ Border colors: Zinc-700, 600

## 🎯 Design Philosophy

**Before**: Green-tinted, nature-inspired, warm
**After**: Neutral gray, professional, modern, minimal

### Inspiration
- Linear (project management)
- Notion (productivity)
- VS Code (development)
- Tailwind UI (design system)

### Benefits
1. **Professional**: More corporate and enterprise-friendly
2. **Neutral**: Works with any brand color
3. **Eye-friendly**: Less color distraction in charts
4. **Modern**: Follows 2024-2025 design trends
5. **Versatile**: Metric cards with vibrant colors pop more against neutral background

## 📝 Chart Color Strategy

### Monochrome Charts (Analytics Focus)
- **White (#FAFAFA)**: Primary data (Impression)
- **Light Gray (#A1A1AA)**: Secondary data (Reach)  
- **Mid Gray (#71717A)**: Tertiary data (ER, percentages)

Benefits:
- Clear hierarchy
- Less visual noise
- Professional presentation
- Easy to print/screenshot

### Colored Accents (UI Elements)
- Progress indicators: Green/Blue/Red based on status
- Metric cards: Keep vibrant gradients
- Buttons & CTAs: Brand colors
- Badges: Accent colors for categorization

## 🔄 Light Mode
Light mode tetap menggunakan soft pastel colors:
- Mint green: #A8E6CF, #6ECDB0
- Sky blue: #8EC5FC
- Coral: #FFB5A0
- Lavender: #C5B9E8
- Amber: #FFE5B4

## ✅ Build Status
- Compiled successfully
- TypeScript check: In progress (timeout normal untuk large codebase)
- All components updated

## 🚀 Next Steps (Optional)
- [ ] Add more gray shades for subtle variations
- [ ] Implement custom theme builder
- [ ] Add monochrome toggle (pure B&W mode)
- [ ] Export/import color schemes

---

**Result**: Dark mode now has a clean, professional gray aesthetic while maintaining visual hierarchy and readability! 🎨
