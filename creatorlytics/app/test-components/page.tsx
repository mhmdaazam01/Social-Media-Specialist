'use client';

import { Badge, PlatformBadge, MetricCard } from '@/components/cly';
import { BarChart2, TrendingUp, Users, Eye } from 'lucide-react';

export default function TestComponentsPage() {
  return (
    <div className="min-h-screen bg-cly-bg p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-cly-display font-black text-cly-text mb-2">
            Creatorlytics Design System Test
          </h1>
          <p className="text-cly-md text-cly-text-2">
            Showcase new components dari Phase 1 implementation
          </p>
        </div>

        {/* Badge Variants */}
        <section className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-7">
          <h2 className="text-cly-lg font-bold text-cly-text mb-3.5">Badge Component</h2>
          <p className="text-cly-sm text-cly-text-3 mb-3.5">
            6 tone variants with optional dot indicator
          </p>
          
          <div className="space-y-3.5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">Neutral</Badge>
              <Badge tone="green">Green</Badge>
              <Badge tone="blue">Blue</Badge>
              <Badge tone="amber">Amber</Badge>
              <Badge tone="red">Red</Badge>
              <Badge tone="purple">Purple</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral" dot>Neutral Dot</Badge>
              <Badge tone="green" dot>Published</Badge>
              <Badge tone="blue" dot>Scheduled</Badge>
              <Badge tone="amber" dot>Review</Badge>
              <Badge tone="red" dot>Blocked</Badge>
              <Badge tone="purple" dot>Draft</Badge>
            </div>
          </div>
        </section>

        {/* Platform Badges */}
        <section className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-7">
          <h2 className="text-cly-lg font-bold text-cly-text mb-3.5">PlatformBadge Component</h2>
          <p className="text-cly-sm text-cly-text-3 mb-3.5">
            Platform-specific colors with dot indicator
          </p>
          
          <div className="flex flex-wrap gap-2">
            <PlatformBadge platform="Instagram" />
            <PlatformBadge platform="TikTok" />
            <PlatformBadge platform="YouTube" />
            <PlatformBadge platform="LinkedIn" />
            <PlatformBadge platform="Twitter" />
            <PlatformBadge platform="Facebook" />
            <PlatformBadge platform="Threads" />
          </div>
        </section>

        {/* Metric Cards */}
        <section className="space-y-3.5">
          <div>
            <h2 className="text-cly-lg font-bold text-cly-text mb-2">MetricCard Component</h2>
            <p className="text-cly-sm text-cly-text-3">
              KPI cards with trend indicators
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Posts"
              value="142"
              delta={12}
              deltaLabel=" posts"
              icon={BarChart2}
              tone="green"
              caption="This month"
            />
            
            <MetricCard
              label="Total Reach"
              value="2.4M"
              delta={18.3}
              deltaLabel="%"
              icon={Eye}
              tone="blue"
              caption="30 days"
            />
            
            <MetricCard
              label="Avg Engagement"
              value="4.8%"
              delta={0.6}
              deltaLabel="pp"
              icon={TrendingUp}
              tone="amber"
              caption="Last week"
            />
            
            <MetricCard
              label="Followers"
              value="+1.2K"
              delta={-5.2}
              deltaLabel="%"
              icon={Users}
              tone="green"
              caption="Growth rate"
            />
          </div>
        </section>

        {/* Typography Scale */}
        <section className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-7">
          <h2 className="text-cly-lg font-bold text-cly-text mb-3.5">Typography Scale</h2>
          
          <div className="space-y-2">
            <div className="text-cly-display font-black text-cly-text">Display (27px) - Black</div>
            <div className="text-cly-2xl font-bold text-cly-text">2XL (22px) - Bold</div>
            <div className="text-cly-xl font-bold text-cly-text">XL (18px) - Bold</div>
            <div className="text-cly-lg font-semibold text-cly-text">LG (16px) - Semibold</div>
            <div className="text-cly-md font-medium text-cly-text">MD (14px) - Medium</div>
            <div className="text-cly-base text-cly-text">Base (13px) - Regular</div>
            <div className="text-cly-sm text-cly-text-2">SM (12px) - Regular</div>
            <div className="text-cly-xs text-cly-text-3">XS (11px) - Regular</div>
            <div className="text-cly-micro text-cly-text-3">Micro (10px) - Regular</div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-7">
          <h2 className="text-cly-lg font-bold text-cly-text mb-3.5">Color Palette</h2>
          
          <div className="space-y-3.5">
            <div>
              <h3 className="text-cly-sm font-bold text-cly-text-2 mb-2">Backgrounds</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="h-20 bg-cly-bg border border-cly-border rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-cly-text-2">bg</span>
                </div>
                <div className="h-20 bg-cly-rail border border-cly-border rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-cly-text-2">rail</span>
                </div>
                <div className="h-20 bg-cly-surface border border-cly-border rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-cly-text-2">surface</span>
                </div>
                <div className="h-20 bg-cly-muted border border-cly-border rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-cly-text-2">muted</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-cly-sm font-bold text-cly-text-2 mb-2">Brand Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="h-20 bg-cly-brand rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-white">brand</span>
                </div>
                <div className="h-20 bg-cly-brand-2 rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-white">brand-2</span>
                </div>
                <div className="h-20 bg-cly-brand-tint border border-cly-border rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-cly-brand">brand-tint</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-cly-sm font-bold text-cly-text-2 mb-2">Semantic Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="h-20 bg-cly-green rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-white">green</span>
                </div>
                <div className="h-20 bg-cly-blue rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-white">blue</span>
                </div>
                <div className="h-20 bg-cly-amber rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-white">amber</span>
                </div>
                <div className="h-20 bg-cly-red rounded-lg flex items-end p-2">
                  <span className="text-cly-xs text-white">red</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shadows */}
        <section className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-7">
          <h2 className="text-cly-lg font-bold text-cly-text mb-3.5">Shadow System</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-7">
              <div className="text-cly-sm font-bold text-cly-text">shadow-cly (default)</div>
            </div>
            
            <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly-hover p-7">
              <div className="text-cly-sm font-bold text-cly-text">shadow-cly-hover</div>
            </div>
          </div>
        </section>

        <div className="text-center text-cly-sm text-cly-text-3 py-7">
          Design system test page • Creatorlytics 2026
        </div>
      </div>
    </div>
  );
}
