# Creatorlytics SaaS — Revisi Plan v2
## Dashboard / Analytics / Report

> Tujuan revisi: mengunci pembagian fungsi 3 page, menghilangkan overlap yang tidak perlu, dan memastikan seluruh insight/angka yang tampil selalu didukung data nyata.

---

# 1. Product Architecture

## Prinsip utama

### Dashboard
**What is happening?**

Quick monitoring. User harus memahami kondisi social media dalam 5–10 detik.

### Analytics
**Why is it happening?**

Deep investigation. User mencari penyebab, perbandingan, pola, dan performa konten/platform.

### Report
**How do I present the result?**

Shareable business report. User mendapatkan narrative + supporting data yang siap dibagikan atau di-export.

### Appendix
**What data supports this report?**

Raw/supporting detail. Tidak menjadi tempat utama untuk insight atau AI narrative.

---

# 2. DASHBOARD

## Tujuan

Dashboard = performance snapshot.

## Struktur

### A. KPI Summary

Gunakan 6 KPI utama:

- Total Posts
- Total Impression
- Total Reach
- Total Engagement
- Average ER
- Goal Progress

### B. Performance Snapshot

Metrics:

- Reach
- Impression
- Engagement
- ER

Controls:

- Date range
- Daily
- Weekly / Monthly jika memang tersedia secara konsisten

Dashboard tidak perlu menampilkan terlalu banyak metric sekaligus.

### C. Top 3 Content

Tampilkan:

- Rank
- Thumbnail
- Title
- Platform
- Reach
- Engagement
- ER

Tujuan: quick scan, bukan content investigation.

### D. Goal Progress

Tampilkan:

- Goal name
- Current
- Target
- Progress %

### E. Performance Insight Cards

Jangan membuat 3 card yang semua artinya "top content".

Gunakan 3 fungsi berbeda:

1. **Best Performer**
   - Menunjukkan pemenang berdasarkan metric yang relevan.

2. **Biggest Opportunity / Attention**
   - Menunjukkan masalah atau peluang berdasarkan data.

3. **Recommended Action**
   - Menjelaskan action yang dapat dilakukan.

### Contoh

**Best Performer**
> TikTok generated the highest average ER at 7.2%.

**Biggest Opportunity**
> Promotional posts generated 32% lower reach than the account average.

**Recommended Action**
> Increase educational video output next month.

### Aturan

Jika tidak cukup data, jangan menghasilkan klaim.

Contoh:

> Not enough performance data to identify a best performer yet.

---

# 3. ANALYTICS

## Tujuan

Analytics = tempat user melakukan investigation.

## A. Filters

Minimal:

- Date range
- Account
- Platform

Tambahan bila relevan:

- Content format
- Content pillar

## B. Performance Trend

Metrics:

- Impressions
- Reach
- Engagement
- ER
- Followers

Controls:

- Daily
- Weekly
- Monthly

Pastikan ER memakai formula yang sama dengan Dashboard dan Report.

## C. Platform Comparison

Kolom:

- Platform
- Posts
- Impression
- Reach
- Engagement
- ER
- Growth vs previous period

Tambahkan visual ranking / highlighting:

- Best platform
- Biggest growth
- Weakest performer

## D. Content Performance

Jadikan area eksplorasi utama.

Fitur:

- Search
- Sort
- Filter
- Date range
- Platform
- Account
- Content format
- Content pillar

Metrics:

- Impression
- Reach
- Engagement
- ER
- Likes
- Comments
- Shares
- Saves
- Reposts
- Profile Visits

Tambahkan bila diperlukan:

- Top performers
- Lowest performers

## E. Content Pillar Analysis

Kolom:

- Pillar
- Posts
- Reach
- Engagement
- ER
- Contribution %

Tujuan:

> Membandingkan content pillar secara eksploratif.

## F. Growth Analysis

Jika data tersedia:

- Follower growth
- Profile visit trend
- Growth by platform
- Growth vs previous period

## G. AI Analysis

Bagi menjadi:

- What changed?
- Why?
- What worked?
- What underperformed?
- What should happen next?

Semua output wajib memiliki supporting data.

---

# 4. REPORT

## Tujuan

Report = auto-generated business report yang siap dibagikan.

Report bukan Analytics versi lain.

## Global Controls

- Period
- Account
- Platform
- Generate / Refresh Report
- Print PDF
- Export CSV
- Export JSON

