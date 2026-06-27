'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart3, Target, Sparkles, CalendarDays, Activity, Users,
  TrendingUp, Clock, Video, ChevronDown, ArrowRight,
} from 'lucide-react';

const FAQS = [
  { q: 'Apakah Creatorlytics beneran gratis?', a: 'Ya, 100% gratis selamanya. Tidak ada hidden fees, tidak ada trial period, dan tidak ada fitur yang dikunci di balik paywall. Kami dibiayai oleh misi untuk membantu kreator Indonesia grow.' },
  { q: 'Platform apa saja yang didukung?', a: 'Saat ini kami mendukung pencatatan untuk Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads. Kamu bebas menambahkan data dari platform manapun.' },
  { q: 'Apakah data saya aman?', a: 'Keamanan data adalah prioritas utama kami. Kami tidak meminta password akun sosial media-mu. Data hanya berasal dari input manualmu untuk menampilkan analytics di dashboard-mu.' },
  { q: 'Berapa lama setup-nya?', a: 'Kurang dari 2 menit. Cukup login dengan Google, tambahkan akun sosial mediamu, dan dashboard langsung siap dipakai.' },
  { q: 'Bagaimana Insights bekerja?', a: 'Sistem logik kami menganalisis pola datamu — waktu posting, format, topik, dan engagement — untuk memberikan rekomendasi berbasis data yang spesifik untuk akunmu.' },
  { q: 'Bisa dipakai di HP?', a: 'Ya! Creatorlytics sepenuhnya responsive dan bisa diakses dari browser HP, tablet, atau desktop.' },
];

const FEATURES = [
  { icon: BarChart3, title: 'Multi-Platform Analytics', desc: 'Rekap data dari 8+ platform sosial media dan lihat semua metrik dalam satu dashboard yang unified.', tag: 'Core', tagColor: 'bg-cly-brand-tint text-cly-brand' },
  { icon: Target, title: 'Goal Tracking & Forecasting', desc: 'Set target followers, reach, atau engagement — dan lihat prediksi kapan targetmu tercapai berdasarkan performa saat ini.', tag: 'Popular', tagColor: 'bg-cly-brand-tint text-cly-brand' },
  { icon: Sparkles, title: 'Data-Driven Insights', desc: 'Dapatkan rekomendasi waktu posting, format konten, dan topik yang paling efektif untuk akunmu dari analisis data historis.', tag: 'Insights', tagColor: 'bg-cly-blue-tint text-cly-blue' },
  { icon: CalendarDays, title: 'Content Planner & Kanban', desc: 'Organize ide kontenmu dari draft sampai published dengan board Kanban yang intuitif.', tag: 'Productivity', tagColor: 'bg-cly-amber-tint text-cly-amber' },
  { icon: Activity, title: 'Content Health Score', desc: 'Skor 0–100 yang mengukur konsistensi, engagement, dan pertumbuhan kontenmu secara keseluruhan.', tag: 'Metrics', tagColor: 'bg-cly-green-tint text-cly-green' },
  { icon: Users, title: 'Competitor Benchmarking', desc: 'Bandingkan performamu dengan kreator lain di niche yang sama — dan cari celah untuk grow lebih cepat.', tag: 'Coming Soon', tagColor: 'bg-cly-purple-tint text-cly-purple' },
];

