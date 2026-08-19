# Creatorlytics SaaS — Revision Planner

## 0. Tujuan Revisi

Tujuan utama revisi adalah memperjelas fungsi 3 page utama agar tidak terasa seperti mengulang data yang sama.

Prinsip UX yang dipakai:

- **Dashboard = What is happening?**
- **Analytics = Why is it happening?**
- **Report = How do I present the result?**

Data yang sama boleh muncul di beberapa page, tetapi **konteks, depth, dan user intent harus berbeda**.

---

# 1. Information Architecture Baru

## Dashboard

Fokus:
> Quick monitoring / performance snapshot

User harus bisa memahami kondisi performa dalam 5–10 detik.

### Isi Dashboard

- KPI Summary
  - Total Posts
  - Total Reach
  - Total Engagement
  - Average ER
  - Goal Progress
- Performance Trend
  - Reach
  - Engagement
  - ER
  - Pilihan Daily / Weekly / Monthly
- Top 3 Content
  - Thumbnail
  - Title
  - Platform
  - Reach
  - Engagement
  - ER
- Goal Progress
  - Current
  - Target
  - Progress %
  - Status: On Track / At Risk / Achieved
- AI Recommendations
  - Best performer
  - Biggest issue
  - Recommended next action

### Yang perlu dihilangkan dari Dashboard

- Breakdown platform yang terlalu detail
- Content pillar analysis detail
- Full post table
- Monthly historical table
- Export/report controls
- Duplicate metrics yang tidak membantu quick scan

---

# 2. Analytics

Fokus:
> Deep analysis / investigation

User datang ke Analytics untuk mencari tahu **kenapa performa terjadi seperti itu**.

## A. Performance Trend

Metrics:

- Impression
- Reach
- Engagement
- ER
- Followers

Controls:

- Date range
- Daily / Weekly / Monthly
- Account filter
- Platform filter

## B. Platform Comparison

Tabel / chart:

- Platform
- Posts
- Impression
- Reach
- Engagement
- ER
- Growth vs previous period

User harus bisa membandingkan platform dengan cepat.

## C. Content Performance

Fitur:

- Top content
- Lowest-performing content
- Sorting
- Filtering
- Date range
- Platform
- Account
- Content format

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
- Profile visits

## D. Content Pillar Analysis

Metrics:

- Pillar
- Posts
- Reach
- Engagement
- ER
- Contribution %

Contoh insight:

> Education generated the highest reach.

> Entertainment generated the highest ER.

## E. Audience / Growth Analysis

Jika data tersedia:

- Follower growth
- Profile visits
- Growth trend
- Platform contribution

## F. AI Analysis

Output:

- What changed?
- Why?
- What performed best?
- What underperformed?
- What should be done next?

### Analytics bukan tempat utama untuk:

- Executive summary
- PDF export
- Formal report narrative
- Full historical raw-data appendix

---

# 3. Report

Fokus:
> Auto-generated business report

Report harus terasa sebagai **hasil akhir yang siap dibagikan ke manager/client/team**.

## Global Controls

- Period
- Account
- Platform
- Print PDF
- Export CSV
- Export JSON

## Tab: Overview

### A. Executive Summary

Metrics:

- Total Posts
- Total Reach
- Total Engagement
- Average ER
- Followers / Follower Growth

Tambahkan comparison vs previous period:

- Reach: +24%
- Engagement: +11%
- ER: +0.7 pp
- Followers: +3.2%

### B. Executive Insights

Auto-generated narrative:

1. What happened?
2. Why did it happen?
3. What worked?
4. What should be done next?

Contoh:

> Reach increased 24% compared with the previous period.

> Growth was primarily driven by TikTok video content.

> Educational content generated the highest average ER.

> Increase educational video output next month.

### C. Performance Overview

Grafik ringkas:

- Reach trend
- Engagement trend
- ER trend
- Follower trend

Jangan menjadikan bagian ini full analytics dashboard.

### D. Platform Performance

Tabel:

| Platform | Posts | Reach | Engagement | ER | Growth |
|---|---:|---:|---:|---:|---:|

Tambahkan automatic highlight:

- Best platform
- Weakest platform
- Biggest growth

### E. Top Performing Content

Top 5.

Tampilkan:

- Thumbnail
- Title
- Platform
- Reach
- Engagement
- ER

Gunakan nama section:
> **Top Performing Content**

Jangan hanya menggunakan "Top 5 Content" jika ingin terasa lebih report-oriented.

### F. Content Pillar Summary

Tampilkan ringkasan pillar:

- Pillar
- Posts
- Reach
- Engagement
- ER
- Contribution %

Fokus pada insight, bukan exploratory analysis.

### G. Goals / KPI Summary

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

---

# 4. Report — Appendix

Appendix menjadi bagian untuk data pendukung / raw detail.

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
> Historical reference.

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
> Supporting data yang dapat diaudit / dicek kembali.

---

# 5. Redundancy Cleanup

## Goal

### Saat ini
- Dashboard: Goals Aktif
- Analytics: Goals Progress
- Report: Goals Summary

### Revisi
- Dashboard: **Goal Progress**
- Analytics: **Remove / minimal**
- Report: **Goal / KPI Summary**

Fungsi:

- Dashboard = monitor
- Report = formal reporting

---

## Top Content

### Saat ini
- Dashboard: Top Content
- Analytics: Top Content
- Report: Top 5 Content

### Revisi

**Dashboard**
- Top 3 Content
- Quick snapshot

**Analytics**
- Full Content Performance
- Search / filter / sort / compare

**Report**
- Top 5 Performing Content
- Curated presentation

---

## Content Pillar

### Saat ini
- Analytics: Performa Pilar
- Report: Content Pillars

### Revisi

