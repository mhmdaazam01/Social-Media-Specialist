'use client';

import './landing.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

export default function LandingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (loading || user) return;
    const targets = document.querySelectorAll('.lp-reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('on');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loading, user]);

  async function handleLogin(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    e.preventDefault();
    setAuthLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  // Show loading while auth resolves
  if (loading || user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#09090A' }}>
        <svg className="lp-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8DF3A" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>
    );
  }

  return (
    <div className="lp">
      <div className="lp-grain"></div>

      {/* NAV */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="lp-logo">
          <div className="lp-logo-mark">C</div>
          Creatorlytics
        </Link>
        <div className="lp-navlinks">
          <a href="#showcase" className="lp-nl">Dashboard</a>
          <a href="#features" className="lp-nl">Fitur</a>
          <a href="#how" className="lp-nl">Cara Kerja</a>
        </div>
        <button onClick={handleLogin} disabled={authLoading} className="lp-nav-cta">
          {authLoading ? 'Memuat...' : 'Mulai Gratis'}
        </button>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-pill">
          <div className="lp-hpd"></div>
          100% Gratis untuk Kreator Indonesia
        </div>
        <h1 className="lp-h1">Kenali kontenmu.<br />Grow lebih cepat.</h1>
        <p className="lp-hero-sub">Analytics dashboard untuk kreator Indonesia — 8+ platform, 10+ metrik, gratis selamanya.</p>
        <div className="lp-hero-ctas">
          <button onClick={handleLogin} disabled={authLoading} className="lp-btn-lime">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(9,9,10,.85)" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(9,9,10,.85)" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(9,9,10,.85)" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(9,9,10,.85)" />
            </svg>
            {authLoading ? 'Memuat...' : 'Mulai Gratis dengan Google'}
          </button>
          <a href="#showcase" className="lp-btn-outline">Lihat Dashboard ↓</a>
        </div>
        <p className="lp-hero-trust">Tidak perlu kartu kredit <span>·</span> Setup &lt;2 menit <span>·</span> Gratis selamanya</p>

        {/* Product Preview */}
        <div className="lp-hero-preview">
          <div className="lp-pvtopbar">
            <div className="lp-pvdots">
              <div className="lp-pvd lp-pvd1"></div>
              <div className="lp-pvd lp-pvd2"></div>
              <div className="lp-pvd lp-pvd3"></div>
            </div>
            <div className="lp-pvurl">creatorlytics.app/dashboard</div>
            <div style={{ width: '60px' }}></div>
          </div>
          <div className="lp-pvbody">
            <div className="lp-pvkpis">
              <div className="lp-pvkpi"><div className="lp-pvkl">Total Reach <div className="lp-pvdd" style={{ background: 'var(--lime)' }}></div></div><div className="lp-pvkv">2.4M</div><div className="lp-pvkc">↑ +18.3%</div></div>
              <div className="lp-pvkpi"><div className="lp-pvkl">Total Post <div className="lp-pvdd" style={{ background: 'var(--green)' }}></div></div><div className="lp-pvkv">142</div><div className="lp-pvkc">↑ +12 bulan ini</div></div>
              <div className="lp-pvkpi"><div className="lp-pvkl">Avg ER <div className="lp-pvdd" style={{ background: 'var(--amber)' }}></div></div><div className="lp-pvkv">4.8%</div><div className="lp-pvkc">↑ +0.6pp</div></div>
              <div className="lp-pvkpi"><div className="lp-pvkl">Followers <div className="lp-pvdd" style={{ background: 'var(--indigo)' }}></div></div><div className="lp-pvkv">+1.2K</div><div className="lp-pvkc">↑ +320 mgg ini</div></div>
            </div>
            <div className="lp-pvcharts">
              <div className="lp-pvbox">
                <div className="lp-pvboxt">Reach — 12 Bulan Terakhir</div>
                <div className="lp-pvchart">
                  <div className="lp-pvb" style={{ height: '35%', background: 'rgba(168,223,58,.16)' }}></div>
                  <div className="lp-pvb" style={{ height: '42%', background: 'rgba(168,223,58,.2)' }}></div>
                  <div className="lp-pvb" style={{ height: '38%', background: 'rgba(168,223,58,.18)' }}></div>
                  <div className="lp-pvb" style={{ height: '51%', background: 'rgba(168,223,58,.25)' }}></div>
                  <div className="lp-pvb" style={{ height: '46%', background: 'rgba(168,223,58,.22)' }}></div>
                  <div className="lp-pvb" style={{ height: '58%', background: 'rgba(168,223,58,.3)' }}></div>
                  <div className="lp-pvb" style={{ height: '63%', background: 'rgba(168,223,58,.5)' }}></div>
                  <div className="lp-pvb" style={{ height: '70%', background: 'rgba(168,223,58,.62)' }}></div>
                  <div className="lp-pvb" style={{ height: '67%', background: 'rgba(168,223,58,.66)' }}></div>
                  <div className="lp-pvb" style={{ height: '78%', background: 'rgba(168,223,58,.78)' }}></div>
                  <div className="lp-pvb" style={{ height: '85%', background: 'rgba(168,223,58,.88)' }}></div>
                  <div className="lp-pvb" style={{ height: '100%', background: '#A8DF3A' }}></div>
                </div>
                <div className="lp-pvblbls">
                  <div className="lp-pvbl">Jan</div><div className="lp-pvbl">Feb</div><div className="lp-pvbl">Mar</div>
                  <div className="lp-pvbl">Apr</div><div className="lp-pvbl">Mei</div><div className="lp-pvbl">Jun</div>
                  <div className="lp-pvbl">Jul</div><div className="lp-pvbl">Agu</div><div className="lp-pvbl">Sep</div>
                  <div className="lp-pvbl">Okt</div><div className="lp-pvbl">Nov</div><div className="lp-pvbl">Des</div>
                </div>
              </div>
              <div className="lp-pvbox">
                <div className="lp-pvboxt">Top Konten</div>
                <div className="lp-tci"><div className="lp-tcr">1</div><div className="lp-tcd" style={{ background: 'var(--lime)' }}></div><div className="lp-tcn">Reels tutorial editing</div><div className="lp-tcv">45.2K</div></div>
                <div className="lp-tci"><div className="lp-tcr">2</div><div className="lp-tcd" style={{ background: 'var(--green)' }}></div><div className="lp-tcn">Behind the scenes</div><div className="lp-tcv">32.1K</div></div>
                <div className="lp-tci"><div className="lp-tcr">3</div><div className="lp-tcd" style={{ background: 'var(--indigo)' }}></div><div className="lp-tcn">Carousel tips</div><div className="lp-tcv">28.7K</div></div>
                <div className="lp-gsep">
                  <div className="lp-gph">Goal Progress</div>
                  <div className="lp-gpi"><div className="lp-gphdr">Followers <span>78%</span></div><div className="lp-gpbar"><div className="lp-gpfill" style={{ width: '78%' }}></div></div></div>
                  <div className="lp-gpi"><div className="lp-gphdr">Reach <span>52%</span></div><div className="lp-gpbar"><div className="lp-gpfill" style={{ width: '52%', opacity: .6 }}></div></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM MARQUEE */}
      <div className="lp-mqwrap">
        <div className="lp-mqinner">
          <span className="lp-mqitem"><span className="dot">✦</span>Instagram</span>
          <span className="lp-mqitem"><span className="dot">✦</span>TikTok</span>
          <span className="lp-mqitem"><span className="dot">✦</span>YouTube</span>
          <span className="lp-mqitem"><span className="dot">✦</span>Twitter / X</span>
          <span className="lp-mqitem"><span className="dot">✦</span>LinkedIn</span>
          <span className="lp-mqitem"><span className="dot">✦</span>Facebook</span>
          <span className="lp-mqitem"><span className="dot">✦</span>Threads</span>
          <span className="lp-mqitem"><span className="dot">✦</span>Instagram</span>
          <span className="lp-mqitem"><span className="dot">✦</span>TikTok</span>
          <span className="lp-mqitem"><span className="dot">✦</span>YouTube</span>
          <span className="lp-mqitem"><span className="dot">✦</span>Twitter / X</span>
          <span className="lp-mqitem"><span className="dot">✦</span>LinkedIn</span>
          <span className="lp-mqitem"><span className="dot">✦</span>Facebook</span>
          <span className="lp-mqitem"><span className="dot">✦</span>Threads</span>
        </div>
      </div>

      {/* SHOWCASE */}
      <section className="lp-sec" id="showcase">
        <p className="lp-eyebrow lp-reveal">Dashboard Preview</p>
        <h2 className="lp-stitle lp-reveal lp-d1">Lihat produknya langsung.</h2>
        <p className="lp-ssub lp-reveal lp-d2">Semua fitur dalam satu dashboard terintegrasi — coba tiap tab.</p>
        
        <div className="lp-stabs">
          <button className={`lp-stab ${activeTab === 'analytics' ? 'on' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
          <button className={`lp-stab ${activeTab === 'goals' ? 'on' : ''}`} onClick={() => setActiveTab('goals')}>Goal Tracking</button>
          <button className={`lp-stab ${activeTab === 'ai' ? 'on' : ''}`} onClick={() => setActiveTab('ai')}>AI Insights</button>
          <button className={`lp-stab ${activeTab === 'planner' ? 'on' : ''}`} onClick={() => setActiveTab('planner')}>Content Planner</button>
        </div>

        {/* ANALYTICS TAB */}
        <div className={`lp-spanel ${activeTab === 'analytics' ? 'on' : ''}`} id="panel-analytics">
          <div className="lp-dpanel">
            <div className="lp-dph"><div className="lp-dpht">Overview Dashboard</div><div className="lp-dphp">Des 2024 · 30 hari terakhir</div></div>
            <div className="lp-dpb">
              <div className="lp-kpis">
                <div className="lp-kpi"><div className="lp-kpil">Total Post <div className="lp-kdd" style={{ background: 'var(--lime)' }}></div></div><div className="lp-kpiv">142</div><div className="lp-kpic">↑ +12 bulan ini</div></div>
                <div className="lp-kpi"><div className="lp-kpil">Total Reach <div className="lp-kdd" style={{ background: 'var(--green)' }}></div></div><div className="lp-kpiv">2.4M</div><div className="lp-kpic">↑ +18.3%</div></div>
                <div className="lp-kpi"><div className="lp-kpil">Avg ER <div className="lp-kdd" style={{ background: 'var(--amber)' }}></div></div><div className="lp-kpiv">4.8%</div><div className="lp-kpic">↑ +0.6pp</div></div>
                <div className="lp-kpi"><div className="lp-kpil">Followers <div className="lp-kdd" style={{ background: 'var(--indigo)' }}></div></div><div className="lp-kpiv">+1.2K</div><div className="lp-kpic">↑ +320 minggu ini</div></div>
              </div>
              <div className="lp-crow">
                <div className="lp-dbox">
                  <div className="lp-dboxt">Reach — 12 Bulan Terakhir</div>
                  <div className="lp-bchart">
                    <div className="lp-bb" style={{ height: '35%', background: 'rgba(168,223,58,.16)' }}></div>
                    <div className="lp-bb" style={{ height: '42%', background: 'rgba(168,223,58,.2)' }}></div>
                    <div className="lp-bb" style={{ height: '38%', background: 'rgba(168,223,58,.18)' }}></div>
                    <div className="lp-bb" style={{ height: '51%', background: 'rgba(168,223,58,.25)' }}></div>
                    <div className="lp-bb" style={{ height: '46%', background: 'rgba(168,223,58,.22)' }}></div>
                    <div className="lp-bb" style={{ height: '58%', background: 'rgba(168,223,58,.3)' }}></div>
                    <div className="lp-bb" style={{ height: '63%', background: 'rgba(168,223,58,.5)' }}></div>
                    <div className="lp-bb" style={{ height: '70%', background: 'rgba(168,223,58,.62)' }}></div>
                    <div className="lp-bb" style={{ height: '67%', background: 'rgba(168,223,58,.66)' }}></div>
                    <div className="lp-bb" style={{ height: '78%', background: 'rgba(168,223,58,.78)' }}></div>
                    <div className="lp-bb" style={{ height: '85%', background: 'rgba(168,223,58,.88)' }}></div>
                    <div className="lp-bb" style={{ height: '100%', background: '#A8DF3A' }}></div>
                  </div>
                  <div className="lp-blbls">
                    <div className="lp-bbl">Jan</div><div className="lp-bbl">Feb</div><div className="lp-bbl">Mar</div>
                    <div className="lp-bbl">Apr</div><div className="lp-bbl">Mei</div><div className="lp-bbl">Jun</div>
                    <div className="lp-bbl">Jul</div><div className="lp-bbl">Agu</div><div className="lp-bbl">Sep</div>
                    <div className="lp-bbl">Okt</div><div className="lp-bbl">Nov</div><div className="lp-bbl">Des</div>
                  </div>
                </div>
                <div className="lp-dbox">
                  <div className="lp-dboxt">Top Konten</div>
                  <div className="lp-tci"><div className="lp-tcr">1</div><div className="lp-tcd" style={{ background: 'var(--lime)' }}></div><div className="lp-tcn">Reels tutorial editing</div><div className="lp-tcv">45.2K</div></div>
                  <div className="lp-tci"><div className="lp-tcr">2</div><div className="lp-tcd" style={{ background: 'var(--green)' }}></div><div className="lp-tcn">Behind the scenes</div><div className="lp-tcv">32.1K</div></div>
                  <div className="lp-tci"><div className="lp-tcr">3</div><div className="lp-tcd" style={{ background: 'var(--indigo)' }}></div><div className="lp-tcn">Carousel tips</div><div className="lp-tcv">28.7K</div></div>
                  <div className="lp-gsep">
                    <div className="lp-gph">Goal Progress</div>
                    <div className="lp-gpi"><div className="lp-gphdr">Followers <span>78%</span></div><div className="lp-gpbar"><div className="lp-gpfill" style={{ width: '78%' }}></div></div></div>
                    <div className="lp-gpi"><div className="lp-gphdr">Reach <span>52%</span></div><div className="lp-gpbar"><div className="lp-gpfill" style={{ width: '52%', opacity: .6 }}></div></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GOALS TAB */}
        <div className={`lp-spanel ${activeTab === 'goals' ? 'on' : ''}`} id="panel-goals">
          <div className="lp-dpanel">
            <div className="lp-dph"><div className="lp-dpht">Goal Tracking</div><div className="lp-dphp">Q4 2024 · Okt–Des</div></div>
            <div className="lp-dpb">
              <div className="lp-ggrid">
                <div className="lp-gc"><div className="lp-gcn">Followers</div><div className="lp-gcv">9,360</div><div className="lp-gct">Target: 12,000 followers</div><div className="lp-gcbar"><div className="lp-gcfill" style={{ width: '78%', background: 'var(--lime)' }}></div></div><div className="lp-gcpct" style={{ color: 'var(--lime)' }}>78% tercapai</div></div>
                <div className="lp-gc"><div className="lp-gcn">Monthly Reach</div><div className="lp-gcv">1.56M</div><div className="lp-gct">Target: 3M reach/bulan</div><div className="lp-gcbar"><div className="lp-gcfill" style={{ width: '52%', background: 'var(--indigo)' }}></div></div><div className="lp-gcpct" style={{ color: 'var(--indigo)' }}>52% tercapai</div></div>
                <div className="lp-gc"><div className="lp-gcn">Avg Engagement Rate</div><div className="lp-gcv">4.8%</div><div className="lp-gct">Target: 5.0% ER</div><div className="lp-gcbar"><div className="lp-gcfill" style={{ width: '96%', background: 'var(--green)' }}></div></div><div className="lp-gcpct" style={{ color: 'var(--green)' }}>96% — hampir!</div></div>
              </div>
              <div className="lp-fcast"><div className="lp-fcastl">✦ AI Forecast</div><div className="lp-fcastt">Dengan pertumbuhan saat ini, target <strong>Followers</strong> akan tercapai sekitar <strong>28 Desember 2024</strong>. Tambah +2 post/minggu untuk mempercepat 18%.</div></div>
            </div>
          </div>
        </div>

        {/* AI TAB */}
        <div className={`lp-spanel ${activeTab === 'ai' ? 'on' : ''}`} id="panel-ai">
          <div className="lp-dpanel">
            <div className="lp-dph"><div className="lp-dpht">AI Insights</div><div className="lp-dphp">Updated 5 menit lalu</div></div>
            <div className="lp-dpb">
              <div className="lp-aigrid">
                <div className="lp-aic"><div className="lp-aiico"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div className="lp-ait">Waktu Terbaik Posting</div><div className="lp-aid">Selasa &amp; Kamis pukul 19:00–21:00 WIB menghasilkan ER 2.4× lebih tinggi dari rata-rata kontenmu.</div></div></div>
                <div className="lp-aic"><div className="lp-aiico"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div><div><div className="lp-ait">Format Terpopuler di Akunmu</div><div className="lp-aid">Reels menghasilkan reach 68% lebih tinggi vs foto carousel bulan ini. Perbanyak Reels pendek.</div></div></div>
                <div className="lp-aic"><div className="lp-aiico"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div><div><div className="lp-ait">Topik yang Sedang Naik</div><div className="lp-aid">&quot;Tutorial editing&quot; dan &quot;Behind the scenes&quot; adalah 2 topik dengan engagement tertinggi — pertahankan.</div></div></div>
              </div>
              <div className="lp-aiscore"><div><div className="lp-ait">Content Health Score</div><div className="lp-aid" style={{ fontSize: '13px', marginTop: '3px' }}>Berdasarkan konsistensi, engagement, dan pertumbuhan bulan ini</div></div><div className="lp-aiscorev">87<span>/100</span></div></div>
            </div>
          </div>
        </div>

        {/* PLANNER TAB */}
        <div className={`lp-spanel ${activeTab === 'planner' ? 'on' : ''}`} id="panel-planner">
          <div className="lp-dpanel">
            <div className="lp-dph"><div className="lp-dpht">Content Planner</div><div className="lp-dphp">20 konten aktif bulan ini</div></div>
            <div className="lp-dpb">
              <div className="lp-kanban">
                <div><div className="lp-kbch">Ide <span className="lp-kbcount">4</span></div>
                  <div className="lp-kbcard"><div className="lp-kbct">Day in the life: shooting day</div><div className="lp-kbtags"><span className="lp-kbt lp-tig">Instagram</span><span className="lp-kbt lp-tlm">Reels</span></div></div>
                  <div className="lp-kbcard"><div className="lp-kbct">Review kamera baru</div><div className="lp-kbtags"><span className="lp-kbt lp-tyt">YouTube</span></div></div>
                </div>
                <div><div className="lp-kbch">Draft <span className="lp-kbcount">5</span></div>
                  <div className="lp-kbcard"><div className="lp-kbct">Tutorial editing Reels 60 detik</div><div className="lp-kbtags"><span className="lp-kbt lp-tig">Instagram</span><span className="lp-kbt lp-tlm">Reels</span></div></div>
                  <div className="lp-kbcard"><div className="lp-kbct">5 tips grow organik 2025</div><div className="lp-kbtags"><span className="lp-kbt lp-tyt">YouTube</span></div></div>
                </div>
                <div><div className="lp-kbch">Review <span className="lp-kbcount">3</span></div>
                  <div className="lp-kbcard"><div className="lp-kbct">Carousel: tools yang gw pakai</div><div className="lp-kbtags"><span className="lp-kbt lp-tig">Instagram</span></div></div>
                  <div className="lp-kbcard"><div className="lp-kbct">Q&amp;A: gimana gw mulai dari 0</div><div className="lp-kbtags"><span className="lp-kbt lp-ttt">TikTok</span></div></div>
                </div>
                <div><div className="lp-kbch">Published <span className="lp-kbcount">8</span></div>
                  <div className="lp-kbcard"><div className="lp-kbct">Reels tutorial editing — 45.2K</div><div className="lp-kbtags"><span className="lp-kbt lp-tig">Instagram</span></div></div>
                  <div className="lp-kbcard"><div className="lp-kbct">Behind the scenes — 32.1K</div><div className="lp-kbtags"><span className="lp-kbt lp-ttt">TikTok</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-testy-s">
        <div className="lp-testy-h lp-reveal">
          <div>
            <p className="lp-eyebrow">Kata Mereka</p>
            <h2 className="lp-stitle" style={{ marginBottom: 0 }}>Kreator Indonesia<br />udah pakai duluan.</h2>
          </div>
          <p className="lp-testy-sub">Bergabung dengan ribuan kreator yang udah track dan grow bareng Creatorlytics.</p>
        </div>
        <div className="lp-trows">
          {/* ROW 1 — kiri ke kanan */}
          <div className="lp-trow">
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Akhirnya ada analytics tool yang ngerti kebutuhan kreator Indonesia. Setup-nya gampang, langsung kepakai hari pertama.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--lime)' }}>R</div><div><div className="lp-tname">Rizky Adi</div><div className="lp-trole">TikTok Creator · 120K followers</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Goal tracking-nya beneran berguna. Gue jadi tau kapan harus push konten lebih keras dan kapan bisa santai.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--indigo)' }}>S</div><div><div className="lp-tname">Sarah Melinda</div><div className="lp-trole">Lifestyle Creator · Instagram</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Sebelumnya gue tracking manual di spreadsheet. Sekarang semua otomatis dan jauh lebih enak dibacanya.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--amber)' }}>A</div><div><div className="lp-tname">Andi Putra</div><div className="lp-trole">YouTuber · 85K subscribers</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;AI Insights-nya akurat banget. Rekomendasiin jam posting yang sama persis sama yang gue rasain sendiri selama ini.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: '#F472B6' }}>D</div><div><div className="lp-tname">Dewi Laksmi</div><div className="lp-trole">Instagram Creator · 95K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Gratis tapi fiturnya selengkap ini? Ini yang selama ini gue cari-cari dan gak ketemu-ketemu.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--green)' }}>B</div><div><div className="lp-tname">Bagas Kurnia</div><div className="lp-trole">Multi-platform Creator</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Data dari 5 platform langsung bisa dibanding-bandingin dalam satu layar. Gak perlu bolak-balik app lagi.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--red)' }}>N</div><div><div className="lp-tname">Nadia Sari</div><div className="lp-trole">Beauty Creator · TikTok</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Content planner-nya berguna banget buat organize ide. Akhirnya semua dalam satu tempat, beneran all-in-one.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--indigo)' }}>F</div><div><div className="lp-tname">Farhan Dafa</div><div className="lp-trole">Gaming Creator · YouTube</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Follower growth gue naik 40% setelah rajin liat analytics dan ikutin rekomendasinya. No cap.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--lime)' }}>C</div><div><div className="lp-tname">Citra Wulandari</div><div className="lp-trole">Lifestyle Creator · 210K</div></div></div></div>
            {/* duplicate for infinite scroll */}
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Akhirnya ada analytics tool yang ngerti kebutuhan kreator Indonesia. Setup-nya gampang, langsung kepakai hari pertama.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--lime)' }}>R</div><div><div className="lp-tname">Rizky Adi</div><div className="lp-trole">TikTok Creator · 120K followers</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Goal tracking-nya beneran berguna. Gue jadi tau kapan harus push konten lebih keras dan kapan bisa santai.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--indigo)' }}>S</div><div><div className="lp-tname">Sarah Melinda</div><div className="lp-trole">Lifestyle Creator · Instagram</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Sebelumnya gue tracking manual di spreadsheet. Sekarang semua otomatis dan jauh lebih enak dibacanya.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--amber)' }}>A</div><div><div className="lp-tname">Andi Putra</div><div className="lp-trole">YouTuber · 85K subscribers</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;AI Insights-nya akurat banget. Rekomendasiin jam posting yang sama persis sama yang gue rasain sendiri selama ini.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: '#F472B6' }}>D</div><div><div className="lp-tname">Dewi Laksmi</div><div className="lp-trole">Instagram Creator · 95K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Gratis tapi fiturnya selengkap ini? Ini yang selama ini gue cari-cari dan gak ketemu-ketemu.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--green)' }}>B</div><div><div className="lp-tname">Bagas Kurnia</div><div className="lp-trole">Multi-platform Creator</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Data dari 5 platform langsung bisa dibanding-bandingin dalam satu layar. Gak perlu bolak-balik app lagi.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--red)' }}>N</div><div><div className="lp-tname">Nadia Sari</div><div className="lp-trole">Beauty Creator · TikTok</div></div></div></div>
          </div>
          {/* ROW 2 — kanan ke kiri */}
          <div className="lp-trow">
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Simple tapi powerful. Dashboard-nya clean dan semua data penting langsung kelihatan tanpa harus dikorek-korek.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--green)' }}>B</div><div><div className="lp-tname">Bima Reza</div><div className="lp-trole">TikTok Foodie · 180K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Sebagai kreator parenting, gue perlu data buat jelasin ke brand. Laporan dari sini beneran profesional dan lengkap.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--amber)' }}>A</div><div><div className="lp-tname">Anisa Kartini</div><div className="lp-trole">Parenting Creator · 67K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Competitor tracking-nya kasih insight yang gue gabayangin bisa dapet secara gratis. Seriously underrated tool.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--lime)' }}>D</div><div><div className="lp-tname">Dino Setiawan</div><div className="lp-trole">Tech Reviewer · YouTube</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Interface-nya intuitif banget. Baru pertama coba langsung ngerti cara pakainya tanpa perlu baca tutorial.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: '#F472B6' }}>L</div><div><div className="lp-tname">Lila Pratiwi</div><div className="lp-trole">Fashion Creator · 340K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Multi-platform management yang beneran works. Instagram, TikTok, YouTube semua masuk dan bisa dibandingkan.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--indigo)' }}>H</div><div><div className="lp-tname">Hendra Fauzi</div><div className="lp-trole">Travel Creator · 52K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;AI forecast-nya akurat. Tau kalau gue posting Kamis pagi, reach-nya bakal dua kali lipat dari hari lain.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--red)' }}>R</div><div><div className="lp-tname">Ririn Astuti</div><div className="lp-trole">Food Blogger · 78K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Gue suka fitur health score-nya. Ada metrics konkret buat ngukur konsistensi, bukan cuma feeling doang.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--green)' }}>K</div><div><div className="lp-tname">Kevin Tanaka</div><div className="lp-trole">Fitness Creator · 230K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Gratis? Literally. Udah 3 bulan pakai, gak ada yang disembunyiin di balik paywall. Ini beneran gratis.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--lime)' }}>M</div><div><div className="lp-tname">Maya Dewi</div><div className="lp-trole">Education Creator · 145K</div></div></div></div>
            {/* duplicate */}
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Simple tapi powerful. Dashboard-nya clean dan semua data penting langsung kelihatan tanpa harus dikorek-korek.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--green)' }}>B</div><div><div className="lp-tname">Bima Reza</div><div className="lp-trole">TikTok Foodie · 180K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Sebagai kreator parenting, gue perlu data buat jelasin ke brand. Laporan dari sini beneran profesional dan lengkap.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--amber)' }}>A</div><div><div className="lp-tname">Anisa Kartini</div><div className="lp-trole">Parenting Creator · 67K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Competitor tracking-nya kasih insight yang gue gabayangin bisa dapet secara gratis. Seriously underrated tool.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--lime)' }}>D</div><div><div className="lp-tname">Dino Setiawan</div><div className="lp-trole">Tech Reviewer · YouTube</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Interface-nya intuitif banget. Baru pertama coba langsung ngerti cara pakainya tanpa perlu baca tutorial.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: '#F472B6' }}>L</div><div><div className="lp-tname">Lila Pratiwi</div><div className="lp-trole">Fashion Creator · 340K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;Multi-platform management yang beneran works. Instagram, TikTok, YouTube semua masuk dan bisa dibandingkan.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--indigo)' }}>H</div><div><div className="lp-tname">Hendra Fauzi</div><div className="lp-trole">Travel Creator · 52K</div></div></div></div>
            <div className="lp-tcard"><div className="lp-trating">★★★★★</div><p className="lp-tquote">&quot;AI forecast-nya akurat. Tau kalau gue posting Kamis pagi, reach-nya bakal dua kali lipat dari hari lain.&quot;</p><div className="lp-tauth"><div className="lp-tava" style={{ background: 'var(--red)' }}>R</div><div><div className="lp-tname">Ririn Astuti</div><div className="lp-trole">Food Blogger · 78K</div></div></div></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-sec" id="features">
        <p className="lp-eyebrow lp-reveal">Fitur Lengkap</p>
        <h2 className="lp-stitle lp-reveal lp-d1">Semua yang kamu butuhkan,<br />dalam satu tempat.</h2>
        <p className="lp-ssub lp-reveal lp-d2">Tidak perlu lagi bolak-balik antar app. Creatorlytics punya semuanya.</p>
        <div className="lp-frows">
          <div className="lp-frow lp-reveal">
            <div className="lp-frn">01</div>
            <div><div className="lp-frt">Multi-Platform Analytics</div><div className="lp-frd">Hubungkan 8+ platform sosial media dan lihat semua metrik dalam satu dashboard yang unified.</div></div>
            <div className="lp-frtag lp-tag-lime">Core</div>
          </div>
          <div className="lp-frow lp-reveal">
            <div className="lp-frn">02</div>
            <div><div className="lp-frt">Goal Tracking &amp; Forecasting</div><div className="lp-frd">Set target followers, reach, atau engagement — dan lihat prediksi AI kapan targetmu tercapai.</div></div>
            <div className="lp-frtag lp-tag-lime">Popular</div>
          </div>
          <div className="lp-frow lp-reveal">
            <div className="lp-frn">03</div>
            <div><div className="lp-frt">AI-Powered Insights</div><div className="lp-frd">Dapatkan rekomendasi waktu posting, format konten, dan topik yang paling efektif untuk akunmu.</div></div>
            <div className="lp-frtag lp-tag-lime">AI</div>
          </div>
          <div className="lp-frow lp-reveal">
            <div className="lp-frn">04</div>
            <div><div className="lp-frt">Content Planner &amp; Kanban</div><div className="lp-frd">Organize ide kontenmu dari draft sampai published dengan board Kanban yang intuitif.</div></div>
            <div className="lp-frtag lp-tag-muted">Productivity</div>
          </div>
          <div className="lp-frow lp-reveal">
            <div className="lp-frn">05</div>
            <div><div className="lp-frt">Content Health Score</div><div className="lp-frd">Skor 0–100 yang mengukur konsistensi, engagement, dan pertumbuhan kontenmu secara keseluruhan.</div></div>
            <div className="lp-frtag lp-tag-muted">Metrics</div>
          </div>
          <div className="lp-frow lp-reveal">
            <div className="lp-frn">06</div>
            <div><div className="lp-frt">Competitor Benchmarking</div><div className="lp-frd">Bandingkan performamu dengan kreator lain di niche yang sama — dan cari celah untuk grow lebih cepat.</div></div>
            <div className="lp-frtag lp-tag-lime">Coming Soon</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-sec" id="how">
        <p className="lp-eyebrow lp-reveal">Cara Kerja</p>
        <h2 className="lp-stitle lp-reveal lp-d1">Setup kurang dari 2 menit.</h2>
        <p className="lp-ssub lp-reveal lp-d2">Tiga langkah simpel, langsung bisa pakai.</p>
        <div className="lp-steps lp-reveal">
          <div className="lp-step">
            <div className="lp-stepn">STEP 01</div>
            <div className="lp-stept">Login dengan Google</div>
            <div className="lp-stepd">Satu klik login — tidak perlu bikin akun baru atau isi form panjang-panjang.</div>
          </div>
          <div className="lp-step">
            <div className="lp-stepn">STEP 02</div>
            <div className="lp-stept">Hubungkan Platform</div>
            <div className="lp-stepd">Pilih platform sosial mediamu — Instagram, TikTok, YouTube, dan lainnya. Koneksi aman via OAuth.</div>
          </div>
          <div className="lp-step">
            <div className="lp-stepn">STEP 03</div>
            <div className="lp-stept">Lihat Dashboard</div>
            <div className="lp-stepd">Semua data langsung muncul di dashboard. Insights, goal tracking, dan content planner siap dipakai.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta-s">
        <div className="lp-cta-left lp-reveal">
          <p className="lp-eyebrow">Mulai Sekarang</p>
          <h2 className="lp-cta-title">Saatnya <em>grow</em> dengan<br />data, bukan feeling.</h2>
          <p className="lp-cta-sub">Join ribuan kreator Indonesia yang udah pakai Creatorlytics. Gratis selamanya, tanpa kartu kredit, tanpa batas waktu.</p>
        </div>
        <div className="lp-cta-right lp-reveal lp-d1">
          <button onClick={handleLogin} disabled={authLoading} className="lp-btn-lime-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(9,9,10,.85)" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(9,9,10,.85)" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(9,9,10,.85)" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(9,9,10,.85)" />
            </svg>
            {authLoading ? 'Memuat...' : 'Mulai Gratis dengan Google'}
          </button>
          <div className="lp-cta-note">Tidak perlu kartu kredit<br />Setup kurang dari 2 menit</div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-faq-s" id="faq">
        <div className="lp-faq-g">
          <div className="lp-faq-sticky">
            <span className="lp-faq-label">FAQ</span>
            <h2 className="lp-faq-t">Pertanyaan<br />yang sering muncul.</h2>
            <p className="lp-faq-sub">Kalau belum terjawab, reach out ke tim kami kapan aja.</p>
          </div>
          <div>
            {[
              { q: 'Apakah Creatorlytics beneran gratis?', a: 'Ya, 100% gratis selamanya. Tidak ada hidden fees, tidak ada trial period, dan tidak ada fitur yang dikunci di balik paywall. Kami dibiayai oleh misi untuk membantu kreator Indonesia grow.' },
              { q: 'Platform apa saja yang didukung?', a: 'Saat ini kami mendukung Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Facebook, dan Threads. Kami terus menambah platform baru berdasarkan request dari kreator.' },
              { q: 'Apakah data saya aman?', a: 'Keamanan data adalah prioritas utama kami. Kami menggunakan enkripsi end-to-end, OAuth untuk koneksi platform, dan tidak pernah menyimpan password akunmu. Data hanya digunakan untuk menampilkan analytics di dashboard-mu.' },
              { q: 'Berapa lama setup-nya?', a: 'Kurang dari 2 menit. Cukup login dengan Google, hubungkan platform sosial mediamu, dan dashboard langsung siap dipakai. Tidak perlu konfigurasi rumit atau proses verifikasi panjang.' },
              { q: 'Bagaimana AI Insights bekerja?', a: 'AI kami menganalisis pola kontenmu — waktu posting, format, topik, dan engagement — untuk memberikan rekomendasi yang spesifik untuk akunmu. Semakin lama kamu pakai, semakin akurat insightnya.' },
              { q: 'Bisa dipakai di HP?', a: 'Ya! Creatorlytics sepenuhnya responsive dan bisa diakses dari browser HP, tablet, atau desktop. Kami juga sedang mengembangkan mobile app native untuk pengalaman yang lebih optimal.' }
            ].map((faq, i) => (
              <div key={i} className={`lp-fi ${openFaq === i ? 'open' : ''}`}>
                <button className="lp-fq" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <div className="lp-ficon">+</div>
                </button>
                <div className="lp-fa"><div className="lp-fain">{faq.a}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-ft-top">
          <div>
            <Link href="/" className="lp-ft-brand">
              <div className="lp-ftmark">C</div>
              Creatorlytics
            </Link>
            <p className="lp-ft-tagline">Analytics dashboard untuk kreator Indonesia. Gratis selamanya.</p>
            <div className="lp-ft-stat">2,400+ kreator aktif</div>
          </div>
          <div>
            <div className="lp-ft-ch">Produk</div>
            <a href="#showcase" className="lp-ft-a">Dashboard</a>
            <a href="#features" className="lp-ft-a">Fitur</a>
            <a href="#how" className="lp-ft-a">Cara Kerja</a>
            <a href="#faq" className="lp-ft-a">FAQ</a>
          </div>
          <div>
            <div className="lp-ft-ch">Kreator</div>
            <a href="#" className="lp-ft-a">Blog</a>
            <a href="#" className="lp-ft-a">Panduan</a>
            <a href="#" className="lp-ft-a">Changelog</a>
            <a href="#" className="lp-ft-a">Status</a>
          </div>
          <div>
            <div className="lp-ft-ch">Legal</div>
            <a href="#" className="lp-ft-a">Privacy Policy</a>
            <a href="#" className="lp-ft-a">Terms of Service</a>
            <a href="#" className="lp-ft-a">Hubungi Kami</a>
          </div>
        </div>
        <div className="lp-ft-btm">
          <div className="lp-ft-copy">© 2024 Creatorlytics. All rights reserved.</div>
          <div className="lp-ft-love">Dibuat dengan <em>♥</em> di Indonesia</div>
        </div>
      </footer>
    </div>
  );
}