### Rekomendasi UX

Pisahkan secara konsep:

**Generate / Print Report**
- PDF

**Export Data**
- CSV
- JSON

Karena PDF = presentation/report, sedangkan CSV/JSON = data extraction.

---

# 5. REPORT — OVERVIEW

## A. Executive Summary

Gunakan KPI utama:

- Total Posts
- Total Impression
- Total Reach
- Total Engagement
- Average ER
- Followers / Follower Growth

Tambahkan comparison vs previous period bila tersedia:

- Total Posts
- Total Impression
- Total Reach
- Total Engagement
- Average ER
- Followers / Follower Growth

### Penting

Comparison tidak boleh muncul jika tidak ada baseline.

Jangan tampilkan:

> +24%

kalau previous-period data tidak tersedia atau perhitungan tidak valid.

Untuk kondisi tersebut:

> No comparison available.

---

# 6. REPORT — EXECUTIVE INSIGHTS

Ini harus menjadi inti nilai Report.

Gunakan narrative:

### 1. What happened?

Contoh:
> Reach increased 24% compared with the previous period.

### 2. Why?

Contoh:
> Growth was primarily driven by TikTok video content.

### 3. What worked?

Contoh:
> Educational content generated the highest average ER.

### 4. What should we do next?

Contoh:
> Increase educational video output next month.

### Aturan wajib

AI hanya boleh membuat insight dari data yang benar-benar tersedia.

Tidak boleh mengarang:

- platform
- content type
- growth
- pillar winner
- top post
- recommendation

Jika evidence tidak cukup:

> Not enough data to generate performance insights yet.

---

# 7. REPORT — PERFORMANCE OVERVIEW

## Masalah versi lama

Performance Overview terlalu mirip dengan "All Metrics" dan hanya menjadi kumpulan angka:

- Total Impression
- Total Reach
- Total Like
- Total Comment
- Total Share
- Total Save
- Total Repost
- Profile Visit

## Revisi

Jadikan section ini lebih visual dan explanatory.

Prioritas:

### A. Impression Trend

### B. Reach Trend

### C. Engagement Trend

### D. ER Trend

### E. Follower Trend

Boleh menampilkan supporting KPI kecil di sekitar grafik.

Jangan menjadikan 8 metric sebagai blok besar kedua yang terasa seperti database dump.

Metric detail tetap tersedia di Appendix / All Posts Detail.

---

# 8. REPORT — PLATFORM PERFORMANCE

Kolom minimum:

- Platform
- Posts
- Impression
- Reach
- Engagement
- ER
- Growth

Tambahan jika penting:

- Impression

Tambahkan automatic labels:

- Best Platform
- Highest Growth
- Lowest Performer

Tapi label hanya muncul ketika data cukup untuk menentukan ranking.

---

# 9. REPORT — TOP PERFORMING CONTENT

Gunakan nama section:

> Top Performing Content

Bukan hanya "Top 5 Content".

Tampilkan:

- Thumbnail
- Title
- Platform
- Impression
- Reach
- Engagement
- ER

Top 5 digunakan untuk report.

Perbedaan dengan Dashboard:

- Dashboard = Top 3 quick snapshot
- Analytics = full Content Performance exploration
- Report = Top 5 curated result

---

# 10. REPORT — CONTENT PILLAR SUMMARY

Analytics:
> Content Pillar Analysis

Report:
> Content Pillar Summary

Kolom:

- Pillar
- Posts
- Impression
- Reach
- Engagement
- ER
- Contribution %

Report hanya menampilkan summary dan insight penting.

Jangan menjadikannya exploratory table seperti Analytics.

---

# 11. REPORT — GOAL / KPI SUMMARY

Tampilkan:

- Goal name
- Current
- Target
- Progress %
- Status

Status:

- Achieved
- On Track
- At Risk

Contoh:

> Followers — 28.6K / 32.4K — 88% — On Track

---

# 12. REPORT — APPENDIX

## A. Monthly Trend

Kolom:

- Month
- Posts
- Impression
- Reach
- Engagement
- ER
- Followers

Tujuan:

> Historical supporting data.

## B. All Posts Detail

Kolom:

- Title
- Platform
- Account
- Date
- Impression
- Reach
- Like
- Comment
- Share
- Save
- Repost
- Profile Visit
- Engagement
- ER