**Analytics**
> Content Pillar Analysis

Untuk eksplorasi dan comparison.

**Report**
> Content Pillar Summary

Untuk hasil ringkas dan executive insight.

---

## Reach / ER / Engagement

Metrics boleh muncul di ketiga page.

Tetapi konteksnya harus berbeda.

### Dashboard
> Reach = current snapshot

### Analytics
> Reach = breakdown + comparison + trend

### Report
> Reach = business result + period comparison + narrative

---

# 6. Copy / Naming Revision

## Dashboard

Ganti / gunakan:

- Tren Performa → **Performance Snapshot**
- Top Konten → **Top 3 Content**
- Goals Aktif → **Goal Progress**
- Platform Terbaik → **Best Performer**
- Next Step → **Recommended Action**

## Analytics

Gunakan:

- Tren Performa → **Performance Trend**
- Rincian per platform → **Platform Comparison**
- Performa Pilar → **Content Pillar Analysis**
- Top Konten → **Content Performance**

## Report

Gunakan:

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

# 7. Data State / Empty State Rules

Karena saat ini banyak data masih 0 / kosong, empty state harus konsisten.

## Jangan tampilkan misleading insight

Contoh sekarang:

> Pertumbuhan reach positif di semua platform bulan ini. Pertahankan konsistensi!

Padahal reach = 0.

Ini harus diperbaiki.

### Rule

Jika tidak ada data performa:

> **No performance data yet.**
> Publish or sync content to start seeing insights.

Jika ada posts tetapi metrics belum tersedia:

> **Posts found, but performance metrics are not available yet.**

Jika pillar belum diisi:

> **No content pillar data yet.**
> Assign pillars to your posts to compare performance.

Jika platform belum terdeteksi:

> **Platform data unavailable.**
> Connect or sync your social accounts.

---

# 8. Data Logic Rules

## ER

Pastikan definisi ER konsisten di seluruh SaaS.

Jika mode impression:

> ER = Engagement / Impression × 100

Jika mode reach:

> ER = Engagement / Reach × 100

UI harus selalu menjelaskan mode yang dipakai.

Jangan sampai:

- Dashboard menggunakan impression
- Analytics menggunakan reach
- Report memakai formula berbeda

tanpa indikasi yang jelas.

---

# 9. KPI Naming Standard

Gunakan terminology yang konsisten:

- Posts
- Impressions
- Reach
- Engagement
- Engagement Rate (ER)
- Likes
- Comments
- Shares
- Saves
- Reposts
- Profile Visits
- Followers
- Follower Growth

Hindari terlalu banyak variasi:

- Total Reach
- Reach
- Reach Total

Pilih satu pola yang konsisten berdasarkan konteks.

---

# 10. Recommended User Flow

## Saat user login

### Step 1
Dashboard:
> Cek kondisi performa.

### Step 2
Klik Analytics:
> Cari tahu penyebab / detail performa.

### Step 3
Klik Report:
> Generate laporan otomatis.

### Step 4
Pilih:
- Period
- Account
- Platform

### Step 5
Preview:
- Executive Summary
- Insights
- Performance
- Platform
- Content
- Goals

### Step 6
Export:
- PDF
- CSV
- JSON

---

# 11. Priority Pengerjaan

## P0 — Wajib

- [ ] Pisahkan fungsi Dashboard / Analytics / Report
- [ ] Hilangkan duplicate section yang tidak punya fungsi berbeda
- [ ] Fix misleading empty-state insights
- [ ] Standardisasi ER calculation
- [ ] Standardisasi KPI naming
- [ ] Jadikan Report sebagai executive/business-facing output
- [ ] Pertahankan Appendix sebagai raw/detail data

## P1 — Penting

- [ ] Tambahkan comparison vs previous period
- [ ] Tambahkan AI Executive Insights di Report
- [ ] Tambahkan Growth % di platform table
- [ ] Tambahkan On Track / At Risk / Achieved pada goals
- [ ] Ubah Top Content Dashboard menjadi Top 3
- [ ] Buat Content Performance di Analytics menjadi area eksplorasi utama

## P2 — Improvement

- [ ] Tambahkan content format analysis
- [ ] Tambahkan content pillar contribution %
- [ ] Tambahkan worst-performing content
- [ ] Tambahkan visual thumbnail pada Report
- [ ] Tambahkan report narrative yang bisa diedit sebelum export
- [ ] Tambahkan report preview sebelum PDF generation

---

# 12. Final Product Definition

## Dashboard

**Job to be done:**
> "Tell me quickly how my social media is doing."

Output:
- Snapshot
- Trend
- Top content
- Goal
- Recommendation

---

## Analytics

**Job to be done:**
> "Help me understand why my performance looks this way."

Output:
- Trend
- Platform comparison
- Content analysis
- Pillar analysis
- Growth analysis
- Deep insights

---

## Report

**Job to be done:**
> "Turn my social media data into a professional report I can share."

Output:
- Executive summary
- Period comparison
- Key insights
- Platform results
- Top content
- Pillar summary
- KPI / goals
- Appendix
- PDF / CSV / JSON export

---

# 13. Success Criteria

Revisi dianggap berhasil jika:

- User tidak merasa Dashboard dan Analytics adalah halaman yang sama.
- User tidak merasa Report hanyalah copy dari Analytics.
- Dashboard dapat dipahami dalam <10 detik.
- Analytics memungkinkan user melakukan investigation.
- Report dapat dibagikan ke manager/client tanpa perlu menjelaskan ulang data.
- Semua angka dan formula konsisten.
- Empty state tidak menghasilkan insight yang misleading.
- Report mempunyai narrative, bukan hanya tabel.
- Appendix tetap menyediakan data detail untuk verification.
