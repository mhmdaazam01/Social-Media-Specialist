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
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';

// ─── Feature list ───────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <BarChart3 className="size-6 text-indigo-500" />,
    title: 'Analytics Mendalam',
    desc: 'Track reach, impressions, ER, dan followers gained dari semua platformmu dalam satu dashboard.',
  },
  {
    icon: <Target className="size-6 text-emerald-500" />,
    title: 'Goal Tracking',
    desc: 'Set target bulanan dan pantau progress secara real-time dengan forecast otomatis.',
  },
  {
    icon: <Lightbulb className="size-6 text-amber-500" />,
    title: 'AI Insights',
    desc: 'Rekomendasi hari terbaik posting, format konten terpopuler, dan estimasi pencapaian goal.',
  },
  {
    icon: <Calendar className="size-6 text-rose-500" />,
    title: 'Content Calendar',
    desc: 'Rencanakan dan jadwalkan konten dengan kalender visual yang terintegrasi langsung.',
  },
  {
    icon: <ClipboardList className="size-6 text-violet-500" />,
    title: 'Content Planner',
    desc: 'Kelola ide konten dari brainstorm sampai siap publish dengan tampilan Kanban board.',
  },
  {
    icon: <FileText className="size-6 text-cyan-500" />,
    title: 'Laporan Otomatis',
    desc: 'Generate laporan performa lengkap dan export ke CSV atau PDF kapan saja.',
  },
  {
    icon: <Users className="size-6 text-pink-500" />,
    title: 'Competitor Tracking',
    desc: 'Pantau performa kompetitor dan benchmark strategi kontenmu terhadap mereka.',
  },
  {
    icon: <TrendingUp className="size-6 text-orange-500" />,
    title: 'Multi-Platform',
    desc: 'Dukung Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads.',
  },
];

const STEPS = [
  { num: '01', title: 'Login dengan Google', desc: 'Satu klik, langsung masuk. Tidak perlu isi form panjang.' },
  { num: '02', title: 'Setup profil kreator', desc: 'Pilih niche, platform, dan pilar kontenmu dalam 2 menit.' },
  { num: '03', title: 'Input data konten', desc: 'Masukkan data postingan manual atau import via CSV sekaligus.' },
  { num: '04', title: 'Lihat insight & grow', desc: 'Dashboard langsung analisis data dan kasih rekomendasi actionable.' },
];