Tujuan:

> Supporting / auditable data.

Appendix tidak perlu AI narrative.

---

# 13. DATA STATE SYSTEM — PRIORITAS TERTINGGI

Sistem harus membedakan 3 kondisi:

## State A — No Data

Belum ada data yang dapat dianalisis.

Copy:

> No performance data yet.
> Publish or sync content to start seeing insights.

## State B — Posts Exist, Metrics Missing

Post ada tetapi performance metric belum tersedia.

Copy:

> 3 posts found, but performance metrics are not available yet.

## State C — Real Zero

Metric memang bernilai 0 dan data valid.

Copy sesuai konteks:

> Reach remained at 0 during this period.

## Larangan

Jangan menyamakan:

- No data
- 0 performance
- Positive performance

---

# 14. AI / INSIGHT SAFETY RULES

## Tidak boleh ada fabricated insight

Contoh yang SALAH ketika data belum tersedia:

> Reach increased 24%.

> Growth was primarily driven by TikTok.

> Educational content generated the highest ER.

> Maintain consistency.

Padahal:

- Reach = 0
- Platform tidak ada
- Pillar tidak ada

## Wajib memakai evidence

Setiap insight harus memiliki source metric internal.

Contoh:

```text
Insight:
TikTok generated the highest reach.

Evidence:
TikTok reach = 145,000
Instagram reach = 92,000
Facebook reach = 21,000
```

## Fallback

Kalau evidence tidak cukup:

> Not enough data to generate a reliable insight yet.

---

# 15. DATA INTEGRITY RULES

## A. ER Formula

Tetapkan satu definisi resmi.

Jika mode = Impression:

> ER = Engagement / Impression × 100

Jika mode = Reach:

> ER = Engagement / Reach × 100

Dashboard, Analytics, dan Report harus menggunakan definisi yang sama.

UI harus menunjukkan mode jika formula dapat berubah.

## B. Growth Formula

Jika menggunakan:

> Growth % = (Current - Previous) / Previous × 100

Tangani:

- Previous = 0
- Previous = null
- Current = 0

Jangan menghasilkan infinity / misleading percentage.

Gunakan:

> N/A

atau:

> No comparison available.

## C. pp vs %

Untuk ER:

Perubahan absolut rate:

> 5.7% → 6.4% = +0.7 pp

Jangan menulis:

> +0.7%

Jika yang dimaksud adalah percentage-point change.

---

# 16. EMPTY STATE CONSISTENCY

Gunakan pola yang konsisten.

## No platform data

> No platform data yet.
> Connect or sync your social accounts to see platform performance.

## No pillar data

> No content pillar data yet.
> Assign pillars to your posts to compare performance.

## No content

> No content available for this period.

## Posts without metrics

> Posts found, but performance metrics are not available yet.

## Insufficient data for AI

> Not enough data to generate reliable insights yet.

---

# 17. PAGE DIFFERENTIATION CHECKLIST

## Dashboard

- [ ] User can understand performance quickly.
- [ ] No deep investigation table.
- [ ] Top 3 only.
- [ ] Goal is visible.
- [ ] Recommendations are concise.
- [ ] Engagement is included as KPI.

## Analytics

- [ ] User can filter and compare.
- [ ] Platform analysis exists.
- [ ] Content analysis exists.
- [ ] Pillar analysis exists.
- [ ] Growth analysis exists.
- [ ] User can investigate why performance changed.

## Report

- [ ] Report feels shareable.
- [ ] Executive Summary exists.
- [ ] Executive Insights exists.
- [ ] Previous-period comparison is valid.
- [ ] Platform results are summarized.
- [ ] Top Performing Content is curated.
- [ ] Goal/KPI status is visible.
- [ ] Appendix contains supporting data.
- [ ] PDF export is treated as presentation.
- [ ] CSV/JSON export is treated as data extraction.

---

# 18. REDUNDANCY RULE

Informasi yang sama BOLEH muncul di beberapa page hanya jika konteksnya berbeda.

## Reach

### Dashboard
> Current snapshot

### Analytics
> Trend / comparison / breakdown

### Report
> Business result + narrative

## Top Content

### Dashboard
> Top 3 quick view

### Analytics
> Full content exploration

### Report
> Top 5 curated result

## Goals

### Dashboard
> Monitor progress

### Analytics
> Tidak perlu menjadi section utama

