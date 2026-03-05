'use client'

import ResumeList from '@/components/dashboard/ResumeList'
import TemplateGallery from '@/components/dashboard/TemplateGallery'
import AnalyticsDashboard, { QuickActions, useAnalytics } from '@/components/analytics/AnalyticsDashboard'

export default function DashboardPage() {
  const { stats, events } = useAnalytics()
  const hasActivity = events.length > 0

  return (
    <div className="space-y-5">
      {/* Unified header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
          {hasActivity ? 'Your resume-building activity at a glance.' : 'Get started by picking an action below.'}
        </p>
      </div>

      {/* Quick Actions — full width */}
      <QuickActions stats={stats} />

      {/* Two-column: workspace (resumes + templates) | analytics sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <ResumeList />
          <TemplateGallery />
        </div>

        <aside className="xl:sticky xl:top-4">
          <AnalyticsDashboard />
        </aside>
      </div>
    </div>
  )
}