const FAQS = [
  {
    q: 'Apakah Creatorlytics gratis?',
    a: 'Ya, 100% gratis. Semua fitur bisa diakses tanpa biaya tersembunyi.',
  },
  {
    q: 'Platform apa saja yang didukung?',
    a: 'Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads.',
  },
  {
    q: 'Apakah data saya aman?',
    a: 'Data disimpan di Supabase dengan Row Level Security — hanya kamu yang bisa akses datamu sendiri.',
  },
  {
    q: 'Apakah perlu connect akun sosmed saya?',
    a: 'Tidak perlu. Kamu input data secara manual atau lewat import CSV, jadi tidak ada akses ke akunmu.',
  },
  {
    q: 'Bisa dipakai di HP?',
    a: 'Bisa. Creatorlytics responsive dan dioptimasi untuk mobile.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Redirect logged-in users straight to dashboard
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

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              C
            </div>
            <span className="font-bold text-lg">Creatorlytics</span>
          </div>
          <Button size="sm" onClick={handleLogin} disabled={authLoading}>
            {authLoading ? <Loader2 className="size-4 animate-spin" /> : 'Mulai Gratis'}
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="size-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
            100% Gratis untuk Kreator Indonesia
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Analytics Dashboard untuk{' '}
            <span className="text-indigo-500">Kreator Konten</span>{' '}
            Indonesia
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Track performa kontenmu di semua platform, pantau goal, dan dapatkan insight berbasis data — tanpa perlu coding, tanpa biaya.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={handleLogin} disabled={authLoading} className="w-full sm:w-auto px-8">
              {authLoading ? (
                <><Loader2 className="size-4 animate-spin" />Memuat...</>
              ) : (
                <>Mulai Gratis dengan Google <ArrowRight className="size-4" /></>
              )}
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto">
              Lihat Fitur
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Tidak perlu kartu kredit. Setup dalam 2 menit.</p>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-border/50 bg-muted/30 py-8 px-4">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
          {[
            { val: '8+', label: 'Platform didukung' },
            { val: '10+', label: 'Metrik yang ditrack' },
            { val: '100%', label: 'Gratis selamanya' },
            { val: '<2 mnt', label: 'Waktu setup' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-foreground">{s.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Semua yang kamu butuhkan</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Dari tracking harian sampai laporan bulanan, Creatorlytics punya semua tools yang kreator butuhkan.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-3 hover:border-indigo-500/30 hover:shadow-md transition-all">
                <div className="p-2 w-fit rounded-lg bg-muted/50">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Cara kerjanya simpel</h2>
            <p className="mt-3 text-muted-foreground">4 langkah dan kamu sudah bisa lihat analytics kontenmu.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative flex flex-col gap-3">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%-8px)] w-full h-px bg-border z-0" />
                )}
                <div className="relative z-10 flex size-10 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold text-sm">
                  {s.num}
                </div>
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Dashboard yang powerful</h2>
            <p className="mt-3 text-muted-foreground">Semua data di satu tempat, visual yang bersih dan mudah dibaca.</p>
          </div>
          {/* Mock dashboard preview */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl">
            {/* Fake topbar */}
            <div className="border-b border-border/60 bg-muted/40 px-4 py-3 flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-400/70" />
              <div className="size-3 rounded-full bg-yellow-400/70" />
              <div className="size-3 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">creatorlytics.app/dashboard</span>
            </div>
            {/* Fake dashboard content */}
            <div className="p-5 space-y-4">
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Total Posts', val: '142', icon: <FileText className="size-4 text-indigo-500" /> },
                  { label: 'Total Reach', val: '2.4M', icon: <BarChart3 className="size-4 text-emerald-500" /> },
                  { label: 'Avg ER', val: '4.8%', icon: <TrendingUp className="size-4 text-amber-500" /> },
                  { label: 'Followers', val: '+1.2K', icon: <Users className="size-4 text-rose-500" /> },
                ].map(k => (
                  <div key={k.label} className="rounded-lg border border-border/50 bg-background/60 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{k.label}</p>
                      <p className="text-base font-bold mt-0.5">{k.val}</p>
                    </div>
                    {k.icon}
                  </div>
                ))}
              </div>
              {/* Chart placeholder */}
              <div className="rounded-lg border border-border/50 bg-background/60 p-4 h-28 flex items-end gap-1.5 overflow-hidden">
                {[35, 55, 40, 70, 60, 85, 75, 90, 65, 80, 95, 72].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-indigo-500/60"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              {/* Bottom row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Top Konten</p>
                  {['Reels tutorial editing', 'Behind the scenes', 'Carousel tips'].map(t => (
                    <div key={t} className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-indigo-500/70 shrink-0" />
                      <p className="text-[11px] text-muted-foreground truncate">{t}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Goal Progress</p>
                  {[
                    { label: 'Followers', pct: 78 },
                    { label: 'Reach', pct: 52 },
                  ].map(g => (
                    <div key={g.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{g.label}</span><span>{g.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${g.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA middle ── */}
      <section className="py-16 px-4 bg-indigo-500/5 border-y border-indigo-500/10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Siap ngetrack konten lebih serius?</h2>
          <p className="mt-3 text-muted-foreground text-sm">Ribuan kreator Indonesia sudah pakai Creatorlytics untuk grow lebih cepat.</p>
          <Button size="lg" onClick={handleLogin} disabled={authLoading} className="mt-6 px-10">
            {authLoading ? <Loader2 className="size-4 animate-spin" /> : <>Mulai Sekarang — Gratis <ArrowRight className="size-4" /></>}
          </Button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Pertanyaan umum</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-muted/30 transition-colors"
                  aria-expanded={openFaq === i}
                >
                  {faq.q}
                  <span className={`ml-4 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl mx-auto mb-4">
            C
          </div>
          <h2 className="text-2xl font-bold">Creatorlytics</h2>
          <p className="mt-2 text-muted-foreground text-sm">Analytics dashboard untuk kreator konten Indonesia.</p>
          <Button size="lg" onClick={handleLogin} disabled={authLoading} className="mt-6 px-10">
            {authLoading ? <Loader2 className="size-4 animate-spin" /> : <>Mulai Gratis <ArrowRight className="size-4" /></>}
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-6 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2025 Creatorlytics. Made with care untuk kreator Indonesia.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" /> Data aman
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" /> 100% Gratis
            </span>
            <span className="flex items-center gap-1">
              <LayoutDashboard className="size-3 text-indigo-500" /> Powered by Supabase & Vercel
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