const TESTIMONIALS = [
  { name: 'Kreator Indonesia', role: 'TikTok Creator', quote: 'Setup-nya gampang, langsung kepakai hari pertama buat rekap.', color: 'bg-cly-brand' },
  { name: 'Social Media Specialist', role: 'Agency', quote: 'Goal tracking-nya beneran berguna. Jadi tau kapan harus push konten lebih keras dan kapan bisa santai.', color: 'bg-cly-blue' },
  { name: 'Digital Marketer', role: 'Freelancer', quote: 'Sebelumnya tracking manual di spreadsheet yang berantakan. Sekarang semua rapi dan jauh lebih enak dibacanya.', color: 'bg-cly-amber' },
  { name: 'Content Creator', role: 'Instagram', quote: 'Insights-nya ngebantu banget. Rekomendasiin jam posting yang pas dari data performa aku.', color: 'bg-cly-purple' },
  { name: 'Community Manager', role: 'Brand', quote: 'Gratis tapi fiturnya selengkap ini? Ini yang selama ini dicari-cari.', color: 'bg-cly-green' },
  { name: 'Marketing Staff', role: 'Startup', quote: 'Data dari 5 platform langsung bisa direkap dalam satu layar. Gak perlu bingung bikin report lagi.', color: 'bg-cly-red' },
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter / X', 'LinkedIn', 'Facebook', 'Threads'];

const STEPS = [
  { num: '01', title: 'Login dengan Google', desc: 'Satu klik login — tidak perlu bikin akun baru atau isi form panjang-panjang.' },
  { num: '02', title: 'Tambahkan Akun & Platform', desc: 'Pilih platform sosial mediamu dan buat profil akun pencatatan.' },
  { num: '03', title: 'Lihat Dashboard', desc: 'Masukkan datamu dan semua metrik langsung muncul di dashboard.' },
];

/* Google icon SVG as component */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LandingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // TEMPORARY: Commented out so you can preview the landing page even if you are logged in
    // if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function handleLogin(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    e.preventDefault();
    setAuthLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cly-bg">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-cly-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="force-light min-h-screen bg-cly-bg text-cly-text font-sans antialiased overflow-x-hidden">

      {/* ─── NAV ─── */}
      <nav className={`sticky top-0 z-50 h-[60px] flex items-center justify-between px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))] border-b transition-shadow duration-300 ${scrolled ? 'border-cly-border bg-cly-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,.06)]' : 'border-transparent bg-cly-bg/80 backdrop-blur-lg'}`}>
        <Link href="/" className="flex items-center gap-2.5 text-cly-text font-bold text-[15px] tracking-tight no-underline">
          <div className="w-[30px] h-[30px] bg-cly-brand rounded-lg grid place-items-center text-white font-extrabold text-[13px]">C</div>
          Creatorlytics
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <a href="#showcase" className="px-3.5 py-2 text-[13px] font-medium text-cly-text-2 hover:text-cly-text hover:bg-cly-muted rounded-lg transition-colors">Dashboard</a>
          <a href="#features" className="px-3.5 py-2 text-[13px] font-medium text-cly-text-2 hover:text-cly-text hover:bg-cly-muted rounded-lg transition-colors">Fitur</a>
          <a href="#how" className="px-3.5 py-2 text-[13px] font-medium text-cly-text-2 hover:text-cly-text hover:bg-cly-muted rounded-lg transition-colors">Cara Kerja</a>
        </div>
        <button onClick={handleLogin} disabled={authLoading} className="h-[34px] px-4 bg-cly-brand text-white border-none rounded-lg font-bold text-[13px] cursor-pointer tracking-tight hover:bg-cly-brand-hover transition-colors inline-flex items-center gap-1.5">
          {authLoading ? 'Memuat...' : 'Mulai Gratis'}
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-20 text-center relative px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))]">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,rgba(47,111,69,.06)_0%,transparent_70%)]" />

        <div className="relative z-10">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cly-surface border border-cly-border rounded-full mb-6 text-[12px] font-medium text-cly-text-2 shadow-cly">
            <span className="w-2 h-2 rounded-full bg-cly-brand animate-pulse" />
            100% Gratis untuk Kreator Indonesia
          </div>

          <h1 className="text-[clamp(36px,6.5vw,72px)] font-extrabold leading-[1.06] tracking-[-0.03em] max-w-[680px] mx-auto text-cly-text">
            Kenali kontenmu.<br />Grow lebih cepat.
          </h1>

          <p className="max-w-[420px] mx-auto mt-5 mb-8 text-[16px] text-cly-text-2 leading-[1.7]">
            Analytics dashboard untuk kreator Indonesia — 8+ platform, 10+ metrik, gratis selamanya.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={handleLogin} disabled={authLoading} className="inline-flex items-center gap-2 h-11 px-5 bg-cly-brand text-white border-none rounded-[10px] font-bold text-[14px] cursor-pointer tracking-tight hover:bg-cly-brand-hover transition-all hover:-translate-y-0.5 shadow-cly">
              <GoogleIcon />
              {authLoading ? 'Memuat...' : 'Mulai Gratis dengan Google'}
            </button>
            <a href="#showcase" className="inline-flex items-center gap-2 h-11 px-5 bg-transparent text-cly-text border border-cly-border rounded-[10px] font-semibold text-[14px] cursor-pointer hover:bg-cly-muted transition-colors no-underline">
              Lihat Dashboard <ArrowRight size={14} />
            </a>
          </div>

          <p className="mt-4 text-[12px] text-cly-text-3">
            Tidak perlu kartu kredit <span className="mx-1.5">·</span> Setup &lt;2 menit <span className="mx-1.5">·</span> Gratis selamanya
          </p>
        </div>

        {/* ─── Dashboard Preview ─── */}
        <div className="max-w-[880px] mx-auto mt-14 bg-cly-surface rounded-2xl border border-cly-border overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,.08),0_2px_8px_rgba(0,0,0,.04)]" style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
          {/* Browser bar */}
          <div className="bg-cly-muted h-9 flex items-center justify-between px-3.5 border-b border-cly-border">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="text-[10px] font-mono text-cly-text-3 bg-cly-bg px-3 py-0.5 rounded">creatorlytics.app/dashboard</div>
            <div className="w-[60px]" />
          </div>
          {/* KPIs */}
          <div className="p-3.5">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total Reach', value: '2.4M', delta: '↑ +18.3%', color: 'bg-cly-green' },
                { label: 'Total Post', value: '142', delta: '↑ +12 bulan ini', color: 'bg-cly-brand' },
                { label: 'Avg ER', value: '4.8%', delta: '↑ +0.6pp', color: 'bg-cly-amber' },
                { label: 'Followers', value: '+1.2K', delta: '↑ +320 mgg ini', color: 'bg-cly-blue' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-cly-bg border border-cly-border rounded-[9px] p-2.5 md:p-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-cly-text-3">{kpi.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${kpi.color}`} />
                  </div>
                  <div className="font-mono text-[17px] md:text-[19px] font-medium text-cly-text">{kpi.value}</div>
                  <div className="text-[10px] font-semibold text-cly-green">{kpi.delta}</div>
                </div>
              ))}
            </div>
            {/* Chart + top content */}
            <div className="grid grid-cols-[1fr_0.5fr] gap-2 mt-2">
              <div className="bg-cly-bg border border-cly-border rounded-[9px] p-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-cly-text-3 mb-2.5">Reach — 12 Bulan Terakhir</div>
                <div className="flex items-end gap-[3px] h-[60px]">
                  {[35, 42, 38, 51, 46, 58, 63, 70, 67, 78, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-cly-brand/20 hover:bg-cly-brand/40 transition-colors" style={{ height: `${h}%`, opacity: 0.3 + (h / 100) * 0.7 }} />
                  ))}
                </div>
                <div className="flex gap-[3px] mt-1">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m) => (
                    <div key={m} className="flex-1 text-center font-mono text-[7px] text-cly-text-3">{m}</div>
                  ))}
                </div>
              </div>
              <div className="bg-cly-bg border border-cly-border rounded-[9px] p-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-cly-text-3 mb-2">Top Konten</div>
                {[
                  { rank: 1, name: 'Reels tutorial editing', reach: '45.2K', color: 'bg-cly-brand' },
                  { rank: 2, name: 'Behind the scenes', reach: '32.1K', color: 'bg-cly-green' },
                  { rank: 3, name: 'Carousel tips', reach: '28.7K', color: 'bg-cly-blue' },
                ].map((item) => (
                  <div key={item.rank} className="flex items-center gap-1.5 py-1.5 hover:bg-cly-muted rounded px-1 transition-colors">
                    <span className="font-mono text-[9px] text-cly-text-3 w-2.5">{item.rank}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.color}`} />
                    <span className="text-[11px] font-medium flex-1 truncate">{item.name}</span>
                    <span className="font-mono text-[10px] text-cly-text-2">{item.reach}</span>
                  </div>
                ))}
                <div className="border-t border-cly-border mt-2 pt-2">
                  <div className="text-[8px] font-semibold uppercase tracking-widest text-cly-text-3 mb-1.5">Goal Progress</div>
                  {[
                    { label: 'Followers', pct: 78 },
                    { label: 'Reach', pct: 52 },
                  ].map((g) => (
                    <div key={g.label} className="mb-1.5">
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="font-medium">{g.label}</span>
                        <span className="font-mono text-cly-text-2">{g.pct}%</span>
                      </div>
                      <div className="h-1 bg-cly-muted-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cly-brand rounded-full transition-all" style={{ width: `${g.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLATFORM MARQUEE ─── */}
      <div className="border-y border-cly-border overflow-hidden">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] py-3 hover:[animation-play-state:paused]">
          {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <span key={i} className="px-6 font-mono text-[11px] text-cly-text-3 tracking-wider whitespace-nowrap border-r border-cly-border">
              <span className="text-cly-brand mr-1.5">✦</span>{p}
            </span>
          ))}
        </div>
      </div>

      {/* ─── SHOWCASE ─── */}
      <section className="py-20 md:py-24 px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))]" id="showcase">
        <p className="font-mono text-[11px] uppercase tracking-[.12em] text-cly-brand mb-3.5">Dashboard Preview</p>
        <h2 className="text-[clamp(26px,3.8vw,42px)] font-bold leading-[1.1] tracking-[-0.025em] mb-2.5">Lihat produknya langsung.</h2>
        <p className="text-[15px] text-cly-text-2 leading-relaxed">Semua fitur dalam satu dashboard terintegrasi.</p>

        {/* AI Insights preview */}
        <div className="mt-10 bg-cly-surface rounded-2xl border border-cly-border overflow-hidden shadow-cly">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-cly-border">
            <span className="text-[13px] font-semibold">AI Insights</span>
            <span className="font-mono text-[11px] text-cly-text-2 bg-cly-muted px-2.5 py-1 rounded-md">Updated 5 menit lalu</span>
          </div>
          <div className="p-4 md:p-5 space-y-3">
            {[
              { icon: Clock, title: 'Waktu Terbaik Posting', desc: 'Selasa & Kamis pukul 19:00–21:00 WIB menghasilkan ER 2.4× lebih tinggi dari rata-rata kontenmu.', color: 'bg-cly-brand-tint text-cly-brand' },
              { icon: Video, title: 'Format Terpopuler', desc: 'Reels menghasilkan reach 68% lebih tinggi vs foto carousel bulan ini. Perbanyak Reels pendek.', color: 'bg-cly-blue-tint text-cly-blue' },
              { icon: TrendingUp, title: 'Topik yang Sedang Naik', desc: '"Tutorial editing" dan "Behind the scenes" adalah 2 topik dengan engagement tertinggi — pertahankan.', color: 'bg-cly-green-tint text-cly-green' },
            ].map((insight) => (
              <div key={insight.title} className="flex gap-3 items-start bg-cly-bg border border-cly-border rounded-[10px] p-3.5 hover:shadow-cly transition-shadow">
                <div className={`w-[34px] h-[34px] rounded-lg grid place-items-center shrink-0 ${insight.color}`}>
                  <insight.icon size={16} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold mb-1">{insight.title}</div>
                  <div className="text-[12.5px] text-cly-text-2 leading-relaxed">{insight.desc}</div>
                </div>
              </div>
            ))}
            {/* Health score */}
            <div className="flex items-center justify-between bg-cly-bg border border-cly-border rounded-[10px] p-3.5">
              <div>
                <div className="text-[13px] font-semibold">Content Health Score</div>
                <div className="text-[12px] text-cly-text-2 mt-0.5">Berdasarkan konsistensi, engagement, dan pertumbuhan</div>
              </div>
              <div className="font-mono text-[28px] font-medium text-cly-brand">87<span className="text-[13px] text-cly-text-3">/100</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 border-t border-cly-border overflow-hidden">
        <div className="px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))] mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.12em] text-cly-brand mb-3.5">Kata Mereka</p>
            <h2 className="text-[clamp(26px,3.8vw,42px)] font-bold leading-[1.1] tracking-[-0.025em]">Kreator Indonesia<br />udah pakai duluan.</h2>
          </div>
          <p className="text-[15px] text-cly-text-2 max-w-[340px] leading-relaxed md:text-right">Bergabung dengan ribuan kreator yang udah track dan grow bareng Creatorlytics.</p>
        </div>
        <div className="flex flex-col gap-3">
          {/* Row 1 */}
          <div className="flex w-max animate-[marqueeL_38s_linear_infinite] hover:[animation-play-state:paused]">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="min-w-[280px] max-w-[280px] bg-cly-surface border border-cly-border rounded-xl p-4 mr-3 shrink-0 hover:border-cly-border-strong transition-colors">
                <div className="text-cly-brand text-[11px] mb-2.5 tracking-wide">★★★★★</div>
                <p className="text-[13px] text-cly-text leading-relaxed mb-3.5">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full ${t.color} text-white grid place-items-center font-bold text-[11px] shrink-0`}>{t.name[0]}</div>
                  <div>
                    <div className="text-[12px] font-semibold">{t.name}</div>
                    <div className="text-[11px] text-cly-text-2">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Row 2 — reverse */}
          <div className="flex w-max animate-[marqueeR_44s_linear_infinite] hover:[animation-play-state:paused]">
            {[...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3)].map((t, i) => (
              <div key={i} className="min-w-[280px] max-w-[280px] bg-cly-surface border border-cly-border rounded-xl p-4 mr-3 shrink-0 hover:border-cly-border-strong transition-colors">
                <div className="text-cly-brand text-[11px] mb-2.5 tracking-wide">★★★★★</div>
                <p className="text-[13px] text-cly-text leading-relaxed mb-3.5">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full ${t.color} text-white grid place-items-center font-bold text-[11px] shrink-0`}>{t.name[0]}</div>
                  <div>
                    <div className="text-[12px] font-semibold">{t.name}</div>
                    <div className="text-[11px] text-cly-text-2">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 md:py-24 px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))] border-t border-cly-border" id="features">
        <p className="font-mono text-[11px] uppercase tracking-[.12em] text-cly-brand mb-3.5">Fitur Lengkap</p>
        <h2 className="text-[clamp(26px,3.8vw,42px)] font-bold leading-[1.1] tracking-[-0.025em] mb-2.5">Semua yang kamu butuhkan,<br />dalam satu tempat.</h2>
        <p className="text-[15px] text-cly-text-2 leading-relaxed">Tidak perlu lagi bolak-balik antar app. Creatorlytics punya semuanya.</p>

        <div className="mt-11 flex flex-col">
          {FEATURES.map((f, i) => (
            <div key={i} className="grid grid-cols-[48px_1fr_auto] gap-5 items-start py-5 border-b border-cly-border first:border-t">
              <div className="font-mono text-[11px] text-cly-text-3 pt-0.5">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <f.icon size={16} className="text-cly-brand" />
                  <span className="font-semibold text-[16px] tracking-tight">{f.title}</span>
                </div>
                <div className="text-[14px] text-cly-text-2 leading-relaxed">{f.desc}</div>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-md font-semibold whitespace-nowrap self-center ${f.tagColor}`}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-24 px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))] border-t border-cly-border" id="how">
        <p className="font-mono text-[11px] uppercase tracking-[.12em] text-cly-brand mb-3.5">Cara Kerja</p>
        <h2 className="text-[clamp(26px,3.8vw,42px)] font-bold leading-[1.1] tracking-[-0.025em] mb-2.5">Setup kurang dari 2 menit.</h2>
        <p className="text-[15px] text-cly-text-2 leading-relaxed">Tiga langkah simpel, langsung bisa pakai.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-11">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              <div className="font-mono text-[11px] text-cly-brand tracking-wider mb-3.5">STEP {step.num}</div>
              <div className="font-bold text-[18px] mb-2 tracking-tight">{step.title}</div>
              <div className="text-[14px] text-cly-text-2 leading-[1.7]">{step.desc}</div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1 text-[15px] text-cly-text-3">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-24 px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))] border-t border-cly-border grid md:grid-cols-[1fr_auto] gap-14 items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.12em] text-cly-brand mb-4">Mulai Sekarang</p>
          <h2 className="text-[clamp(28px,3.8vw,44px)] font-bold tracking-[-0.025em] leading-[1.1] mb-3.5">
            Saatnya <em className="not-italic text-cly-brand">grow</em> dengan<br />data, bukan feeling.
          </h2>
          <p className="text-[15px] text-cly-text-2 leading-[1.72] max-w-[480px]">Join ribuan kreator Indonesia yang udah pakai Creatorlytics. Gratis selamanya, tanpa kartu kredit, tanpa batas waktu.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <button onClick={handleLogin} disabled={authLoading} className="inline-flex items-center gap-2 h-12 px-6 bg-cly-brand text-white border-none rounded-[10px] font-bold text-[15px] cursor-pointer tracking-tight hover:bg-cly-brand-hover transition-all hover:-translate-y-0.5 whitespace-nowrap shadow-cly">
            <GoogleIcon />
            {authLoading ? 'Memuat...' : 'Mulai Gratis dengan Google'}
          </button>
          <div className="font-mono text-[11px] text-cly-text-3 leading-[1.7] md:text-right">Tidak perlu kartu kredit<br />Setup kurang dari 2 menit</div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-24 px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))] border-t border-cly-border" id="faq">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-16">
          <div className="md:sticky md:top-20 md:self-start">
            <span className="font-mono text-[11px] uppercase tracking-[.12em] text-cly-brand block mb-4">FAQ</span>
            <h2 className="font-bold text-[24px] tracking-tight leading-[1.2] mb-3">Pertanyaan<br />yang sering muncul.</h2>
            <p className="text-[13px] text-cly-text-2 leading-[1.7]">Kalau belum terjawab, reach out ke tim kami kapan aja.</p>
          </div>
          <div>
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-cly-border">
                <button className="flex items-start justify-between gap-5 py-5 w-full text-left bg-transparent border-none cursor-pointer text-[15px] font-semibold text-cly-text hover:text-cly-brand transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <div className={`w-[26px] h-[26px] border border-cly-border rounded-md grid place-items-center shrink-0 transition-all ${openFaq === i ? 'bg-cly-brand-tint border-cly-brand/30 text-cly-brand rotate-45' : 'text-cly-text-3'}`}>
                    <ChevronDown size={14} className={`transition-transform ${openFaq === i ? 'rotate-[135deg]' : ''}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-[220px]' : 'max-h-0'}`}>
                  <div className="text-[14px] text-cly-text-2 leading-[1.78] pb-5">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-cly-border pt-14 pb-8 px-5 md:px-8 lg:px-[max(20px,calc((100%-1100px)/2))]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-cly-text font-bold text-[15px] tracking-tight no-underline mb-3">
              <div className="w-[26px] h-[26px] bg-cly-brand rounded-md grid place-items-center text-white font-extrabold text-[11px]">C</div>
              Creatorlytics
            </Link>
            <p className="text-[13px] text-cly-text-2 leading-relaxed mb-3">Analytics dashboard untuk kreator Indonesia. Gratis selamanya.</p>
            <div className="font-mono text-[11px] text-cly-brand font-medium">2,400+ kreator aktif</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cly-text-3 mb-4">Produk</div>
            <a href="#showcase" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">Dashboard</a>
            <a href="#features" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">Fitur</a>
            <a href="#how" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">Cara Kerja</a>
            <a href="#faq" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">FAQ</a>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cly-text-3 mb-4">Kreator</div>
            <a href="#" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">Blog</a>
            <a href="#" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">Panduan</a>
            <a href="#" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">Changelog</a>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cly-text-3 mb-4">Legal</div>
            <Link href="/legal/privacy" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">Privacy Policy</Link>
            <Link href="/legal/terms" className="block text-[13px] text-cly-text-2 mb-2.5 hover:text-cly-text transition-colors no-underline">Terms of Service</Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-cly-border gap-3">
          <div className="text-[12px] text-cly-text-3">© {new Date().getFullYear()} Creatorlytics. All rights reserved.</div>
          <div className="text-[12px] text-cly-text-3">Dibuat dengan <em className="not-italic text-cly-brand">♥</em> di Indonesia</div>
        </div>
      </footer>
    </div>
  );
}
