'use client';

import './landing.css';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

/* ─── data ─────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { n: '01', title: 'Analytics Mendalam', tag: { label: '✦ Unggulan', cls: 'lp-tg' }, wide: true, desc: 'Track reach, impressions, engagement rate, dan followers gained dari semua platformmu dalam satu dashboard terintegrasi. Visualisasi data yang bersih dan mudah dipahami — tanpa perlu ekspor manual.' },
  { n: '02', title: 'Goal Tracking', tag: null, wide: false, desc: 'Set target bulanan dan pantau progress secara real-time dengan forecast otomatis berbasis velocity harian.' },
  { n: '03', title: 'AI Insights', tag: { label: '✦ AI-Powered', cls: 'lp-ta' }, wide: false, desc: 'Rekomendasi hari terbaik posting, format konten terpopuler, dan estimasi pencapaian goal berbasis data nyata.' },
  { n: '04', title: 'Content Calendar', tag: null, wide: false, desc: 'Rencanakan dan jadwalkan konten dengan kalender visual yang terintegrasi langsung ke semua platformmu.' },
  { n: '05', title: 'Content Planner', tag: null, wide: false, desc: 'Kelola ide konten dari brainstorm sampai siap publish dengan tampilan Kanban board yang intuitif.' },
  { n: '06', title: 'Laporan Otomatis', tag: null, wide: false, desc: 'Generate laporan performa lengkap dan export ke CSV kapan saja — siap dibagikan ke klien atau tim.' },
  { n: '07', title: 'Competitor Tracking', tag: null, wide: false, desc: 'Pantau performa kompetitor dan benchmark strategi kontenmu terhadap mereka secara langsung.' },
  { n: '08', title: 'Multi-Platform', tag: { label: '8+ Platform', cls: 'lp-tr' }, wide: false, desc: 'Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads — semua dalam satu tempat.' },
];

const STEPS = [
  { n: '01', title: 'Login dengan Google', desc: 'Satu klik, langsung masuk. Tidak perlu isi form panjang atau verifikasi email terpisah.' },
  { n: '02', title: 'Setup profil kreator', desc: 'Pilih niche, platform, dan pilar kontenmu dalam 2 menit. Dashboard langsung dipersonalisasi.' },
  { n: '03', title: 'Input data konten', desc: 'Masukkan data postingan manual atau import via CSV sekaligus. Proses cepat, tidak ribet sama sekali.' },
  { n: '04', title: 'Lihat insight & grow', desc: 'Dashboard analisis data dan kasih rekomendasi actionable yang bisa langsung kamu jalankan.' },
];

const CHART_BARS = [
  { h: 35, red: false }, { h: 42, red: false }, { h: 38, red: false },
  { h: 51, red: false }, { h: 46, red: false }, { h: 58, red: false },
  { h: 63, red: true, op: 0.68 }, { h: 70, red: true, op: 0.74 },
  { h: 67, red: true, op: 0.80 }, { h: 78, red: true, op: 0.86 },
  { h: 85, red: true, op: 0.92 }, { h: 100, red: true, op: 1 },
];
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

const FAQS = [
  { q: 'Apakah Creatorlytics gratis?', a: 'Ya, Creatorlytics 100% gratis untuk semua kreator Indonesia. Tidak ada biaya tersembunyi, tidak perlu kartu kredit, dan tidak ada masa trial. Gratis selamanya — beneran.' },
  { q: 'Platform apa saja yang didukung?', a: 'Kami mendukung Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads — total 8+ platform sosial media utama yang dipakai kreator Indonesia saat ini.' },
  { q: 'Apakah data saya aman?', a: 'Data kamu sepenuhnya aman. Kami menggunakan Supabase dengan Row Level Security — hanya kamu yang bisa akses datamu sendiri. Tidak ada data yang dijual atau dibagikan ke pihak ketiga.' },
  { q: 'Apakah perlu connect akun sosmed saya?', a: 'Tidak perlu. Kamu bisa input data secara manual atau import via CSV. Tidak ada akses sama sekali ke akun sosmedmu.' },
  { q: 'Bisa dipakai di HP?', a: 'Bisa! Creatorlytics dioptimalkan untuk mobile sehingga semua fitur bisa diakses dari HP dengan nyaman — termasuk input data, lihat analytics, dan goal tracking.' },
];

/* ─── component ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    revealRefs.current.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function r(delay?: string) {
    return (el: HTMLElement | null) => {
      if (!el || revealRefs.current.includes(el)) return;
      el.classList.add('lp-reveal');
      if (delay) el.classList.add(delay);
      revealRefs.current.push(el);
    };
  }

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
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7' }}>
        <svg className="lp-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0AFA9" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>
    );
  }

  return (
    <div className="lp">
      {/* GRAIN */}
      <div className="lp-grain" aria-hidden="true" />

      {/* NAV */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="/" className="lp-logo">
          <div className="lp-logo-mark">C</div>
          Creatorlytics
        </a>
        <div className="lp-nav-r">
          <button type="button" onClick={() => scrollTo('features')} className="lp-nav-a">Fitur</button>
          <button type="button" onClick={() => scrollTo('how')} className="lp-nav-a">Cara Kerja</button>
          <button type="button" onClick={() => scrollTo('faq')} className="lp-nav-a">FAQ</button>
          <button type="button" onClick={handleLogin} disabled={authLoading} className="lp-nav-btn">
            {authLoading
              ? <svg className="lp-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : 'Mulai Gratis'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-deco lp-deco-ring" aria-hidden="true" />
        <div className="lp-deco lp-deco-blob" aria-hidden="true" />
        <div className="lp-deco lp-deco-sq" aria-hidden="true" />

        <div className="lp-badge">
          <div className="lp-badge-dot" aria-hidden="true">✓</div>
          100% Gratis untuk Kreator Indonesia
        </div>

        <h1 className="lp-h1">
          Analytics Dashboard untuk<br />
          <span className="lp-h1-em">Kreator Konten</span><br />
          Indonesia
        </h1>

        <p className="lp-hero-sub">
          Track performa kontenmu di semua platform, pantau goal, dan dapatkan insight berbasis data — tanpa perlu coding, tanpa biaya.
        </p>

        <div className="lp-ctas">
          <button type="button" onClick={handleLogin} disabled={authLoading} className="lp-btn-r">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,.85)" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,.85)" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(255,255,255,.85)" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,.85)" />
            </svg>
            {authLoading ? 'Memuat...' : 'Mulai Gratis dengan Google'}
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" onClick={() => scrollTo('features')} className="lp-btn-g">
            Lihat Fitur <span aria-hidden="true">↓</span>
          </button>
        </div>

        <p className="lp-trust">
          Tidak perlu kartu kredit <span>·</span> Setup dalam 2 menit <span>·</span> Gratis selamanya
        </p>
      </section>

      {/* STATS */}
      <div className="lp-stats">
        {[
          { val: '8+', label: 'Platform didukung', d: '' },
          { val: '10+', label: 'Metrik yang ditrack', d: 'lp-d1' },
          { val: '100%', label: 'Gratis selamanya', d: 'lp-d2' },
          { val: '<2 mnt', label: 'Waktu setup', d: 'lp-d3' },
        ].map(s => (
          <div key={s.label} ref={r(s.d)} className="lp-stat">
            <div className="lp-stat-n">{s.val}</div>
            <div className="lp-stat-l">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" className="lp-sec">
        <p ref={r()} className="lp-eyebrow">Semua yang kamu butuhkan</p>
        <h2 ref={r('lp-d1')} className="lp-sec-title" style={{ maxWidth: 560 }}>
          Dari tracking harian sampai laporan bulanan.
        </h2>

        <div className="lp-feat-grid">
          {FEATURES.map(f => (
            <div key={f.n} className={`lp-fc${f.wide ? ' lp-fc-wide' : ''}`}>
              <div className="lp-fc-bar" aria-hidden="true" />
              <div className="lp-fc-n">{f.n}</div>
              <div className="lp-fc-title">{f.title}</div>
              <div className="lp-fc-desc">{f.desc}</div>
              {f.tag && <div className={`lp-tag ${f.tag.cls}`}>{f.tag.label}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="lp-sec lp-sec-alt">
        <p ref={r()} className="lp-eyebrow">Cara kerjanya simpel</p>
        <h2 ref={r('lp-d1')} className="lp-sec-title" style={{ maxWidth: 520 }}>
          4 langkah, langsung lihat analytics kontenmu.
        </h2>

        <div className="lp-steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.n} ref={r(i > 0 ? `lp-d${i}` : '')} className="lp-step">
              <div className="lp-step-bg" aria-hidden="true">{s.n}</div>
              <div className="lp-step-circle">{s.n}</div>
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="lp-sec" style={{ textAlign: 'center' }}>
        <p className="lp-eyebrow">Preview Dashboard</p>
        <h2 className="lp-sec-title" style={{ maxWidth: 460, margin: '0 auto' }}>
          Dashboard yang powerful
        </h2>
        <p className="lp-sec-sub" style={{ maxWidth: 420, margin: '16px auto 0', textAlign: 'center' }}>
          Semua data di satu tempat, visual yang bersih dan mudah dibaca.
        </p>

        <div ref={r()} className="lp-bw">
          {/* Browser bar */}
          <div className="lp-bbar">
            <div className="lp-bdots">
              <div className="lp-bd" style={{ background: '#FF5F57' }} />
              <div className="lp-bd" style={{ background: '#FEBC2E' }} />
              <div className="lp-bd" style={{ background: '#28C840' }} />
            </div>
            <div className="lp-burl">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="rgba(255,255,255,0.32)" aria-hidden="true"><path d="M5 0a3.5 3.5 0 0 0-3.5 3.5V5H.5A.5.5 0 0 0 0 5.5v6a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-6A.5.5 0 0 0 9.5 5H8.5V3.5A3.5 3.5 0 0 0 5 0zm2 5H3V3.5a2 2 0 0 1 4 0V5z"/></svg>
              creatorlytics.app/dashboard
            </div>
          </div>

          {/* Body */}
          <div className="lp-dbody">
            {/* Sidebar */}
            <div className="lp-dsb">
              <div className="lp-dsb-logo">Creatorlytics</div>
              {['Dashboard', 'Analytics', 'Konten', 'Goals', 'Laporan', 'Kompetitor'].map((item, i) => (
                <div key={item} className={`lp-dnav${i === 0 ? ' on' : ''}`}>{item}</div>
              ))}
            </div>

            {/* Main */}
            <div className="lp-dmain">
              <div className="lp-dhdr">
                <div className="lp-dhdr-t">Overview — Desember 2024</div>
                <div className="lp-dhdr-p">30 hari terakhir</div>
              </div>

              {/* KPI */}
              <div className="lp-krow">
                {[
                  { label: 'Total Post', dot: '#DC3020', val: '142', chg: '↑ +12 bulan ini' },
                  { label: 'Total Reach', dot: '#1B5E38', val: '2.4M', chg: '↑ +18.3%' },
                  { label: 'Avg ER', dot: '#C97C0B', val: '4.8%', chg: '↑ +0.6pp' },
                  { label: 'Followers', dot: '#5B5EA6', val: '+1.2K', chg: '↑ +320 minggu ini' },
                ].map(k => (
                  <div key={k.label} className="lp-kpi">
                    <div className="lp-klbl">
                      {k.label}
                      <div className="lp-kdot" style={{ background: k.dot }} />
                    </div>
                    <div className="lp-kval">{k.val}</div>
                    <div className="lp-kchg">{k.chg}</div>
                  </div>
                ))}
              </div>

              {/* Chart + Top content */}
              <div className="lp-brow">
                <div className="lp-dbox">
                  <div className="lp-boxtitle">Reach — 12 Bulan Terakhir</div>
                  <div className="lp-bchart">
                    {CHART_BARS.map((b, i) => (
                      <div
                        key={i}
                        className={`lp-bar ${b.red ? 'lp-br' : 'lp-bg'}`}
                        style={{ height: `${b.h}%`, opacity: b.op ?? 1 }}
                      />
                    ))}
                  </div>
                  <div className="lp-blbls">
                    {MONTHS.map(m => <div key={m} className="lp-bl">{m}</div>)}
                  </div>
                </div>

                <div className="lp-tbox">
                  <div className="lp-boxtitle">Top Konten</div>
                  {[
                    { rank: '1', dot: '#DC3020', name: 'Reels tutorial editing', val: '45.2K' },
                    { rank: '2', dot: '#1B5E38', name: 'Behind the scenes', val: '32.1K' },
                    { rank: '3', dot: '#C97C0B', name: 'Carousel tips', val: '28.7K' },
                  ].map(t => (
                    <div key={t.rank} className="lp-tci">
                      <span className="lp-tcrank">{t.rank}</span>
                      <div className="lp-tcdot" style={{ background: t.dot }} />
                      <span className="lp-tcname">{t.name}</span>
                      <span className="lp-tcval">{t.val}</span>
                    </div>
                  ))}

                  <div className="lp-gsep">
                    <div className="lp-ghead">Goal Progress</div>
                    {[
                      { label: 'Followers', pct: 78, color: '#1B5E38' },
                      { label: 'Reach', pct: 52, color: '#DC3020' },
                    ].map(g => (
                      <div key={g.label} className="lp-gi">
                        <div className="lp-gihdr">
                          {g.label} <span>{g.pct}%</span>
                        </div>
                        <div className="lp-gbar">
                          <div className="lp-gfill" style={{ width: `${g.pct}%`, background: g.color }} />
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
      <div className="lp-cta-out">
        <div ref={r()} className="lp-cta-card">
          <p className="lp-cey">Mulai Sekarang</p>
          <h2 className="lp-ctitle">Siap ngetrack konten<br />lebih serius?</h2>
          <p className="lp-csub">
            Ribuan kreator Indonesia sudah pakai Creatorlytics<br />
            untuk grow lebih cepat dan lebih terarah.
          </p>
          <button type="button" onClick={handleLogin} disabled={authLoading} className="lp-cbtn">
            {authLoading ? 'Memuat...' : 'Mulai Gratis Sekarang'} &nbsp;→
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="lp-faq-out">
        <p className="lp-eyebrow">Pertanyaan umum</p>
        <h2 className="lp-sec-title" style={{ maxWidth: 400 }}>Yang sering ditanyain</h2>
        <div className="lp-faq-in">
          {FAQS.map((faq, i) => (
            <div key={i} className={`lp-fi${openFaq === i ? ' open' : ''}`}>
              <button
                type="button"
                className="lp-fq"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                {faq.q}
                <span className="lp-ficon" aria-hidden="true">+</span>
              </button>
              <div className="lp-fa">
                <div className="lp-fa-in">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-ft-brand">
          <div className="lp-ft-mark">C</div>
          Creatorlytics
        </div>
        <p className="lp-ft-tag">Analytics dashboard untuk kreator konten Indonesia. Gratis selamanya.</p>
        <div className="lp-ft-btm">
          <p className="lp-ft-copy">© 2025 Creatorlytics. All rights reserved.</p>
          <p className="lp-ft-love">Dibuat dengan <em>♥</em> untuk kreator Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
