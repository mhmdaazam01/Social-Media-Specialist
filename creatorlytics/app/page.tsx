'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Target,
  Calendar,
  FileText,
  Users,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ClipboardList,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BarChart3,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    title: 'Analytics Mendalam',
    desc: 'Track reach, impressions, ER, dan followers gained dari semua platform dalam satu dashboard terpusat.',
  },
  {
    icon: Target,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    title: 'Goal Tracking',
    desc: 'Set target bulanan dan pantau progress secara real-time dengan forecast otomatis berbasis velocity.',
  },
  {
    icon: Lightbulb,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    title: 'AI Insights',
    desc: 'Rekomendasi hari terbaik posting, format konten terpopuler, dan estimasi pencapaian goal.',
  },
  {
    icon: Calendar,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    title: 'Content Calendar',
    desc: 'Rencanakan dan jadwalkan konten dengan kalender visual yang terintegrasi langsung.',
  },
  {
    icon: ClipboardList,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    title: 'Content Planner',
    desc: 'Kelola ide konten dari brainstorm sampai siap publish dengan tampilan Kanban board.',
  },
  {
    icon: FileText,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    title: 'Laporan Otomatis',
    desc: 'Generate laporan performa lengkap dan export ke CSV kapan saja dengan satu klik.',
  },
  {
    icon: Users,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    title: 'Competitor Tracking',
    desc: 'Pantau performa kompetitor dan benchmark strategi kontenmu terhadap mereka.',
  },
  {
    icon: TrendingUp,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    title: 'Multi-Platform',
    desc: 'Dukung Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: Zap,
    title: 'Login dengan Google',
    desc: 'Satu klik, langsung masuk. Tidak perlu isi form atau verifikasi email.',
  },
  {
    num: '02',
    icon: Users,
    title: 'Setup profil kreator',
    desc: 'Pilih niche, platform aktif, dan pilar kontenmu dalam 2 menit.',
  },
  {
    num: '03',
    icon: FileText,
    title: 'Input data konten',
    desc: 'Masukkan data postingan manual atau import via CSV sekaligus.',
  },
  {
    num: '04',
    icon: BarChart3,
    title: 'Lihat insight & grow',
    desc: 'Dashboard otomatis analisis data dan beri rekomendasi actionable.',
  },
];

