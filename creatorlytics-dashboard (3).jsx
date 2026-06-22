import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Bell,
  BookOpen,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns3,
  Download,
  Eye,
  FileText,
  Filter,
  Globe,
  Kanban,
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
} from "lucide-react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
// Color hues kept exactly as-is (already distinctive, not AI-slop colors).
// What was missing was a disciplined scale on top of them: one set of font
// sizes, one set of weights, one spacing rhythm, used everywhere instead of
// ad hoc numbers (11.5, 12.5, 850, etc.) scattered per component.
const C = {
  bg: "#F6F7F4", rail: "#FDFDFB", surface: "#FFFFFF",
  mutedSurface: "#F0F2ED", mutedSurface2: "#E5E8E0",
  border: "#E0E3DA", borderStrong: "#C9CFC1",
  text: "#1D211B", text2: "#60675B", text3: "#8A9283",
  brand: "#2F6F45", brand2: "#175A7A", brandTint: "#E6F2EA",
  blue: "#2563A7", blueTint: "#E7EFF8",
  amber: "#A15C07", amberTint: "#F7EDDC",
  green: "#197B3A", greenTint: "#E3F3E7",
  red: "#B93B32", redTint: "#F8E7E5",
  purple: "#7C4D9D", purpleTint: "#F0E7F6",
};

const FS = { micro: 10, xs: 11, sm: 12, base: 13, md: 14, lg: 16, xl: 18, xxl: 22, display: 27 };
const FW = { regular: 400, medium: 500, semibold: 600, bold: 700, black: 800 };
const SP = { xs: 6, sm: 8, md: 10, lg: 14, xl: 18, xxl: 22, xxxl: 28 };
const RADIUS = { sm: 6, md: 8, lg: 10, pill: 999 };

const shadow = "0 1px 2px rgba(29,33,27,0.05), 0 10px 24px rgba(29,33,27,0.04)";
const shadowHover = "0 1px 2px rgba(29,33,27,0.06), 0 16px 34px rgba(29,33,27,0.08)";

const PLATFORM = {
  TikTok: { color: "#13747C", bg: "#E1F1F2" },
  Instagram: { color: "#A23B86", bg: "#F6E8F1" },
  YouTube: { color: "#C6362E", bg: "#FBE8E6" },
  LinkedIn: { color: "#2563A7", bg: "#E7EFF8" },
};

const STATUS = {
  Published: { label: "Published", color: C.green, bg: C.greenTint },
  Scheduled: { label: "Scheduled", color: C.blue, bg: C.blueTint },
  Draft: { label: "Draft", color: C.text2, bg: C.mutedSurface },
  Review: { label: "Review", color: C.amber, bg: C.amberTint },
  Blocked: { label: "Blocked", color: C.red, bg: C.redTint },
};

const PRIORITY = {
  High: { color: C.red, bg: C.redTint },
  Medium: { color: C.amber, bg: C.amberTint },
  Low: { color: C.text2, bg: C.mutedSurface },
};

const trendData = [
  { month: "Jan", reach: 8200, er: 2.1, saves: 112 },
  { month: "Feb", reach: 11800, er: 2.5, saves: 146 },
  { month: "Mar", reach: 10100, er: 2.2, saves: 119 },
  { month: "Apr", reach: 15300, er: 3.1, saves: 202 },
  { month: "Mei", reach: 19200, er: 3.7, saves: 268 },
  { month: "Jun", reach: 25400, er: 4.8, saves: 384 },
];

const REACH_TARGET = 30000;

const pillarData = [
  { name: "Tutorial", score: 82, posts: 8 },
  { name: "Behind Scene", score: 74, posts: 5 },
  { name: "Review", score: 61, posts: 4 },
  { name: "Storytime", score: 48, posts: 3 },
];

const platformRows = [
  { platform: "TikTok", posts: 9, reach: 18400, er: 5.2, growth: 38, saveRate: 2.4 },
  { platform: "Instagram", posts: 7, reach: 6200, er: 3.6, growth: 16, saveRate: 3.1 },
  { platform: "YouTube", posts: 3, reach: 3100, er: 4.1, growth: -4, saveRate: 1.8 },
];

const contentRows = [
  { id: 1, title: "Behind the scenes: batch shooting setup", platform: "TikTok", format: "Short video", pillar: "Behind Scene", owner: "Alya", status: "Published", priority: "High", date: "18 Jun 2026", iso: "2026-06-18", reach: 12400, er: 5.8, saves: 264, nextStep: "Repurpose hook for Reels" },
  { id: 2, title: "Carousel: 5 mistakes creator pemula", platform: "Instagram", format: "Carousel", pillar: "Tutorial", owner: "Dimas", status: "Published", priority: "Medium", date: "16 Jun 2026", iso: "2026-06-16", reach: 4200, er: 4.6, saves: 188, nextStep: "Turn into checklist post" },
  { id: 3, title: "Review tools editing mobile", platform: "YouTube", format: "Long form", pillar: "Review", owner: "Mira", status: "Scheduled", priority: "High", date: "22 Jun 2026", iso: "2026-06-22", reach: 0, er: 0, saves: 0, nextStep: "Finalize thumbnail" },
  { id: 4, title: "Script: content batching in 90 minutes", platform: "TikTok", format: "Short video", pillar: "Tutorial", owner: "Alya", status: "Review", priority: "Medium", date: "24 Jun 2026", iso: "2026-06-24", reach: 0, er: 0, saves: 0, nextStep: "Approve hook version B" },
  { id: 5, title: "LinkedIn recap: weekly creator metrics", platform: "LinkedIn", format: "Text post", pillar: "Storytime", owner: "Raka", status: "Draft", priority: "Low", date: "26 Jun 2026", iso: "2026-06-26", reach: 0, er: 0, saves: 0, nextStep: "Add chart screenshot" },
  { id: 6, title: "Partnership brief: mini campaign launch", platform: "Instagram", format: "Reels", pillar: "Review", owner: "Mira", status: "Blocked", priority: "High", date: "28 Jun 2026", iso: "2026-06-28", reach: 0, er: 0, saves: 0, nextStep: "Waiting for brand approval" },
];

const goalsList = [
  { id: 1, label: "Monthly reach", metric: "Reach", current: 25400, target: REACH_TARGET, due: "30 Jun 2026", confidence: 84, action: "Need 2 more high-reach posts" },
  { id: 2, label: "Average engagement", metric: "ER", current: 4.8, target: 5, due: "30 Jun 2026", confidence: 76, action: "Push tutorial pillar this week" },
  { id: 3, label: "Publishing consistency", metric: "Posts", current: 19, target: 22, due: "30 Jun 2026", confidence: 91, action: "Schedule 3 pending drafts" },
];

const plannerColumns = [
  { id: "idea", label: "Idea", hint: "Backlog", color: C.text2, items: [
    { title: "React to creator economy trend", platform: "TikTok", format: "Short video", due: "No date", priority: "Low", owner: "Alya" },
    { title: "Mini case study: viral hook teardown", platform: "LinkedIn", format: "Text post", due: "Fri", priority: "Medium", owner: "Raka" },
  ]},
  { id: "brief", label: "Brief", hint: "Ready to write", color: C.amber, items: [
    { title: "Brand brief: creator desk setup", platform: "Instagram", format: "Reels", due: "Today", priority: "High", owner: "Mira" },
  ]},
  { id: "draft", label: "Draft", hint: "In progress", color: C.blue, items: [
    { title: "Script: content batching in 90 minutes", platform: "TikTok", format: "Short video", due: "Tue", priority: "Medium", owner: "Alya" },
    { title: "Carousel: analytics terms creator wajib tahu", platform: "Instagram", format: "Carousel", due: "Wed", priority: "Medium", owner: "Dimas" },
  ]},
  { id: "review", label: "Review", hint: "Needs decision", color: C.purple, items: [
    { title: "YouTube thumbnail variants", platform: "YouTube", format: "Creative", due: "Today", priority: "High", owner: "Mira" },
  ]},
  { id: "ready", label: "Ready", hint: "Can schedule", color: C.green, items: [] },
];

