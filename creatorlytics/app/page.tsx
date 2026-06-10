'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    n: '01', title: 'Analytics Mendalam', tag: { label: '✦ Unggulan', cls: 'tg' }, wide: true,
    desc: 'Track reach, impressions, engagement rate, dan followers gained dari semua platformmu dalam satu dashboard terintegrasi. Visualisasi data yang bersih dan mudah dipahami — tanpa perlu ekspor manual.',
  },
  {
    n: '02', title: 'Goal Tracking', tag: null, wide: false,
    desc: 'Set target bulanan dan pantau progress secara real-time dengan forecast otomatis dan visual yang jelas.',
  },
  {
    n: '03', title: 'AI Insights', tag: { label: '✦ AI-Powered', cls: 'ta' }, wide: false,
    desc: 'Rekomendasi hari terbaik posting, format konten terpopuler, dan estimasi pencapaian goal berbasis data.',
  },
  {
    n: '04', title: 'Content Calendar', tag: null, wide: false,
    desc: 'Rencanakan dan jadwalkan konten dengan kalender visual yang terintegrasi langsung ke semua platformmu.',
  },
  {
    n: '05', title: 'Content Planner', tag: null, wide: false,
    desc: 'Kelola ide konten dari brainstorm sampai siap publish dengan tampilan Kanban board yang intuitif dan mudah dipakai.',
  },
  {
    n: '06', title: 'Laporan Otomatis', tag: null, wide: false,
    desc: 'Generate laporan performa lengkap dan export ke CSV atau PDF kapan saja hanya dengan satu klik.',
  },
  {
    n: '07', title: 'Competitor Tracking', tag: null, wide: false,
    desc: 'Pantau performa kompetitor dan benchmark strategi kontenmu terhadap mereka secara langsung dan real-time.',
  },
  {
    n: '08', title: 'Multi-Platform', tag: { label: '8+ Platform', cls: 'tr' }, wide: false,
    desc: 'Dukung Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads dalam satu tempat terpadu.',
  },
];

const STEPS = [
  { n: '01', title: 'Login dengan Google', desc: 'Satu klik, langsung masuk. Tidak perlu isi form panjang atau verifikasi email terpisah.' },
  { n: '02', title: 'Setup profil kreator', desc: 'Pilih niche, platform, dan pilar kontenmu dalam 2 menit. Dashboard langsung dipersonalisasi.' },
  { n: '03', title: 'Input data konten', desc: 'Masukkan data postingan manual atau import via CSV sekaligus. Proses cepat, tidak ribet sama sekali.' },
  { n: '04', title: 'Lihat insight & grow', desc: 'Dashboard analisis data dan kasih rekomendasi actionable yang bisa langsung kamu jalankan.' },
];

const FAQS = [
  { q: 'Apakah Creatorlytics gratis?', a: 'Ya, Creatorlytics 100% gratis untuk semua kreator Indonesia. Tidak ada biaya tersembunyi, tidak perlu kartu kredit, dan tidak ada masa trial. Gratis selamanya — beneran.' },
  { q: 'Platform apa saja yang didukung?', a: 'Kami mendukung Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads — total 8+ platform sosial media utama yang dipakai kreator Indonesia saat ini.' },
  { q: 'Apakah data saya aman?', a: 'Data kamu sepenuhnya aman. Kami menggunakan Supabase dengan Row Level Security — hanya kamu yang bisa akses datamu sendiri. Tidak ada data yang dijual atau dibagikan ke pihak ketiga.' },
  { q: 'Apakah perlu connect akun sosmed saya?', a: 'Tidak perlu. Kamu input data secara manual atau lewat import CSV, jadi tidak ada akses sama sekali ke akun sosmedmu.' },
  { q: 'Bisa dipakai di HP?', a: 'Bisa! Creatorlytics dioptimalkan untuk mobile sehingga semua fitur bisa diakses dari HP dengan nyaman — termasuk input data, lihat analytics, dan goal tracking.' },
];