### Report
> Formal KPI summary

## Pillars

### Dashboard
> Tidak perlu detail

### Analytics
> Detailed comparison

### Report
> Summary

---

# 19. COPY / NAMING STANDARD

## Dashboard

- Performance Snapshot
- Top 3 Content
- Goal Progress
- Best Performer
- Biggest Opportunity
- Recommended Action

## Analytics

- Performance Trend
- Platform Comparison
- Content Performance
- Content Pillar Analysis
- Growth Analysis
- AI Analysis

## Report

- Executive Summary
- Executive Insights
- Performance Overview
- Platform Performance
- Top Performing Content
- Content Pillar Summary
- Goal / KPI Summary
- Appendix
- Monthly Trend
- All Posts Detail

---

# 20. PRIORITY IMPLEMENTATION

## P0 — Critical

- [ ] Fix misleading / fabricated AI insights.
- [ ] Implement No Data / Metrics Missing / Real Zero states.
- [ ] Disable comparisons when previous-period baseline is unavailable.
- [ ] Validate ER calculation across all pages.
- [ ] Validate Growth calculation and zero-baseline handling.
- [ ] Add Total Engagement to Dashboard KPI.
- [ ] Ensure Report insights are generated only from real evidence.
- [ ] Remove redundant "Performance Overview" metric-dump behavior in Report.

## P1 — High Value

- [ ] Refine Dashboard insight cards into Best Performer / Biggest Opportunity / Recommended Action.
- [ ] Add Growth column to Report Platform Performance.
- [ ] Improve Report performance section with charts.
- [ ] Improve Top Performing Content with thumbnails.
- [ ] Add status logic for goals.
- [ ] Add robust empty states to every analytics section.
- [ ] Separate PDF/report action from CSV/JSON data export conceptually.

## P2 — Enhancement

- [ ] Add content format analysis.
- [ ] Add pillar contribution percentage.
- [ ] Add lowest-performing content.
- [ ] Add editable AI report narrative before PDF export.
- [ ] Add report preview before generation.
- [ ] Add period-over-period visualization where sufficient data exists.

---

# 21. FINAL PRODUCT DEFINITION

## Dashboard

**Job to be Done**

> "Tell me quickly how my social media is doing."

Contains:

- KPI snapshot
- Performance snapshot
- Top 3 content
- Goal
- Quick insights
- Recommended action

---

## Analytics

**Job to be Done**

> "Help me understand why my performance looks this way."

Contains:

- Trend
- Platform comparison
- Content performance
- Pillar analysis
- Growth analysis
- Investigation tools
- Evidence-based AI analysis

---

## Report

**Job to be Done**

> "Turn my social media data into a professional report I can share."

Contains:

- Executive summary
- Period comparison
- Executive insights
- Performance charts
- Platform performance
- Top performing content
- Content pillar summary
- Goal/KPI summary
- Appendix
- PDF
- CSV
- JSON

---

# 22. FINAL QA — Sebelum dianggap selesai

- [ ] Tidak ada angka comparison yang muncul tanpa baseline.
- [ ] Tidak ada AI insight yang tidak mempunyai evidence.
- [ ] Tidak ada AI yang menyebut platform/pillar jika datanya kosong.
- [ ] Tidak ada "positive growth" ketika metric aktual = 0 dan baseline tidak valid.
- [ ] Dashboard memiliki Total Engagement.
- [ ] Dashboard hanya quick view.
- [ ] Analytics menjadi tempat deep dive.
- [ ] Report terasa seperti business report.
- [ ] Appendix hanya berisi supporting data.
- [ ] ER definition konsisten.
- [ ] Growth definition konsisten.
- [ ] Empty state copy konsisten.
- [ ] Top Content tidak terasa duplikat antar page.
- [ ] Goal tidak diulang sebagai section besar di semua page.
- [ ] PDF output tetap masuk akal walaupun sebagian data kosong.
- [ ] CSV/JSON export tetap dapat menghasilkan data terstruktur.

---

# 23. Target Akhir

Setelah revisi selesai, user flow harus terasa seperti:

```text
DASHBOARD
"What's happening?"
        ↓
ANALYTICS
"Why is it happening?"
        ↓
REPORT
"How do I communicate the result?"
        ↓
APPENDIX
"What data supports the result?"
```

Ini menjadi prinsip utama untuk pengembangan berikutnya.