const calendarWeeks = [
  [
    { day: 31, current: false, events: [] },
    { day: 1, current: true, events: [] },
    { day: 2, current: true, events: [] },
    { day: 3, current: true, events: [{ title: "Carousel mistakes", time: "10:00", platform: "Instagram", priority: "Medium", status: "Published" }] },
    { day: 4, current: true, events: [] },
    { day: 5, current: true, events: [{ title: "Batch shooting BTS", time: "19:00", platform: "TikTok", priority: "High", status: "Published" }] },
    { day: 6, current: true, events: [] },
  ],
  [
    { day: 7, current: true, events: [] },
    { day: 8, current: true, events: [{ title: "Creator metrics recap", time: "09:00", platform: "LinkedIn", priority: "Low", status: "Scheduled" }] },
    { day: 9, current: true, events: [] },
    { day: 10, current: true, events: [{ title: "Tutorial editing mobile", time: "20:00", platform: "TikTok", priority: "High", status: "Published" }] },
    { day: 11, current: true, events: [] },
    { day: 12, current: true, events: [
      { title: "Reels campaign draft", time: "18:30", platform: "Instagram", priority: "High", status: "Scheduled" },
      { title: "YouTube review premiere", time: "19:00", platform: "YouTube", priority: "High", status: "Scheduled" },
    ] },
    { day: 13, current: true, events: [] },
  ],
  [
    { day: 14, current: true, events: [] },
    { day: 15, current: true, events: [{ title: "Story Q&A", time: "12:00", platform: "Instagram", priority: "Medium", status: "Scheduled" }] },
    { day: 16, current: true, events: [] },
    { day: 17, current: true, today: true, events: [{ title: "Analytics review", time: "16:00", platform: "TikTok", priority: "Medium", status: "Review" }] },
    { day: 18, current: true, events: [] },
    { day: 19, current: true, events: [{ title: "Hook A/B test", time: "20:00", platform: "TikTok", priority: "High", status: "Scheduled" }] },
    { day: 20, current: true, events: [] },
  ],
  [
    { day: 21, current: true, events: [] },
    { day: 22, current: true, events: [{ title: "YouTube tools review", time: "19:30", platform: "YouTube", priority: "High", status: "Scheduled" }] },
    { day: 23, current: true, events: [] },
    { day: 24, current: true, events: [{ title: "Batching script review", time: "15:00", platform: "TikTok", priority: "Medium", status: "Review" }] },
    { day: 25, current: true, events: [{ title: "Carousel checklist", time: "11:00", platform: "Instagram", priority: "Medium", status: "Draft" }] },
    { day: 26, current: true, events: [] },
    { day: 27, current: true, events: [] },
  ],
  [
    { day: 28, current: true, events: [{ title: "Campaign launch", time: "18:00", platform: "Instagram", priority: "High", status: "Blocked" }] },
    { day: 29, current: true, events: [] },
    { day: 30, current: true, events: [{ title: "Monthly report export", time: "09:00", platform: "LinkedIn", priority: "Medium", status: "Scheduled" }] },
    { day: 1, current: false, events: [] },
    { day: 2, current: false, events: [] },
    { day: 3, current: false, events: [] },
    { day: 4, current: false, events: [] },
  ],
];

const competitors = [
  { name: "@kreator.lain", platform: "TikTok", followers: 215000, er: 5.4, postsWeek: 6, format: "Short video", gap: "Hooks are sharper" },
  { name: "@brand.kompetitor", platform: "Instagram", followers: 89000, er: 2.1, postsWeek: 4, format: "Carousel", gap: "More saveable posts" },
  { name: "@channelsebelah", platform: "YouTube", followers: 42000, er: 3.8, postsWeek: 2, format: "Long form", gap: "Better thumbnails" },
];

const navGroups = [
  { label: "Overview", items: [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", Icon: BarChart2 },
    { id: "report", label: "Report", Icon: FileText },
  ]},
  { label: "Operate", items: [
    { id: "konten", label: "Konten", Icon: BookOpen },
    { id: "planner", label: "Planner", Icon: Kanban },
    { id: "kalender", label: "Kalender", Icon: Calendar },
  ]},
  { label: "Growth", items: [
    { id: "goals", label: "Goals", Icon: Target },
    { id: "kompetitor", label: "Kompetitor", Icon: Globe },
  ]},
];

const pageMeta = {
  dashboard: { title: "Dashboard", subtitle: "Executive snapshot dan action queue bulan ini" },
  analytics: { title: "Analytics", subtitle: "Diagnosis performa, platform, dan pillar konten" },
  report: { title: "Report", subtitle: "Laporan siap export untuk klien atau internal review" },
  konten: { title: "Konten", subtitle: "Asset library, tracking, dan workflow konten" },
  planner: { title: "Planner", subtitle: "Board produksi dari ide sampai siap publish" },
  kalender: { title: "Kalender", subtitle: "Jadwal publish, konflik, dan agenda mingguan" },
  goals: { title: "Goals", subtitle: "Target, confidence forecast, dan tindakan berikutnya" },
  kompetitor: { title: "Kompetitor", subtitle: "Benchmark performa dan opportunity gap" },
  pengaturan: { title: "Pengaturan", subtitle: "Workspace, platform, dan notifikasi" },
};