const CHART_BARS = [
  { h: 35, red: false }, { h: 42, red: false }, { h: 38, red: false },
  { h: 51, red: false }, { h: 46, red: false }, { h: 58, red: false },
  { h: 63, red: true, op: 0.68 }, { h: 70, red: true, op: 0.74 },
  { h: 67, red: true, op: 0.80 }, { h: 78, red: true, op: 0.86 },
  { h: 85, red: true, op: 0.92 }, { h: 100, red: true, op: 1 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  // redirect logged-in users
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  // scroll shadow on nav
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // intersection observer for reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('on'); obs.unobserve(e.target); } }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addReveal = (el: HTMLElement | null, delay?: string) => {
    if (el) {
      el.classList.add('reveal');
      if (delay) el.classList.add(delay);
      if (!revealRefs.current.includes(el)) revealRefs.current.push(el);
    }
  };

  async function handleLogin() {
    setAuthLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  if (loading || user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7' }}>
        <Loader2 style={{ width: 20, height: 20, color: '#B0AFA9', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fl { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-10px) rotate(4deg);} }
        @keyframes fl-sq { 0%,100%{transform:translateY(0) rotate(18deg);} 50%{transform:translateY(-10px) rotate(26deg);} }
        .reveal { opacity:0; transform:translateY(30px); transition:opacity 0.65s ease, transform 0.65s ease; }
        .reveal.on { opacity:1; transform:none; }
        .d1{transition-delay:0.1s;} .d2{transition-delay:0.2s;} .d3{transition-delay:0.3s;}
        .fc-bar { position:absolute; top:0; left:0; right:0; height:2px; background:#DC3020; transform:scaleX(0); transform-origin:left; transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .fc:hover .fc-bar { transform:scaleX(1); }
        .fc:hover { background:#FEFCF9; }
        .step:hover { transform:translateY(-5px); box-shadow:0 24px 60px rgba(0,0,0,0.09); }
        .step:hover .step-circle { background:#181817; color:#FAFAF7; }
        .nav-a:hover { color:#181817; background:#F2F0EB; }
        .logo:hover .logo-mark { background:#DC3020; }
        .nav-btn:hover { background:#DC3020; transform:translateY(-1px); }
        .btn-r:hover { transform:translateY(-3px); box-shadow:0 12px 28px rgba(220,48,32,0.38); }
        .btn-g:hover { border-color:#181817; background:#181817; color:#FAFAF7; }
        .cbtn:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(220,48,32,0.42); }
        .tci:hover { background:#F5F4F0; }
        .bar:hover { opacity:0.72 !important; }
        .fi.open .ficon { background:#181817; border-color:#181817; color:#FAFAF7; transform:rotate(45deg); }
        .fi.open .fa { max-height:240px; }
        .tg { background:#EDFAF4; color:#1B5E38; }
        .ta { background:#FFF8EB; color:#C97C0B; }
        .tr { background:#FFF0EE; color:#DC3020; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#FAFAF7', color: '#181817', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", lineHeight: 1.6, overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' }}>

        {/* GRAIN */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '256px', opacity: 0.025 }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 62, padding: '0 max(20px, calc((100% - 1120px) / 2))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(250,250,247,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(232,230,225,0.5)', boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.07)' : 'none', transition: 'box-shadow 0.3s' }}>
          <a href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#181817', fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
            <div className="logo-mark" style={{ width: 32, height: 32, background: '#181817', borderRadius: 9, display: 'grid', placeItems: 'center', fontSize: 15, color: '#FAFAF7', fontWeight: 900, transition: 'background 0.2s', fontFamily: "'Fraunces', serif" }}>C</div>
            Creatorlytics
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button type="button" onClick={() => scrollTo('features')} className="nav-a" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: '#706F6B', textDecoration: 'none', borderRadius: 100, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s, background 0.2s' }}>Fitur</button>
            <button type="button" onClick={() => scrollTo('how')} className="nav-a" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: '#706F6B', textDecoration: 'none', borderRadius: 100, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s, background 0.2s' }}>Cara Kerja</button>
            <button type="button" onClick={handleLogin} disabled={authLoading} className="nav-btn" style={{ height: 36, padding: '0 18px', background: '#181817', color: '#FAFAF7', border: 'none', borderRadius: 100, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s, transform 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              {authLoading ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : 'Mulai Gratis'}
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding: '96px max(20px, calc((100% - 1120px) / 2)) 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(220,48,32,0.042) 0%, transparent 65%)', pointerEvents: 'none' }} />
          {/* Deco */}
          <div style={{ position: 'absolute', width: 72, height: 72, borderRadius: '50%', border: '1.5px solid #D5D3CE', top: 52, left: '5%', animation: 'fl 7s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: '#FFF8EB', border: '1px solid rgba(201,124,11,0.18)', top: 92, right: '7%', animation: 'fl 9s ease-in-out 2s infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 26, height: 26, borderRadius: 7, background: '#FFF0EE', bottom: 52, left: '13%', animation: 'fl-sq 8s ease-in-out 1s infinite', pointerEvents: 'none' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EDFAF4', border: '1px solid rgba(27,94,56,0.15)', borderRadius: 100, padding: '5px 14px 5px 5px', fontSize: 12.5, fontWeight: 700, color: '#1B5E38', marginBottom: 36, letterSpacing: '0.01em', animation: 'fadeUp 0.7s ease both' }}>
            <div style={{ width: 22, height: 22, background: '#1B5E38', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, color: 'white', fontWeight: 700 }}>✓</div>
            100% Gratis untuk Kreator Indonesia
          </div>

          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(46px, 7.5vw, 84px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.025em', animation: 'fadeUp 0.7s ease 0.1s both' }}>
            Analytics Dashboard untuk<br />
            <span style={{ fontStyle: 'italic', color: '#DC3020' }}>Kreator Konten</span><br />
            Indonesia
          </h1>

          <p style={{ maxWidth: 490, margin: '26px auto 44px', fontSize: 17.5, color: '#706F6B', lineHeight: 1.72, animation: 'fadeUp 0.7s ease 0.2s both' }}>
            Track performa kontenmu di semua platform, pantau goal, dan dapatkan insight berbasis data — tanpa perlu coding, tanpa biaya.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', animation: 'fadeUp 0.7s ease 0.3s both' }}>
            <button type="button" onClick={handleLogin} disabled={authLoading} className="btn-r" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#DC3020', color: 'white', border: 'none', height: 50, padding: '0 28px', borderRadius: 100, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', textDecoration: 'none', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,.85)" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,.85)" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(255,255,255,.85)" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,.85)" />
              </svg>
              {authLoading ? 'Memuat...' : 'Mulai Gratis dengan Google'}
              <span style={{ fontSize: 18 }}>→</span>
            </button>
            <button type="button" onClick={() => scrollTo('features')} className="btn-g" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#181817', border: '1.5px solid #D5D3CE', height: 50, padding: '0 24px', borderRadius: 100, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}>
              Lihat Fitur <span style={{ fontSize: 16 }}>↓</span>
            </button>
          </div>

          <p style={{ marginTop: 18, fontSize: 13, color: '#B0AFA9', animation: 'fadeUp 0.7s ease 0.4s both' }}>
            Tidak perlu kartu kredit <span style={{ margin: '0 7px' }}>·</span> Setup dalam 2 menit <span style={{ margin: '0 7px' }}>·</span> Gratis selamanya
          </p>
        </section>

        {/* STATS */}
        <div style={{ background: '#0F0F0E', padding: '48px max(20px, calc((100% - 1120px) / 2))', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { val: '8+', label: 'Platform didukung', delay: '' },
            { val: '10+', label: 'Metrik yang ditrack', delay: 'd1' },
            { val: '100%', label: 'Gratis selamanya', delay: 'd2' },
            { val: '<2 mnt', label: 'Waktu setup', delay: 'd3' },
          ].map((s, i) => (
            <div key={s.label} ref={el => addReveal(el, s.delay)} style={{ textAlign: 'center', padding: '0 16px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, color: '#F5F3ED', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section id="features" style={{ padding: '112px max(20px, calc((100% - 1120px) / 2))' }}>
          <p ref={el => addReveal(el)} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#706F6B', marginBottom: 18 }}>Semua yang kamu butuhkan</p>
          <h2 ref={el => addReveal(el, 'd1')} style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px, 4.5vw, 50px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', maxWidth: 560 }}>Dari tracking harian sampai laporan bulanan.</h2>

          <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#E8E6E1', border: '1px solid #E8E6E1', borderRadius: 20, overflow: 'hidden' }}>
            {FEATURES.map(f => (
              <div key={f.n} className="fc" style={{ background: '#FFFFFF', padding: '40px 36px', position: 'relative', transition: 'background 0.2s', gridColumn: f.wide ? 'span 2' : 'span 1' }}>
                <div className="fc-bar" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: '#B0AFA9', letterSpacing: '0.1em', marginBottom: 28 }}>
                  {f.n}
                  <span style={{ display: 'inline-block', width: 36, height: 1, background: '#D5D3CE', flexShrink: 0 }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: f.wide ? 21 : 17, lineHeight: 1.3, marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 14.5, color: '#706F6B', lineHeight: 1.72 }}>{f.desc}</div>
                {f.tag && (
                  <div className={`fc-tag ${f.tag.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 18, padding: '4px 10px', borderRadius: 100, fontSize: 11.5, fontWeight: 700 }}>{f.tag.label}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ padding: '112px max(20px, calc((100% - 1120px) / 2))', background: '#F2F0EB' }}>
          <p ref={el => addReveal(el)} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#706F6B', marginBottom: 18 }}>Cara kerjanya simpel</p>
          <h2 ref={el => addReveal(el, 'd1')} style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px, 4.5vw, 50px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', maxWidth: 520 }}>4 langkah, langsung lihat analytics kontenmu.</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 64 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} ref={el => addReveal(el, i === 0 ? '' : `d${i}` as 'd1'|'d2'|'d3')} className="step" style={{ background: '#FFFFFF', border: '1px solid #E8E6E1', borderRadius: 20, padding: 44, position: 'relative', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s' }}>
                <div style={{ position: 'absolute', bottom: -20, right: 10, fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 128, color: '#E8E6E1', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{s.n}</div>
                <div className="step-circle" style={{ width: 40, height: 40, border: '2px solid #181817', borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, marginBottom: 28, transition: 'all 0.25s', color: '#181817', background: 'transparent' }}>{s.n}</div>
                <h3 style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: '#706F6B', lineHeight: 1.72, maxWidth: 280 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section style={{ padding: '112px max(20px, calc((100% - 1120px) / 2))', textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#706F6B', marginBottom: 18 }}>Preview Dashboard</p>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px, 4.5vw, 50px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', maxWidth: 460, margin: '0 auto' }}>Dashboard yang powerful</h2>
          <p style={{ maxWidth: 420, margin: '16px auto 0', fontSize: 17, color: '#706F6B', lineHeight: 1.72 }}>Semua data di satu tempat, visual yang bersih dan mudah dibaca.</p>

          <div ref={el => addReveal(el)} style={{ marginTop: 60, borderRadius: 16, overflow: 'hidden', background: '#1C1C1A', boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.1)', textAlign: 'left' }}>
            {/* Browser bar */}
            <div style={{ background: '#252523', height: 46, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['#FF5F57'], ['#FEBC2E'], ['#28C840']].map(([c]) => <div key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ margin: '0 auto', background: '#1C1C1A', borderRadius: 7, padding: '5px 14px', fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: 'rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔒 creatorlytics.app/dashboard
              </div>
            </div>

            {/* Dashboard body */}
            <div style={{ background: '#F5F4F0', display: 'grid', gridTemplateColumns: '196px 1fr', minHeight: 460 }}>
              {/* Sidebar */}
              <div style={{ background: '#fff', borderRight: '1px solid #EEECE8', padding: '18px 12px' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 14, color: '#181817', padding: '8px 10px 16px', borderBottom: '1px solid #EEECE8', marginBottom: 12 }}>Creatorlytics</div>
                {['Dashboard', 'Analytics', 'Konten', 'Goals', 'Laporan', 'Kompetitor'].map((item, i) => (
                  <div key={item} style={{ padding: '9px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, color: i === 0 ? '#FAFAF7' : '#84827E', background: i === 0 ? '#181817' : 'transparent', marginBottom: 2, cursor: 'pointer' }}>{item}</div>
                ))}
              </div>

              {/* Main */}
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#181817' }}>Overview — Desember 2024</div>
                  <div style={{ fontSize: 11, fontWeight: 600, background: '#EEECE8', color: '#706F6B', padding: '4px 10px', borderRadius: 100 }}>30 hari terakhir</div>
                </div>

                {/* KPI */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Total Post', dot: '#DC3020', val: '142', chg: '↑ +12 bulan ini' },
                    { label: 'Total Reach', dot: '#1B5E38', val: '2.4M', chg: '↑ +18.3%' },
                    { label: 'Avg ER', dot: '#C97C0B', val: '4.8%', chg: '↑ +0.6pp' },
                    { label: 'Followers', dot: '#5B5EA6', val: '+1.2K', chg: '↑ +320 minggu ini' },
                  ].map(k => (
                    <div key={k.label} style={{ background: 'white', border: '1px solid #EEECE8', borderRadius: 12, padding: '14px 15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#84827E', marginBottom: 8 }}>
                        {k.label} <div style={{ width: 6, height: 6, borderRadius: '50%', background: k.dot }} />
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 21, fontWeight: 500, color: '#181817', marginBottom: 3 }}>{k.val}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1B5E38' }}>{k.chg}</div>
                    </div>
                  ))}
                </div>

                {/* Chart + Top content */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr', gap: 10, flex: 1 }}>
                  <div style={{ background: 'white', border: '1px solid #EEECE8', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#181817', marginBottom: 14 }}>Reach — 12 Bulan Terakhir</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90 }}>
                      {CHART_BARS.map((b, i) => (
                        <div key={i} className="bar" style={{ flex: 1, borderRadius: '3px 3px 0 0', background: b.red ? '#DC3020' : '#EDECEA', height: `${b.h}%`, opacity: b.op ?? 1, cursor: 'pointer', transition: 'opacity 0.15s' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                      {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map(m => (
                        <div key={m} style={{ flex: 1, textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 8.5, color: '#B0AFA9' }}>{m}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'white', border: '1px solid #EEECE8', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#181817', marginBottom: 14 }}>Top Konten</div>
                    {[
                      { rank: '1', dot: '#DC3020', name: 'Reels tutorial editing', val: '45.2K' },
                      { rank: '2', dot: '#1B5E38', name: 'Behind the scenes', val: '32.1K' },
                      { rank: '3', dot: '#C97C0B', name: 'Carousel tips', val: '28.7K' },
                    ].map(t => (
                      <div key={t.rank} className="tci" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 8px', borderRadius: 7, cursor: 'pointer', transition: 'background 0.15s' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#B0AFA9', width: 12, textAlign: 'center' }}>{t.rank}</span>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: '#181817', flex: 1 }}>{t.name}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#84827E' }}>{t.val}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #EEECE8', marginTop: 10, paddingTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#B0AFA9', marginBottom: 10 }}>Goal Progress</div>
                      {[{ label: 'Followers', pct: 78, color: '#1B5E38' }, { label: 'Reach', pct: 52, color: '#DC3020' }].map(g => (
                        <div key={g.label} style={{ marginBottom: 9 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 500, color: '#181817', marginBottom: 5 }}>
                            {g.label} <span style={{ fontFamily: "'DM Mono', monospace", color: '#84827E' }}>{g.pct}%</span>
                          </div>
                          <div style={{ height: 5, background: '#EEECE8', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${g.pct}%`, background: g.color, borderRadius: 100 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div style={{ padding: '0 max(20px, calc((100% - 1120px) / 2)) 112px' }}>
          <div ref={el => addReveal(el)} style={{ background: '#0F0F0E', borderRadius: 28, padding: '88px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 60%, rgba(220,48,32,0.17) 0%, transparent 52%), radial-gradient(ellipse at 78% 40%, rgba(27,94,56,0.10) 0%, transparent 52%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Mulai Sekarang</p>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(34px, 5vw, 58px)', fontWeight: 900, color: '#F5F3ED', lineHeight: 1.08, letterSpacing: '-0.025em', marginBottom: 16 }}>Siap ngetrack konten<br />lebih serius?</h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, marginBottom: 44 }}>Ribuan kreator Indonesia sudah pakai Creatorlytics<br />untuk grow lebih cepat dan lebih terarah.</p>
              <button type="button" onClick={handleLogin} disabled={authLoading} className="cbtn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#DC3020', color: 'white', border: 'none', height: 54, padding: '0 40px', borderRadius: 100, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer', textDecoration: 'none', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s' }}>
                {authLoading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : 'Mulai Gratis Sekarang'} &nbsp;→
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding: '0 max(20px, calc((100% - 1120px) / 2)) 112px' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#706F6B', marginBottom: 18 }}>Pertanyaan umum</p>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px, 4.5vw, 50px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', maxWidth: 400 }}>Yang sering ditanyain</h2>
          <div style={{ maxWidth: 720, marginTop: 48 }}>
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={isOpen ? 'fi open' : 'fi'} style={{ borderBottom: '1px solid #E8E6E1' }}>
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} className="fq" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '24px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s' }}>
                    {faq.q}
                    <div className="ficon" style={{ width: 30, height: 30, flexShrink: 0, border: '1.5px solid #D5D3CE', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 16, color: '#706F6B', transition: 'all 0.25s' }}>+</div>
                  </div>
                  <div className="fa" style={{ maxHeight: isOpen ? 240 : 0, overflow: 'hidden', transition: 'max-height 0.38s cubic-bezier(0,1,0.5,1)' }}>
                    <div style={{ fontSize: 15.5, color: '#706F6B', lineHeight: 1.8, paddingBottom: 24 }}>{faq.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ background: '#0F0F0E', padding: '60px max(20px, calc((100% - 1120px) / 2)) 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: '#F5F3ED', marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, background: '#2A2A28', borderRadius: 9, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 900, color: '#F5F3ED', fontFamily: "'Fraunces', serif" }}>C</div>
            Creatorlytics
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, maxWidth: 280 }}>Analytics dashboard untuk kreator konten Indonesia. Gratis selamanya.</p>
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.22)' }}>© 2025 Creatorlytics. All rights reserved.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.22)' }}>Dibuat dengan <span style={{ color: '#DC3020' }}>♥</span> untuk kreator Indonesia</p>
          </div>
        </footer>

      </div>
    </>
  );
}