const FAQS = [
  {
    q: 'Apakah Creatorlytics gratis?',
    a: 'Ya, 100% gratis. Semua fitur bisa diakses tanpa biaya tersembunyi, tanpa kartu kredit.',
  },
  {
    q: 'Platform apa saja yang didukung?',
    a: 'Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads. Kamu juga bisa tambah platform custom.',
  },
  {
    q: 'Apakah data saya aman?',
    a: 'Data disimpan di Supabase dengan Row Level Security — hanya kamu yang bisa akses datamu sendiri. Tidak ada data yang dibagikan ke pihak ketiga.',
  },
  {
    q: 'Apakah perlu connect akun sosmed saya?',
    a: 'Tidak perlu. Kamu input data secara manual atau lewat import CSV, jadi tidak ada akses sama sekali ke akun sosmedmu.',
  },
  {
    q: 'Bisa dipakai di HP?',
    a: 'Bisa. Creatorlytics fully responsive dan dioptimasi untuk semua ukuran layar.',
  },
  {
    q: 'Bagaimana cara menghitung Engagement Rate?',
    a: 'Kamu bisa pilih mode ER: berbasis impression, reach, atau followers. Bisa diubah kapan saja di Settings.',
  },
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter / X', 'LinkedIn', 'Facebook', 'Threads'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  async function handleLogin() {
    setAuthLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" />
          Memuat...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-sm">
              C
            </div>
            <span className="font-bold text-base tracking-tight">Creatorlytics</span>
          </div>

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <button type="button" onClick={() => scrollTo('features')} className="hover:text-foreground transition-colors cursor-pointer">Fitur</button>
            <button type="button" onClick={() => scrollTo('how')} className="hover:text-foreground transition-colors cursor-pointer">Cara Kerja</button>
            <button type="button" onClick={() => scrollTo('faq')} className="hover:text-foreground transition-colors cursor-pointer">FAQ</button>
          </div>

          <Button size="sm" onClick={handleLogin} disabled={authLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-sm">
            {authLoading ? <Loader2 className="size-3.5 animate-spin" /> : <>Mulai Gratis</>}
          </Button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6">
        {/* Layered background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/8 blur-[100px]" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[80px]" />
          <div className="absolute top-10 right-1/4 w-[250px] h-[250px] rounded-full bg-cyan-500/5 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-4 py-1.5 text-xs font-semibold text-indigo-500 mb-6">
            <Star className="size-3 fill-indigo-500" />
            100% Gratis · Tanpa Kartu Kredit · Untuk Kreator Indonesia
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-foreground">
            Analytics Dashboard untuk{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-indigo-500">Kreator Konten</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-indigo-500/10 rounded-sm -z-0" />
            </span>
            {' '}Indonesia
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Track performa konten di semua platform, pantau goal bulanan, dan dapatkan insight berbasis data — semua gratis, tanpa coding.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full sm:w-auto px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20 transition-all duration-200"
            >
              {authLoading ? (
                <><Loader2 className="size-4 animate-spin" />Memuat...</>
              ) : (
                <>
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Mulai Gratis dengan Google
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo('features')}
              className="w-full sm:w-auto h-12 cursor-pointer"
            >
              Lihat Semua Fitur
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground/70">Setup selesai dalam kurang dari 2 menit.</p>

          {/* Platform logos strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground/60 mr-1">Dukung:</span>
            {PLATFORMS.map(p => (
              <span key={p} className="px-3 py-1 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="border-y border-border/40 bg-muted/20 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
          {[
            { val: '7+', label: 'Platform sosmed' },
            { val: '10+', label: 'Metrik ditrack' },
            { val: '100%', label: 'Gratis selamanya' },
            { val: '<2 mnt', label: 'Waktu setup' },
          ].map(s => (
            <div key={s.label} className="flex flex-col gap-1">
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{s.val}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Fitur Lengkap</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Semua yang kamu butuhkan</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Dari tracking harian sampai laporan bulanan, Creatorlytics punya semua tools yang kreator butuhkan untuk grow.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-border/50 bg-card p-5 flex flex-col gap-4 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-default"
                >
                  <div className={`p-2.5 w-fit rounded-xl ${f.bg}`}>
                    <Icon className={`size-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-4 sm:px-6 bg-muted/15">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Cara Kerja</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Simpel dari awal sampai akhir</h2>
            <p className="mt-3 text-muted-foreground text-sm">4 langkah dan kamu sudah bisa lihat analytics kontenmu.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="relative flex flex-col gap-4">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(50%+28px)] right-[calc(-50%+28px)] h-px bg-gradient-to-r from-border to-transparent z-0" />
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                      <Icon className="size-5 text-indigo-500" />
                    </div>
                    <span className="text-xs font-bold text-indigo-500/60 font-mono">{s.num}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ──────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Preview</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Dashboard yang powerful</h2>
            <p className="mt-3 text-muted-foreground text-sm">Semua data di satu tempat, visual yang bersih dan mudah dibaca.</p>
          </div>

          {/* Browser frame */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/10 ring-1 ring-border/20">
            {/* Browser bar */}
            <div className="border-b border-border/50 bg-muted/50 px-4 py-2.5 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-red-400/80" />
                <div className="size-3 rounded-full bg-yellow-400/80" />
                <div className="size-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background/60 rounded-md px-3 py-1 flex items-center gap-2 max-w-xs mx-auto">
                  <div className="size-2.5 rounded-full bg-emerald-500/60 shrink-0" />
                  <span className="text-[11px] text-muted-foreground font-mono truncate">creatorlytics.vercel.app/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-5 space-y-4 bg-background/40">
              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Total Posts', val: '142', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  { label: 'Total Reach', val: '2.4M', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Avg ER', val: '4.8%', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Followers', val: '+1.2K', icon: Users, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                ].map(k => {
                  const KIcon = k.icon;
                  return (
                    <div key={k.label} className="rounded-xl border border-border/40 bg-card/80 p-3.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">{k.label}</p>
                        <p className="text-base font-bold mt-0.5 tracking-tight">{k.val}</p>
                      </div>
                      <div className={`p-1.5 rounded-lg ${k.bg} shrink-0`}>
                        <KIcon className={`size-3.5 ${k.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart area */}
              <div className="rounded-xl border border-border/40 bg-card/80 p-4">
                <p className="text-[11px] font-semibold text-muted-foreground mb-3">Tren Reach Bulanan</p>
                <div className="h-24 flex items-end gap-1 overflow-hidden">
                  {[28, 45, 35, 62, 55, 78, 68, 85, 60, 75, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-600/80 to-indigo-400/50"
                      style={{ height: `${h}%` }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'].map(m => (
                    <span key={m} className="text-[9px] text-muted-foreground/60 flex-1 text-center">{m}</span>
                  ))}
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/40 bg-card/80 p-3.5 space-y-2.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Top Konten</p>
                  {[
                    { title: 'Reels tutorial editing', reach: '48.2K' },
                    { title: 'Behind the scenes vlog', reach: '31.7K' },
                    { title: 'Carousel 5 tips konten', reach: '27.4K' },
                  ].map((t, i) => (
                    <div key={t.title} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground/40 w-4 shrink-0">{i + 1}</span>
                      <p className="text-[11px] text-foreground/80 flex-1 truncate">{t.title}</p>
                      <span className="text-[10px] font-semibold text-indigo-500 shrink-0">{t.reach}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border/40 bg-card/80 p-3.5 space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Goal Progress</p>
                  {[
                    { label: 'Followers +500', pct: 78, color: 'bg-emerald-500' },
                    { label: 'Reach 100K', pct: 52, color: 'bg-indigo-500' },
                    { label: 'Engagement 5K', pct: 34, color: 'bg-amber-500' },
                  ].map(g => (
                    <div key={g.label} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-muted-foreground">{g.label}</span>
                        <span className="text-[10px] font-semibold text-foreground/70">{g.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${g.color}`}
                          style={{ width: `${g.pct}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust section ──────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-muted/15 border-y border-border/40">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-8">Kenapa kreator pilih Creatorlytics</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                title: 'Data Aman & Privat',
                desc: 'Row Level Security Supabase memastikan hanya kamu yang bisa akses datamu sendiri.',
              },
              {
                icon: Zap,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
                title: 'Setup Super Cepat',
                desc: 'Dari login sampai lihat analytics pertama kurang dari 2 menit. Tanpa konfigurasi rumit.',
              },
              {
                icon: CheckCircle2,
                color: 'text-indigo-500',
                bg: 'bg-indigo-500/10',
                title: '100% Gratis Selamanya',
                desc: 'Semua fitur tersedia tanpa batas waktu, tanpa freemium, tanpa hidden cost.',
              },
            ].map(t => {
              const TIcon = t.icon;
              return (
                <div key={t.title} className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col gap-3">
                  <div className={`p-2.5 w-fit rounded-xl ${t.bg}`}>
                    <TIcon className={`size-5 ${t.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm">{t.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-10 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Siap grow lebih cepat?</h2>
              <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
                Mulai track kontenmu sekarang dan lihat apa yang benar-benar bekerja untuk channelmu.
              </p>
              <Button
                size="lg"
                onClick={handleLogin}
                disabled={authLoading}
                className="mt-6 px-10 h-12 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/25 cursor-pointer"
              >
                {authLoading
                  ? <Loader2 className="size-4 animate-spin" />
                  : <>Mulai Sekarang — Gratis <ArrowRight className="size-4" /></>}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground/60">Tidak perlu kartu kredit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-muted/15">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">FAQ</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Pertanyaan yang sering ditanya</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border bg-card overflow-hidden transition-colors duration-150 ${isOpen ? 'border-indigo-500/30' : 'border-border/50'}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-muted/20 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen
                      ? <ChevronUp className="size-4 text-indigo-500 shrink-0 ml-4" />
                      : <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-4" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
              C
            </div>
            <span className="font-semibold text-sm">Creatorlytics</span>
            <span className="text-xs text-muted-foreground">© 2025</span>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="size-3 text-emerald-500" />
              Data aman
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-indigo-500" />
              100% Gratis
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-3 text-amber-500" />
              Made for Indonesia
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