const fmt = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}rb`;
  return String(value);
};

const pct = (value) => `${value.toFixed(1)}%`;

const card = (extra = {}) => ({
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: RADIUS.lg,
  boxShadow: shadow,
  ...extra,
});

const baseButton = {
  borderRadius: RADIUS.md,
  border: `1px solid ${C.border}`,
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: FW.semibold,
  lineHeight: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  minHeight: 34,
  fontSize: FS.sm,
};

const primaryBtnStyle = { ...baseButton, background: C.brand, borderColor: C.brand, color: "#FFFFFF", padding: "0 14px", fontWeight: FW.bold };
const ghostBtnStyle = { ...baseButton, background: C.surface, color: C.text2, padding: "0 13px" };
const iconBtnStyle = { ...baseButton, width: 34, height: 34, padding: 0, color: C.text2 };
const inputStyle = { height: 34, border: `1px solid ${C.border}`, borderRadius: RADIUS.md, background: C.surface, color: C.text, fontSize: FS.sm, fontFamily: "inherit", outline: "none" };
const segmentWrap = { display: "flex", gap: 6, background: C.mutedSurface, padding: 4, borderRadius: RADIUS.md, border: `1px solid ${C.border}`, width: "fit-content" };
const segmentBtn = (active) => ({ ...baseButton, minHeight: 30, padding: "0 14px", fontSize: FS.sm, borderColor: "transparent", background: active ? C.surface : "transparent", color: active ? C.text : C.text2, boxShadow: active ? "0 1px 2px rgba(29,33,27,0.08)" : "none" });

function Badge({ children, tone = "neutral", dot = false }) {
  const tones = {
    neutral: { color: C.text2, bg: C.mutedSurface },
    green: { color: C.green, bg: C.greenTint },
    blue: { color: C.blue, bg: C.blueTint },
    amber: { color: C.amber, bg: C.amberTint },
    red: { color: C.red, bg: C.redTint },
    purple: { color: C.purple, bg: C.purpleTint },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: RADIUS.pill, background: t.bg, color: t.color, fontSize: FS.xs, fontWeight: FW.bold, whiteSpace: "nowrap" }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.color }} />}
      {children}
    </span>
  );
}

function PlatformBadge({ platform }) {
  const p = PLATFORM[platform] || { color: C.text2, bg: C.mutedSurface };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: RADIUS.sm, background: p.bg, color: p.color, fontSize: FS.xs, fontWeight: FW.bold, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
      {platform}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.Draft;
  const tone = status === "Published" ? "green" : status === "Scheduled" ? "blue" : status === "Review" ? "amber" : status === "Blocked" ? "red" : "neutral";
  return <Badge tone={tone} dot>{s.label}</Badge>;
}

function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.Low;
  return (
    <span style={{ border: `1px solid ${p.color}33`, color: p.color, background: p.bg, borderRadius: RADIUS.sm, padding: "2px 7px", fontSize: FS.micro, fontWeight: FW.black, whiteSpace: "nowrap" }}>
      {priority}
    </span>
  );
}

function OwnerTag({ name }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.text2, fontSize: FS.sm, fontWeight: FW.semibold }}>
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: C.mutedSurface2, color: C.text2, display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: FW.bold, flexShrink: 0 }}>{name.charAt(0)}</span>
      {name}
    </span>
  );
}

function SectionTitle({ title, note, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: SP.lg }}>
      <div>
        <div style={{ fontSize: FS.md, fontWeight: FW.bold, color: C.text }}>{title}</div>
        {note && <div style={{ fontSize: FS.sm, color: C.text3, marginTop: 4, lineHeight: 1.45 }}>{note}</div>}
      </div>
      {action}
    </div>
  );
}

function PageFrame({ children }) {
  return (
    <div className="cly-page" style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: SP.xl }}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, delta, deltaLabel, icon: Icon, tone = "green", caption }) {
  const negative = typeof delta === "number" && delta < 0;
  const color = negative ? C.red : tone === "blue" ? C.blue : tone === "amber" ? C.amber : C.green;
  const bg = negative ? C.redTint : tone === "blue" ? C.blueTint : tone === "amber" ? C.amberTint : C.greenTint;

  return (
    <div className="cly-card" style={card({ padding: SP.lg, minHeight: 120 })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SP.xl }}>
        <div style={{ fontSize: FS.xs, fontWeight: FW.bold, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ width: 30, height: 30, borderRadius: RADIUS.md, background: bg, display: "grid", placeItems: "center", color }}>
          <Icon size={15} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: FS.display, fontWeight: FW.black, color: C.text, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
          {caption && <div style={{ fontSize: FS.xs, color: C.text3, marginTop: 7 }}>{caption}</div>}
        </div>
        {delta !== undefined && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 3, color, fontSize: FS.xs, fontWeight: FW.bold }}>
            {negative ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {negative ? "" : "+"}{delta}{deltaLabel}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.borderStrong}`, borderRadius: RADIUS.md, padding: "10px 12px", boxShadow: shadow, fontSize: FS.sm }}>
      <div style={{ color: C.text2, fontWeight: FW.bold, marginBottom: 7 }}>{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey} style={{ color: item.color, display: "flex", justifyContent: "space-between", gap: 16, fontWeight: FW.bold }}>
          <span>{item.name}</span>
          <span>{item.dataKey === "er" ? pct(item.value) : fmt(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function DemoStrip() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text2, fontSize: FS.sm }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
        Mock workspace · updated 3 min ago
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Badge tone="neutral">Jun 2026</Badge>
        <Badge tone="blue">All platforms</Badge>
        <Badge tone="amber">Prototype data</Badge>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, text, tone = "green" }) {
  const colors = { green: [C.green, C.greenTint], blue: [C.blue, C.blueTint], amber: [C.amber, C.amberTint], red: [C.red, C.redTint], purple: [C.purple, C.purpleTint] };
  const [color, bg] = colors[tone] || colors.green;
  return (
    <div className="cly-card" style={card({ padding: SP.lg, display: "flex", gap: 12, alignItems: "flex-start" })}>
      <div style={{ width: 34, height: 34, borderRadius: RADIUS.md, display: "grid", placeItems: "center", color, background: bg, flexShrink: 0 }}>
        <Icon size={16} />
      </div>
      <div>
        <div style={{ fontSize: FS.base, fontWeight: FW.bold, color: C.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: FS.sm, color: C.text2, lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const bestContent = contentRows[0];
  const currentReach = trendData[trendData.length - 1].reach;
  const reachProgress = Math.round((currentReach / REACH_TARGET) * 100);

  return (
    <PageFrame>
      <DemoStrip />

      <div className="cly-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: SP.lg }}>
        <MetricCard label="Reach" value={fmt(currentReach)} delta={32} deltaLabel="%" icon={Eye} caption={`${reachProgress}% of monthly target`} />
        <MetricCard label="Average ER" value="4.8%" delta={1.1} deltaLabel="pp" icon={TrendingUp} tone="blue" caption="Weighted by reach" />
        <MetricCard label="Active posts" value="19" delta={5} deltaLabel="" icon={BookOpen} tone="amber" caption="3 drafts pending schedule" />
        <MetricCard label="Goal confidence" value="84%" delta={8} deltaLabel="%" icon={Target} caption="Likely to hit reach goal" />
      </div>

      <div className="cly-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) 360px", gap: SP.lg }}>
        <div className="cly-card" style={card({ padding: SP.xl })}>
          <SectionTitle title="Executive snapshot" note="Reach is tracking above the last 3-month average; target line uses the active monthly goal." />
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.brand} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.border} strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: C.text3, fontSize: FS.xs }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.text3, fontSize: FS.xs }} axisLine={false} tickLine={false} tickFormatter={fmt} width={42} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={REACH_TARGET} stroke={C.amber} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="reach" name="Reach" stroke={C.brand} strokeWidth={2.4} fill="url(#reachFill)" dot={{ fill: C.brand, r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="cly-three-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: SP.md, marginTop: SP.md }}>
            <InsightCard icon={ArrowUpRight} title="Winning move" text={`Turn "${bestContent.title}" into 2 platform variants this week.`} />
            <InsightCard icon={AlertTriangle} title="Watchout" text="Two high-priority posts collide on 12 Jun. Move one to the next day." tone="amber" />
            <InsightCard icon={CheckCircle2} title="Next action" text="Schedule 3 drafts to protect publishing consistency goal." tone="blue" />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: SP.lg }}>
          <div className="cly-card" style={card({ padding: SP.xl })}>
            <SectionTitle title="Action queue" note="What needs attention before the next publish window." />
            {[
              ["Resolve calendar conflict", "12 Jun · Instagram and YouTube within 30 min", "High", AlertTriangle],
              ["Approve hook variant B", "TikTok batching script is waiting in review", "Medium", Clock],
              ["Export monthly report", "Client report ready after final Jun data", "Low", Download],
            ].map(([title, text, priority, Icon]) => (
              <div key={title} className="cly-row" style={{ display: "flex", gap: 10, padding: "11px 4px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 30, height: 30, borderRadius: RADIUS.md, background: PRIORITY[priority].bg, color: PRIORITY[priority].color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: FS.base, fontWeight: FW.bold, color: C.text }}>{title}</span>
                    <PriorityBadge priority={priority} />
                  </div>
                  <div style={{ fontSize: FS.sm, color: C.text3, lineHeight: 1.4 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="cly-card" style={card({ padding: SP.xl })}>
            <SectionTitle title="Today" note="Operational pulse" />
            <div style={{ display: "grid", gap: SP.sm }}>
              {[["16:00", "Analytics review", "Review"], ["18:30", "Reels campaign draft", "Scheduled"], ["20:00", "Hook A/B test", "Scheduled"]].map(([time, title, status]) => (
                <div key={title} style={{ display: "grid", gridTemplateColumns: "52px minmax(0,1fr) auto", alignItems: "center", gap: 10, fontSize: FS.sm }}>
                  <span style={{ color: C.text3, fontWeight: FW.bold, fontFamily: "monospace" }}>{time}</span>
                  <span style={{ color: C.text, fontWeight: FW.semibold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function AnalyticsPage() {
  return (
    <PageFrame>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
        <button style={ghostBtnStyle}><Filter size={14} />All platforms</button>
        <button style={ghostBtnStyle}><SlidersHorizontal size={14} />Compare last month</button>
      </div>

      <div className="cly-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) 390px", gap: SP.lg }}>
        <div className="cly-card" style={card({ padding: SP.xl })}>
          <SectionTitle title="Reach and engagement trend" note="Bars use reach, line uses engagement rate." />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: C.text3, fontSize: FS.xs }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: C.text3, fontSize: FS.xs }} axisLine={false} tickLine={false} tickFormatter={fmt} width={42} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: C.text3, fontSize: FS.xs }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} width={38} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="reach" name="Reach" fill={C.brandTint} radius={[5, 5, 0, 0]} barSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="er" name="ER" stroke={C.blue} strokeWidth={2.4} dot={{ r: 3, fill: C.blue, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cly-card" style={card({ padding: SP.xl })}>
          <SectionTitle title="Pillar score" note="Composite score: ER, saves, reach quality." />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pillarData} layout="vertical" margin={{ top: 4, right: 34, left: 4, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis dataKey="name" type="category" tick={{ fill: C.text2, fontSize: FS.xs }} axisLine={false} tickLine={false} width={92} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" name="Score" fill={C.brand} radius={[0, 5, 5, 0]} barSize={18}>
                <LabelList dataKey="score" position="right" formatter={(value) => `${value}/100`} style={{ fill: C.text, fontSize: FS.xs, fontWeight: FW.bold }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <SectionTitle title="What this means" note="Three takeaways from the trend above, before you dig into the platform table." />
        <div className="cly-three-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: SP.lg }}>
          <InsightCard icon={TrendingUp} title="Reach momentum" text="Reach grew 32% month over month, mostly from short-form tutorial content." />
          <InsightCard icon={BookOpen} title="Pillar signal" text="Tutorial posts have the strongest score because saves and completion are both high." tone="blue" />
          <InsightCard icon={AlertTriangle} title="Distribution gap" text="YouTube ER is healthy, but posting frequency is too low to move total reach." tone="amber" />
        </div>
      </div>

      <div className="cly-card" style={card({ padding: "10px 18px" })}>
        <div style={{ paddingTop: SP.md }}>
          <SectionTitle title="Platform breakdown" note="Posts, reach, engagement, and growth side by side." />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: FS.base }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Platform", "Posts", "Reach", "Avg ER", "Save rate", "Growth"].map((head) => (
                <th key={head} style={{ textAlign: head === "Platform" ? "left" : "right", color: C.text3, fontSize: FS.micro, textTransform: "uppercase", letterSpacing: "0.05em", padding: "12px 0", fontWeight: FW.black }}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {platformRows.map((row, index) => (
              <tr key={row.platform} className="cly-row" style={{ borderBottom: index < platformRows.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <td style={{ padding: "12px 0" }}><PlatformBadge platform={row.platform} /></td>
                <td style={{ textAlign: "right", color: C.text2 }}>{row.posts}</td>
                <td style={{ textAlign: "right", color: C.text2 }}>{fmt(row.reach)}</td>
                <td style={{ textAlign: "right", color: C.text, fontWeight: FW.black }}>{pct(row.er)}</td>
                <td style={{ textAlign: "right", color: C.text2 }}>{pct(row.saveRate)}</td>
                <td style={{ textAlign: "right", color: row.growth >= 0 ? C.green : C.red, fontWeight: FW.black }}>{row.growth >= 0 ? "+" : ""}{row.growth}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageFrame>
  );
}

function ContentToolbar({ query, setQuery, platform, setPlatform, status, setStatus, sort, setSort }) {
  return (
    <div className="cly-card" style={card({ padding: SP.md, display: "grid", gridTemplateColumns: "minmax(220px,1fr) auto auto auto", gap: SP.sm, alignItems: "center" })}>
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: C.text3 }} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, owner, pillar..." style={{ ...inputStyle, width: "100%", padding: "0 10px 0 32px" }} />
      </div>
      <select value={platform} onChange={(event) => setPlatform(event.target.value)} style={{ ...inputStyle, padding: "0 28px 0 10px" }}>
        <option value="all">All platforms</option>
        {Object.keys(PLATFORM).map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
      <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ ...inputStyle, padding: "0 28px 0 10px" }}>
        <option value="all">All statuses</option>
        {Object.keys(STATUS).map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
      <select value={sort} onChange={(event) => setSort(event.target.value)} style={{ ...inputStyle, padding: "0 28px 0 10px" }}>
        <option value="date">Sort by date</option>
        <option value="reach">Sort by reach</option>
        <option value="er">Sort by ER</option>
        <option value="priority">Sort by priority</option>
      </select>
    </div>
  );
}

function KontenPage() {
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("date");

  const filteredRows = useMemo(() => {
    const priorityRank = { High: 3, Medium: 2, Low: 1 };
    return contentRows
      .filter((row) => platform === "all" || row.platform === platform)
      .filter((row) => status === "all" || row.status === status)
      .filter((row) => `${row.title} ${row.owner} ${row.pillar} ${row.format}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === "reach") return b.reach - a.reach;
        if (sort === "er") return b.er - a.er;
        if (sort === "priority") return priorityRank[b.priority] - priorityRank[a.priority];
        return b.iso.localeCompare(a.iso);
      });
  }, [platform, query, sort, status]);

  return (
    <PageFrame>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={primaryBtnStyle}><Plus size={14} />New post</button>
          <button style={ghostBtnStyle}><Upload size={14} />Import</button>
          <button style={ghostBtnStyle}><Download size={14} />Export</button>
        </div>
        <div style={segmentWrap}>
          <button onClick={() => setView("table")} style={segmentBtn(view === "table")}><ListChecks size={14} />Table</button>
          <button onClick={() => setView("cards")} style={segmentBtn(view === "cards")}><Columns3 size={14} />Cards</button>
        </div>
      </div>

      <ContentToolbar query={query} setQuery={setQuery} platform={platform} setPlatform={setPlatform} status={status} setStatus={setStatus} sort={sort} setSort={setSort} />

      {view === "table" ? (
        <div className="cly-card" style={card({ padding: "4px 16px", overflowX: "auto" })}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: FS.base, minWidth: 920 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ width: 34, padding: "13px 0" }}><input type="checkbox" /></th>
                {["Content", "Platform", "Status", "Owner", "Date", "Reach", "ER", "Next step", ""].map((head) => (
                  <th key={head} style={{ textAlign: ["Reach", "ER"].includes(head) ? "right" : "left", color: C.text3, fontSize: FS.micro, textTransform: "uppercase", letterSpacing: "0.05em", padding: "13px 0", fontWeight: FW.black }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={row.id} className="cly-row" style={{ borderBottom: index < filteredRows.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <td style={{ padding: "14px 0" }}><input type="checkbox" /></td>
                  <td>
                    <div style={{ fontWeight: FW.bold, color: C.text, marginBottom: 6 }}>{row.title}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Badge tone="neutral">{row.format}</Badge>
                      <Badge tone="purple">{row.pillar}</Badge>
                      <PriorityBadge priority={row.priority} />
                    </div>
                  </td>
                  <td><PlatformBadge platform={row.platform} /></td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><OwnerTag name={row.owner} /></td>
                  <td style={{ color: C.text2 }}>{row.date}</td>
                  <td style={{ textAlign: "right", color: C.text2, fontWeight: FW.semibold }}>{row.reach ? fmt(row.reach) : "—"}</td>
                  <td style={{ textAlign: "right", color: row.er ? C.text : C.text3, fontWeight: FW.black }}>{row.er ? pct(row.er) : "—"}</td>
                  <td style={{ color: C.text2, maxWidth: 220 }}>{row.nextStep}</td>
                  <td style={{ textAlign: "right" }}>
                    <button title="More actions" style={{ ...iconBtnStyle, width: 28, height: 28 }}><MoreHorizontal size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cly-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: SP.lg }}>
          {filteredRows.map((row) => (
            <div key={row.id} className="cly-card" style={card({ padding: SP.lg })}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: SP.lg }}>
                <PlatformBadge platform={row.platform} />
                <StatusBadge status={row.status} />
              </div>
              <div style={{ fontSize: FS.md, fontWeight: FW.bold, color: C.text, lineHeight: 1.35, marginBottom: SP.md }}>{row.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: SP.lg }}>
                <Badge tone="neutral">{row.format}</Badge>
                <Badge tone="purple">{row.pillar}</Badge>
                <PriorityBadge priority={row.priority} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, paddingTop: SP.md, borderTop: `1px solid ${C.border}` }}>
                <div><div style={{ fontSize: FS.micro, color: C.text3, fontWeight: FW.bold }}>Reach</div><div style={{ fontSize: FS.base, fontWeight: FW.bold, color: C.text }}>{row.reach ? fmt(row.reach) : "—"}</div></div>
                <div><div style={{ fontSize: FS.micro, color: C.text3, fontWeight: FW.bold }}>ER</div><div style={{ fontSize: FS.base, fontWeight: FW.bold, color: C.text }}>{row.er ? pct(row.er) : "—"}</div></div>
                <div><div style={{ fontSize: FS.micro, color: C.text3, fontWeight: FW.bold }}>Owner</div><OwnerTag name={row.owner} /></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageFrame>
  );
}

function PlannerPage() {
  return (
    <PageFrame>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={primaryBtnStyle}><Plus size={14} />New idea</button>
          <button style={ghostBtnStyle}><Filter size={14} />Owner</button>
          <button style={ghostBtnStyle}><Clock size={14} />This week</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="red">1 blocked</Badge>
          <Badge tone="amber">3 due soon</Badge>
          <Badge tone="green">1 ready</Badge>
        </div>
      </div>

      <div className="cly-board" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(210px,1fr))", gap: SP.lg, alignItems: "start" }}>
        {plannerColumns.map((column) => (
          <div key={column.id} style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: SP.md }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: column.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: FS.sm, fontWeight: FW.black, color: C.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>{column.label}</div>
                <div style={{ fontSize: FS.xs, color: C.text3 }}>{column.hint}</div>
              </div>
              <Badge tone="neutral">{column.items.length}</Badge>
            </div>

            <div style={{ display: "grid", gap: SP.sm }}>
              {column.items.map((item) => (
                <div key={item.title} className="cly-card" style={card({ padding: SP.md, borderTop: `3px solid ${column.color}` })}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: SP.sm }}>
                    <PriorityBadge priority={item.priority} />
                    <button title="Card actions" style={{ ...iconBtnStyle, width: 24, height: 24 }}><MoreHorizontal size={13} /></button>
                  </div>
                  <div style={{ fontSize: FS.base, fontWeight: FW.bold, color: C.text, lineHeight: 1.35, marginBottom: SP.md }}>{item.title}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: SP.md }}>
                    <PlatformBadge platform={item.platform} />
                    <Badge tone="neutral">{item.format}</Badge>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text3, fontSize: FS.xs, fontWeight: FW.semibold }}>
                    <OwnerTag name={item.owner} />
                    <span>{item.due}</span>
                  </div>
                </div>
              ))}

              {column.items.length === 0 && (
                <div style={{ minHeight: 120, border: `1px dashed ${C.borderStrong}`, borderRadius: RADIUS.lg, display: "grid", placeItems: "center", color: C.text3, fontSize: FS.sm, background: C.rail }}>
                  Drop approved items here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

function KalenderPage() {
  const days = calendarWeeks.flat();
  const events = days.flatMap((day) => day.current ? day.events.map((event) => ({ ...event, day: day.day, conflict: day.events.length > 1 })) : []);
  const conflictCount = events.filter((event) => event.conflict).length;

  return (
    <PageFrame>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button title="Previous month" style={iconBtnStyle}><ChevronLeft size={15} /></button>
          <div style={{ fontSize: FS.xl, fontWeight: FW.black, color: C.text }}>June 2026</div>
          <button title="Next month" style={iconBtnStyle}><ChevronRight size={15} /></button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {conflictCount > 0 && <Badge tone="red">{conflictCount} conflicts</Badge>}
          <button style={ghostBtnStyle}><Filter size={14} />Platform</button>
          <button style={primaryBtnStyle}><CalendarPlus size={14} />Quick add</button>
        </div>
      </div>

      <div className="cly-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: SP.lg }}>
        <div className="cly-card" style={card({ overflow: "hidden" })}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${C.border}` }}>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((label) => (
              <div key={label} style={{ padding: "11px 8px", textAlign: "center", color: C.text3, fontSize: FS.micro, fontWeight: FW.black, letterSpacing: "0.05em" }}>{label}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {days.map((cell, index) => {
              const hasConflict = cell.events.length > 1;
              return (
                <div key={`${cell.day}-${index}`} style={{
                  minHeight: 112, padding: 9,
                  borderRight: index % 7 !== 6 ? `1px solid ${C.border}` : "none",
                  borderBottom: index < days.length - 7 ? `1px solid ${C.border}` : "none",
                  background: cell.today ? C.brandTint : cell.current ? C.surface : C.rail,
                  opacity: cell.current ? 1 : 0.45,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SP.sm }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", background: cell.today ? C.brand : "transparent", color: cell.today ? "#FFFFFF" : C.text2, fontSize: FS.sm, fontWeight: FW.black }}>
                      {cell.day}
                    </div>
                    {hasConflict && <AlertTriangle size={13} color={C.red} />}
                  </div>
                  <div style={{ display: "grid", gap: 5 }}>
                    {cell.events.slice(0, 2).map((event) => {
                      const platform = PLATFORM[event.platform];
                      return (
                        <div key={`${event.time}-${event.title}`} style={{ borderLeft: `3px solid ${platform?.color || C.text2}`, background: STATUS[event.status]?.bg || C.mutedSurface, color: STATUS[event.status]?.color || C.text2, borderRadius: RADIUS.sm, padding: "5px 7px", minWidth: 0 }}>
                          <div style={{ fontSize: FS.micro, fontWeight: FW.black, fontFamily: "monospace" }}>{event.time}</div>
                          <div style={{ fontSize: FS.xs, fontWeight: FW.bold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</div>
                        </div>
                      );
                    })}
                    {cell.events.length > 2 && <div style={{ color: C.text3, fontSize: FS.xs, fontWeight: FW.bold }}>+{cell.events.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: SP.lg }}>
          <div className="cly-card" style={card({ padding: SP.xl })}>
            <SectionTitle title="Agenda" note={`${events.length} scheduled items this month`} />
            <div style={{ display: "grid", gap: SP.sm }}>
              {events.slice(0, 7).map((event) => (
                <div key={`${event.day}-${event.time}-${event.title}`} className="cly-row" style={{ display: "grid", gridTemplateColumns: "42px minmax(0,1fr) auto", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "monospace", fontSize: FS.md, fontWeight: FW.black, color: C.text }}>{String(event.day).padStart(2, "0")}</div>
                    <div style={{ fontSize: 9, color: C.text3, fontWeight: FW.bold }}>JUN</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: FS.base, fontWeight: FW.bold, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</span>
                      {event.conflict && <AlertTriangle size={13} color={C.red} />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.text3, fontSize: FS.xs }}>
                      <span>{event.time}</span>
                      <PlatformBadge platform={event.platform} />
                    </div>
                  </div>
                  <PriorityBadge priority={event.priority} />
                </div>
              ))}
            </div>
          </div>

          <InsightCard icon={AlertTriangle} title="Conflict rule" text="Flag any high-priority publish events scheduled within the same hour." tone="red" />
        </div>
      </div>
    </PageFrame>
  );
}

function GoalsPage() {
  return (
    <PageFrame>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="green">2 on track</Badge>
          <Badge tone="amber">1 needs push</Badge>
        </div>
        <button style={primaryBtnStyle}><Plus size={14} />New goal</button>
      </div>

      <div className="cly-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: SP.lg }}>
        {goalsList.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.id} className="cly-card" style={card({ padding: SP.xl })}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: SP.lg }}>
                <div>
                  <div style={{ fontSize: FS.md, fontWeight: FW.bold, color: C.text }}>{goal.label}</div>
                  <div style={{ fontSize: FS.sm, color: C.text3, marginTop: 3 }}>{goal.metric} · due {goal.due}</div>
                </div>
                <Badge tone={goal.confidence >= 85 ? "green" : "amber"}>{goal.confidence}% confidence</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: SP.sm }}>
                <div style={{ fontSize: FS.xxl, fontWeight: FW.black, color: C.text, letterSpacing: "-0.02em" }}>{progress}%</div>
                <div style={{ color: C.text3, fontSize: FS.sm, fontWeight: FW.semibold }}>
                  {goal.metric === "ER" ? pct(goal.current) : fmt(goal.current)} / {goal.metric === "ER" ? pct(goal.target) : fmt(goal.target)}
                </div>
              </div>
              <div style={{ height: 7, background: C.mutedSurface2, borderRadius: RADIUS.pill, overflow: "hidden", marginBottom: SP.md }}>
                <div style={{ height: "100%", width: `${progress}%`, background: goal.confidence >= 85 ? C.green : C.amber, borderRadius: RADIUS.pill }} />
              </div>
              <div style={{ padding: 11, background: C.rail, border: `1px solid ${C.border}`, borderRadius: RADIUS.md, color: C.text2, fontSize: FS.sm, lineHeight: 1.45 }}>
                {goal.action}
              </div>
            </div>
          );
        })}
      </div>

      <div className="cly-card" style={card({ padding: SP.xl, display: "grid", gridTemplateColumns: "42px minmax(0,1fr) auto", gap: 14, alignItems: "center" })}>
        <div style={{ width: 42, height: 42, borderRadius: RADIUS.lg, background: C.brandTint, color: C.brand, display: "grid", placeItems: "center" }}>
          <Sparkles size={18} />
        </div>
        <div>
          <div style={{ fontSize: FS.md, fontWeight: FW.bold, color: C.text, marginBottom: 4 }}>Forecast</div>
          <div style={{ fontSize: FS.sm, color: C.text2 }}>If two scheduled short videos ship this week, monthly reach is projected to land at 31.8rb.</div>
        </div>
        <button style={ghostBtnStyle}>Open plan</button>
      </div>
    </PageFrame>
  );
}

function ReportPage() {
  const [tab, setTab] = useState("overview");
  const reportKpis = [["Posts", "19", "+5 vs May"], ["Reach", "25.4rb", "85% of target"], ["Avg ER", "4.8%", "+1.1pp"], ["Saves", "384", "+43%"]];
  const reportSections = [["Executive summary", "Ready"], ["Platform breakdown", "Ready"], ["Top content table", "Ready"], ["Next actions", "Needs review"]];
  const topReportRows = contentRows.filter((row) => row.status === "Published").slice(0, 3);

  return (
    <PageFrame>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="green">Client-ready</Badge>
          <Badge tone="neutral">June 2026</Badge>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={ghostBtnStyle}><Download size={14} />PDF</button>
          <button style={ghostBtnStyle}><Download size={14} />CSV</button>
          <button style={ghostBtnStyle}><FileText size={14} />Share link</button>
        </div>
      </div>

      <div style={segmentWrap}>
        {[["overview", "Overview"], ["appendix", "Appendix"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={segmentBtn(tab === id)}>{label}</button>
        ))}
      </div>

      <div className="cly-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: SP.lg, alignItems: "start" }}>
        <div className="cly-card" style={card({ padding: SP.xxl })}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: SP.lg, borderBottom: `1px solid ${C.border}`, marginBottom: SP.lg }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: RADIUS.md, background: C.brand, color: "#FFFFFF", display: "grid", placeItems: "center", fontWeight: FW.black }}>C</div>
              <div>
                <div style={{ fontSize: FS.lg, fontWeight: FW.black, color: C.text }}>Creatorlytics Performance Report</div>
                <div style={{ fontSize: FS.sm, color: C.text3, marginTop: 3 }}>Spend Time · June 2026</div>
              </div>
            </div>
            <div style={{ textAlign: "right", color: C.text3, fontSize: FS.sm }}>
              Generated<br /><strong style={{ color: C.text }}>20 Jun 2026</strong>
            </div>
          </div>

          <div className="cly-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: SP.md, marginBottom: SP.lg }}>
            {reportKpis.map(([label, value, note]) => (
              <div key={label} style={{ padding: 13, background: C.rail, border: `1px solid ${C.border}`, borderRadius: RADIUS.md }}>
                <div style={{ fontSize: FS.micro, color: C.text3, fontWeight: FW.black, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: FS.xxl, color: C.text, fontWeight: FW.black, marginTop: 6 }}>{value}</div>
                <div style={{ fontSize: FS.xs, color: C.text3, marginTop: 4 }}>{note}</div>
              </div>
            ))}
          </div>

          {tab === "overview" && (
            <>
              <div className="cly-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 0.85fr", gap: SP.lg, marginBottom: SP.lg }}>
                <div>
                  <SectionTitle title="Executive summary" />
                  <div style={{ color: C.text2, fontSize: FS.base, lineHeight: 1.62 }}>
                    June performance is trending positively with reach up 32% and engagement rate up 1.1pp. Tutorial and behind-scene formats are the strongest signals. The main operational risk is schedule conflict on 12 Jun and three drafts that need final approval.
                  </div>
                </div>
                <div style={{ padding: SP.md, background: C.rail, border: `1px solid ${C.border}`, borderRadius: RADIUS.md }}>
                  <div style={{ fontSize: FS.sm, fontWeight: FW.black, color: C.text, marginBottom: SP.sm }}>Narrative angle</div>
                  <div style={{ fontSize: FS.sm, color: C.text2, lineHeight: 1.55 }}>
                    Position this month as "quality reach growth": fewer random experiments, more repeatable tutorial formats, and clearer publishing discipline.
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle title="Recommended next actions" />
                <div className="cly-three-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: SP.md }}>
                  <InsightCard icon={CheckCircle2} title="Scale" text="Repurpose top TikTok concept into Instagram Reels and LinkedIn recap." />
                  <InsightCard icon={Clock} title="Schedule" text="Move one high-priority 12 Jun publish to avoid audience overlap." tone="amber" />
                  <InsightCard icon={Target} title="Goal" text="Publish 2 more short videos to pass the monthly reach target." tone="blue" />
                </div>
              </div>
            </>
          )}

          {tab === "appendix" && (
            <>
              <SectionTitle title="Platform appendix" note="Compact table for the exported report." />
              <div style={{ overflowX: "auto", marginBottom: SP.lg }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: FS.base, minWidth: 560 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Platform", "Posts", "Reach", "Avg ER", "Save rate", "Growth"].map((head) => (
                        <th key={head} style={{ textAlign: head === "Platform" ? "left" : "right", color: C.text3, fontSize: FS.micro, textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 0", fontWeight: FW.black }}>{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {platformRows.map((row, index) => (
                      <tr key={row.platform} className="cly-row" style={{ borderBottom: index < platformRows.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <td style={{ padding: "11px 0" }}><PlatformBadge platform={row.platform} /></td>
                        <td style={{ textAlign: "right", color: C.text2 }}>{row.posts}</td>
                        <td style={{ textAlign: "right", color: C.text2 }}>{fmt(row.reach)}</td>
                        <td style={{ textAlign: "right", color: C.text, fontWeight: FW.black }}>{pct(row.er)}</td>
                        <td style={{ textAlign: "right", color: C.text2 }}>{pct(row.saveRate)}</td>
                        <td style={{ textAlign: "right", color: row.growth >= 0 ? C.green : C.red, fontWeight: FW.black }}>{row.growth >= 0 ? "+" : ""}{row.growth}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionTitle title="Top content" note="Rows selected for the report." />
              <div style={{ display: "grid", gap: SP.md }}>
                {topReportRows.map((row) => (
                  <div key={row.id} className="cly-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center", paddingBottom: SP.md, borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: C.text, fontSize: FS.base, fontWeight: FW.bold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>{row.title}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <PlatformBadge platform={row.platform} />
                        <Badge tone="purple">{row.pillar}</Badge>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: C.text, fontSize: FS.base, fontWeight: FW.black }}>{pct(row.er)}</div>
                      <div style={{ color: C.text3, fontSize: FS.xs }}>{fmt(row.reach)} reach</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: SP.lg }}>
          <div className="cly-card" style={card({ padding: SP.xl })}>
            <SectionTitle title="Report package" note="What this export includes." />
            <div style={{ display: "grid", gap: SP.sm }}>
              {reportSections.map(([label, state]) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center", paddingBottom: SP.sm, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.text, fontSize: FS.base, fontWeight: FW.bold }}>{label}</span>
                  <Badge tone={state === "Ready" ? "green" : "amber"}>{state}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="cly-card" style={card({ padding: SP.xl })}>
            <SectionTitle title="Distribution" note="Suggested recipient context." />
            {[["Client version", "Hide internal conflict notes"], ["Internal version", "Include action owners"], ["CSV appendix", "Attach platform and content rows"]].map(([label, text], index) => (
              <div key={label} style={{ padding: "10px 0", borderBottom: index < 2 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ fontSize: FS.base, fontWeight: FW.bold, color: C.text, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: FS.sm, color: C.text3, lineHeight: 1.4 }}>{text}</div>
              </div>
            ))}
          </div>

          <InsightCard icon={Sparkles} title="AI note" text="Lead with reach growth, then explain that tutorial formats are driving higher quality engagement." tone="purple" />
        </div>
      </div>
    </PageFrame>
  );
}

function KompetitorPage() {
  return (
    <PageFrame>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="blue">3 tracked accounts</Badge>
          <Badge tone="green">You lead ER</Badge>
        </div>
        <button style={primaryBtnStyle}><Plus size={14} />Add competitor</button>
      </div>

      <div className="cly-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: SP.lg }}>
        <div className="cly-card" style={card({ padding: "6px 18px", overflowX: "auto" })}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: FS.base, minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Account", "Platform", "Followers", "Avg ER", "Posts/week", "Dominant format", "Gap"].map((head) => (
                  <th key={head} style={{ textAlign: ["Followers", "Avg ER", "Posts/week"].includes(head) ? "right" : "left", color: C.text3, fontSize: FS.micro, textTransform: "uppercase", letterSpacing: "0.05em", padding: "13px 0", fontWeight: FW.black }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.brandTint }}>
                <td style={{ padding: "13px 9px", color: C.brand, fontWeight: FW.black }}>You</td>
                <td><PlatformBadge platform="TikTok" /></td>
                <td style={{ textAlign: "right", color: C.text }}>64.2rb</td>
                <td style={{ textAlign: "right", color: C.brand, fontWeight: FW.black }}>4.8%</td>
                <td style={{ textAlign: "right", color: C.text }}>5</td>
                <td style={{ color: C.text2 }}>Tutorial</td>
                <td style={{ color: C.text2 }}>Need stronger thumbnails</td>
              </tr>
              {competitors.map((row) => (
                <tr key={row.name} className="cly-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 9px", color: C.text, fontWeight: FW.semibold }}>{row.name}</td>
                  <td><PlatformBadge platform={row.platform} /></td>
                  <td style={{ textAlign: "right", color: C.text2 }}>{fmt(row.followers)}</td>
                  <td style={{ textAlign: "right", color: C.text2 }}>{pct(row.er)}</td>
                  <td style={{ textAlign: "right", color: C.text2 }}>{row.postsWeek}</td>
                  <td style={{ color: C.text2 }}>{row.format}</td>
                  <td style={{ color: C.text2 }}>{row.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: SP.lg }}>
          <InsightCard icon={TrendingUp} title="Benchmark insight" text="Your ER is stronger than the tracked set, but posting frequency is still behind the fastest TikTok competitor." />
          <div className="cly-card" style={card({ padding: SP.xl })}>
            <SectionTitle title="Opportunity gap" note="What to test next" />
            {["Sharper first 2 seconds", "More saveable carousel templates", "Thumbnail system for YouTube"].map((item, index) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: index < 2 ? `1px solid ${C.border}` : "none" }}>
                <Badge tone={index === 0 ? "green" : index === 1 ? "blue" : "amber"}>{index + 1}</Badge>
                <span style={{ fontSize: FS.base, fontWeight: FW.semibold, color: C.text }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function PengaturanPage() {
  const [tab, setTab] = useState("profile");
  const platforms = [
    { name: "TikTok", color: PLATFORM.TikTok.color, connected: true },
    { name: "Instagram", color: PLATFORM.Instagram.color, connected: true },
    { name: "YouTube", color: PLATFORM.YouTube.color, connected: false },
    { name: "LinkedIn", color: PLATFORM.LinkedIn.color, connected: false },
  ];
  const notifications = [
    ["Weekly report", "Performance summary every Monday morning", true],
    ["New AI insight", "Alert when a new recommendation is ready", true],
    ["Goal reached", "Alert when a tracked goal hits 100%", false],
  ];
  const settingsRows = [["Workspace name", "Spend Time"], ["Default reporting period", "Monthly"], ["Primary metric", "Reach + ER"]];

  return (
    <PageFrame>
      <div style={segmentWrap}>
        {[["profile", "Profile"], ["platforms", "Platforms"], ["notifications", "Notifications"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={segmentBtn(tab === id)}>{label}</button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="cly-card" style={card({ padding: SP.xxl, maxWidth: 640 })}>
          <SectionTitle title="Workspace profile" note="Mock controls for the prototype state." />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: SP.lg }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.blueTint, color: C.blue, display: "grid", placeItems: "center", fontSize: FS.lg, fontWeight: FW.black, flexShrink: 0 }}>M</div>
            <div>
              <div style={{ fontSize: FS.md, fontWeight: FW.bold, color: C.text }}>Spend Time</div>
              <div style={{ fontSize: FS.sm, color: C.text3 }}>Free plan · Personal workspace</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: SP.sm }}>
            {settingsRows.map(([label, value]) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "190px minmax(0,1fr) auto", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ color: C.text3, fontSize: FS.sm, fontWeight: FW.bold }}>{label}</div>
                <div style={{ color: C.text, fontSize: FS.base, fontWeight: FW.bold }}>{value}</div>
                <button style={{ ...ghostBtnStyle, minHeight: 30 }}><Pencil size={13} />Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "platforms" && (
        <div style={{ display: "grid", gap: SP.sm, maxWidth: 640 }}>
          {platforms.map((p) => (
            <div key={p.name} className="cly-card" style={card({ padding: SP.lg, display: "flex", justifyContent: "space-between", alignItems: "center" })}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: FS.base, fontWeight: FW.semibold, color: C.text }}>{p.name}</span>
              </div>
              <Badge tone={p.connected ? "green" : "neutral"}>{p.connected ? "Connected" : "Not connected"}</Badge>
            </div>
          ))}
        </div>
      )}

      {tab === "notifications" && (
        <div className="cly-card" style={card({ padding: "4px 20px", maxWidth: 640 })}>
          {notifications.map(([title, desc, on], index) => (
            <div key={title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: index < notifications.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <div style={{ fontSize: FS.base, fontWeight: FW.semibold, color: C.text, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: FS.sm, color: C.text3 }}>{desc}</div>
              </div>
              <div style={{ width: 36, height: 20, borderRadius: RADIUS.pill, background: on ? C.brand : C.mutedSurface2, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#FFFFFF", position: "absolute", top: 2, left: on ? 18 : 2, boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageFrame>
  );
}

function NavButton({ active, collapsed, Icon, label, onClick }) {
  return (
    <button onClick={onClick} title={collapsed ? label : undefined} style={{
      width: "100%", minHeight: 36, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
      gap: 10, padding: collapsed ? "0" : "0 10px", borderRadius: RADIUS.md, border: "none",
      borderLeft: active && !collapsed ? `3px solid ${C.brand}` : "3px solid transparent",
      cursor: "pointer", fontFamily: "inherit",
      background: active ? C.brandTint : "transparent", color: active ? C.brand : C.text2,
      fontSize: FS.base, fontWeight: active ? FW.black : FW.semibold, textAlign: "left",
    }}>
      <Icon size={16} />
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  return (
    <aside style={{ width: collapsed ? 72 : 220, background: C.rail, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.18s ease", flexShrink: 0 }}>
      <div style={{ height: 58, padding: collapsed ? "0 12px" : "0 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: RADIUS.md, background: C.brand, color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: FS.md, fontWeight: FW.black, flexShrink: 0 }}>C</div>
          {!collapsed && <div style={{ fontSize: FS.md, fontWeight: FW.black, color: C.text, letterSpacing: "-0.01em" }}>Creatorlytics</div>}
        </div>
        {!collapsed && (
          <button title="Collapse sidebar" onClick={() => setCollapsed(true)} style={{ ...iconBtnStyle, width: 28, height: 28 }}>
            <PanelLeftClose size={14} />
          </button>
        )}
      </div>

      {collapsed && (
        <button title="Open sidebar" onClick={() => setCollapsed(false)} style={{ ...iconBtnStyle, width: 36, height: 32, margin: "10px auto 4px" }}>
          <PanelLeftOpen size={15} />
        </button>
      )}

      <nav style={{ padding: collapsed ? "8px 8px" : "16px 10px", flex: 1, overflowY: "auto" }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: SP.xl }}>
            {!collapsed && <div style={{ fontSize: FS.micro, color: C.text3, fontWeight: FW.black, textTransform: "uppercase", letterSpacing: "0.07em", padding: "0 10px", marginBottom: 8 }}>{group.label}</div>}
            <div style={{ display: "grid", gap: 3 }}>
              {group.items.map(({ id, label, Icon }) => (
                <NavButton key={id} active={page === id} collapsed={collapsed} Icon={Icon} label={label} onClick={() => setPage(id)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div style={{ padding: collapsed ? 8 : 10, borderTop: `1px solid ${C.border}` }}>
        <NavButton active={page === "pengaturan"} collapsed={collapsed} Icon={Settings} label="Pengaturan" onClick={() => setPage("pengaturan")} />
      </div>
    </aside>
  );
}

function TopBar({ meta }) {
  return (
    <header style={{ height: 58, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", flexShrink: 0 }}>
      <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px 6px 6px", background: C.mutedSurface, border: `1px solid ${C.border}`, borderRadius: RADIUS.md, cursor: "pointer", color: C.text, fontSize: FS.sm, fontWeight: FW.bold, fontFamily: "inherit", flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: RADIUS.sm, background: C.blueTint, color: C.blue, display: "grid", placeItems: "center", fontSize: 10, fontWeight: FW.black }}>M</div>
        Spend Time
        <ChevronDown size={13} color={C.text3} />
      </button>

      <div style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: FS.lg, fontWeight: FW.black, color: C.text, lineHeight: 1 }}>{meta.title}</div>
        <div style={{ fontSize: FS.sm, color: C.text3, marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.subtitle}</div>
      </div>

      <div className="cly-top-search" style={{ width: 300, height: 34, borderRadius: RADIUS.md, border: `1px solid ${C.border}`, background: C.rail, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", color: C.text3, fontSize: FS.sm }}>
        <Search size={14} />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Search content, report, goal...</span>
        <span style={{ border: `1px solid ${C.borderStrong}`, borderRadius: 4, padding: "1px 5px", fontSize: 10, fontFamily: "monospace" }}>Ctrl K</span>
      </div>

      <button title="Notifications" style={{ ...iconBtnStyle, position: "relative" }}>
        <Bell size={15} />
        <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: C.red, border: `1.5px solid ${C.surface}` }} />
      </button>

      <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.blueTint, color: C.blue, display: "grid", placeItems: "center", fontSize: FS.base, fontWeight: FW.black }}>M</div>
    </header>
  );
}

const globalCss = `
  * { box-sizing: border-box; }
  .cly-card { transition: border-color 0.14s ease, box-shadow 0.14s ease; }
  .cly-card:hover { border-color: ${C.borderStrong}; box-shadow: ${shadowHover}; }
  .cly-row { transition: background 0.12s ease; }
  .cly-row:hover { background: ${C.rail}; }
  button:hover { filter: brightness(0.98); }

  @media (max-width: 1180px) {
    .cly-main-grid { grid-template-columns: 1fr !important; }
    .cly-board { grid-template-columns: repeat(2,minmax(220px,1fr)) !important; }
    .cly-card-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
  }

  @media (max-width: 860px) {
    .cly-kpi-grid, .cly-three-grid, .cly-card-grid { grid-template-columns: 1fr !important; }
    .cly-board { grid-template-columns: 1fr !important; }
    .cly-top-search { display: none !important; }
    .cly-page { padding: 16px !important; }
  }
`;

export default function CreatorlyticsApp() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const meta = pageMeta[page];

  return (
    <div style={{ height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'Inter', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", overflow: "hidden" }}>
      <style>{globalCss}</style>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar meta={meta} />
        <main style={{ flex: 1, overflow: "auto", background: C.bg }}>
          {page === "dashboard" && <DashboardPage />}
          {page === "analytics" && <AnalyticsPage />}
          {page === "report" && <ReportPage />}
          {page === "konten" && <KontenPage />}
          {page === "planner" && <PlannerPage />}
          {page === "kalender" && <KalenderPage />}
          {page === "goals" && <GoalsPage />}
          {page === "kompetitor" && <KompetitorPage />}
          {page === "pengaturan" && <PengaturanPage />}
        </main>
      </div>
    </div>
  );
}
