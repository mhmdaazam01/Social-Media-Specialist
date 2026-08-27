'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDays, ChevronLeft, ChevronRight, LogIn, Loader2, Lock, Eye, Edit3, AlertTriangle } from 'lucide-react';
import { PlatformBadge } from '@/components/cly';
import type { CalendarEvent } from '@/types';

interface GuestData {
  share: {
    id: string;
    share_token: string;
    public_enabled: boolean;
    target_type: string;
    default_role: 'viewer' | 'editor';
  };
  owner: {
    id: string;
    display_name: string;
  };
  events: CalendarEvent[] | null;
  isLoggedIn: boolean;
  isOwner: boolean;
  isCollaborator: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  idea: '#94A3B8',
  scheduled: '#60A5FA',
  published: '#34D399',
  cancelled: '#F87171',
};

export default function ShareCalendarGuestPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [data, setData] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/collab/guest?token=${token}&type=calendar`)
      .then(async res => {
        const json = await res.json();
        if (!res.ok) setError(json.error ?? 'Gagal memuat konten');
        else setData(json);
        setLoading(false);
      })
      .catch(() => { setError('Gagal memuat konten.'); setLoading(false); });
  }, [token]);

  const handleClaimAccess = async () => {
    if (data?.isOwner || data?.isCollaborator) {
      router.push('/calendar');
      return;
    }
    setClaiming(true);
    const res = await fetch('/api/collab/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ share_token: token }),
    });
    const json = await res.json();
    if (res.ok) {
      router.push('/calendar');
    } else if (json.error === 'Unauthorized') {
      router.push(`/login?next=/share/calendar/${token}`);
    } else if (json.error === 'You are the owner of this workspace') {
      router.push('/calendar');
    } else {
      setClaiming(false);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const totalDays = lastDay.getDate();
    const days: Array<{ date: number | null; dateStr: string | null; events: CalendarEvent[] }> = [];
    for (let i = 0; i < startDay; i++) days.push({ date: null, dateStr: null, events: [] });
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = (data?.events ?? []).filter(e => e.scheduled_date === dateStr);
      days.push({ date: d, dateStr, events: dayEvents });
    }
    return days;
  }, [year, month, data]);

  const monthName = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cly-bg">
        <Loader2 className="size-8 animate-spin text-cly-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cly-bg p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10">
          {error.includes('log in') || error.includes('Unauthorized')
            ? <Lock className="size-7 text-red-400" />
            : <AlertTriangle className="size-7 text-red-400" />
          }
        </div>
        <h1 className="text-cly-lg font-semibold text-cly-text">Link Tidak Valid</h1>
        <p className="max-w-sm text-cly-sm text-cly-text-muted">{error}</p>
        {(error.includes('log in') || error.includes('Unauthorized')) && (
          <button
            onClick={() => router.push(`/login?next=/share/calendar/${token}`)}
            className="flex items-center gap-2 rounded-lg bg-cly-brand px-6 py-2.5 text-cly-sm font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95"
          >
            <LogIn className="size-4" />
            Login untuk Akses
          </button>
        )}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-cly-bg">
      {/* Guest Banner */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cly-border bg-cly-brand/10 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {data.share.default_role === 'editor' ? (
            <Edit3 className="size-4 text-cly-brand" />
          ) : (
            <Eye className="size-4 text-cly-brand" />
          )}
          <span className="text-cly-xs font-medium text-cly-text">
            Melihat Calendar milik <strong>{data.owner?.display_name || 'Pengguna'}</strong> — Mode {data.share.default_role === 'editor' ? 'Editor' : 'Read-Only'}
          </span>
        </div>
        <button
          onClick={handleClaimAccess}
          disabled={claiming}
          className="flex items-center gap-1.5 rounded-lg bg-cly-brand px-4 py-1.5 text-cly-xs font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95 disabled:opacity-60"
        >
          {claiming ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : data.isOwner ? (
            <>Buka Workspace</>
          ) : data.isCollaborator ? (
            <>Buka Workspace</>
          ) : data.isLoggedIn ? (
            <><LogIn className="size-3.5" /> Gabung Workspace</>
          ) : (
            <><LogIn className="size-3.5" /> Login untuk Bergabung</>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-[18px] p-[18px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-cly-lg font-semibold text-cly-text">Content Calendar</h1>
            <p className="text-cly-xs text-cly-text-muted">Workspace: {data.owner?.display_name || 'Pengguna'}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-cly-border bg-cly-surface px-3 py-1.5">
            <Eye className="size-3 text-cly-text-muted" />
            <span className="text-[10px] font-medium text-cly-text-muted">Read Only</span>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="rounded-[10px] bg-cly-surface shadow-cly overflow-hidden">
          {/* Month Nav */}
          <div className="flex items-center justify-between border-b border-cly-border px-4 py-3">
            <button onClick={prevMonth} className="flex size-7 items-center justify-center rounded-lg text-cly-text-muted hover:bg-cly-bg hover:text-cly-text">
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-cly-brand" />
              <span className="text-cly-sm font-semibold text-cly-text capitalize">{monthName}</span>
            </div>
            <button onClick={nextMonth} className="flex size-7 items-center justify-center rounded-lg text-cly-text-muted hover:bg-cly-bg hover:text-cly-text">
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-cly-border">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-cly-text-muted">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const now = new Date();
              const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
              const isToday = day.dateStr === todayStr;
              return (
                <div
                  key={idx}
                  className={`min-h-[80px] border-b border-r border-cly-border p-1.5 ${!day.date ? 'bg-cly-bg/30' : ''}`}
                >
                  {day.date && (
                    <>
                      <span className={`inline-flex size-5 items-center justify-center rounded-full text-[11px] font-medium ${
                        isToday ? 'bg-cly-brand text-white' : 'text-cly-text-muted'
                      }`}>
                        {day.date}
                      </span>
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        {day.events.slice(0, 2).map(ev => (
                          <div
                            key={ev.id}
                            className="truncate rounded px-1 py-0.5 text-[9px] font-medium text-white"
                            style={{ backgroundColor: STATUS_COLORS[ev.status] ?? '#94A3B8' }}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {day.events.length > 2 && (
                          <span className="text-[9px] text-cly-text-muted">+{day.events.length - 2} lagi</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda list */}
        {data.events && data.events.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-cly-xs font-medium uppercase tracking-wider text-cly-text-muted">Semua Event ({data.events.length})</span>
            <div className="flex flex-col gap-1.5">
              {data.events.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 rounded-lg bg-cly-surface px-4 py-2.5 shadow-cly">
                  <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[ev.status] ?? '#94A3B8' }} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-cly-xs font-medium text-cly-text">{ev.title}</p>
                    <p className="text-[10px] text-cly-text-muted">{ev.scheduled_date}{ev.scheduled_time ? ` · ${ev.scheduled_time}` : ''}</p>
                  </div>
                  {ev.platform && <PlatformBadge platform={ev.platform} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
